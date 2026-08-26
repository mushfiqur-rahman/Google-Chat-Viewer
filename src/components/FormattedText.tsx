import React from 'react';

interface FormattedTextProps {
  text: string;
  searchQuery?: string;
  className?: string;
}

export const FormattedText: React.FC<FormattedTextProps> = ({ text, searchQuery, className = '' }) => {
  if (!text) return null;

  // Function to highlight search query within a plain text snippet
  const highlightSearch = (str: string) => {
    if (!searchQuery || !searchQuery.trim()) return str;
    const query = searchQuery.trim();
    const parts = str.split(new RegExp(`(${escapeRegExp(query)})`, 'gi'));
    if (parts.length === 1) return str;

    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-amber-300 dark:bg-amber-500/50 text-neutral-900 dark:text-neutral-100 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Check for multiline code blocks ```code```
  const codeBlockRegex = /```([\s\S]*?)```/g;
  const segments: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push(parseInlineFormatting(text.substring(lastIndex, match.index), highlightSearch, segments.length));
    }
    const codeContent = match[1];
    segments.push(
      <pre
        key={`codeblock-${match.index}`}
        className="my-2 p-3 bg-neutral-900 text-neutral-100 rounded-lg text-xs font-mono overflow-x-auto border border-neutral-800"
      >
        <code>{codeContent.trim()}</code>
      </pre>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push(parseInlineFormatting(text.substring(lastIndex), highlightSearch, segments.length));
  }

  return <div className={`leading-relaxed break-words whitespace-pre-wrap ${className}`}>{segments}</div>;
};

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseInlineFormatting(
  rawText: string,
  highlightSearch: (s: string) => React.ReactNode,
  keyOffset: number
): React.ReactNode {
  // Line-by-line processing to handle paragraphs, bullet points, blockquotes, mentions, inline code, bold, links
  const lines = rawText.split('\n');

  return lines.map((line, lineIdx) => {
    // Check if line is blockquote
    const isQuote = line.startsWith('> ');
    const content = isQuote ? line.substring(2) : line;

    // Tokenize inline elements: URLs, @mentions, `code`, *bold* or **bold**, _italic_
    const tokens = tokenizeInline(content);

    const renderedTokens = tokens.map((token, tIdx) => {
      const key = `${keyOffset}-${lineIdx}-${tIdx}`;

      if (token.type === 'mention') {
        return (
          <span
            key={key}
            className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 border border-blue-200 dark:border-blue-800 mx-0.5"
          >
            {token.value}
          </span>
        );
      }

      if (token.type === 'url') {
        return (
          <a
            key={key}
            href={token.value.startsWith('http') ? token.value : `https://${token.value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-700 dark:hover:text-blue-300 break-all"
            onClick={(e) => e.stopPropagation()}
          >
            {highlightSearch(token.value)}
          </a>
        );
      }

      if (token.type === 'code') {
        return (
          <code
            key={key}
            className="px-1.5 py-0.5 mx-0.5 text-xs font-mono bg-neutral-100 dark:bg-neutral-800 text-rose-600 dark:text-rose-400 rounded border border-neutral-200 dark:border-neutral-700"
          >
            {token.value}
          </code>
        );
      }

      if (token.type === 'bold') {
        return (
          <strong key={key} className="font-semibold text-neutral-900 dark:text-neutral-100">
            {highlightSearch(token.value)}
          </strong>
        );
      }

      if (token.type === 'italic') {
        return (
          <em key={key} className="italic text-neutral-800 dark:text-neutral-200">
            {highlightSearch(token.value)}
          </em>
        );
      }

      return <React.Fragment key={key}>{highlightSearch(token.value)}</React.Fragment>;
    });

    if (isQuote) {
      return (
        <div
          key={`line-${lineIdx}`}
          className="border-l-4 border-neutral-300 dark:border-neutral-600 pl-3 py-1 my-1 italic text-neutral-600 dark:text-neutral-400"
        >
          {renderedTokens}
        </div>
      );
    }

    return (
      <div key={`line-${lineIdx}`} className={lineIdx > 0 ? 'mt-1' : ''}>
        {renderedTokens.length > 0 ? renderedTokens : <span>&nbsp;</span>}
      </div>
    );
  });
}

interface InlineToken {
  type: 'text' | 'mention' | 'url' | 'code' | 'bold' | 'italic';
  value: string;
}

function tokenizeInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  // Regex capturing @mentions, URLs, `code`, **bold**, *bold*, _italic_
  const pattern = /(@[a-zA-Z0-9_\s.()]+(?=\s|$|[,:;]))|(https?:\/\/[^\s<]+[^<.,:;"')\]\s])|(`[^`]+`)|(\*\*[^*]+\*\*|\*[^*]+\*)|(_[^_]+_)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', value: text.substring(lastIndex, match.index) });
    }

    if (match[1]) {
      tokens.push({ type: 'mention', value: match[1] });
    } else if (match[2]) {
      tokens.push({ type: 'url', value: match[2] });
    } else if (match[3]) {
      tokens.push({ type: 'code', value: match[3].slice(1, -1) });
    } else if (match[4]) {
      const bVal = match[4].startsWith('**') ? match[4].slice(2, -2) : match[4].slice(1, -1);
      tokens.push({ type: 'bold', value: bVal });
    } else if (match[5]) {
      tokens.push({ type: 'italic', value: match[5].slice(1, -1) });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: 'text', value: text.substring(lastIndex) });
  }

  return tokens;
}
