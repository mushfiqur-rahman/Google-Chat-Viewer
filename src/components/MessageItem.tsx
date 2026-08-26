import React, { useState } from 'react';
import { Bot, Paperclip, FileText, Download, Copy, Check, Star, Code, Eye, ExternalLink } from 'lucide-react';
import { TakeoutMessage, TakeoutAttachment } from '../types';
import { getAvatarColor, getInitials, formatBytes } from '../utils/ui';
import { formatTimeOnly } from '../utils/date';
import { FormattedText } from './FormattedText';

interface MessageItemProps {
  message: TakeoutMessage;
  isFirstInGroup: boolean;
  searchQuery?: string;
  isHighlighted?: boolean;
  onSelectMedia: (att: TakeoutAttachment) => void;
  onViewRawJson: (data: any) => void;
  onToggleBookmark?: (messageId: string) => void;
  onJumpToThread?: (topicId: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isFirstInGroup,
  searchQuery,
  isHighlighted,
  onSelectMedia,
  onViewRawJson,
  onToggleBookmark,
  onJumpToThread,
}) => {
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const { creator, text, timestamp, created_date, attached_files, reactions, is_system_message, bookmarked, topic_id } = message;
  const avatarColor = getAvatarColor(creator.name);
  const initials = getInitials(creator.name);
  const isBot = creator.user_type === 'Bot_System' || creator.user_type === 'System' || creator.name.toLowerCase().includes('bot');

  const handleCopyText = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  // System notification styling
  if (is_system_message) {
    return (
      <div
        id={`msg-${message.id}`}
        className={`group relative flex items-start gap-3 py-2 px-3 sm:px-4 my-1 rounded-lg transition-all duration-200 ${
          isHighlighted ? 'bg-amber-100/80 dark:bg-amber-950/40 ring-1 ring-amber-400' : 'hover:bg-[#f8f9fa] dark:hover:bg-neutral-800/40'
        }`}
      >
        <div className="w-8 h-8 rounded-full bg-[#f1f3f4] dark:bg-neutral-700 flex items-center justify-center text-[#5f6368] dark:text-neutral-300 shrink-0 text-xs mt-0.5">
          <Bot className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-bold text-[#202124] dark:text-neutral-200">{creator.name}</span>
            <span className="text-[10px] text-gray-400">{formatTimeOnly(timestamp)}</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-[#f1f3f4] dark:bg-neutral-700 text-[#5f6368] dark:text-neutral-300 rounded font-medium">
              System
            </span>
          </div>
          <FormattedText text={text} searchQuery={searchQuery} className="text-xs text-[#5f6368] dark:text-neutral-400" />
        </div>

        {/* Hover actions */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-2 flex items-center gap-1 bg-white dark:bg-neutral-800 border border-[#dadce0] dark:border-neutral-700 rounded-md p-1 shadow-sm z-10">
          <button
            onClick={() => onViewRawJson(message.raw || message)}
            title="Inspect raw Takeout JSON"
            className="p-1 text-[#5f6368] hover:text-[#202124] dark:hover:text-neutral-200 rounded hover:bg-[#f1f3f4] dark:hover:bg-neutral-700"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id={`msg-${message.id}`}
      className={`group relative flex gap-3.5 px-3 sm:px-6 py-1 rounded-md transition-all duration-200 ${
        isFirstInGroup ? 'mt-3 pt-2' : 'mt-0.5'
      } ${
        isHighlighted
          ? 'bg-amber-50 dark:bg-amber-950/40 ring-1 ring-amber-400 shadow-2xs'
          : 'hover:bg-[#f8f9fa] dark:hover:bg-neutral-800/40'
      }`}
    >
      {/* Left Avatar / Spacer */}
      {isFirstInGroup ? (
        <div
          className={`w-9 h-9 rounded-full ${avatarColor.bg} ${avatarColor.text} shrink-0 mt-0.5 flex items-center justify-center font-medium text-xs shadow-2xs select-none`}
        >
          {initials}
        </div>
      ) : (
        <div className="w-9 shrink-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity select-none">
          <span className="text-[10px] text-gray-400 font-mono" title={created_date}>
            {formatTimeOnly(timestamp)}
          </span>
        </div>
      )}

      {/* Main Message Content */}
      <div className="flex-1 min-w-0">
        {/* Author Header for First in Group */}
        {isFirstInGroup && (
          <div className="flex items-baseline gap-2 mb-0.5 flex-wrap">
            <span className="text-sm font-bold text-[#202124] dark:text-neutral-100">
              {creator.name}
            </span>

            {isBot && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                <Bot className="w-3 h-3" /> BOT
              </span>
            )}

            <div className="relative inline-block">
              <span
                className="text-[10px] text-gray-400 cursor-help"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                {formatTimeOnly(timestamp)}
              </span>
              {showTooltip && (
                <div className="absolute left-0 bottom-full mb-1 z-30 px-2 py-1 bg-[#202124] text-white text-[10px] rounded shadow-lg whitespace-nowrap pointer-events-none">
                  {created_date}
                </div>
              )}
            </div>

            {topic_id && (
              <button
                onClick={() => onJumpToThread?.(topic_id)}
                className="text-[10px] font-medium px-2 py-0.2 rounded bg-[#f1f3f4] dark:bg-neutral-800 text-[#5f6368] dark:text-neutral-400 hover:bg-[#e8eaed] dark:hover:bg-neutral-700 transition-colors"
                title={`Topic ID: ${topic_id}`}
              >
                Thread #{topic_id.slice(-6)}
              </button>
            )}
          </div>
        )}

        {/* Message Text */}
        {text && (
          <FormattedText
            text={text}
            searchQuery={searchQuery}
            className="text-sm leading-relaxed text-[#3c4043] dark:text-neutral-200 font-normal"
          />
        )}

        {/* Attached Files & Images */}
        {attached_files && attached_files.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2.5">
            {attached_files.map((att, idx) => {
              const isImg = att.file_type === 'image' || att.original_name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);

              if (isImg) {
                return (
                  <div
                    key={idx}
                    onClick={() => onSelectMedia(att)}
                    className="group/img relative rounded-lg overflow-hidden border border-[#dadce0] dark:border-neutral-700 bg-[#f8f9fa] dark:bg-neutral-800 max-w-sm cursor-pointer shadow-2xs hover:shadow-xs transition-all"
                  >
                    {att.file_url ? (
                      <img
                        src={att.file_url}
                        alt={att.original_name}
                        referrerPolicy="no-referrer"
                        className="max-h-56 w-auto object-cover rounded-lg transition-transform duration-200 group-hover/img:scale-[1.01]"
                      />
                    ) : (
                      <div className="p-3 flex items-center gap-3">
                        <Paperclip className="w-5 h-5 text-[#5f6368]" />
                        <div>
                          <p className="text-xs font-medium text-[#202124] dark:text-neutral-200">{att.original_name}</p>
                          <span className="text-[10px] text-[#5f6368]">Image attachment</span>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                      <span className="px-2.5 py-1 bg-[#202124]/90 text-white rounded text-xs font-medium flex items-center gap-1.5 backdrop-blur-xs">
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={idx}
                  onClick={() => att.file_url && onSelectMedia(att)}
                  className="flex items-center gap-3 p-2.5 rounded-lg border border-[#dadce0] dark:border-neutral-700 bg-white dark:bg-neutral-800/80 hover:bg-[#f8f9fa] dark:hover:bg-neutral-700/80 max-w-sm cursor-pointer transition-colors shadow-2xs"
                >
                  <div className="w-8 h-8 rounded bg-[#e8f0fe] text-[#1a73e8] dark:bg-[#1a73e8]/20 dark:text-[#8ab4f8] flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#202124] dark:text-neutral-100 truncate">
                      {att.original_name}
                    </p>
                    <p className="text-[10px] text-[#5f6368] dark:text-neutral-400">
                      {att.file_size ? formatBytes(att.file_size) : 'Takeout Document'}
                    </p>
                  </div>
                  {att.file_url ? (
                    <a
                      href={att.file_url}
                      download={att.original_name}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 text-[#5f6368] hover:text-[#202124] dark:hover:text-neutral-200 rounded hover:bg-[#f1f3f4] dark:hover:bg-neutral-600 transition-colors"
                      title="Download file"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  ) : (
                    <Paperclip className="w-4 h-4 text-[#5f6368] shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Reactions */}
        {reactions && reactions.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5 items-center">
            {reactions.map((reaction, rIdx) => (
              <div
                key={rIdx}
                title={reaction.reactors.length > 0 ? `Reacted by: ${reaction.reactors.join(', ')}` : 'Emoji Reaction'}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f1f3f4] dark:bg-neutral-800 hover:bg-[#e8eaed] dark:hover:bg-neutral-700 border border-[#dadce0] dark:border-neutral-700 text-xs cursor-default transition-all shadow-2xs"
              >
                <span className="text-sm select-none">{reaction.emoji}</span>
                <span className="text-[11px] font-medium text-[#3c4043] dark:text-neutral-300">
                  {reaction.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hover Action Floating Bar */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 -top-2 flex items-center gap-0.5 bg-white dark:bg-neutral-800 border border-[#dadce0] dark:border-neutral-700 rounded p-0.5 shadow-sm z-20">
        <button
          onClick={handleCopyText}
          title="Copy message text"
          className="p-1 text-[#5f6368] hover:text-[#202124] dark:hover:text-neutral-100 rounded hover:bg-[#f1f3f4] dark:hover:bg-neutral-700 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#34a853]" /> : <Copy className="w-3.5 h-3.5" />}
        </button>

        {onToggleBookmark && (
          <button
            onClick={() => onToggleBookmark(message.id)}
            title={bookmarked ? 'Remove Star' : 'Star message'}
            className={`p-1 rounded hover:bg-[#f1f3f4] dark:hover:bg-neutral-700 transition-colors ${
              bookmarked ? 'text-[#fbbc04] fill-[#fbbc04]' : 'text-[#5f6368] hover:text-[#fbbc04]'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          onClick={() => onViewRawJson(message.raw || message)}
          title="Inspect raw Takeout JSON"
          className="p-1 text-[#5f6368] hover:text-[#202124] dark:hover:text-neutral-100 rounded hover:bg-[#f1f3f4] dark:hover:bg-neutral-700 transition-colors"
        >
          <Code className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

