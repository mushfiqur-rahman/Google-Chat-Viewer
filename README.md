# Google Chat Takeout Viewer (ArchiveChat)

A fast, private, and full-featured local viewer and search engine for your Google Chat (and classic Google Hangouts) Takeout data backups.

---

## Key Features

- **100% Private & Client-Side Local**: All parsing, unzipping, indexing, and rendering happens entirely inside your browser's local memory using Web APIs. **Zero messages, attachments, or metadata are ever uploaded to an external server.**
- **Flexible Archive Ingestion & Drag-and-Drop**:
  - Direct native drag-and-drop support for `.zip` files, folders (with nested recursive directory traversal), or `messages.json`
  - Global window drag detection with full-screen drop feedback
  - In-memory archive extraction via `jszip` with real-time parsing progress
  - Directory picker fallback and built-in interactive **Demo Archive** to preview all features immediately
- **High-Density Google Chat UI & Keyboard Navigation**:
  - **Keyboard Navigation**: Use <kbd>↑</kbd> and <kbd>↓</kbd> (or <kbd>k</kbd>/<kbd>j</kbd>) to traverse messages, <kbd>Home</kbd>/<kbd>End</kbd> to jump to top/bottom, <kbd>S</kbd> to star/bookmark, <kbd>C</kbd> to copy, and <kbd>↵ Enter</kbd> to inspect attachments/JSON
  - Direct Messages (1:1) and Spaces / Group Chats with custom avatars and status indicators
  - Threaded conversation & Topic support
  - Emoji reaction badges with participant breakdowns
  - Inline image attachment previews & file download handling
  - Message bookmarking (starring), raw JSON inspection, and clipboard copying
- **Global Search & Filter Engine (`Ctrl + K` / `Cmd + K` or `/`)**:
  - Instant full-text search across all conversations and messages with highlighted match previews
  - Filter by date range, sender name, or conversation space
  - Filter conversations by Year or Unread / Spaces / DMs
- **Conversation Analytics & Stats**:
  - Message counts, participant activity distribution, and activity timelines
- **Exporting Capabilities**:
  - Export chats to standalone styled **HTML**, clean **Markdown (.md)**, or formatted **JSON**
- **Dark Mode & Light Mode**:
  - Crisp high-density design with custom dark theme support, system preference detection, and local storage persistence

---

## Quick Start

### 1. Prerequisites

Ensure you have **Node.js** (v18.0.0 or higher) and **npm** installed.

```bash
node -v
npm -v
```

### 2. Install Dependencies

Clone or navigate to the project directory and run:

```bash
npm install
```

### 3. Start Development Server

Start the local Vite dev server:

```bash
npm run dev
```

The application will be running at:
`http://localhost:3000` (or `http://127.0.0.1:3000`)

---

## Available Scripts

- `npm run dev`: Starts the local development server on port 3000 with HMR.
- `npm run build`: Compiles TypeScript and builds the production-optimized static assets into `dist/`.
- `npm run preview`: Previews the production build locally.
- `npm run lint`: Runs TypeScript compiler check (`tsc --noEmit`) to validate type safety.

---

## How to Export Your Google Chat History

1. Visit [takeout.google.com](https://takeout.google.com) in your web browser.
2. Click **"Deselect all"** at the top of the product list.
3. Scroll down and check the box next to **"Google Chat"**.
4. Click **"Next step"** at the bottom of the page.
5. Choose **"Export once"**, `.zip` format, and your preferred file size limit (e.g. 2GB or 10GB).
6. Click **"Create export"** and download the resulting archive when Google finishes processing.
7. Open this app in your browser, drag & drop the downloaded `.zip` file into the upload zone (or click **"Select .ZIP or JSON File"**), and explore your chat history!

---

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4 with custom dark mode variants
- **Icons**: `lucide-react`
- **Archive Extraction**: `jszip` (pure client-side extraction)
- **Bundler & Dev Server**: Vite 6

---

## License

MIT License. Designed for offline data preservation and privacy.
