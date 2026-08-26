import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Users,
  Hash,
  Search,
  Upload,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Paperclip,
  Database,
  Star,
} from 'lucide-react';
import { TakeoutConversation } from '../types';
import { getAvatarColor, getInitials } from '../utils/ui';
import { formatRelativeTime } from '../utils/date';

interface SidebarProps {
  conversations: TakeoutConversation[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onOpenUpload: () => void;
  onOpenSearch: () => void;
  onOpenStats?: () => void;
  isOpen: boolean;
  onToggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onOpenUpload,
  onOpenSearch,
  isOpen,
}) => {
  const [filterText, setFilterText] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'spaces' | 'dms'>('all');
  const [spacesOpen, setSpacesOpen] = useState(true);
  const [dmsOpen, setDmsOpen] = useState(true);

  // Group into Spaces and DMs
  const { spaces, dms } = useMemo(() => {
    const s: TakeoutConversation[] = [];
    const d: TakeoutConversation[] = [];

    for (const c of conversations) {
      if (c.type === 'dm') {
        d.push(c);
      } else {
        s.push(c);
      }
    }

    return { spaces: s, dms: d };
  }, [conversations]);

  // Filter conversations
  const filteredSpaces = useMemo(() => {
    if (!filterText.trim()) return spaces;
    const q = filterText.toLowerCase();
    return spaces.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.messages.some((m) => m.text.toLowerCase().includes(q))
    );
  }, [spaces, filterText]);

  const filteredDMs = useMemo(() => {
    if (!filterText.trim()) return dms;
    const q = filterText.toLowerCase();
    return dms.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.members.some((m) => m.name.toLowerCase().includes(q)) ||
        c.messages.some((m) => m.text.toLowerCase().includes(q))
    );
  }, [dms, filterText]);

  // Total stats
  const totalMessagesCount = useMemo(
    () => conversations.reduce((acc, c) => acc + c.messages.length, 0),
    [conversations]
  );
  const totalAttachmentsCount = useMemo(
    () => conversations.reduce((acc, c) => acc + (c.total_attachments || 0), 0),
    [conversations]
  );

  return (
    <aside
      id="app-sidebar"
      className={`fixed lg:static inset-y-0 left-0 z-40 w-72 sm:w-80 bg-white dark:bg-neutral-900 border-r border-[#dadce0] dark:border-neutral-800 flex flex-col transition-transform duration-200 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Top Filter & Search */}
      <div className="p-3 border-b border-[#dadce0] dark:border-neutral-800 space-y-2 bg-white dark:bg-neutral-900">
        <div className="flex items-center justify-between text-xs font-semibold text-[#5f6368] dark:text-neutral-400 uppercase tracking-wider">
          <span>Conversations</span>
          <span className="bg-[#f1f3f4] dark:bg-neutral-800 text-[#5f6368] dark:text-neutral-300 font-mono px-1.5 py-0.5 rounded text-[10px] font-bold">
            {conversations.length}
          </span>
        </div>

        {/* Filter input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Filter conversations..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#f1f3f4] dark:bg-neutral-800/80 border border-transparent rounded-lg text-xs text-[#202124] dark:text-neutral-200 placeholder-[#5f6368] dark:placeholder-neutral-500 focus:outline-hidden focus:bg-white dark:focus:bg-neutral-900 focus:border-[#1a73e8]"
          />
          <Search className="w-3.5 h-3.5 text-[#5f6368] dark:text-neutral-400 absolute left-2.5 top-2" />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-0.5 bg-[#f1f3f4] dark:bg-neutral-800 rounded-lg text-[11px] font-medium">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-1 rounded text-center transition-colors ${
              activeTab === 'all'
                ? 'bg-white dark:bg-neutral-900 text-[#202124] dark:text-neutral-100 shadow-2xs font-semibold'
                : 'text-[#5f6368] hover:text-[#202124] dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            All ({conversations.length})
          </button>
          <button
            onClick={() => setActiveTab('spaces')}
            className={`flex-1 py-1 rounded text-center transition-colors ${
              activeTab === 'spaces'
                ? 'bg-white dark:bg-neutral-900 text-[#202124] dark:text-neutral-100 shadow-2xs font-semibold'
                : 'text-[#5f6368] hover:text-[#202124] dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            Spaces ({spaces.length})
          </button>
          <button
            onClick={() => setActiveTab('dms')}
            className={`flex-1 py-1 rounded text-center transition-colors ${
              activeTab === 'dms'
                ? 'bg-white dark:bg-neutral-900 text-[#202124] dark:text-neutral-100 shadow-2xs font-semibold'
                : 'text-[#5f6368] hover:text-[#202124] dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            Direct ({dms.length})
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#dadce0]/40 dark:divide-neutral-800/40">
        {conversations.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#5f6368] dark:text-neutral-400 space-y-3">
            <Database className="w-8 h-8 mx-auto opacity-40" />
            <p>No archive loaded yet.</p>
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-md text-xs font-medium transition-colors"
            >
              <Upload className="w-3.5 h-3.5" /> Upload Backup
            </button>
          </div>
        ) : (
          <>
            {/* SPACES SECTION */}
            {(activeTab === 'all' || activeTab === 'spaces') && filteredSpaces.length > 0 && (
              <div>
                <button
                  onClick={() => setSpacesOpen(!spacesOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold text-[#5f6368] dark:text-neutral-400 uppercase tracking-wider bg-[#f8f9fa] dark:bg-neutral-900/80 hover:bg-[#f1f3f4] dark:hover:bg-neutral-800 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    {spacesOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    <span>Spaces & Groups</span>
                  </div>
                  <span className="text-[10px] font-mono lowercase">({filteredSpaces.length})</span>
                </button>

                {spacesOpen && (
                  <div className="divide-y divide-[#dadce0]/30 dark:divide-neutral-800/30">
                    {filteredSpaces.map((space) => {
                      const isSelected = space.id === activeConversationId;
                      const lastMsg = space.messages[space.messages.length - 1];

                      return (
                        <div
                          key={space.id}
                          id={`space-item-${space.id}`}
                          onClick={() => onSelectConversation(space.id)}
                          className={`group px-3 py-2.5 flex items-center gap-3 cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[#e8f0fe] dark:bg-[#1a73e8]/20 border-l-4 border-[#1a73e8]'
                              : 'hover:bg-[#f8f9fa] dark:hover:bg-neutral-800/60 border-l-4 border-transparent'
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs shrink-0 font-medium ${
                              isSelected
                                ? 'bg-[#1a73e8] text-white'
                                : 'bg-[#34a853] text-white'
                            }`}
                          >
                            <Hash className="w-4 h-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline gap-1">
                              <h3 className={`text-xs font-medium truncate ${isSelected ? 'text-[#1967d2] dark:text-[#8ab4f8] font-semibold' : 'text-[#202124] dark:text-neutral-100'}`}>
                                {space.name}
                              </h3>
                              {space.last_message_time && (
                                <span className="text-[10px] text-gray-500 dark:text-neutral-400 shrink-0">
                                  {formatRelativeTime(space.last_message_time)}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#5f6368] dark:text-neutral-400 truncate mt-0.5">
                              {lastMsg ? `${lastMsg.creator.name}: ${lastMsg.text || 'Attached file'}` : `${space.messages.length} messages`}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* DIRECT MESSAGES SECTION */}
            {(activeTab === 'all' || activeTab === 'dms') && filteredDMs.length > 0 && (
              <div>
                <button
                  onClick={() => setDmsOpen(!dmsOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold text-[#5f6368] dark:text-neutral-400 uppercase tracking-wider bg-[#f8f9fa] dark:bg-neutral-900/80 hover:bg-[#f1f3f4] dark:hover:bg-neutral-800 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    {dmsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    <span>Direct Messages</span>
                  </div>
                  <span className="text-[10px] font-mono lowercase">({filteredDMs.length})</span>
                </button>

                {dmsOpen && (
                  <div className="divide-y divide-[#dadce0]/30 dark:divide-neutral-800/30">
                    {filteredDMs.map((dm) => {
                      const isSelected = dm.id === activeConversationId;
                      const avatarColor = getAvatarColor(dm.name);
                      const initials = getInitials(dm.name);
                      const lastMsg = dm.messages[dm.messages.length - 1];

                      return (
                        <div
                          key={dm.id}
                          id={`dm-item-${dm.id}`}
                          onClick={() => onSelectConversation(dm.id)}
                          className={`group px-3 py-2.5 flex items-center gap-3 cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[#e8f0fe] dark:bg-[#1a73e8]/20 border-l-4 border-[#1a73e8]'
                              : 'hover:bg-[#f8f9fa] dark:hover:bg-neutral-800/60 border-l-4 border-transparent'
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-full ${avatarColor.bg} ${avatarColor.text} flex items-center justify-center font-medium text-xs shrink-0`}
                          >
                            {initials}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline gap-1">
                              <h3 className={`text-xs font-medium truncate ${isSelected ? 'text-[#1967d2] dark:text-[#8ab4f8] font-semibold' : 'text-[#202124] dark:text-neutral-100'}`}>
                                {dm.name}
                              </h3>
                              {dm.last_message_time && (
                                <span className="text-[10px] text-gray-500 dark:text-neutral-400 shrink-0">
                                  {formatRelativeTime(dm.last_message_time)}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#5f6368] dark:text-neutral-400 truncate mt-0.5">
                              {lastMsg ? lastMsg.text || 'Attached file' : `${dm.messages.length} messages`}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* High-density Sidebar Bottom Info */}
      <div className="p-3 border-t border-[#dadce0] dark:border-neutral-800 bg-[#f8f9fa] dark:bg-neutral-900 flex items-center justify-between text-[11px] text-[#5f6368] dark:text-neutral-400">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#34a853]"></div>
          <span className="font-medium">Sandbox Ready</span>
        </div>
        <span className="font-mono text-[10px]">
          {totalMessagesCount.toLocaleString()} msgs • {totalAttachmentsCount} files
        </span>
      </div>
    </aside>
  );
};

