import React, { useState, useEffect, useRef } from 'react';
import { TakeoutConversation, TakeoutAttachment, ParseProgress } from './types';
import { SAMPLE_CONVERSATIONS } from './data/sampleData';
import { parseTakeoutArchive } from './utils/parser';
import { getFilesFromDataTransfer } from './utils/fileDrop';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { RightInfoPanel } from './components/RightInfoPanel';
import { FileUploadZone } from './components/FileUploadZone';
import { SearchModal } from './components/SearchModal';
import { StatsModal } from './components/StatsModal';
import { ExportModal } from './components/ExportModal';
import { MembersModal } from './components/MembersModal';
import { MediaLightbox } from './components/MediaLightbox';
import { RawJsonModal } from './components/RawJsonModal';
import { UploadCloud } from 'lucide-react';

export default function App() {
  const [conversations, setConversations] = useState<TakeoutConversation[]>(SAMPLE_CONVERSATIONS);
  const [activeConversationId, setActiveConversationId] = useState<string>(SAMPLE_CONVERSATIONS[0]?.id || '');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string | undefined>(undefined);
  const [isWindowDragging, setIsWindowDragging] = useState(false);
  const dragCounterRef = useRef(0);

  // Modals & Overlays
  const [uploadViewOpen, setUploadViewOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<TakeoutAttachment | null>(null);
  const [rawJsonData, setRawJsonData] = useState<any | null>(null);
  const [highlightMessageId, setHighlightMessageId] = useState<string | undefined>(undefined);

  // Parsing state
  const [parseProgress, setParseProgress] = useState<ParseProgress | null>(null);

  // Dark mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('google_chat_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('google_chat_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('google_chat_theme', 'light');
    }
  }, [darkMode]);

  // Keyboard shortcuts & Window-level Drag-and-Drop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      } else if (e.key === '/' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };

    const handleWindowDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current += 1;
      if (e.dataTransfer?.types?.includes('Files')) {
        setIsWindowDragging(true);
      }
    };

    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
    };

    const handleWindowDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current -= 1;
      if (dragCounterRef.current <= 0) {
        setIsWindowDragging(false);
        dragCounterRef.current = 0;
      }
    };

    const handleWindowDrop = async (e: DragEvent) => {
      e.preventDefault();
      setIsWindowDragging(false);
      dragCounterRef.current = 0;

      if (e.dataTransfer) {
        const files = await getFilesFromDataTransfer(e.dataTransfer);
        if (files && files.length > 0) {
          handleFilesSelected(files);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('dragenter', handleWindowDragEnter);
    window.addEventListener('dragover', handleWindowDragOver);
    window.addEventListener('dragleave', handleWindowDragLeave);
    window.addEventListener('drop', handleWindowDrop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('dragenter', handleWindowDragEnter);
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('dragleave', handleWindowDragLeave);
      window.removeEventListener('drop', handleWindowDrop);
    };
  }, []);

  const handleFilesSelected = async (files: File[]) => {
    try {
      setParseProgress({
        status: 'reading',
        progressPercent: 10,
        message: 'Reading uploaded archive...',
        conversationsFound: 0,
        messagesFound: 0,
        mediaCount: 0,
      });

      const parsed = await parseTakeoutArchive(files, (p) => setParseProgress(p));

      if (parsed.length > 0) {
        setConversations(parsed);
        setActiveConversationId(parsed[0].id);
        setUploadViewOpen(false);
      } else {
        setParseProgress({
          status: 'error',
          progressPercent: 0,
          message: 'No chat messages found in the files.',
          conversationsFound: 0,
          messagesFound: 0,
          mediaCount: 0,
          error: 'Could not find messages.json or Hangouts.json in the provided files. Please ensure you uploaded a valid Google Takeout Google Chat archive.',
        });
      }
    } catch (err: any) {
      console.error('Error parsing files:', err);
      setParseProgress({
        status: 'error',
        progressPercent: 0,
        message: 'Parsing error occurred.',
        conversationsFound: 0,
        messagesFound: 0,
        mediaCount: 0,
        error: err?.message || 'Failed to parse archive. Please check the file format.',
      });
    }
  };

  const handleLoadSampleData = () => {
    setConversations(SAMPLE_CONVERSATIONS);
    setActiveConversationId(SAMPLE_CONVERSATIONS[0].id);
    setUploadViewOpen(false);
    setParseProgress(null);
  };

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || conversations[0];

  // If year is filtered, optionally filter the displayed messages or jump
  const filteredActiveConversation = React.useMemo(() => {
    if (!activeConversation) return activeConversation;
    if (!selectedYear) return activeConversation;

    const filteredMsgs = activeConversation.messages.filter((m) => {
      if (!m.timestamp) return true;
      const y = new Date(m.timestamp).getFullYear().toString();
      return y === selectedYear;
    });

    return {
      ...activeConversation,
      messages: filteredMsgs.length > 0 ? filteredMsgs : activeConversation.messages,
    };
  }, [activeConversation, selectedYear]);

  const handleSelectSearchResult = (conversationId: string, messageId: string) => {
    setActiveConversationId(conversationId);
    setHighlightMessageId(messageId);
    setSearchModalOpen(false);
    setUploadViewOpen(false);
    setSidebarOpen(false);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#f8f9fa] dark:bg-neutral-950 text-[#202124] dark:text-neutral-100 overflow-hidden font-sans antialiased">
      {/* Top Header */}
      <Header
        conversations={conversations}
        activeConversation={activeConversation}
        onOpenUpload={() => setUploadViewOpen(true)}
        onOpenSearch={() => setSearchModalOpen(true)}
        onOpenStats={() => setStatsModalOpen(true)}
        onLoadSampleData={handleLoadSampleData}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Workspace Layout (Sidebar + Chat Area + Right Info Panel) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={(id) => {
            setActiveConversationId(id);
            setUploadViewOpen(false);
            setSidebarOpen(false);
            setHighlightMessageId(undefined);
          }}
          onOpenUpload={() => {
            setUploadViewOpen(true);
            setSidebarOpen(false);
          }}
          onOpenSearch={() => setSearchModalOpen(true)}
          isOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Mobile backdrop for sidebar */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-30 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Pane */}
        <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-neutral-900 overflow-hidden relative">
          {uploadViewOpen || conversations.length === 0 ? (
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center">
              <FileUploadZone
                onFilesSelected={handleFilesSelected}
                onLoadSampleData={handleLoadSampleData}
                progress={parseProgress}
              />
            </div>
          ) : filteredActiveConversation ? (
            <ChatArea
              conversation={filteredActiveConversation}
              highlightMessageId={highlightMessageId}
              onSelectMedia={(att) => setSelectedMedia(att)}
              onViewRawJson={(data) => setRawJsonData(data)}
              onOpenMembers={() => setMembersModalOpen(true)}
              onOpenExport={() => setExportModalOpen(true)}
              onOpenStats={() => setStatsModalOpen(true)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-[#5f6368] text-xs">
              Select a conversation from the sidebar to view chat history.
            </div>
          )}
        </main>

        {/* Right Info Panel (Desktop) */}
        {!uploadViewOpen && conversations.length > 0 && (
          <div className="hidden xl:flex shrink-0">
            <RightInfoPanel
              activeConversation={activeConversation}
              allConversations={conversations}
              selectedYear={selectedYear}
              onSelectYear={setSelectedYear}
              onOpenMembers={() => setMembersModalOpen(true)}
              onOpenExport={() => setExportModalOpen(true)}
              onOpenStats={() => setStatsModalOpen(true)}
              onViewRawJson={() => setRawJsonData(activeConversation?.raw || activeConversation)}
            />
          </div>
        )}
      </div>

      {/* High Density Status Footer */}
      <footer
        id="app-status-footer"
        className="h-7 bg-[#f1f3f4] dark:bg-neutral-900 border-t border-[#dadce0] dark:border-neutral-800 px-4 flex items-center justify-between text-[10px] text-[#5f6368] dark:text-neutral-400 select-none shrink-0"
      >
        <div className="flex items-center gap-2 truncate">
          <span>Engine: Browser-side V8</span>
          <span>•</span>
          <span>Local Sandbox (Zero Network Transmission)</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden sm:inline font-mono">Takeout Viewer v1.4.2</span>
          <span className="flex items-center gap-1.5 font-medium text-[#137333] dark:text-[#81c995]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34a853] inline-block animate-pulse"></span>
            Local Runtime Active
          </span>
        </div>
      </footer>

      {/* Global Search Modal */}
      {searchModalOpen && (
        <SearchModal
          conversations={conversations}
          activeConversationId={activeConversation?.id}
          onSelectResult={handleSelectSearchResult}
          onClose={() => setSearchModalOpen(false)}
        />
      )}

      {/* Analytics & Stats Modal */}
      {statsModalOpen && activeConversation && (
        <StatsModal
          conversation={activeConversation}
          onClose={() => setStatsModalOpen(false)}
        />
      )}

      {/* Export Conversation Modal */}
      {exportModalOpen && activeConversation && (
        <ExportModal
          conversation={activeConversation}
          onClose={() => setExportModalOpen(false)}
        />
      )}

      {/* Space Members Modal */}
      {membersModalOpen && activeConversation && (
        <MembersModal
          members={activeConversation.members}
          spaceName={activeConversation.name}
          onClose={() => setMembersModalOpen(false)}
        />
      )}

      {/* Media Lightbox */}
      {selectedMedia && (
        <MediaLightbox
          attachment={selectedMedia}
          onClose={() => setSelectedMedia(null)}
        />
      )}

      {/* Raw JSON Payload Inspector */}
      {rawJsonData && (
        <RawJsonModal
          data={rawJsonData}
          onClose={() => setRawJsonData(null)}
        />
      )}

      {/* Global Window Drag-and-Drop Overlay */}
      {isWindowDragging && (
        <div
          id="window-drag-overlay"
          className="fixed inset-0 z-50 bg-[#1a73e8]/20 backdrop-blur-xs border-4 border-dashed border-[#1a73e8] flex flex-col items-center justify-center pointer-events-none p-6 animate-pulse"
        >
          <div className="bg-white dark:bg-neutral-900 border border-[#1a73e8] rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-md text-center">
            <div className="w-16 h-16 rounded-full bg-[#1a73e8] text-white flex items-center justify-center shadow-lg">
              <UploadCloud className="w-9 h-9" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#202124] dark:text-neutral-100">
                Drop Google Takeout Archive Here
              </h2>
              <p className="text-xs text-[#5f6368] dark:text-neutral-400 mt-1">
                Release your Takeout .zip archive, folder, or JSON export anywhere to parse locally.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

