import React from 'react';
import { X, BarChart3, Users, MessageSquare, Paperclip, Smile, Calendar, Clock } from 'lucide-react';
import { TakeoutConversation } from '../types';

interface StatsModalProps {
  conversation: TakeoutConversation;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ conversation, onClose }) => {
  const totalMessages = conversation.messages.length;
  let totalWords = 0;
  let totalAttachments = 0;
  let totalReactions = 0;

  const senderCounts: Record<string, number> = {};
  const emojiCounts: Record<string, number> = {};
  const hourCounts: number[] = new Array(24).fill(0);
  const dayOfWeekCounts: number[] = new Array(7).fill(0);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (const msg of conversation.messages) {
    // Word count
    const words = msg.text.trim().split(/\s+/).filter(Boolean);
    totalWords += words.length;

    // Sender
    const name = msg.creator.name || 'Unknown';
    senderCounts[name] = (senderCounts[name] || 0) + 1;

    // Attachments
    if (msg.attached_files) {
      totalAttachments += msg.attached_files.length;
    }

    // Reactions
    if (msg.reactions) {
      for (const r of msg.reactions) {
        totalReactions += r.count;
        emojiCounts[r.emoji] = (emojiCounts[r.emoji] || 0) + r.count;
      }
    }

    // Time metrics
    const d = new Date(msg.timestamp);
    hourCounts[d.getHours()]++;
    dayOfWeekCounts[d.getDay()]++;
  }

  // Sorted senders
  const sortedSenders = Object.entries(senderCounts).sort((a, b) => b[1] - a[1]);
  const sortedEmojis = Object.entries(emojiCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const maxSenderCount = sortedSenders[0]?.[1] || 1;
  const maxDayCount = Math.max(...dayOfWeekCounts, 1);

  // Find busiest hour
  let peakHour = 0;
  let peakHourCount = 0;
  hourCounts.forEach((count, hour) => {
    if (count > peakHourCount) {
      peakHourCount = count;
      peakHour = hour;
    }
  });

  const peakHourStr = new Date(2024, 0, 1, peakHour).toLocaleTimeString([], { hour: 'numeric', hour12: true });

  return (
    <div
      id="stats-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="stats-modal-card"
        className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm md:text-base">
                Conversation Analytics & Insights
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-xs">
                {conversation.name}
              </p>
            </div>
          </div>
          <button
            id="btn-close-stats-modal"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center">
              <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
              <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {totalMessages.toLocaleString()}
              </div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400">Messages</div>
            </div>

            <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
              <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {sortedSenders.length}
              </div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400">Contributors</div>
            </div>

            <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center">
              <Paperclip className="w-4 h-4 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
              <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {totalAttachments}
              </div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400">Files & Media</div>
            </div>

            <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center">
              <Smile className="w-4 h-4 text-amber-500 mx-auto mb-1" />
              <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {totalReactions}
              </div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400">Reactions</div>
            </div>
          </div>

          {/* Quick Insights */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
              <Clock className="w-3.5 h-3.5 text-blue-500" /> Busiest Time: <strong>{peakHourStr}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" /> Total Words: <strong>{totalWords.toLocaleString()}</strong>
            </span>
          </div>

          {/* Senders Breakdown */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
              Top Contributors
            </h4>
            <div className="space-y-2.5">
              {sortedSenders.slice(0, 6).map(([name, count]) => {
                const percent = Math.round((count / totalMessages) * 100);
                return (
                  <div key={name} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-neutral-800 dark:text-neutral-200">
                      <span>{name}</span>
                      <span className="text-neutral-500 dark:text-neutral-400 font-mono">
                        {count} msgs ({percent}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${(count / maxSenderCount) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity by Day of Week */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
              Activity by Day of Week
            </h4>
            <div className="grid grid-cols-7 gap-2">
              {daysOfWeek.map((day, idx) => {
                const count = dayOfWeekCounts[idx];
                const heightPct = Math.round((count / maxDayCount) * 100);
                return (
                  <div key={day} className="flex flex-col items-center">
                    <div className="w-full h-24 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-end p-1">
                      <div
                        className="w-full bg-blue-500 rounded-md transition-all duration-300"
                        style={{ height: `${Math.max(heightPct, 4)}%` }}
                        title={`${count} messages on ${day}`}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mt-1.5">
                      {day}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Emoji Reactions */}
          {sortedEmojis.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
                Most Used Reactions
              </h4>
              <div className="flex flex-wrap gap-2">
                {sortedEmojis.map(([emoji, count]) => (
                  <div
                    key={emoji}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs"
                  >
                    <span className="text-base">{emoji}</span>
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
