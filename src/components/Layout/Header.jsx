import React from 'react'
import { Menu, Moon, Sun, Save, CheckCheck, Loader } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function Header() {
  const { state, dispatch } = useApp()
  const { autosaveStatus, isDarkMode, isSidebarOpen } = state

  const statusIcon = {
    idle:   null,
    saving: <Loader size={13} className="animate-spin text-slate-400" />,
    saved:  <CheckCheck size={13} className="text-emerald-400" />,
  }[autosaveStatus]

  const statusText = {
    idle:   '',
    saving: 'Saving…',
    saved:  'Saved',
  }[autosaveStatus]

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-slate-900/95 border-b border-slate-700/60 backdrop-blur-sm sticky top-0 z-30">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          className="text-slate-400 hover:text-cream transition-colors p-1.5 rounded hover:bg-slate-700"
          title="Toggle sidebar"
        >
          <Menu size={18} />
        </button>

        {/* Breadcrumb */}
        <Breadcrumb />
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Autosave status */}
        {autosaveStatus !== 'idle' && (
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 animate-fade-in">
            {statusIcon}
            <span>{statusText}</span>
          </div>
        )}

        {/* Dark mode toggle */}
        <button
          onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
          className="text-slate-400 hover:text-amber transition-colors p-1.5 rounded hover:bg-slate-700"
          title="Toggle theme"
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  )
}

function Breadcrumb() {
  const { state, dispatch } = useApp()
  const { projects, activeProjectId, activeChapterId, activeView } = state

  const project = projects.find(p => p.id === activeProjectId)
  const chapter = project?.chapters.find(c => c.id === activeChapterId)

  return (
    <nav className="flex items-center gap-2 text-sm font-body">
      <button
        onClick={() => dispatch({ type: 'GO_TO_DASHBOARD' })}
        className="text-slate-400 hover:text-amber transition-colors"
      >
        Dashboard
      </button>

      {project && (
        <>
          <span className="text-slate-600">/</span>
          <button
            onClick={() => dispatch({ type: 'GO_TO_PROJECT' })}
            className={`transition-colors ${!chapter ? 'text-amber' : 'text-slate-400 hover:text-amber'}`}
          >
            {project.title}
          </button>
        </>
      )}

      {chapter && (
        <>
          <span className="text-slate-600">/</span>
          <span className="text-amber truncate max-w-[200px]">{chapter.title}</span>
        </>
      )}

      {activeView === 'scenes' && (
        <>
          <span className="text-slate-600">/</span>
          <span className="text-amber">Scene Board</span>
        </>
      )}
    </nav>
  )
}
