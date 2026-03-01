import React from 'react'
import { BookOpen, ChevronRight, Trash2 } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { projectWordCount, formatNumber } from '../../utils/wordCount'

const GENRE_ICONS = {
  fantasy: '🧙', 'sci-fi': '🚀', romance: '💕', mystery: '🔍',
  thriller: '🗡️', horror: '👻', literary: '📚', historical: '⚔️',
  'young-adult': '🌟', default: '📖',
}

export default function ProjectCard({ project }) {
  const { dispatch, notify } = useApp()
  const wordCount = projectWordCount(project)
  const chapterCount = project.chapters.length
  const completeCount = project.chapters.filter(c => c.status === 'complete').length
  const progress = chapterCount > 0 ? Math.round((completeCount / chapterCount) * 100) : 0
  const genreKey = project.genre?.toLowerCase().replace(/\s+/g, '-')
  const genreIcon = GENRE_ICONS[genreKey] || GENRE_ICONS.default

  const handleDelete = e => {
    e.stopPropagation()
    if (confirm(`Delete "${project.title}"? This cannot be undone.`)) {
      dispatch({ type: 'DELETE_PROJECT', payload: project.id })
      notify(`"${project.title}" deleted`, 'info')
    }
  }

  const updatedAt = new Date(project.updatedAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <div
      onClick={() => dispatch({ type: 'SET_ACTIVE_PROJECT', payload: project.id })}
      className="group relative bg-slate-800 border border-slate-700 rounded-xl overflow-hidden
                 cursor-pointer hover:border-amber/50 transition-all duration-300
                 hover:shadow-xl hover:shadow-amber/5 hover:-translate-y-0.5 animate-fade-in"
    >
      {/* Color bar */}
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: project.coverColor || '#d4a853' }}
      />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{genreIcon}</span>
            <div>
              <h3 className="font-display text-lg text-cream leading-tight group-hover:text-amber transition-colors line-clamp-1">
                {project.title}
              </h3>
              {project.author && (
                <p className="text-xs text-slate-500 font-body italic">{project.author}</p>
              )}
            </div>
          </div>

          <button
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400
                       transition-all p-1 rounded hover:bg-slate-700"
          >
            <Trash2 size={13} />
          </button>
        </div>

        {/* Synopsis */}
        {project.synopsis && (
          <p className="text-sm text-slate-400 font-body italic line-clamp-2 mb-4 leading-snug">
            {project.synopsis}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs font-mono text-slate-500 mb-4">
          <span className="flex items-center gap-1">
            <BookOpen size={10} />
            {chapterCount} ch.
          </span>
          <span>{formatNumber(wordCount)} words</span>
          {project.genre && <span className="text-slate-600">{project.genre}</span>}
        </div>

        {/* Progress bar */}
        {chapterCount > 0 && (
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-1">
              <span>Progress</span>
              <span className={progress === 100 ? 'text-emerald-400' : 'text-slate-400'}>
                {progress}%
              </span>
            </div>
            <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  backgroundColor: progress === 100 ? '#34d399' : project.coverColor || '#d4a853',
                }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/50">
          <span className="text-xs text-slate-600 font-mono">Updated {updatedAt}</span>
          <ChevronRight
            size={14}
            className="text-slate-600 group-hover:text-amber group-hover:translate-x-0.5 transition-all"
          />
        </div>
      </div>
    </div>
  )
}
