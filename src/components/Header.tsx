import React from 'react';
import {
  MessageSquare,
  Search,
  Upload,
  BarChart3,
  Moon,
  Sun,
  Menu,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import { TakeoutConversation } from '../types';

interface HeaderProps {
  conversations: TakeoutConversation[];
  activeConversation?: TakeoutConversation;
  onOpenUpload: () => void;
  onOpenSearch: () => void;
  onOpenStats: () => void;
  onOpenPrivacy: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onToggleSidebar: () => void;
  showInfoPanel?: boolean;
  onToggleInfoPanel?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  conversations,
  onOpenUpload,
  onOpenSearch,
  onOpenStats,
  onOpenPrivacy,
  darkMode,
  onToggleDarkMode,
  onToggleSidebar,
  showInfoPanel,
  onToggleInfoPanel,
}) => {
  return (
    <header className="h-14 sm:h-16 bg-white dark:bg-neutral-900 border-b border-[#dadce0] dark:border-neutral-800 px-3 sm:px-4 flex items-center justify-between gap-2 sm:gap-4 z-30 shrink-0 select-none">
      {/* Left: Hamburger & Branding */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          id="btn-toggle-sidebar"
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 text-[#5f6368] hover:text-[#202124] dark:text-neutral-400 dark:hover:text-neutral-200 rounded-md hover:bg-[#f1f3f4] dark:hover:bg-neutral-800 transition-colors"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-center gap-2.5">
          <div className="bg-[#1a73e8] p-1.5 sm:p-2 rounded-lg text-white shadow-xs shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="sm:w-5 sm:h-5">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-medium text-[#202124] dark:text-neutral-100 tracking-tight">
              Archive<span className="text-[#1a73e8] font-bold">Chat</span>
            </h1>
            <span className="hidden xs:inline-block px-1.5 py-0.5 bg-[#e8f0fe] dark:bg-[#1a73e8]/20 text-[#1967d2] dark:text-[#8ab4f8] text-[10px] font-bold rounded uppercase tracking-wider border border-[#d2e3fc] dark:border-[#1a73e8]/30">
              v0.0.1
            </span>
          </div>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-xl hidden md:block mx-2 sm:mx-6">
        <button
          id="btn-header-search"
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 sm:py-2 bg-[#f1f3f4] dark:bg-neutral-800/90 hover:bg-[#e8eaed] dark:hover:bg-neutral-700/80 rounded-lg text-xs text-[#5f6368] dark:text-neutral-400 transition-all border border-transparent focus:border-[#1a73e8] focus:bg-white dark:focus:bg-neutral-900"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[#5f6368] dark:text-neutral-400" />
            <span className="truncate">Search in all conversations...</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-neutral-900 border border-[#dadce0] dark:border-neutral-700 rounded text-[10px] font-mono text-[#5f6368] dark:text-neutral-400 shadow-2xs">
              Ctrl + K
            </kbd>
          </div>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Privacy Policy button */}
        <button
          id="btn-header-privacy"
          onClick={onOpenPrivacy}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#f8f9fa] dark:bg-neutral-800 hover:bg-[#f1f3f4] dark:hover:bg-neutral-700 text-[#3c4043] dark:text-neutral-200 rounded-md text-xs font-medium transition-colors border border-[#dadce0] dark:border-neutral-700"
          title="Privacy Policy & Security"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#34a853] dark:text-[#81c995]" />
          <span className="hidden sm:inline">Privacy Policy</span>
        </button>

        {/* Global Search mobile button */}
        <button
          onClick={onOpenSearch}
          className="md:hidden p-2 text-[#5f6368] dark:text-neutral-300 hover:bg-[#f1f3f4] dark:hover:bg-neutral-800 rounded-md transition-colors"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Analytics button */}
        {conversations.length > 0 && (
          <button
            id="btn-header-stats"
            onClick={onOpenStats}
            className="p-2 text-[#5f6368] dark:text-neutral-300 hover:bg-[#f1f3f4] dark:hover:bg-neutral-800 rounded-md transition-colors"
            title="Archive Analytics & Stats"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
        )}

        {/* Upload archive button */}
        <button
          id="btn-header-upload"
          onClick={onOpenUpload}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-md text-xs font-medium shadow-xs transition-colors"
          title="Load Google Takeout Archive"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Load Takeout</span>
          <span className="hidden md:inline text-[10px] opacity-85 uppercase font-mono">ZIP/JSON</span>
        </button>

        {/* Toggle Right Info Panel */}
        {onToggleInfoPanel && conversations.length > 0 && (
          <button
            onClick={onToggleInfoPanel}
            className={`hidden xl:inline-flex p-2 rounded-md transition-colors ${
              showInfoPanel
                ? 'bg-[#e8f0fe] text-[#1967d2] dark:bg-[#1a73e8]/20 dark:text-[#8ab4f8]'
                : 'text-[#5f6368] dark:text-neutral-300 hover:bg-[#f1f3f4] dark:hover:bg-neutral-800'
            }`}
            title="Toggle Archive Information Panel"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        )}

        {/* Dark mode toggle */}
        <button
          id="btn-toggle-dark-mode"
          onClick={onToggleDarkMode}
          className="p-2 text-[#5f6368] dark:text-neutral-300 hover:bg-[#f1f3f4] dark:hover:bg-neutral-800 rounded-md transition-colors"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};

