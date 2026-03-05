# 📖 ChapterFlow — Novel Writing Web App

> **Stack:** React 18 · Vite · TipTap · dnd-kit · Tailwind CSS · Supabase · Vercel

A polished, production-grade novel writing application. Manage multiple novel projects, write with a rich text editor, plan scenes on a corkboard, export your manuscript, and sync everything to the cloud.

See it in action here: https://chapterflow-liard.vercel.app/
---

## ✨ Features

- **Authentication** — Email/password sign up, login, and password reset via Supabase Auth
- **Cloud Sync** — All projects, chapters, and scenes sync to Supabase with a 1-second debounced autosave
- **Project Management** — Create and manage multiple novel projects with title, author, genre, synopsis, and accent color
- **Chapter Management** — Add, edit, delete, and drag-to-reorder chapters
- **Rich Text Editor** — TipTap-powered editor with formatting toolbar (bold, italic, headings, lists, blockquote, alignment, highlight)
- **Notes Panel** — Per-chapter notes/outline panel that slides in alongside the editor
- **Word Count Tracking** — Live word count, reading time estimate, per-chapter and per-project totals
- **Scene Board** — Drag-and-drop scene cards per chapter (like Scrivener's corkboard)
- **Export** — PDF (with title page, TOC, page numbers), HTML/Word, and Plain Text
- **Autosave** — Persists to both localStorage (fast) and Supabase (cloud)
- **Search & Filter** — Search chapter content/notes, filter by status
- **Dark Mode** — Full dark/light mode toggle
- **Responsive** — Collapsible sidebar, mobile-friendly layout

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier is fine)
- A [Vercel](https://vercel.com) account for deployment

### 1. Clone and install

```bash
git clone https://github.com/your-username/chapterflow.git
cd chapterflow
npm install
```

### 2. Set up Supabase

In your Supabase project, go to **SQL Editor** and run:

```sql
-- PROJECTS
create table public.projects (
  id          uuid primary key,
  user_id     uuid references auth.users not null,
  title       text not null,
  author      text,
  genre       text,
  synopsis    text,
  cover_color text default '#d4a853',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- CHAPTERS
create table public.chapters (
  id          uuid primary key,
  project_id  uuid references public.projects(id) on delete cascade,
  user_id     uuid references auth.users not null,
  title       text not null,
  content     text,
  notes       text,
  status      text default 'draft',
  word_count  integer default 0,
  "order"     integer default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- SCENES
create table public.scenes (
  id          uuid primary key,
  chapter_id  uuid references public.chapters(id) on delete cascade,
  user_id     uuid references auth.users not null,
  title       text not null,
  description text,
  color       text,
  "order"     integer default 0
);

-- Row Level Security
alter table public.projects enable row level security;
alter table public.chapters enable row level security;
alter table public.scenes   enable row level security;

create policy "Users manage own projects"
  on public.projects for all using (auth.uid() = user_id);

create policy "Users manage own chapters"
  on public.chapters for all using (auth.uid() = user_id);

create policy "Users manage own scenes"
  on public.scenes for all using (auth.uid() = user_id);
```

Then go to **Authentication → URL Configuration** and add your allowed redirect URLs:
- `http://localhost:5173` (development)
- `https://your-app.vercel.app` (production)

### 3. Add environment variables

Create a `.env.local` file in the project root (never commit this):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these values from your Supabase dashboard under **Settings → API**.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## 🌐 Deploying to Vercel

1. Push your repo to GitHub
2. Import the project in [Vercel](https://vercel.com/new)
3. Go to **Project Settings → Environment Variables** and add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - Set both for **Production**, **Preview**, and **Development**
4. Deploy — Vercel auto-deploys on every push to `main`

> Vite environment variables must be prefixed with `VITE_` to be available in the browser bundle.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite |
| Auth & Database | Supabase |
| State | React Context + useReducer |
| Rich Text | TipTap 2 |
| Drag & Drop | @dnd-kit |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Export (PDF) | jsPDF |
| Local Persistence | localStorage |
| Fonts | Playfair Display, Crimson Text, Courier Prime |
| Hosting | Vercel |

---

## 📁 Project Structure

```
chapterflow/
├── .env.local                      # Your Supabase keys (never commit)
├── index.html
├── vite.config.js
├── tailwind.config.js
└── src/
    ├── App.jsx                     # Root component, auth gate, sync wiring
    ├── main.jsx
    ├── index.css                   # Global styles + TipTap styles
    ├── lib/
    │   └── supabase.js             # Supabase client instance
    ├── context/
    │   └── AppContext.jsx          # Global state (projects, user, UI)
    ├── hooks/
    │   └── useSupabaseSync.js      # Load from + debounced save to Supabase
    ├── utils/
    │   ├── wordCount.js            # Word counting & text utilities
    │   └── exportUtils.js         # PDF, HTML, TXT export logic
    └── components/
        ├── Auth/
        │   └── AuthScreen.jsx      # Login, signup, password reset UI
        ├── Layout/
        │   ├── Sidebar.jsx         # Navigation sidebar with sign out
        │   └── Header.jsx          # Breadcrumb & autosave indicator
        ├── Projects/
        │   ├── ProjectDashboard.jsx
        │   ├── ProjectCard.jsx
        │   └── CreateProjectModal.jsx
        ├── Chapters/
        │   ├── ChapterList.jsx     # Sortable chapter list
        │   ├── ChapterItem.jsx     # Draggable chapter row
        │   └── ChapterEditor.jsx  # Editor + notes panel
        ├── Editor/
        │   └── RichTextEditor.jsx  # TipTap editor with toolbar
        ├── Scenes/
        │   └── SceneBoard.jsx      # Corkboard scene card organizer
        ├── Export/
        │   └── ExportModal.jsx     # PDF / HTML / TXT export
        └── UI/
            ├── Button.jsx
            ├── Modal.jsx
            ├── Badge.jsx
            ├── SearchBar.jsx
            └── Notifications.jsx
```

---

## 📝 Data Model

```
Project {
  id, title, author, genre, synopsis, coverColor,
  chapters: Chapter[],
  createdAt, updatedAt
}

Chapter {
  id, title, content (HTML), notes (HTML),
  status, wordCount, order,
  scenes: Scene[],
  createdAt, updatedAt
}

Scene {
  id, title, description, color, order
}
```

Data is stored in Supabase (source of truth) and mirrored to localStorage for fast initial load and offline resilience.

---

## 🔐 Auth Flow

1. User lands on app → `supabase.auth.getSession()` checks for an existing session
2. No session → `AuthScreen` renders (login / signup / reset)
3. On login → session stored by Supabase client automatically
4. `onAuthStateChange` listener keeps the app in sync with token refresh and sign out
5. On sign out → state cleared, user returned to `AuthScreen`

---

## 🎨 Design

The app uses a **Literary Noir** aesthetic — deep slate backgrounds, warm amber accents, Playfair Display headings, and Crimson Text for body content. The full editor experience is distraction-free with an optional slide-in notes panel.

---

## 🔮 Future Enhancements

- Deletion sync to Supabase (currently handled locally only)
- Version snapshots / chapter history with rollback
- AI writing suggestions
- Collaboration / shared projects
- PWA offline support
- DOCX export
- Chapter templates

---

## 📄 License

MIT
