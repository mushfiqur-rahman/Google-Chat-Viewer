import React, { useState } from 'react';
import { X, Download, FileText, Code, FileCode, Check } from 'lucide-react';
import { TakeoutConversation } from '../types';

interface ExportModalProps {
  conversation: TakeoutConversation;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ conversation, onClose }) => {
  const [format, setFormat] = useState<'html' | 'md' | 'json' | 'txt'>('html');
  const [includeAttachments, setIncludeAttachments] = useState(true);
  const [downloaded, setDownloaded] = useState(false);

  const handleExport = () => {
    let content = '';
    let mimeType = 'text/plain';
    let fileExt = 'txt';

    const safeTitle = conversation.name.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();

    if (format === 'json') {
      content = JSON.stringify(conversation, null, 2);
      mimeType = 'application/json';
      fileExt = 'json';
    } else if (format === 'md') {
      mimeType = 'text/markdown';
      fileExt = 'md';
      content = `# ${conversation.name}\n\n`;
      content += `**Type**: ${conversation.type.toUpperCase()}\n`;
      content += `**Members**: ${conversation.members.map((m) => m.name).join(', ')}\n`;
      content += `**Total Messages**: ${conversation.messages.length}\n\n`;
      content += `---\n\n`;

      for (const msg of conversation.messages) {
        content += `### ${msg.creator.name} - *${msg.created_date}*\n\n`;
        content += `${msg.text}\n\n`;
        if (includeAttachments && msg.attached_files && msg.attached_files.length > 0) {
          content += `*Attachments*:\n`;
          for (const att of msg.attached_files) {
            content += `- 📎 [${att.original_name}](${att.export_name || ''})\n`;
          }
          content += `\n`;
        }
        if (msg.reactions && msg.reactions.length > 0) {
          content += `*Reactions*: ${msg.reactions.map((r) => `${r.emoji} (${r.count})`).join(' ')}\n\n`;
        }
        content += `---\n\n`;
      }
    } else if (format === 'txt') {
      mimeType = 'text/plain';
      fileExt = 'txt';
      content = `${conversation.name}\n`;
      content += `========================================================\n\n`;
      for (const msg of conversation.messages) {
        content += `[${msg.created_date}] ${msg.creator.name}:\n${msg.text}\n\n`;
      }
    } else {
      // HTML format - standalone styled page ready for viewing or printing to PDF
      mimeType = 'text/html';
      fileExt = 'html';
      content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(conversation.name)} - Google Chat Transcript</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1f2937; background: #fafafa; }
    .header { border-bottom: 2px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px; }
    h1 { margin: 0 0 8px 0; color: #111827; }
    .meta { font-size: 13px; color: #6b7280; }
    .message { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px 18px; margin-bottom: 12px; }
    .msg-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .author { font-weight: 600; color: #111827; }
    .date { font-size: 12px; color: #9ca3af; }
    .text { white-space: pre-wrap; line-height: 1.5; font-size: 14px; }
    .reactions { margin-top: 8px; font-size: 12px; color: #4b5563; }
    .reaction-pill { display: inline-block; background: #f3f4f6; border-radius: 12px; padding: 2px 8px; margin-right: 6px; }
    .attachments { margin-top: 8px; font-size: 12px; color: #2563eb; }
    @media print { body { background: white; max-width: 100%; margin: 0; } .message { break-inside: avoid; border: 1px solid #d1d5db; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${escapeHtml(conversation.name)}</h1>
    <div class="meta">
      <strong>Type:</strong> ${escapeHtml(conversation.type.toUpperCase())} |
      <strong>Participants:</strong> ${escapeHtml(conversation.members.map((m) => m.name).join(', '))} |
      <strong>Exported Messages:</strong> ${conversation.messages.length}
    </div>
  </div>
  <div class="messages">
    ${conversation.messages
      .map(
        (m) => `
      <div class="message">
        <div class="msg-header">
          <span class="author">${escapeHtml(m.creator.name)}</span>
          <span class="date">${escapeHtml(m.created_date)}</span>
        </div>
        <div class="text">${escapeHtml(m.text)}</div>
        ${
          m.reactions && m.reactions.length > 0
            ? `<div class="reactions">${m.reactions
                .map((r) => `<span class="reaction-pill">${r.emoji} ${r.count}</span>`)
                .join('')}</div>`
            : ''
        }
        ${
          m.attached_files && m.attached_files.length > 0
            ? `<div class="attachments">📎 Attached: ${m.attached_files
                .map((a) => escapeHtml(a.original_name))
                .join(', ')}</div>`
            : ''
        }
      </div>
    `
      )
      .join('')}
  </div>
</body>
</html>`;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeTitle}_transcript.${fileExt}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div
      id="export-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="export-modal-card"
        className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-md shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm md:text-base">
                Export Conversation
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-xs">
                {conversation.name}
              </p>
            </div>
          </div>
          <button
            id="btn-close-export-modal"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'html', label: 'HTML (Print/PDF)', icon: FileCode, desc: 'Styled page for browser & printing' },
                { id: 'md', label: 'Markdown (.md)', icon: FileText, desc: 'Clean formatted doc for Notion/Obsidian' },
                { id: 'json', label: 'JSON Data', icon: Code, desc: 'Complete structured conversation data' },
                { id: 'txt', label: 'Plain Text (.txt)', icon: FileText, desc: 'Lightweight raw text log' },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = format === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setFormat(item.id as any)}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200'
                        : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-medium text-xs">
                      <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-tight">
                      {item.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="chk-include-attachments"
              checked={includeAttachments}
              onChange={(e) => setIncludeAttachments(e.target.checked)}
              className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="chk-include-attachments" className="text-xs text-neutral-700 dark:text-neutral-300">
              Include attachment lists and emoji reaction summaries
            </label>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-export"
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl shadow-xs transition-colors"
            >
              {downloaded ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              {downloaded ? 'Downloaded!' : `Download ${format.toUpperCase()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
