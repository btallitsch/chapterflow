import React, { useState } from 'react'
import { Plus, BookOpen, TrendingUp, Clock, Feather } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import ProjectCard from './ProjectCard'
import CreateProjectModal from './CreateProjectModal'
import { projectWordCount, formatNumber } from '../../utils/wordCount'

export default function ProjectDashboard() {
  const { state } = useApp()
  const [showCreate, setShowCreate] = useState(false)

  const { projects } = state
  const totalWords = projects.reduce((sum, p) => sum + projectWordCount(p), 0)
  const totalChapters = projects.reduce((sum, p) => sum + p.chapters.length, 0)

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 animate-fade-in">
      {/* Hero header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Feather size={32} className="text-amber" />
          <h1 className="font-display text-4xl text-cream">
            Your <span className="text-amber italic">Library</span>
          </h1>
        </div>
        <p className="text-parchment/60 font-body text-lg ml-11">
          Every great story begins with a single chapter.
        </p>
      </div>

      {/* Stats bar */}
      {projects.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard icon={<BookOpen size={18} />} label="Projects" value={projects.length} />
          <StatCard icon={<TrendingUp size={18} />} label="Total Words" value={formatNumber(totalWords)} />
          <StatCard icon={<Clock size={18} />} label="Chapters" value={totalChapters} />
        </div>
      )}

      {/* Projects grid */}
      {projects.length === 0 ? (
        <EmptyState onCreate={() => setShowCreate(true)} />
      ) : (
        <>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl text-parchment">Your Projects</h2>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-amber text-slate-900 hover:bg-amber-dark
                         px-4 py-2 rounded-lg text-sm font-semibold font-body transition-all
                         shadow-md hover:shadow-amber/20 hover:shadow-lg"
            >
              <Plus size={16} />
              New Project
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </>
      )}

      <CreateProjectModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 flex items-center gap-4">
      <div className="text-amber">{icon}</div>
      <div>
        <div className="font-mono text-xl text-cream font-bold">{value}</div>
        <div className="text-xs text-slate-500 font-mono uppercase tracking-wide">{label}</div>
      </div>
    </div>
  )
}

function EmptyState({ onCreate }) {
  return (
    <div className="text-center py-20">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800 border border-slate-700 mb-6">
        <BookOpen size={32} className="text-amber" />
      </div>
      <h3 className="font-display text-2xl text-cream mb-2">No novels yet</h3>
      <p className="text-parchment/50 font-body mb-6 max-w-sm mx-auto">
        Your story is waiting to be written. Start your first project and bring your novel to life.
      </p>
      <button
        onClick={onCreate}
        className="inline-flex items-center gap-2 bg-amber text-slate-900 hover:bg-amber-dark
                   px-6 py-3 rounded-lg font-semibold font-body transition-all
                   shadow-lg hover:shadow-amber/20 hover:shadow-xl"
      >
        <Plus size={18} />
        Create Your First Novel
      </button>
    </div>
  )
}
