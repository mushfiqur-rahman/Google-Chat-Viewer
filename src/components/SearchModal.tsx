import React, { useState, useMemo } from 'react';
import { Search, X, Filter, Calendar, User, Paperclip, Link as LinkIcon, Smile, Star, ArrowRight, MessageSquare } from 'lucide-react';
import { TakeoutConversation, TakeoutMessage } from '../types';
import { FormattedText } from './FormattedText';
import { formatFullDateTime } from '../utils/date';
import { getAvatarColor, getInitials } from '../utils/ui';

interface SearchModalProps {
  conversations: TakeoutConversation[];
  activeConversationId?: string;
  onSelectResult: (conversationId: string, messageId: string) => void;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  conversations,
  activeConversationId,
  onSelectResult,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [targetScope, setTargetScope] = useState<'all' | 'current'>(activeConversationId ? 'current' : 'all');
  const [selectedSender, setSelectedSender] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [hasAttachment, setHasAttachment] = useState(false);
  const [hasLink, setHasLink] = useState(false);
  const [hasReaction, setHasReaction] = useState(false);
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Extract all unique senders across conversations
  const allSenders = useMemo(() => {
    const set = new Set<string>();
    for (const c of conversations) {
      for (const m of c.messages) {
        if (m.creator?.name) set.add(m.creator.name);
      }
    }
    return Array.from(set).sort();
  }, [conversations]);

  // Execute search filter
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const fromTime = dateFrom ? new Date(dateFrom).getTime() : 0;
    const toTime = dateTo ? new Date(dateTo).getTime() + 86400000 : Infinity;

    const matched: { conversation: TakeoutConversation; message: TakeoutMessage }[] = [];

    const targetConversations =
      targetScope === 'current' && activeConversationId
        ? conversations.filter((c) => c.id === activeConversationId)
        : conversations;

    for (const conv of targetConversations) {
      for (const msg of conv.messages) {
        // Query match
        if (q) {
          const matchText = msg.text.toLowerCase().includes(q);
          const matchSender = msg.creator.name.toLowerCase().includes(q);
          const matchAttachment = msg.attached_files?.some((a) => a.original_name.toLowerCase().includes(q));
          if (!matchText && !matchSender && !matchAttachment) continue;
        }

        // Sender filter
        if (selectedSender !== 'all' && msg.creator.name !== selectedSender) {
          continue;
        }

        // Date range filter
        if (msg.timestamp < fromTime || msg.timestamp > toTime) {
          continue;
        }

        // Has attachment filter
        if (hasAttachment && (!msg.attached_files || msg.attached_files.length === 0)) {
          continue;
        }

        // Has link filter
        if (hasLink && !msg.text.includes('http://') && !msg.text.includes('https://')) {
          continue;
        }

        // Has reaction filter
        if (hasReaction && (!msg.reactions || msg.reactions.length === 0)) {
          continue;
        }

        // Starred only
        if (bookmarkedOnly && !msg.bookmarked) {
          continue;
        }

        matched.push({ conversation: conv, message: msg });
      }
    }

    // Sort newest first
    return matched.sort((a, b) => b.message.timestamp - a.message.timestamp);
  }, [
    conversations,
    query,
    targetScope,
    activeConversationId,
    selectedSender,
    dateFrom,
    dateTo,
    hasAttachment,
    hasLink,
    hasReaction,
    bookmarkedOnly,
  ]);

  const activeFiltersCount =
    (selectedSender !== 'all' ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0) +
    (hasAttachment ? 1 : 0) +
    (hasLink ? 1 : 0) +
    (hasReaction ? 1 : 0) +
    (bookmarkedOnly ? 1 : 0);

  return (
    <div
      id="search-modal-overlay"
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="search-modal-card"
        className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-neutral-400" />
            <input
              id="input-global-search"
              type="text"
              placeholder="Search messages, senders, links, or attached files..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="flex-1 bg-transparent text-sm sm:text-base text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-hidden"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                  : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 bg-emerald-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scope selection */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-200/60 dark:border-neutral-800/60">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">Search scope:</span>
            <button
              onClick={() => setTargetScope('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                targetScope === 'all'
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
              }`}
            >
              All Conversations ({conversations.length})
            </button>
            {activeConversationId && (
              <button
                onClick={() => setTargetScope('current')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  targetScope === 'current'
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                }`}
              >
                In Current Chat Only
              </button>
            )}
          </div>

          {/* Expanded Filter Panel */}
          {showFilters && (
            <div className="mt-3 p-3.5 bg-white dark:bg-neutral-800/70 rounded-xl border border-neutral-200 dark:border-neutral-700/80 space-y-3 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Sender */}
                <div>
                  <label className="flex items-center gap-1 font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    <User className="w-3.5 h-3.5" /> Sender
                  </label>
                  <select
                    value={selectedSender}
                    onChange={(e) => setSelectedSender(e.target.value)}
                    className="w-full p-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs"
                  >
                    <option value="all">Any Sender</option>
                    {allSenders.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date From */}
                <div>
                  <label className="flex items-center gap-1 font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    <Calendar className="w-3.5 h-3.5" /> From Date
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full p-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs"
                  />
                </div>

                {/* Date To */}
                <div>
                  <label className="flex items-center gap-1 font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    <Calendar className="w-3.5 h-3.5" /> To Date
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full p-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer text-neutral-700 dark:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={hasAttachment}
                    onChange={(e) => setHasAttachment(e.target.checked)}
                    className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <Paperclip className="w-3.5 h-3.5 text-neutral-500" /> Has Files / Images
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-neutral-700 dark:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={hasLink}
                    onChange={(e) => setHasLink(e.target.checked)}
                    className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <LinkIcon className="w-3.5 h-3.5 text-neutral-500" /> Has Links
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-neutral-700 dark:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={hasReaction}
                    onChange={(e) => setHasReaction(e.target.checked)}
                    className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <Smile className="w-3.5 h-3.5 text-neutral-500" /> Has Emoji Reactions
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-neutral-700 dark:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={bookmarkedOnly}
                    onChange={(e) => setBookmarkedOnly(e.target.checked)}
                    className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <Star className="w-3.5 h-3.5 text-amber-500" /> Starred Only
                </label>

                {activeFiltersCount > 0 && (
                  <button
                    onClick={() => {
                      setSelectedSender('all');
                      setDateFrom('');
                      setDateTo('');
                      setHasAttachment(false);
                      setHasLink(false);
                      setHasReaction(false);
                      setBookmarkedOnly(false);
                    }}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:underline ml-auto"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-neutral-100 dark:divide-neutral-800/80">
          <div className="text-xs text-neutral-400 pb-2 px-1">
            {results.length} {results.length === 1 ? 'message found' : 'messages found'}
          </div>

          {results.length === 0 ? (
            <div className="py-16 text-center text-neutral-400 text-xs">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No matching messages found. Try adjusting your search query or filters.
            </div>
          ) : (
            results.slice(0, 100).map(({ conversation, message }) => {
              const avatarColor = getAvatarColor(message.creator.name);
              const initials = getInitials(message.creator.name);

              return (
                <div
                  key={`${conversation.id}-${message.id}`}
                  onClick={() => onSelectResult(conversation.id, message.id)}
                  className="group py-3 px-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/60 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {conversation.name}
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        {formatFullDateTime(new Date(message.timestamp))}
                      </span>
                    </div>

                    <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Jump to message <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-full ${avatarColor.bg} ${avatarColor.text} flex items-center justify-center font-semibold text-[10px] shrink-0`}
                    >
                      {initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                          {message.creator.name}
                        </span>
                      </div>
                      <FormattedText
                        text={message.text}
                        searchQuery={query}
                        className="text-xs text-neutral-700 dark:text-neutral-300 line-clamp-3 mt-0.5"
                      />

                      {/* Attachments preview */}
                      {message.attached_files && message.attached_files.length > 0 && (
                        <div className="flex items-center gap-2 mt-1.5">
                          {message.attached_files.map((a, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-md text-neutral-600 dark:text-neutral-400"
                            >
                              <Paperclip className="w-3 h-3" /> {a.original_name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
