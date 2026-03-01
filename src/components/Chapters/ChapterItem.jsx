import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Edit3, Trash2, CheckCircle, Clock } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Badge from '../UI/Badge'
import { formatNumber } from '../../utils/wordCount'

export default function ChapterItem({ chapter, index, projectId }) {
  const { dispatch, notify } = useApp()
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(chapter.title)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chapter.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 'auto',
  }

  const openEditor = () => {
    dispatch({ type: 'SET_ACTIVE_CHAPTER', payload: chapter.id })
  }

  const handleRename = () => {
    if (editTitle.trim() && editTitle !== chapter.title) {
      dispatch({
        type: 'UPDATE_CHAPTER',
        payload: { projectId, chapterId: chapter.id, data: { title: editTitle.trim() } },
      })
    }
    setIsEditing(false)
  }

  const handleDelete = e => {
    e.stopPropagation()
    if (confirm(`Delete "${chapter.title}"?`)) {
      dispatch({ type: 'DELETE_CHAPTER', payload: { projectId, chapterId: chapter.id } })
      notify(`Chapter deleted`, 'info')
    }
  }

  const handleStatusCycle = e => {
    e.stopPropagation()
    const statuses = ['draft', 'in-progress', 'needs-editing', 'complete']
    const next = statuses[(statuses.indexOf(chapter.status) + 1) % statuses.length]
    dispatch({
      type: 'UPDATE_CHAPTER',
      payload: { projectId, chapterId: chapter.id, data: { status: next } },
    })
  }

  const updatedAt = new Date(chapter.updatedAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  })

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group flex items-center gap-3 bg-slate-800 border rounded-xl px-4 py-3
        transition-all duration-200 cursor-pointer
        ${isDragging
          ? 'border-amber shadow-lg shadow-amber/10'
          : 'border-slate-700 hover:border-slate-500 hover:bg-slate-750'
        }
      `}
      onClick={openEditor}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        onClick={e => e.stopPropagation()}
        className="drag-handle text-slate-600 hover:text-slate-400 transition-colors p-1 -ml-1 shrink-0"
      >
        <GripVertical size={14} />
      </div>

      {/* Chapter number */}
      <span className="text-xs font-mono text-slate-600 w-5 shrink-0">
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Title */}
      <div className="flex-1 min-w-0" onClick={e => e.stopPropagation()}>
        {isEditing ? (
          <input
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={e => {
              if (e.key === 'Enter') handleRename()
              if (e.key === 'Escape') setIsEditing(false)
            }}
            className="bg-slate-700 border border-amber text-cream rounded px-2 py-0.5
                       text-base font-body w-full focus:outline-none"
            autoFocus
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span
            className="font-body text-base text-parchment group-hover:text-cream transition-colors truncate block"
            onDoubleClick={e => { e.stopPropagation(); setIsEditing(true) }}
          >
            {chapter.title}
          </span>
        )}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs font-mono text-slate-600 hidden sm:block">
          {formatNumber(chapter.wordCount || 0)} words
        </span>

        <span className="text-xs font-mono text-slate-600 hidden md:block">
          {updatedAt}
        </span>

        {/* Status badge (click to cycle) */}
        <div
          onClick={handleStatusCycle}
          title="Click to change status"
          className="cursor-pointer"
        >
          <Badge status={chapter.status || 'draft'} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={e => { e.stopPropagation(); setIsEditing(true) }}
            className="text-slate-500 hover:text-amber p-1 rounded hover:bg-slate-700 transition-colors"
            title="Rename"
          >
            <Edit3 size={12} />
          </button>
          <button
            onClick={handleDelete}
            className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-slate-700 transition-colors"
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}
