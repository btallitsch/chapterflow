# 📖 ChapterFlow — Novel Writing Web App

A polished, production-grade novel writing application built with React. Manage multiple novel projects, write with a rich text editor, plan scenes on a corkboard, and export your manuscript.

## ✨ Features

- **Project Management** — Create and manage multiple novel projects with title, author, genre, synopsis, and accent color
- **Chapter Management** — Add, edit, delete, and drag-to-reorder chapters
- **Rich Text Editor** — TipTap-powered editor with formatting toolbar (bold, italic, headings, lists, blockquote, alignment, highlight)
- **Notes Panel** — Per-chapter notes/outline panel that slides in alongside the editor
- **Word Count Tracking** — Live word count, reading time estimate, per-chapter and per-project totals
- **Scene Board** — Drag-and-drop scene cards per chapter (like Scrivener's corkboard)
- **Export** — PDF (with title page, TOC, page numbers), HTML/Word, and Plain Text
- **Autosave** — Automatically persists to localStorage on every change
- **Search & Filter** — Search chapter content/notes, filter by draft/complete/needs-editing/in-progress
- **Dark Mode** — Full dark/light mode toggle
- **Responsive** — Collapsible sidebar, mobile-friendly layout

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone or upload to GitHub, then:
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite |
| State | React Context + useReducer |
| Rich Text | TipTap 2 |
| Drag & Drop | @dnd-kit |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Export (PDF) | jsPDF |
| Persistence | localStorage |
| Fonts | Playfair Display, Crimson Text, Courier Prime |

## 📁 Project Structure

```
src/
├── App.jsx                     # Root component & router
├── main.jsx                    # Entry point
├── index.css                   # Global styles + TipTap styles
├── context/
│   └── AppContext.jsx          # Global state (projects, chapters, UI)
├── utils/
│   ├── wordCount.js            # Word counting & text utilities
│   └── exportUtils.js         # PDF, HTML, TXT export logic
└── components/
    ├── Layout/
    │   ├── Sidebar.jsx         # Navigation sidebar with project tree
    │   └── Header.jsx          # Top bar with breadcrumb & autosave
    ├── Projects/
    │   ├── ProjectDashboard.jsx # Main project grid + stats
    │   ├── ProjectCard.jsx     # Individual project card
    │   └── CreateProjectModal.jsx # Create/edit project form
    ├── Chapters/
    │   ├── ChapterList.jsx     # Sortable chapter list for a project
    │   ├── ChapterItem.jsx     # Individual draggable chapter row
    │   └── ChapterEditor.jsx  # Full chapter editor with notes panel
    ├── Editor/
    │   └── RichTextEditor.jsx  # TipTap rich text editor component
    ├── Scenes/
    │   └── SceneBoard.jsx      # Corkboard-style scene card organizer
    ├── Export/
    │   └── ExportModal.jsx     # Export options (PDF/HTML/TXT)
    └── UI/
        ├── Button.jsx          # Reusable button variants
        ├── Modal.jsx           # Modal dialog component
        ├── Badge.jsx           # Status badge + select
        ├── SearchBar.jsx       # Search input
        └── Notifications.jsx  # Toast notifications
```

## 📝 Data Model

All data is stored in localStorage as JSON.

```
Project {
  id, title, author, genre, synopsis, coverColor,
  chapters: Chapter[],
  createdAt, updatedAt
}

Chapter {
  id, title, content (HTML), notes (HTML), status,
  wordCount, scenes: Scene[],
  order, createdAt, updatedAt
}

Scene {
  id, title, description, color, order
}
```

## 🎨 Design

The app uses a **Literary Noir** aesthetic:
- Deep slate backgrounds (#0f1117)
- Warm amber accents (#d4a853)
- Playfair Display for headings
- Crimson Text for body content
- Courier Prime for monospace/stats

## 🔮 Future Enhancements

- Cloud sync (Firebase / Supabase)
- Version snapshots / chapter history
- AI writing suggestions (Claude API)
- Collaboration / shared projects
- PWA offline support
- Mobile drag-and-drop
- DOCX export
- Chapter templates

## 📄 License

MIT
