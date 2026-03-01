import React, { useState, useMemo } from 'react'
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates,
  rectSortingStrategy, arrayMove, useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, ArrowLeft, GripVertical, X, Edit3, Check } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Button from '../UI/Button'

const SCENE_COLORS = [
  '#2e384d', '#3d4d2e', '#4d2e3d', '#2e4d4a', '#4d3d2e',
  '#1a3a5c', '#2d4a1e', '#4a1e35', '#1e4a46', '#4a3d1e',
]

export default function SceneBoard() {
  const { state, dispatch, notify } = useApp()
  const { projects, activeProjectId, activeChapterId } = state

  const project = projects.find(p => p.id === activeProjectId)
  const sortedChapters = useMemo(
    () => project?.chapters.slice().sort((a, b) => a.order - b.order) || [],
    [project]
  )

  const [selectedChapterId, setSelectedChapterId] = useState(
    activeChapterId || sortedChapters[0]?.id || null
  )
  const [activeId, setActiveId] = useState(null)

  const chapter = project?.chapters.find(c => c.id === selectedChapterId)
  const sortedScenes = useMemo(
    () => chapter?.scenes?.slice().sort((a, b) => a.order - b.order) || [],
    [chapter]
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  if (!project) return null

  const addScene = () => {
    dispatch({
      type: 'CREATE_SCENE',
      payload: {
        projectId: project.id,
        chapterId: selectedChapterId,
        title: `Scene ${(chapter?.scenes?.length || 0) + 1}`,
        color: SCENE_COLORS[Math.floor(Math.random() * SCENE_COLORS.length)],
        order: chapter?.scenes?.length || 0,
      },
    })
  }

  const handleDragStart = ({ active }) => setActiveId(active.id)

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null)
    if (!over || active.id === over.id) return
    const oldIdx = sortedScenes.findIndex(s => s.id === active.id)
    const newIdx = sortedScenes.findIndex(s => s.id === over.id)
    const reordered = arrayMove(sortedScenes, oldIdx, newIdx).map((s, i) => ({ ...s, order: i }))
    dispatch({
      type: 'REORDER_SCENES',
      payload: { projectId: project.id, chapterId: selectedChapterId, scenes: reordered },
    })
  }

  const activeScene = sortedScenes.find(s => s.id === activeId)

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'GO_TO_PROJECT' })}>
            <ArrowLeft size={14} />
            Back
          </Button>
          <h2 className="font-display text-xl text-amber">Scene Board</h2>
          <span className="text-slate-500 font-body text-sm italic">— {project.title}</span>
        </div>

        <Button variant="primary" size="sm" onClick={addScene} disabled={!selectedChapterId}>
          <Plus size={14} />
          Add Scene
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Chapter tabs */}
        <div className="w-48 border-r border-slate-700 overflow-y-auto py-3 px-2 space-y-1 shrink-0">
          <p className="text-xs font-mono text-slate-600 uppercase tracking-wider px-2 mb-2">Chapters</p>
          {sortedChapters.map((ch, idx) => (
            <button
              key={ch.id}
              onClick={() => setSelectedChapterId(ch.id)}
              className={`
                w-full text-left px-3 py-2 rounded-lg text-sm font-body transition-all
                ${selectedChapterId === ch.id
                  ? 'bg-amber/15 text-amber border border-amber/30'
                  : 'text-slate-400 hover:bg-slate-700 hover:text-parchment'
                }
              `}
            >
              <span className="text-xs font-mono text-slate-600 mr-1">{idx + 1}.</span>
              <span className="truncate">{ch.title}</span>
            </button>
          ))}
        </div>

        {/* Scene cards */}
        <div className="flex-1 overflow-auto p-6">
          {!selectedChapterId ? (
            <p className="text-slate-500 text-center mt-20 font-body italic">
              Select a chapter to view its scenes.
            </p>
          ) : sortedScenes.length === 0 ? (
            <div className="text-center mt-20">
              <p className="text-slate-500 font-body italic mb-4">
                No scenes yet for <span className="text-parchment">{chapter?.title}</span>.
              </p>
              <Button variant="outline" size="sm" onClick={addScene}>
                <Plus size={14} />
                Create First Scene
              </Button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={sortedScenes.map(s => s.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 auto-rows-fr">
                  {sortedScenes.map((scene, idx) => (
                    <SortableSceneCard
                      key={scene.id}
                      scene={scene}
                      index={idx}
                      projectId={project.id}
                      chapterId={selectedChapterId}
                    />
                  ))}
                </div>
              </SortableContext>

              <DragOverlay>
                {activeScene && (
                  <div
                    className="p-3 rounded-lg border-2 border-amber shadow-2xl opacity-95 w-36 h-28"
                    style={{ backgroundColor: activeScene.color || '#2e384d' }}
                  >
                    <p className="font-body text-sm text-cream font-semibold">{activeScene.title}</p>
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  )
}

function SortableSceneCard({ scene, index, projectId, chapterId }) {
  const { dispatch } = useApp()
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(scene.title)
  const [editDesc, setEditDesc] = useState(scene.description || '')

  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: scene.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const saveEdit = () => {
    dispatch({
      type: 'UPDATE_SCENE',
      payload: {
        projectId, chapterId, sceneId: scene.id,
        data: { title: editTitle.trim() || scene.title, description: editDesc },
      },
    })
    setIsEditing(false)
  }

  const deleteScene = () => {
    dispatch({ type: 'DELETE_SCENE', payload: { projectId, chapterId, sceneId: scene.id } })
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, backgroundColor: scene.color || '#2e384d' }}
      className={`
        group relative rounded-xl border p-3 min-h-[110px] flex flex-col
        transition-all duration-200 cursor-default
        ${isDragging ? 'border-amber shadow-xl' : 'border-white/10 hover:border-white/25'}
      `}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 drag-handle text-white/30 hover:text-white/60 transition-colors"
      >
        <GripVertical size={12} />
      </div>

      {/* Scene number */}
      <span className="absolute top-2 right-2 text-[10px] font-mono text-white/30">
        #{index + 1}
      </span>

      {isEditing ? (
        <div className="mt-4 flex flex-col gap-1 flex-1" onClick={e => e.stopPropagation()}>
          <input
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            className="bg-black/30 text-white text-sm rounded px-2 py-1 focus:outline-none border border-white/20 font-body"
            placeholder="Scene title"
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setIsEditing(false) }}
          />
          <textarea
            value={editDesc}
            onChange={e => setEditDesc(e.target.value)}
            className="bg-black/30 text-white/70 text-xs rounded px-2 py-1 focus:outline-none
                       border border-white/20 resize-none font-body"
            placeholder="Brief description…"
            rows={2}
          />
          <button
            onClick={saveEdit}
            className="self-end text-xs text-emerald-300 hover:text-emerald-200 flex items-center gap-1"
          >
            <Check size={11} /> Save
          </button>
        </div>
      ) : (
        <div className="mt-3 flex flex-col flex-1">
          <p className="font-body text-sm text-white font-semibold leading-tight mb-1 line-clamp-2">
            {scene.title}
          </p>
          {scene.description && (
            <p className="text-[11px] text-white/50 line-clamp-3 leading-snug font-body">
              {scene.description}
            </p>
          )}
        </div>
      )}

      {/* Hover actions */}
      {!isEditing && (
        <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="text-white/40 hover:text-white p-0.5 transition-colors"
          >
            <Edit3 size={11} />
          </button>
          <button
            onClick={deleteScene}
            className="text-white/40 hover:text-red-400 p-0.5 transition-colors"
          >
            <X size={11} />
          </button>
        </div>
      )}
    </div>
  )
}
