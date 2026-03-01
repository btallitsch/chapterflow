import React, { useState, useMemo } from 'react'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import {
  Plus, Download, Settings, LayoutGrid, StickyNote, Search,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import ChapterItem from './ChapterItem'
import CreateProjectModal from '../Projects/CreateProjectModal'
import ExportModal from '../Export/ExportModal'
import SearchBar from '../UI/SearchBar'
import Button from '../UI/Button'
import { projectWordCount, formatNumber, estimatePages } from '../../utils/wordCount'

export default function ChapterList() {
  const { state, dispatch, notify } = useApp()
  const { projects, activeProjectId, searchQuery, statusFilter } = state
  const project = projects.find(p => p.id === activeProjectId)

  const [activeId, setActiveId] = useState(null)
  const [showEdit, setShowEdit] = useState(false)
  const [showExport, setShowExport] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const sortedChapters = useMemo(() => {
    if (!project) return []
    return [...project.chapters].sort((a, b) => a.order - b.order)
  }, [project])

  const filteredChapters = useMemo(() => {
    return sortedChapters.filter(ch => {
      const matchesSearch = !searchQuery || 
        ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ch.content || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ch.notes || '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || ch.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [sortedChapters, searchQuery, statusFilter])

  if (!project) return null

  const wordCount = projectWordCount(project)
  const pages = estimatePages(wordCount)

  const handleDragStart = ({ active }) => setActiveId(active.id)

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null)
    if (!over || active.id === over.id) return

    const oldIdx = sortedChapters.findIndex(c => c.id === active.id)
    const newIdx = sortedChapters.findIndex(c => c.id === over.id)
    const reordered = arrayMove(sortedChapters, oldIdx, newIdx).map((c, i) => ({ ...c, order: i }))

    dispatch({ type: 'REORDER_CHAPTERS', payload: { projectId: project.id, chapters: reordered } })
  }

  const addChapter = () => {
    dispatch({
      type: 'CREATE_CHAPTER',
      payload: {
        projectId: project.id,
        title: `Chapter ${project.chapters.length + 1}`,
        order: project.chapters.length,
      },
    })
    notify('New chapter added', 'success')
  }

  const activeChapter = sortedChapters.find(c => c.id === activeId)

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 animate-fade-in">
      {/* Project header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: project.coverColor || '#d4a853' }}
            />
            <h1 className="font-display text-3xl text-cream">{project.title}</h1>
          </div>
          {project.author && (
            <p className="text-slate-400 font-body italic text-base ml-6">by {project.author}</p>
          )}
          {project.synopsis && (
            <p className="text-slate-500 font-body text-sm mt-2 ml-6 max-w-xl italic leading-snug">
              {project.synopsis}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={() => setShowEdit(true)} title="Edit project">
            <Settings size={14} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'GO_TO_SCENES' })} title="Scene board">
            <LayoutGrid size={14} />
            <span className="hidden sm:inline">Scenes</span>
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setShowExport(true)}>
            <Download size={14} />
            Export
          </Button>
          <Button variant="primary" size="sm" onClick={addChapter}>
            <Plus size={14} />
            Chapter
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-6 text-xs font-mono text-slate-500 mb-6 pb-6 border-b border-slate-700">
        <span>{project.chapters.length} chapters</span>
        <span>{formatNumber(wordCount)} words</span>
        <span>~{pages} pages</span>
        <span>
          {project.chapters.filter(c => c.status === 'complete').length} complete
        </span>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <SearchBar
          value={searchQuery}
          onChange={v => dispatch({ type: 'SET_SEARCH_QUERY', payload: v })}
          placeholder="Search chapters…"
          className="flex-1"
        />
        <select
          value={statusFilter}
          onChange={e => dispatch({ type: 'SET_STATUS_FILTER', payload: e.target.value })}
          className="bg-slate-700 border border-slate-600 text-parchment rounded-lg px-3 py-1.5
                     text-sm font-mono focus:outline-none focus:border-amber shrink-0"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="in-progress">In Progress</option>
          <option value="needs-editing">Needs Editing</option>
          <option value="complete">Complete</option>
        </select>
      </div>

      {/* Chapter list with DnD */}
      {filteredChapters.length === 0 ? (
        <EmptyChapters onAdd={addChapter} hasFilter={searchQuery || statusFilter !== 'all'} />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredChapters.map(c => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {filteredChapters.map((chapter, idx) => (
                <ChapterItem
                  key={chapter.id}
                  chapter={chapter}
                  index={sortedChapters.indexOf(chapter)}
                  projectId={project.id}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeChapter && (
              <div className="bg-slate-700 border border-amber rounded-xl px-5 py-4 shadow-2xl opacity-90">
                <span className="font-display text-amber">{activeChapter.title}</span>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      <CreateProjectModal isOpen={showEdit} onClose={() => setShowEdit(false)} project={project} />
      <ExportModal isOpen={showExport} onClose={() => setShowExport(false)} project={project} />
    </div>
  )
}

function EmptyChapters({ onAdd, hasFilter }) {
  return (
    <div className="text-center py-16 border-2 border-dashed border-slate-700 rounded-xl">
      <StickyNote size={32} className="text-slate-600 mx-auto mb-3" />
      {hasFilter ? (
        <p className="text-slate-500 font-body">No chapters match your filters.</p>
      ) : (
        <>
          <p className="text-slate-400 font-body mb-4">No chapters yet. Begin your story.</p>
          <Button variant="primary" size="sm" onClick={onAdd}>
            <Plus size={14} />
            Add First Chapter
          </Button>
        </>
      )}
    </div>
  )
}
