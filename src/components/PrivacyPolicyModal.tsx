import React from 'react';
import { ShieldCheck, Lock, EyeOff, ServerOff, CheckCircle2, X, ExternalLink } from 'lucide-react';

interface PrivacyPolicyModalProps {
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ onClose }) => {
  return (
    <div
      id="privacy-policy-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="privacy-policy-modal"
        className="bg-white dark:bg-neutral-900 border border-[#dadce0] dark:border-neutral-700 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#dadce0] dark:border-neutral-800 flex items-center justify-between bg-[#f8f9fa] dark:bg-neutral-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#e6f4ea] dark:bg-[#137333]/20 text-[#137333] dark:text-[#81c995] border border-[#34a853]/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#202124] dark:text-neutral-100 flex items-center gap-2">
                Privacy Policy & Security Guarantee
              </h2>
              <p className="text-xs text-[#5f6368] dark:text-neutral-400">
                ArchiveChat v0.0.1 • itsupportbee.com
              </p>
            </div>
          </div>
          <button
            id="btn-close-privacy-modal"
            onClick={onClose}
            className="p-1.5 text-[#5f6368] hover:text-[#202124] dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-[#e8eaed] dark:hover:bg-neutral-800 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs text-[#3c4043] dark:text-neutral-300 leading-relaxed">
          {/* Key Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-[#f8f9fa] dark:bg-neutral-800/60 border border-[#dadce0] dark:border-neutral-700/80 rounded-lg space-y-1 text-center">
              <ServerOff className="w-5 h-5 text-[#1a73e8] dark:text-[#8ab4f8] mx-auto mb-1" />
              <div className="font-bold text-[#202124] dark:text-neutral-100 text-xs">Zero Server Upload</div>
              <div className="text-[11px] text-[#5f6368] dark:text-neutral-400">All data stays in browser memory</div>
            </div>

            <div className="p-3 bg-[#f8f9fa] dark:bg-neutral-800/60 border border-[#dadce0] dark:border-neutral-700/80 rounded-lg space-y-1 text-center">
              <EyeOff className="w-5 h-5 text-[#34a853] dark:text-[#81c995] mx-auto mb-1" />
              <div className="font-bold text-[#202124] dark:text-neutral-100 text-xs">No Analytics / Tracking</div>
              <div className="text-[11px] text-[#5f6368] dark:text-neutral-400">No cookies, beacons, or telemetry</div>
            </div>

            <div className="p-3 bg-[#f8f9fa] dark:bg-neutral-800/60 border border-[#dadce0] dark:border-neutral-700/80 rounded-lg space-y-1 text-center">
              <Lock className="w-5 h-5 text-[#e8710a] dark:text-[#f29900] mx-auto mb-1" />
              <div className="font-bold text-[#202124] dark:text-neutral-100 text-xs">Full Ownership</div>
              <div className="text-[11px] text-[#5f6368] dark:text-neutral-400">You retain 100% control of exports</div>
            </div>
          </div>

          {/* Section 1 */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-[#202124] dark:text-neutral-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#e8f0fe] dark:bg-[#1a73e8]/20 text-[#1a73e8] dark:text-[#8ab4f8] flex items-center justify-center font-mono text-xs">
                1
              </span>
              100% Client-Side Local Processing
            </h3>
            <p>
              ArchiveChat is designed from the ground up as an offline-first, client-side utility. When you load a Google Takeout <code>.zip</code> file, unzipped folder, or <code>messages.json</code> file, the data is decompressed and indexed entirely within your browser's local sandbox memory using standard JavaScript Web APIs and in-memory Web Workers.
            </p>
            <p>
              <strong>None of your chat messages, contact names, email addresses, images, attachments, or conversation metadata are ever transmitted to any remote server or cloud database.</strong>
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-[#202124] dark:text-neutral-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#e8f0fe] dark:bg-[#1a73e8]/20 text-[#1a73e8] dark:text-[#8ab4f8] flex items-center justify-center font-mono text-xs">
                2
              </span>
              No Telemetry, Cookies, or Data Collection
            </h3>
            <p>
              This application does not collect, log, or track user activity. There are no tracking cookies, analytics services (such as Google Analytics, Mixpanel, or Amplitude), advertising pixels, or telemetry beacons embedded in this application.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-[#202124] dark:text-neutral-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#e8f0fe] dark:bg-[#1a73e8]/20 text-[#1a73e8] dark:text-[#8ab4f8] flex items-center justify-center font-mono text-xs">
                3
              </span>
              Volatile Session Storage
            </h3>
            <p>
              Parsed conversations and loaded media files exist solely in volatile browser RAM for the duration of your session. Once you reload or close the browser tab, all in-memory chat data is immediately discarded. If you wish to save your parsed chats, you may use the manual Export features (HTML, Markdown, or JSON).
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-[#202124] dark:text-neutral-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#e8f0fe] dark:bg-[#1a73e8]/20 text-[#1a73e8] dark:text-[#8ab4f8] flex items-center justify-center font-mono text-xs">
                4
              </span>
              Publisher & Copyright
            </h3>
            <p>
              ArchiveChat v0.0.1 is maintained and published by{' '}
              <a
                href="https://itsupportbee.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#1a73e8] dark:text-[#8ab4f8] inline-flex items-center gap-1 hover:underline"
              >
                itsupportbee.com <ExternalLink className="w-3 h-3" />
              </a>
              .
            </p>
            <p className="text-[11px] text-[#5f6368] dark:text-neutral-400">
              © {new Date().getFullYear()} itsupportbee.com. All rights reserved. Google, Google Chat, and Google Takeout are trademarks of Google LLC. This tool is an independent viewer not affiliated with Google LLC.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-[#dadce0] dark:border-neutral-800 bg-[#f8f9fa] dark:bg-neutral-900/90 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-[#137333] dark:text-[#81c995] font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>Verified 100% Offline Safe</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded font-medium text-xs transition-colors shadow-2xs"
          >
            I Understand & Accept
          </button>
        </div>
      </div>
    </div>
  );
};
