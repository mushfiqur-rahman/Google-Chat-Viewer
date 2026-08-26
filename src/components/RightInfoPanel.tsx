import React, { useMemo } from 'react';
import {
  ShieldCheck,
  Calendar,
  Layers,
  FileCode,
  Users,
  Download,
  BarChart3,
  HardDrive,
  Clock,
  Sparkles,
} from 'lucide-react';
import { TakeoutConversation } from '../types';
import { formatBytes } from '../utils/ui';

interface RightInfoPanelProps {
  activeConversation?: TakeoutConversation;
  allConversations: TakeoutConversation[];
  selectedYear?: string;
  onSelectYear: (year: string | undefined) => void;
  onOpenMembers: () => void;
  onOpenExport: () => void;
  onOpenStats: () => void;
  onViewRawJson: () => void;
}

export const RightInfoPanel: React.FC<RightInfoPanelProps> = ({
  activeConversation,
  allConversations,
  selectedYear,
  onSelectYear,
  onOpenMembers,
  onOpenExport,
  onOpenStats,
  onViewRawJson,
}) => {
  // Aggregate statistics
  const totalStats = useMemo(() => {
    let totalMessages = 0;
    let totalFiles = 0;
    let totalSizeEst = 0;
    const yearSet = new Set<string>();

    for (const conv of allConversations) {
      totalMessages += conv.messages.length;
      totalFiles += conv.total_attachments || 0;
      for (const m of conv.messages) {
        if (m.timestamp) {
          const y = new Date(m.timestamp).getFullYear().toString();
          yearSet.add(y);
        }
        if (m.attached_files) {
          for (const f of m.attached_files) {
            totalSizeEst += f.byte_size || 50000;
          }
        }
      }
    }

    const sortedYears = Array.from(yearSet).sort().reverse();

    return {
      totalMessages,
      totalFiles,
      totalSizeEst: totalSizeEst > 0 ? totalSizeEst : totalMessages * 450,
      years: sortedYears.length > 0 ? sortedYears : ['2024', '2023', '2022', '2021'],
    };
  }, [allConversations]);

  return (
    <aside
      id="archive-info-sidebar"
      className="w-64 bg-[#f8f9fa] dark:bg-neutral-900 border-l border-[#dadce0] dark:border-neutral-800 p-4 flex flex-col gap-5 overflow-y-auto shrink-0 select-none text-xs"
    >
      {/* 1. Archive Information Card */}
      <div>
        <h4 className="text-[11px] font-bold text-[#5f6368] dark:text-neutral-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Archive Information</span>
          <HardDrive className="w-3.5 h-3.5 opacity-60" />
        </h4>
        <div className="space-y-2 bg-white dark:bg-neutral-800 p-3 rounded-lg border border-[#dadce0] dark:border-neutral-700/80 shadow-2xs">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#5f6368] dark:text-neutral-400">Loaded:</span>
            <span className="font-medium text-[#202124] dark:text-neutral-200">Local Cache</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#5f6368] dark:text-neutral-400">Messages:</span>
            <span className="font-semibold text-[#1a73e8] dark:text-[#8ab4f8]">
              {totalStats.totalMessages.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#5f6368] dark:text-neutral-400">Attached Files:</span>
            <span className="font-medium text-[#202124] dark:text-neutral-200">
              {totalStats.totalFiles.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#5f6368] dark:text-neutral-400">Memory Footprint:</span>
            <span className="font-medium text-[#202124] dark:text-neutral-200">
              {formatBytes(totalStats.totalSizeEst)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Verified Local / Privacy Card */}
      <div>
        <h4 className="text-[11px] font-bold text-[#5f6368] dark:text-neutral-400 uppercase tracking-wider mb-2">
          Data Privacy
        </h4>
        <div className="bg-[#e6f4ea] dark:bg-[#137333]/20 p-3 rounded-lg border border-[#34a853] dark:border-[#34a853]/40 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-[#137333] dark:text-[#81c995]">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="text-[11px] font-bold tracking-wide uppercase">Verified Local</span>
          </div>
          <p className="text-[10px] leading-relaxed text-[#137333] dark:text-[#a8dab5]">
            No data is uploaded to any server. All parsing, indexing, and rendering occurs in your browser's local memory.
          </p>
        </div>
      </div>

      {/* 3. Filter by Year Grid */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[11px] font-bold text-[#5f6368] dark:text-neutral-400 uppercase tracking-wider">
            Filter by Year
          </h4>
          {selectedYear && (
            <button
              onClick={() => onSelectYear(undefined)}
              className="text-[10px] text-[#1a73e8] dark:text-[#8ab4f8] hover:underline"
            >
              Clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {totalStats.years.map((yr) => {
            const isSel = selectedYear === yr;
            return (
              <button
                key={yr}
                onClick={() => onSelectYear(isSel ? undefined : yr)}
                className={`p-2 rounded text-[11px] font-mono font-medium transition-colors border ${
                  isSel
                    ? 'bg-[#1a73e8] text-white border-[#1a73e8] shadow-2xs'
                    : 'bg-white dark:bg-neutral-800 text-[#3c4043] dark:text-neutral-200 border-[#dadce0] dark:border-neutral-700 hover:bg-[#f1f3f4] dark:hover:bg-neutral-700'
                }`}
              >
                {yr}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Active Space / Quick Tools */}
      {activeConversation && (
        <div>
          <h4 className="text-[11px] font-bold text-[#5f6368] dark:text-neutral-400 uppercase tracking-wider mb-2">
            Active Chat Actions
          </h4>
          <div className="space-y-1.5">
            <button
              onClick={onOpenStats}
              className="w-full flex items-center justify-between p-2 bg-white dark:bg-neutral-800 hover:bg-[#f1f3f4] dark:hover:bg-neutral-700 border border-[#dadce0] dark:border-neutral-700 rounded text-xs text-[#3c4043] dark:text-neutral-200 transition-colors"
            >
              <span className="flex items-center gap-2">
                <BarChart3 className="w-3.5 h-3.5 text-[#1a73e8]" /> Conversation Stats
              </span>
            </button>

            <button
              onClick={onOpenMembers}
              className="w-full flex items-center justify-between p-2 bg-white dark:bg-neutral-800 hover:bg-[#f1f3f4] dark:hover:bg-neutral-700 border border-[#dadce0] dark:border-neutral-700 rounded text-xs text-[#3c4043] dark:text-neutral-200 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-[#34a853]" /> Participant List
              </span>
              <span className="text-[10px] text-[#5f6368] font-mono">
                {activeConversation.members.length}
              </span>
            </button>

            <button
              onClick={onOpenExport}
              className="w-full flex items-center justify-between p-2 bg-white dark:bg-neutral-800 hover:bg-[#f1f3f4] dark:hover:bg-neutral-700 border border-[#dadce0] dark:border-neutral-700 rounded text-xs text-[#3c4043] dark:text-neutral-200 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Download className="w-3.5 h-3.5 text-[#e8710a]" /> Export Conversation
              </span>
            </button>

            <button
              onClick={onViewRawJson}
              className="w-full flex items-center justify-between p-2 bg-white dark:bg-neutral-800 hover:bg-[#f1f3f4] dark:hover:bg-neutral-700 border border-[#dadce0] dark:border-neutral-700 rounded text-xs text-[#3c4043] dark:text-neutral-200 transition-colors"
            >
              <span className="flex items-center gap-2">
                <FileCode className="w-3.5 h-3.5 text-[#9334e6]" /> Inspect Raw JSON
              </span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
