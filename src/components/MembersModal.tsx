import React, { useState } from 'react';
import { X, Users, Mail, Bot, UserCheck, Search } from 'lucide-react';
import { TakeoutUser } from '../types';
import { getAvatarColor, getInitials } from '../utils/ui';

interface MembersModalProps {
  members: TakeoutUser[];
  spaceName: string;
  onClose: () => void;
}

export const MembersModal: React.FC<MembersModalProps> = ({ members, spaceName, onClose }) => {
  const [search, setSearch] = useState('');

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.email && m.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div
      id="members-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="members-modal-card"
        className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm md:text-base">
                Members & Participants
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-xs">
                {spaceName} ({members.length})
              </p>
            </div>
          </div>
          <button
            id="btn-close-members-modal"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search filter */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search members by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 text-xs md:text-sm rounded-xl border border-transparent focus:border-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-neutral-100 dark:divide-neutral-800/60">
          {filteredMembers.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400">No members found matching &ldquo;{search}&rdquo;</div>
          ) : (
            filteredMembers.map((member, idx) => {
              const color = getAvatarColor(member.name);
              const initials = getInitials(member.name);
              const isBot = member.user_type === 'Bot_System' || member.user_type === 'System' || member.name.toLowerCase().includes('bot');

              return (
                <div key={`${member.email || member.name}-${idx}`} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${color.bg} ${color.text} flex items-center justify-center font-semibold text-xs shrink-0 shadow-xs`}>
                      {initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs md:text-sm text-neutral-900 dark:text-neutral-100">
                          {member.name}
                        </span>
                        {isBot ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            <Bot className="w-3 h-3" /> Bot
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-neutral-400">
                            <UserCheck className="w-3 h-3 text-emerald-500" />
                          </span>
                        )}
                      </div>
                      {member.email && (
                        <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                          <Mail className="w-3 h-3 text-neutral-400" />
                          <span>{member.email}</span>
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
