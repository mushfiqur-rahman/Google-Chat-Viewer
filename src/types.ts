export interface TakeoutUser {
  name: string;
  email?: string;
  user_type?: string;
  avatar_url?: string;
}

export interface TakeoutAttachment {
  original_name: string;
  export_name?: string;
  file_url?: string; // Blob URL if loaded from ZIP
  file_type?: 'image' | 'video' | 'audio' | 'document' | 'other';
  file_size?: number;
}

export interface TakeoutReaction {
  emoji: string;
  count: number;
  reactors: string[];
}

export interface TakeoutAnnotation {
  type?: string;
  url?: string;
  title?: string;
  snippet?: string;
  image_url?: string;
}

export interface TakeoutMessage {
  id: string;
  conversation_id: string;
  creator: TakeoutUser;
  created_date: string; // Original string
  timestamp: number; // Normalized epoch ms for accurate sorting
  text: string;
  topic_id?: string;
  attached_files?: TakeoutAttachment[];
  reactions?: TakeoutReaction[];
  annotations?: TakeoutAnnotation[];
  is_system_message?: boolean;
  bookmarked?: boolean;
  raw?: any;
}

export interface TakeoutConversation {
  id: string;
  name: string;
  type: 'dm' | 'space' | 'group' | 'hangout';
  members: TakeoutUser[];
  messages: TakeoutMessage[];
  last_message_time?: number;
  folder_path?: string;
  topic_count?: number;
  total_attachments?: number;
}

export interface SearchFilterState {
  query: string;
  sender: string;
  conversationId: string; // 'all' or specific ID
  dateFrom: string;
  dateTo: string;
  hasAttachment: boolean;
  hasLink: boolean;
  hasReaction: boolean;
  bookmarkedOnly: boolean;
}

export interface ParseProgress {
  status: 'idle' | 'reading' | 'parsing' | 'extracting_media' | 'completed' | 'error';
  fileName?: string;
  progressPercent: number;
  message: string;
  conversationsFound: number;
  messagesFound: number;
  mediaCount: number;
  error?: string;
}
