import React, { useState, useRef } from 'react';
import { UploadCloud, FolderOpen, FileCode, ShieldCheck, Sparkles, AlertCircle, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { ParseProgress } from '../types';

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  onLoadSampleData: () => void;
  progress: ParseProgress | null;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFilesSelected,
  onLoadSampleData,
  progress,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const items = e.dataTransfer.items;
    const files: File[] = [];

    if (items) {
      // Traverse dropped items (handles directories and files)
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
    } else {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        files.push(e.dataTransfer.files[i]);
      }
    }

    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  const isLoading = progress && progress.status !== 'completed' && progress.status !== 'error' && progress.status !== 'idle';

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 space-y-5">
      {/* Privacy Guarantee Banner */}
      <div className="flex items-center gap-3 p-3.5 bg-[#e6f4ea] dark:bg-[#137333]/20 border border-[#34a853] dark:border-[#34a853]/40 rounded-lg text-xs text-[#137333] dark:text-[#a8dab5] shadow-2xs">
        <div className="p-2 rounded bg-[#34a853] text-white shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <strong className="font-bold block text-[#137333] dark:text-[#81c995]">
            100% Private & Client-Side Local
          </strong>
          <span>
            Your Google Takeout archives are parsed directly inside your browser. No messages, media, or personal data ever leave your machine.
          </span>
        </div>
      </div>

      {/* Main Drag & Drop Zone */}
      <div
        id="dropzone-archive-upload"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 sm:p-10 text-center transition-all duration-200 ${
          isDragging
            ? 'border-[#1a73e8] bg-[#e8f0fe] dark:bg-[#1a73e8]/10 scale-[1.01]'
            : 'border-[#dadce0] dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:border-[#1a73e8] shadow-2xs'
        }`}
      >
        {/* Hidden inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip,.json"
          multiple
          className="hidden"
          onChange={handleFileInputChange}
        />
        <input
          ref={folderInputRef}
          type="file"
          // @ts-ignore
          webkitdirectory=""
          directory=""
          multiple
          className="hidden"
          onChange={handleFileInputChange}
        />

        {isLoading ? (
          <div className="space-y-4 py-4">
            <div className="w-10 h-10 border-3 border-[#1a73e8] border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-[#202124] dark:text-neutral-100">
                {progress.message}
              </h3>
              <p className="text-xs text-[#5f6368] dark:text-neutral-400">
                {progress.fileName ? `File: ${progress.fileName}` : 'Parsing conversations & attachments...'}
              </p>
            </div>

            {/* Progress bar */}
            <div className="max-w-xs mx-auto h-2 bg-[#f1f3f4] dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1a73e8] rounded-full transition-all duration-300"
                style={{ width: `${progress.progressPercent}%` }}
              />
            </div>

            <div className="flex justify-center gap-4 text-xs font-mono text-[#5f6368]">
              <span>{progress.conversationsFound} conversations</span>
              <span>•</span>
              <span>{progress.messagesFound} messages</span>
              <span>•</span>
              <span>{progress.mediaCount} media files</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#e8f0fe] text-[#1a73e8] dark:bg-[#1a73e8]/20 dark:text-[#8ab4f8] flex items-center justify-center mx-auto shadow-2xs">
              <UploadCloud className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-bold text-[#202124] dark:text-neutral-100">
                Drop your Google Takeout export here
              </h3>
              <p className="text-xs text-[#5f6368] dark:text-neutral-400 mt-1 max-w-md mx-auto">
                Supports Takeout <strong>.ZIP</strong> archives, unzipped Takeout <strong>folders</strong>, or direct <strong>messages.json</strong> / <strong>Hangouts.json</strong> files.
              </p>
            </div>

            {/* Upload Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <button
                id="btn-select-zip-file"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded font-medium text-xs shadow-2xs transition-colors"
              >
                <FileCode className="w-4 h-4" /> Select .ZIP or JSON File
              </button>

              <button
                id="btn-select-folder"
                onClick={() => folderInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 hover:bg-[#f1f3f4] dark:hover:bg-neutral-700 text-[#3c4043] dark:text-neutral-200 rounded font-medium text-xs border border-[#dadce0] dark:border-neutral-700 transition-colors shadow-2xs"
              >
                <FolderOpen className="w-4 h-4 text-[#e8710a]" /> Select Unzipped Folder
              </button>
            </div>

            {/* Or Sample Data */}
            <div className="pt-3 border-t border-[#dadce0] dark:border-neutral-800">
              <p className="text-xs text-[#5f6368] mb-2">Want to try it without an export first?</p>
              <button
                id="btn-load-sample-takeout"
                onClick={onLoadSampleData}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1a73e8] dark:text-[#8ab4f8] hover:bg-[#e8f0fe] dark:hover:bg-[#1a73e8]/20 rounded transition-colors border border-[#d2e3fc] dark:border-neutral-700"
              >
                <Sparkles className="w-3.5 h-3.5" /> Explore with Sample Google Chat Backup
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error display */}
      {progress?.status === 'error' && (
        <div className="p-3.5 bg-[#fce8e6] dark:bg-red-950/30 border border-[#ea4335] dark:border-red-800 rounded-lg flex items-start gap-3 text-xs text-[#c5221f] dark:text-red-300">
          <AlertCircle className="w-4 h-4 text-[#ea4335] shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block mb-0.5">Could not parse file</strong>
            <span>{progress.error || 'Please verify the file is a valid Google Takeout archive containing messages.json or Hangouts.json.'}</span>
          </div>
        </div>
      )}

      {/* Accordion: How to get Google Takeout */}
      <div className="bg-white dark:bg-neutral-900 border border-[#dadce0] dark:border-neutral-800 rounded-lg overflow-hidden shadow-2xs">
        <button
          onClick={() => setShowHowTo(!showHowTo)}
          className="w-full flex items-center justify-between p-3.5 text-left hover:bg-[#f8f9fa] dark:hover:bg-neutral-800/50 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-4 h-4 text-[#1a73e8]" />
            <span className="text-xs font-bold text-[#202124] dark:text-neutral-200">
              How to export your Google Chat history from Google Takeout
            </span>
          </div>
          {showHowTo ? <ChevronUp className="w-4 h-4 text-[#5f6368]" /> : <ChevronDown className="w-4 h-4 text-[#5f6368]" />}
        </button>

        {showHowTo && (
          <div className="p-3.5 pt-0 border-t border-[#dadce0] dark:border-neutral-800 text-xs text-[#3c4043] dark:text-neutral-400 space-y-2">
            <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
              <li>
                Go to <a href="https://takeout.google.com" target="_blank" rel="noopener noreferrer" className="text-[#1a73e8] dark:text-[#8ab4f8] underline font-medium">takeout.google.com</a> in your browser.
              </li>
              <li>
                Click <strong>Deselect all</strong> at the top of the list.
              </li>
              <li>
                Scroll down and check only <strong>Google Chat</strong> (and optionally Hangouts if you have older archives).
              </li>
              <li>
                Click <strong>Next step</strong> at the bottom.
              </li>
              <li>
                Choose <em>Transfer to: Email (download link)</em> and file format <em>.zip</em>, then click <strong>Create export</strong>.
              </li>
              <li>
                Once Google finishes preparing the archive, download the zip file and drop it directly onto this page!
              </li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

