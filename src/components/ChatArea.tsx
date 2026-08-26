import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Hash,
  Users,
  Search,
  Download,
  BarChart3,
  Calendar,
  Layers,
  ArrowDown,
  ArrowUp,
  X,
  Star,
  Info,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { TakeoutConversation, TakeoutMessage, TakeoutAttachment } from '../types';
import { MessageItem } from './MessageItem';
import { formatDateDivider } from '../utils/date';
import { getAvatarColor, getInitials } from '../utils/ui';

interface ChatAreaProps {
  conversation: TakeoutConversation;
  highlightMessageId?: string;
  onSelectMedia: (att: TakeoutAttachment) => void;
  onViewRawJson: (data: any) => void;
  onOpenMembers: () => void;
  onOpenExport: () => void;
  onOpenStats: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  conversation,
  highlightMessageId,
  onSelectMedia,
  onViewRawJson,
  onOpenMembers,
  onOpenExport,
  onOpenStats,
}) => {
  const [localSearch, setLocalSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [highlightedId, setHighlightedId] = useState<string | undefined>(highlightMessageId);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Update highlighted message when prop changes
  useEffect(() => {
    if (highlightMessageId) {
      setHighlightedId(highlightMessageId);
      setTimeout(() => {
        const el = document.getElementById(`msg-${highlightMessageId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [highlightMessageId]);

  // Extract all distinct topics in conversation
  const topics = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of conversation.messages) {
      if (m.topic_id) {
        map.set(m.topic_id, (map.get(m.topic_id) || 0) + 1);
      }
    }
    return Array.from(map.entries()).map(([id, count]) => ({ id, count }));
  }, [conversation]);

  const toggleBookmark = (msgId: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(msgId)) next.delete(msgId);
      else next.add(msgId);
      return next;
    });
  };

  // Filter messages
  const filteredMessages = useMemo(() => {
    let list = conversation.messages.map((m) => ({
      ...m,
      bookmarked: bookmarkedIds.has(m.id),
    }));

    if (showStarredOnly) {
      list = list.filter((m) => m.bookmarked);
    }

    if (selectedTopic !== 'all') {
      list = list.filter((m) => m.topic_id === selectedTopic);
    }

    if (localSearch.trim()) {
      const q = localSearch.toLowerCase();
      list = list.filter(
        (m) =>
          m.text.toLowerCase().includes(q) ||
          m.creator.name.toLowerCase().includes(q) ||
          m.attached_files?.some((a) => a.original_name.toLowerCase().includes(q))
      );
    }

    return list;
  }, [conversation.messages, selectedTopic, localSearch, showStarredOnly, bookmarkedIds]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    chatContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Format first and last message dates for conversation range badge
  const dateRange = useMemo(() => {
    if (conversation.messages.length === 0) return '';
    const first = new Date(conversation.messages[0].timestamp);
    const last = new Date(conversation.messages[conversation.messages.length - 1].timestamp);
    return `${first.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} – ${last.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}`;
  }, [conversation.messages]);

  const isDM = conversation.type === 'dm';
  const avatarColor = getAvatarColor(conversation.name);
  const initials = getInitials(conversation.name);

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-neutral-900 overflow-hidden">
      {/* Conversation Top Header */}
      <div className="h-14 border-b border-[#dadce0] dark:border-neutral-800 px-4 sm:px-6 flex items-center justify-between gap-3 bg-white dark:bg-neutral-900 z-20 shrink-0 select-none">
        {/* Left: Title & Metadata */}
        <div className="flex items-center gap-3 min-w-0">
          {isDM ? (
            <div
              className={`w-8 h-8 rounded-full ${avatarColor.bg} ${avatarColor.text} flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}
            >
              {initials}
            </div>
          ) : (
            <div className="w-8 h-8 rounded-md bg-[#e8f0fe] text-[#1a73e8] dark:bg-[#1a73e8]/20 dark:text-[#8ab4f8] flex items-center justify-center text-sm shrink-0 border border-[#d2e3fc] dark:border-neutral-700">
              <Hash className="w-4 h-4" />
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#34a853] shrink-0" title="Active Local Archive"></div>
              <h2 className="font-bold text-sm sm:text-base text-[#202124] dark:text-neutral-100 truncate">
                {conversation.name}
              </h2>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#5f6368] dark:text-neutral-400">
              <button
                id="btn-open-members"
                onClick={onOpenMembers}
                className="hover:text-[#1a73e8] dark:hover:text-[#8ab4f8] flex items-center gap-1 font-medium transition-colors"
                title="View participant list"
              >
                <Users className="w-3 h-3" />
                <span>{conversation.members.length} {conversation.members.length === 1 ? 'member' : 'members'}</span>
              </button>

              <span>•</span>
              <span className="font-mono text-[10px] text-[#5f6368]">
                {conversation.messages.length.toLocaleString()} messages
              </span>

              <span>•</span>
              <span className="flex items-center gap-1 font-mono text-[10px]">
                <Calendar className="w-2.5 h-2.5" />
                {dateRange}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Controls & Search */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Search in Current Chat */}
          <div className="relative hidden md:block w-44 lg:w-56">
            <Search className="w-3.5 h-3.5 text-[#5f6368] absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Find in chat..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-8 pr-7 py-1 bg-[#f1f3f4] dark:bg-neutral-800 rounded-full text-xs text-[#202124] dark:text-neutral-200 placeholder-[#5f6368] border border-transparent focus:border-[#1a73e8] focus:bg-white dark:focus:bg-neutral-800 focus:outline-hidden transition-all"
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch('')}
                className="absolute right-2 top-1.5 text-[#5f6368] hover:text-[#202124] dark:hover:text-neutral-200"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Starred filter button */}
          <button
            onClick={() => setShowStarredOnly(!showStarredOnly)}
            title={showStarredOnly ? 'Show all messages' : 'Show starred messages only'}
            className={`p-1.5 rounded-full transition-colors ${
              showStarredOnly
                ? 'bg-amber-50 text-[#fbbc04] border border-amber-300'
                : 'text-[#5f6368] hover:text-[#202124] dark:hover:text-neutral-200 hover:bg-[#f1f3f4] dark:hover:bg-neutral-800'
            }`}
          >
            <Star className={`w-4 h-4 ${showStarredOnly ? 'fill-[#fbbc04]' : ''}`} />
          </button>

          {/* Analytics / Stats */}
          <button
            id="btn-chat-stats"
            onClick={onOpenStats}
            title="Conversation Stats & Analytics"
            className="p-1.5 text-[#5f6368] hover:text-[#202124] dark:hover:text-neutral-200 hover:bg-[#f1f3f4] dark:hover:bg-neutral-800 rounded-full transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
          </button>

          {/* Export button */}
          <button
            id="btn-chat-export"
            onClick={onOpenExport}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-neutral-800 hover:bg-[#f1f3f4] dark:hover:bg-neutral-700 text-[#3c4043] dark:text-neutral-200 rounded text-xs font-medium transition-colors border border-[#dadce0] dark:border-neutral-700 shadow-2xs"
            title="Export conversation as HTML, Markdown, or JSON"
          >
            <Download className="w-3.5 h-3.5 text-[#1a73e8]" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Sub-header: Topics Filter Toolbar if space has multiple topics */}
      {topics.length > 1 && (
        <div className="px-4 py-1.5 bg-[#f8f9fa] dark:bg-neutral-900 border-b border-[#dadce0] dark:border-neutral-800 flex items-center gap-1.5 overflow-x-auto text-xs shrink-0">
          <span className="flex items-center gap-1 text-[#5f6368] dark:text-neutral-400 font-bold text-[11px] uppercase tracking-wider whitespace-nowrap">
            <Layers className="w-3 h-3" /> Threads:
          </span>
          <button
            onClick={() => setSelectedTopic('all')}
            className={`px-2.5 py-0.5 rounded text-xs font-medium whitespace-nowrap transition-colors border ${
              selectedTopic === 'all'
                ? 'bg-[#1a73e8] text-white border-[#1a73e8] shadow-2xs'
                : 'bg-white dark:bg-neutral-800 text-[#3c4043] dark:text-neutral-300 border-[#dadce0] dark:border-neutral-700 hover:bg-[#f1f3f4]'
            }`}
          >
            All ({conversation.messages.length})
          </button>
          {topics.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTopic(t.id)}
              className={`px-2.5 py-0.5 rounded text-xs font-medium whitespace-nowrap transition-colors border ${
                selectedTopic === t.id
                  ? 'bg-[#1a73e8] text-white border-[#1a73e8] shadow-2xs'
                  : 'bg-white dark:bg-neutral-800 text-[#3c4043] dark:text-neutral-300 border-[#dadce0] dark:border-neutral-700 hover:bg-[#f1f3f4]'
              }`}
            >
              Thread #{t.id.slice(-6)} ({t.count})
            </button>
          ))}
        </div>
      )}

      {/* Messages Scroll Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-2 sm:px-4 py-3 space-y-0.5 relative"
      >
        {filteredMessages.length === 0 ? (
          <div className="py-24 text-center text-[#5f6368] text-xs">
            <Info className="w-8 h-8 mx-auto mb-2 opacity-40" />
            No messages found matching your filter criteria.
          </div>
        ) : (
          filteredMessages.map((msg, idx) => {
            const prevMsg = filteredMessages[idx - 1];

            // Check if we need a Date Divider Pill
            const showDateDivider =
              !prevMsg ||
              new Date(prevMsg.timestamp).toDateString() !==
                new Date(msg.timestamp).toDateString();

            // Group messages if from same sender within 5 minutes
            const isSameSenderAsPrev =
              prevMsg &&
              prevMsg.creator.name === msg.creator.name &&
              !prevMsg.is_system_message &&
              !msg.is_system_message &&
              msg.timestamp - prevMsg.timestamp < 300000 &&
              !showDateDivider &&
              prevMsg.topic_id === msg.topic_id;

            const isFirstInGroup = !isSameSenderAsPrev;

            return (
              <React.Fragment key={msg.id}>
                {showDateDivider && (
                  <div className="flex items-center justify-center my-4 select-none">
                    <span className="text-[11px] font-bold text-[#5f6368] dark:text-neutral-400 bg-[#f1f3f4] dark:bg-neutral-800 px-3 py-1 rounded-full uppercase tracking-wider border border-[#dadce0] dark:border-neutral-700">
                      {formatDateDivider(msg.timestamp)}
                    </span>
                  </div>
                )}

                <MessageItem
                  message={msg}
                  isFirstInGroup={isFirstInGroup}
                  searchQuery={localSearch}
                  isHighlighted={highlightedId === msg.id}
                  onSelectMedia={onSelectMedia}
                  onViewRawJson={onViewRawJson}
                  onToggleBookmark={toggleBookmark}
                  onJumpToThread={(tId) => setSelectedTopic(tId)}
                />
              </React.Fragment>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Scroll Nav Buttons */}
      <div className="absolute right-6 bottom-16 flex flex-col gap-1.5 z-20">
        <button
          onClick={scrollToTop}
          title="Scroll to top (Oldest)"
          className="p-2 bg-white dark:bg-neutral-800 text-[#5f6368] dark:text-neutral-300 rounded-full shadow-md border border-[#dadce0] dark:border-neutral-700 hover:bg-[#f8f9fa] dark:hover:bg-neutral-700 transition-transform active:scale-95"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={scrollToBottom}
          title="Scroll to bottom (Newest)"
          className="p-2 bg-white dark:bg-neutral-800 text-[#5f6368] dark:text-neutral-300 rounded-full shadow-md border border-[#dadce0] dark:border-neutral-700 hover:bg-[#f8f9fa] dark:hover:bg-neutral-700 transition-transform active:scale-95"
        >
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Offline Archive Mode Bottom Banner */}
      <div className="p-3 bg-white dark:bg-neutral-900 border-t border-[#dadce0] dark:border-neutral-800 shrink-0 select-none">
        <div className="flex items-center gap-3 px-4 py-2 bg-[#f1f3f4] dark:bg-neutral-800/80 rounded-full text-[#5f6368] dark:text-neutral-400 text-xs border border-[#dadce0] dark:border-neutral-700">
          <Lock className="w-3.5 h-3.5 text-[#5f6368] dark:text-neutral-400 shrink-0" />
          <span className="truncate">
            Offline Archive Mode: Messaging is disabled. Viewing Google Chat Takeout local history.
          </span>
        </div>
      </div>
    </div>
  );
};

