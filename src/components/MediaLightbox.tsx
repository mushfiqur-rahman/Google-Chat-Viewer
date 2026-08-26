import React, { useEffect, useState } from 'react';
import { X, ZoomIn, ZoomOut, Download, ExternalLink, RotateCw } from 'lucide-react';
import { TakeoutAttachment } from '../types';

interface MediaLightboxProps {
  attachment: TakeoutAttachment | null;
  onClose: () => void;
}

export const MediaLightbox: React.FC<MediaLightboxProps> = ({ attachment, onClose }) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!attachment) return null;

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 4));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  const isImage = attachment.file_type === 'image' || !attachment.file_type;

  return (
    <div
      id="media-lightbox-overlay"
      className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm text-white animate-fade-in"
      onClick={onClose}
    >
      {/* Top Bar */}
      <div
        className="flex items-center justify-between px-6 py-3 bg-neutral-900/80 border-b border-neutral-800 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="font-medium text-sm truncate max-w-md text-neutral-200">
            {attachment.original_name}
          </span>
          {attachment.export_name && (
            <span className="text-xs text-neutral-400 font-mono hidden md:inline truncate max-w-xs">
              {attachment.export_name}
            </span>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          {isImage && (
            <>
              <button
                id="btn-lightbox-zoomin"
                onClick={handleZoomIn}
                title="Zoom In"
                className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                id="btn-lightbox-zoomout"
                onClick={handleZoomOut}
                title="Zoom Out"
                className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button
                id="btn-lightbox-rotate"
                onClick={handleRotate}
                title="Rotate"
                className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
              >
                <RotateCw className="w-5 h-5" />
              </button>
            </>
          )}

          {attachment.file_url && (
            <a
              id="btn-lightbox-download"
              href={attachment.file_url}
              download={attachment.original_name}
              title="Download File"
              className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="w-5 h-5" />
            </a>
          )}

          {attachment.file_url && (
            <a
              id="btn-lightbox-open-tab"
              href={attachment.file_url}
              target="_blank"
              rel="noopener noreferrer"
              title="Open in new tab"
              className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          )}

          <button
            id="btn-lightbox-close"
            onClick={onClose}
            title="Close (Esc)"
            className="p-2 rounded-lg hover:bg-red-500/20 text-neutral-300 hover:text-red-400 transition-colors ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Media Content Stage */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden select-none">
        {attachment.file_url ? (
          isImage ? (
            <img
              src={attachment.file_url}
              alt={attachment.original_name}
              referrerPolicy="no-referrer"
              className="max-h-[85vh] max-w-[90vw] object-contain transition-transform duration-150 ease-out shadow-2xl rounded"
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg)`,
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div
              className="bg-neutral-900 p-8 rounded-xl border border-neutral-800 max-w-lg text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-base font-semibold mb-2">{attachment.original_name}</p>
              <p className="text-sm text-neutral-400 mb-6">Document / File attachment</p>
              <a
                href={attachment.file_url}
                download={attachment.original_name}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-medium text-sm transition-colors"
              >
                <Download className="w-4 h-4" /> Download File
              </a>
            </div>
          )
        ) : (
          <div
            className="bg-neutral-900 p-8 rounded-xl border border-neutral-800 max-w-md text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-base font-medium mb-2">{attachment.original_name}</p>
            <p className="text-xs text-neutral-400">
              This attachment reference was exported in the Takeout metadata without the raw binary file attached in this view session.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
