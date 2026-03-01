import React from 'react'
import { BookOpen, LayoutDashboard, ChevronRight, Plus, Feather } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function Sidebar() {
  const { state, dispatch } = useApp()
  const { projects, activeProjectId, activeView, isSidebarOpen } = state

  const activeProject = projects.find(p => p.id === activeProjectId)

  return (
    <aside
      className={`
        flex flex-col bg-slate-950 border-r border-slate-700/60
        transition-all duration-300 ease-in-out shrink-0
        ${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-700/60">
        <Feather size={22} className="text-amber" />
        <span className="font-display text-xl text-cream font-semibold tracking-wide">ChapterFlow</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {/* Dashboard */}
        <button
          onClick={() => dispatch({ type: 'GO_TO_DASHBOARD' })}
          className={`
            w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-body
            transition-all duration-150 text-left group
            ${activeView === 'dashboard'
              ? 'bg-amber/15 text-amber border border-amber/30'
              : 'text-slate-300 hover:bg-slate-800 hover:text-cream'
            }
          `}
        >
          <LayoutDashboard size={15} />
          <span>Dashboard</span>
        </button>

        {/* Projects divider */}
        <div className="pt-3 pb-1 px-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Projects</span>
            <button
              onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'dashboard' })}
              className="text-slate-500 hover:text-amber transition-colors"
              title="New project"
            >
              <Plus size={13} />
            </button>
          </div>
        </div>

        {projects.length === 0 && (
          <p className="text-xs text-slate-600 px-3 py-2 italic">No projects yet.</p>
        )}

        {projects.map(project => (
          <div key={project.id}>
            <button
              onClick={() => dispatch({ type: 'SET_ACTIVE_PROJECT', payload: project.id })}
              className={`
                w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-body
                transition-all duration-150 text-left group
                ${activeProjectId === project.id
                  ? 'bg-slate-700 text-cream'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-parchment'
                }
              `}
            >
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: project.coverColor || '#d4a853' }}
              />
              <span className="flex-1 truncate">{project.title}</span>
              <ChevronRight
                size={12}
                className={`shrink-0 transition-transform duration-200
                  ${activeProjectId === project.id ? 'text-slate-400' : 'text-slate-600 group-hover:text-slate-400'}`}
              />
            </button>

            {/* Chapters sub-list */}
            {activeProjectId === project.id && activeProject && (
              <div className="ml-4 mt-1 space-y-0.5 border-l border-slate-700 pl-3">
                {activeProject.chapters
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((ch, idx) => (
                    <button
                      key={ch.id}
                      onClick={() => dispatch({ type: 'SET_ACTIVE_CHAPTER', payload: ch.id })}
                      className={`
                        w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs font-body
                        transition-colors text-left
                        ${state.activeChapterId === ch.id
                          ? 'text-amber bg-amber/10'
                          : 'text-slate-500 hover:text-parchment hover:bg-slate-800'
                        }
                      `}
                    >
                      <BookOpen size={10} className="shrink-0" />
                      <span className="truncate">
                        <span className="text-slate-600 mr-1">{idx + 1}.</span>
                        {ch.title}
                      </span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-700/60">
        <p className="text-xs font-mono text-slate-600">
          {projects.length} project{projects.length !== 1 ? 's' : ''}
        </p>
      </div>
    </aside>
  )
}
