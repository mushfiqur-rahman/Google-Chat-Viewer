import JSZip from 'jszip';
import { TakeoutConversation, TakeoutMessage, TakeoutUser, TakeoutAttachment, ParseProgress } from '../types';
import { parseTakeoutDate } from './date';

function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

function getFileType(filename: string): 'image' | 'video' | 'audio' | 'document' | 'other' {
  const ext = getFileExtension(filename);
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'heic'].includes(ext)) return 'image';
  if (['mp4', 'mov', 'webm', 'mkv', 'avi'].includes(ext)) return 'video';
  if (['mp3', 'wav', 'm4a', 'ogg', 'aac'].includes(ext)) return 'audio';
  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'md'].includes(ext)) return 'document';
  return 'other';
}

/**
 * Normalizes user object from various Takeout structures
 */
function normalizeUser(userObj: any, fallbackName: string = 'User'): TakeoutUser {
  if (!userObj) return { name: fallbackName };
  if (typeof userObj === 'string') return { name: userObj };

  const name = userObj.name || userObj.display_name || userObj.formatted_name || userObj.email || fallbackName;
  const email = userObj.email || userObj.user_email || undefined;
  const user_type = userObj.user_type || userObj.type || undefined;
  const avatar_url = userObj.avatar_url || userObj.photo_url || undefined;

  return { name, email, user_type, avatar_url };
}

/**
 * Parse Google Chat messages.json payload
 */
export function parseMessagesJson(
  jsonData: any,
  conversationId: string,
  groupInfo?: any,
  mediaMap?: Map<string, string> // Map of normalized filename/path -> blob URL
): TakeoutConversation {
  const rawMessages: any[] = Array.isArray(jsonData)
    ? jsonData
    : Array.isArray(jsonData?.messages)
    ? jsonData.messages
    : [];

  const membersMap = new Map<string, TakeoutUser>();
  const topicsSet = new Set<string>();
  let totalAttachments = 0;

  // Add members from groupInfo if available
  if (groupInfo?.members && Array.isArray(groupInfo.members)) {
    for (const m of groupInfo.members) {
      const u = normalizeUser(m);
      membersMap.set(u.email || u.name, u);
    }
  }

  const messages: TakeoutMessage[] = rawMessages.map((msg, index) => {
    const creator = normalizeUser(msg.creator || msg.sender || msg.user, 'Unknown User');
    membersMap.set(creator.email || creator.name, creator);

    const dateStr = msg.created_date || msg.created_at || msg.timestamp || msg.date;
    const { timestamp, formatted } = parseTakeoutDate(dateStr);

    if (msg.topic_id) {
      topicsSet.add(msg.topic_id);
    }

    // Process attached files
    const attachments: TakeoutAttachment[] = [];
    const rawFiles = msg.attached_files || msg.attachments || [];
    if (Array.isArray(rawFiles)) {
      for (const f of rawFiles) {
        const origName = f.original_name || f.name || f.filename || 'attachment';
        const exportName = f.export_name || f.path || origName;
        const fileType = getFileType(origName);

        // Try to match with mediaMap
        let file_url: string | undefined = undefined;
        if (mediaMap) {
          // Check full path or base filename
          const baseName = origName.split('/').pop() || origName;
          const exportBase = exportName.split('/').pop() || exportName;
          file_url = mediaMap.get(exportName) || 
                     mediaMap.get(origName) || 
                     mediaMap.get(baseName) || 
                     mediaMap.get(exportBase);
        }

        attachments.push({
          original_name: origName,
          export_name: exportName,
          file_url,
          file_type: fileType,
        });
        totalAttachments++;
      }
    }

    // Process reactions
    const reactions = [];
    if (Array.isArray(msg.reactions)) {
      for (const r of msg.reactions) {
        let emoji = r.emoji?.unicode || r.emoji?.name || (typeof r.emoji === 'string' ? r.emoji : '👍');
        const count = r.reaction_count || (Array.isArray(r.reactors) ? r.reactors.length : 1);
        const reactors = Array.isArray(r.reactors)
          ? r.reactors.map((rc: any) => (typeof rc === 'string' ? rc : rc.name || rc.email || 'User'))
          : [];
        reactions.push({ emoji, count, reactors });
      }
    }

    // Process annotations (cards, links)
    const annotations = [];
    if (Array.isArray(msg.annotations)) {
      for (const a of msg.annotations) {
        annotations.push({
          type: a.type || a.chip_type,
          url: a.url || a.target_url,
          title: a.title || a.chip_text,
          snippet: a.snippet || a.description,
          image_url: a.image_url,
        });
      }
    }

    const text = msg.text || msg.message_state?.text || (typeof msg.content === 'string' ? msg.content : '') || '';

    return {
      id: msg.message_id || msg.id || `${conversationId}_msg_${index}`,
      conversation_id: conversationId,
      creator,
      created_date: formatted,
      timestamp,
      text,
      topic_id: msg.topic_id,
      attached_files: attachments.length > 0 ? attachments : undefined,
      reactions: reactions.length > 0 ? reactions : undefined,
      annotations: annotations.length > 0 ? annotations : undefined,
      is_system_message: msg.is_system_message || msg.creator?.user_type === 'System' || msg.creator?.user_type === 'Bot_System',
      raw: msg,
    };
  });

  // Sort chronological (oldest to newest)
  messages.sort((a, b) => a.timestamp - b.timestamp);

  // Determine conversation type & name
  let conversationName = groupInfo?.name || groupInfo?.title;
  let type: 'dm' | 'space' | 'group' = 'space';

  const lowerId = conversationId.toLowerCase();
  if (lowerId.includes('direct message') || lowerId.includes('dm') || lowerId.includes('users')) {
    type = 'dm';
  } else if (lowerId.includes('space') || lowerId.includes('group') || lowerId.includes('room')) {
    type = 'space';
  }

  if (!conversationName) {
    if (type === 'dm') {
      // Use other participant's name
      const allMembers = Array.from(membersMap.values());
      if (allMembers.length > 0) {
        conversationName = allMembers.map(m => m.name).join(', ');
      } else {
        conversationName = conversationId.split('/').pop() || 'Direct Message';
      }
    } else {
      conversationName = conversationId.split('/').pop()?.replace(/_/g, ' ') || 'Chat Space';
    }
  }

  return {
    id: conversationId,
    name: conversationName,
    type,
    members: Array.from(membersMap.values()),
    messages,
    last_message_time: messages.length > 0 ? messages[messages.length - 1].timestamp : Date.now(),
    topic_count: topicsSet.size,
    total_attachments: totalAttachments,
  };
}

/**
 * Parses Hangouts.json export format
 */
export function parseHangoutsJson(hangoutsData: any): TakeoutConversation[] {
  const conversations: TakeoutConversation[] = [];
  const rawConvs = hangoutsData?.conversations || [];

  for (let cIdx = 0; cIdx < rawConvs.length; cIdx++) {
    const convObj = rawConvs[cIdx];
    const convState = convObj.conversation?.conversation || convObj.conversation_state?.conversation;
    const events = convObj.events || convObj.conversation_state?.event || [];

    if (!events || events.length === 0) continue;

    // Build participant lookup
    const participantMap = new Map<string, TakeoutUser>();
    if (convState?.participant_data && Array.isArray(convState.participant_data)) {
      for (const p of convState.participant_data) {
        const gaiaId = p.id?.gaia_id || p.id?.chat_id;
        const name = p.fallback_name || p.display_name || 'Hangouts User';
        if (gaiaId) {
          participantMap.set(gaiaId, { name, email: p.email });
        }
      }
    }

    const messages: TakeoutMessage[] = [];
    const convId = convState?.id?.id || `hangout_${cIdx}`;
    let totalAttachments = 0;

    for (let eIdx = 0; eIdx < events.length; eIdx++) {
      const ev = events[eIdx];
      const chatMsg = ev.chat_message;
      if (!chatMsg) continue; // Skip non-chat events if any

      const senderId = ev.sender_id?.gaia_id || ev.sender_id?.chat_id;
      const creator = participantMap.get(senderId) || { name: 'Unknown User' };

      const { timestamp, formatted } = parseTakeoutDate(ev.timestamp);

      // Segments
      let text = '';
      const segments = chatMsg.message_content?.segment || [];
      for (const seg of segments) {
        text += seg.text || '';
      }

      // Attachments (Photos)
      const attachments: TakeoutAttachment[] = [];
      const attachList = chatMsg.message_content?.attachment || [];
      for (const att of attachList) {
        if (att.embed_item?.type?.includes('PLUS_PHOTO') || att.embed_item?.plus_photo) {
          const photo = att.embed_item.plus_photo;
          const photoUrl = photo.url || photo.thumbnail?.image_url;
          attachments.push({
            original_name: 'Photo',
            file_url: photoUrl,
            file_type: 'image',
          });
          totalAttachments++;
        }
      }

      messages.push({
        id: ev.event_id || `${convId}_msg_${eIdx}`,
        conversation_id: convId,
        creator,
        created_date: formatted,
        timestamp,
        text,
        attached_files: attachments.length > 0 ? attachments : undefined,
        raw: ev,
      });
    }

    messages.sort((a, b) => a.timestamp - b.timestamp);

    const isGroup = convState?.type === 'GROUP' || participantMap.size > 2;
    const convName = convState?.name || 
      (isGroup 
        ? Array.from(participantMap.values()).map(m => m.name).slice(0, 3).join(', ') + (participantMap.size > 3 ? '...' : '')
        : Array.from(participantMap.values()).map(m => m.name).join(', ') || `Hangout Conversation ${cIdx + 1}`);

    conversations.push({
      id: convId,
      name: convName,
      type: isGroup ? 'group' : 'dm',
      members: Array.from(participantMap.values()),
      messages,
      last_message_time: messages.length > 0 ? messages[messages.length - 1].timestamp : Date.now(),
      total_attachments: totalAttachments,
    });
  }

  return conversations;
}

/**
 * Main parser function to handle uploaded ZIP file, folder files, or individual JSON files
 */
export async function parseTakeoutArchive(
  files: File[],
  onProgress?: (progress: ParseProgress) => void
): Promise<TakeoutConversation[]> {
  onProgress?.({
    status: 'reading',
    progressPercent: 10,
    message: 'Analyzing uploaded files...',
    conversationsFound: 0,
    messagesFound: 0,
    mediaCount: 0,
  });

  const mediaMap = new Map<string, string>(); // file path/name -> object URL
  const conversations: TakeoutConversation[] = [];

  // Case 1: If a ZIP file is provided
  const zipFile = files.find(f => f.name.toLowerCase().endsWith('.zip'));
  if (zipFile) {
    onProgress?.({
      status: 'parsing',
      fileName: zipFile.name,
      progressPercent: 20,
      message: `Unpacking Takeout archive (${(zipFile.size / (1024 * 1024)).toFixed(1)} MB)...`,
      conversationsFound: 0,
      messagesFound: 0,
      mediaCount: 0,
    });

    const zip = await JSZip.loadAsync(zipFile);
    const fileEntries = Object.keys(zip.files);
    
    // Step 1: Collect and create Blob URLs for media files inside ZIP
    const mediaFiles = fileEntries.filter(
      path => !zip.files[path].dir && !path.endsWith('.json') && !path.endsWith('.html') && !path.endsWith('.txt')
    );

    let processedMedia = 0;
    for (const mediaPath of mediaFiles) {
      try {
        const fileData = await zip.files[mediaPath].async('blob');
        const blobUrl = URL.createObjectURL(fileData);
        mediaMap.set(mediaPath, blobUrl);
        const baseName = mediaPath.split('/').pop();
        if (baseName) {
          mediaMap.set(baseName, blobUrl);
        }
        processedMedia++;
      } catch (err) {
        console.warn(`Could not extract media file: ${mediaPath}`, err);
      }
    }

    onProgress?.({
      status: 'parsing',
      progressPercent: 50,
      message: 'Processing chat messages and channels...',
      conversationsFound: 0,
      messagesFound: 0,
      mediaCount: processedMedia,
    });

    // Check for Hangouts.json
    const hangoutsPath = fileEntries.find(p => p.toLowerCase().endsWith('hangouts.json'));
    if (hangoutsPath) {
      try {
        const jsonText = await zip.files[hangoutsPath].async('text');
        const hangoutsData = JSON.parse(jsonText);
        const parsedHangouts = parseHangoutsJson(hangoutsData);
        conversations.push(...parsedHangouts);
      } catch (err) {
        console.error('Error parsing Hangouts.json:', err);
      }
    }

    // Step 2: Find all messages.json files
    const messagesPaths = fileEntries.filter(p => p.toLowerCase().endsWith('messages.json'));
    let convCount = 0;
    let totalMsgs = 0;

    for (const msgPath of messagesPaths) {
      try {
        const jsonText = await zip.files[msgPath].async('text');
        const jsonData = JSON.parse(jsonText);

        // Check for accompanying group_info.json in the same folder
        const folder = msgPath.substring(0, msgPath.lastIndexOf('/'));
        const groupInfoPath = fileEntries.find(
          p => p.startsWith(folder) && p.toLowerCase().endsWith('group_info.json')
        );
        let groupInfo: any = undefined;
        if (groupInfoPath) {
          try {
            const giText = await zip.files[groupInfoPath].async('text');
            groupInfo = JSON.parse(giText);
          } catch (e) {
            // ignore
          }
        }

        const conv = parseMessagesJson(jsonData, folder || msgPath, groupInfo, mediaMap);
        if (conv.messages.length > 0) {
          conversations.push(conv);
          convCount++;
          totalMsgs += conv.messages.length;
        }
      } catch (err) {
        console.error(`Error parsing ${msgPath}:`, err);
      }
    }

    onProgress?.({
      status: 'completed',
      progressPercent: 100,
      message: 'Archive loaded successfully!',
      conversationsFound: conversations.length,
      messagesFound: totalMsgs,
      mediaCount: processedMedia,
    });

    return conversations.sort((a, b) => (b.last_message_time || 0) - (a.last_message_time || 0));
  }

  // Case 2: Direct folder / multiple files upload
  onProgress?.({
    status: 'parsing',
    progressPercent: 30,
    message: `Reading ${files.length} files...`,
    conversationsFound: 0,
    messagesFound: 0,
    mediaCount: 0,
  });

  // Collect media
  for (const file of files) {
    if (!file.name.endsWith('.json') && !file.name.endsWith('.html') && !file.name.endsWith('.txt')) {
      const blobUrl = URL.createObjectURL(file);
      const relPath = (file as any).webkitRelativePath || file.name;
      mediaMap.set(relPath, blobUrl);
      mediaMap.set(file.name, blobUrl);
    }
  }

  // Look for Hangouts.json
  const hangoutsFile = files.find(f => f.name.toLowerCase().endsWith('hangouts.json'));
  if (hangoutsFile) {
    try {
      const text = await hangoutsFile.text();
      const hData = JSON.parse(text);
      const parsedHangouts = parseHangoutsJson(hData);
      conversations.push(...parsedHangouts);
    } catch (e) {
      console.error('Error parsing Hangouts file:', e);
    }
  }

  // Group files by folder to match group_info.json with messages.json
  const folderMap = new Map<string, { messages?: File; groupInfo?: File }>();
  for (const file of files) {
    const relPath = (file as any).webkitRelativePath || file.name;
    const folder = relPath.includes('/') ? relPath.substring(0, relPath.lastIndexOf('/')) : 'root';
    const entry = folderMap.get(folder) || {};

    if (file.name.toLowerCase().endsWith('messages.json')) {
      entry.messages = file;
    } else if (file.name.toLowerCase().endsWith('group_info.json')) {
      entry.groupInfo = file;
    }
    folderMap.set(folder, entry);
  }

  let totalMsgs = 0;
  for (const [folder, entry] of folderMap.entries()) {
    if (entry.messages) {
      try {
        const msgText = await entry.messages.text();
        const msgData = JSON.parse(msgText);
        let groupInfo: any = undefined;
        if (entry.groupInfo) {
          try {
            const giText = await entry.groupInfo.text();
            groupInfo = JSON.parse(giText);
          } catch (e) {
            // ignore
          }
        }
        const conv = parseMessagesJson(msgData, folder, groupInfo, mediaMap);
        if (conv.messages.length > 0) {
          conversations.push(conv);
          totalMsgs += conv.messages.length;
        }
      } catch (e) {
        console.error(`Error parsing folder ${folder}:`, e);
      }
    }
  }

  // Also check if any standalone JSON files are messages.json format
  for (const file of files) {
    if (file.name.toLowerCase().endsWith('.json') && !file.name.toLowerCase().includes('hangouts') && !file.name.toLowerCase().includes('group_info')) {
      const relPath = (file as any).webkitRelativePath || file.name;
      const folder = relPath.includes('/') ? relPath.substring(0, relPath.lastIndexOf('/')) : 'root';
      if (!folderMap.get(folder)?.messages) {
        try {
          const text = await file.text();
          const data = JSON.parse(text);
          if (Array.isArray(data) || data.messages) {
            const conv = parseMessagesJson(data, file.name.replace('.json', ''), undefined, mediaMap);
            if (conv.messages.length > 0) {
              conversations.push(conv);
              totalMsgs += conv.messages.length;
            }
          }
        } catch (e) {
          // ignore non-chat json
        }
      }
    }
  }

  onProgress?.({
    status: 'completed',
    progressPercent: 100,
    message: 'Loaded successfully!',
    conversationsFound: conversations.length,
    messagesFound: totalMsgs,
    mediaCount: mediaMap.size,
  });

  return conversations.sort((a, b) => (b.last_message_time || 0) - (a.last_message_time || 0));
}
