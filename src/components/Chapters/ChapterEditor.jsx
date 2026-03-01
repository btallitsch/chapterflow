import React, { useState, useCallback, useEffect } from 'react'
import { ArrowLeft, LayoutGrid, FileText, StickyNote, ChevronLeft, ChevronRight, Save } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import RichTextEditor from '../Editor/RichTextEditor'
import Badge, { StatusSelect } from '../UI/Badge'
import Button from '../UI/Button'
import { countWords, formatNumber, readingTime } from '../../utils/wordCount'

export default function ChapterEditor() {
  const { state, dispatch, notify } = useApp()
  const { projects, activeProjectId, activeChapterId } = state

  const project = projects.find(p => p.id === activeProjectId)
  const chapter = project?.chapters.find(c => c.id === activeChapterId)
  const sortedChapters = project?.chapters.slice().sort((a, b) => a.order - b.order) || []
  const currentIdx = sortedChapters.findIndex(c => c.id === activeChapterId)

  const [showNotes, setShowNotes] = useState(false)
  const [title, setTitle] = useState(chapter?.title || '')
  const [isEditingTitle, setIsEditingTitle] = useState(false)

  useEffect(() => {
    setTitle(chapter?.title || '')
  }, [chapter?.title])

  const handleContentChange = useCallback((html) => {
    if (!chapter) return
    const wordCount = countWords(html)
    dispatch({
      type: 'UPDATE_CHAPTER',
      payload: {
        projectId: activeProjectId,
        chapterId: activeChapterId,
        data: { content: html, wordCount },
      },
    })
  }, [activeProjectId, activeChapterId, dispatch, chapter])

  const handleNotesChange = useCallback((html) => {
    if (!chapter) return
    dispatch({
      type: 'UPDATE_CHAPTER',
      payload: {
        projectId: activeProjectId,
        chapterId: activeChapterId,
        data: { notes: html },
      },
    })
  }, [activeProjectId, activeChapterId, dispatch, chapter])

  const handleTitleSave = () => {
    if (title.trim() && title !== chapter.title) {
      dispatch({
        type: 'UPDATE_CHAPTER',
        payload: {
          projectId: activeProjectId,
          chapterId: activeChapterId,
          data: { title: title.trim() },
        },
      })
    }
    setIsEditingTitle(false)
  }

  const handleStatusChange = (status) => {
    dispatch({
      type: 'UPDATE_CHAPTER',
      payload: { projectId: activeProjectId, chapterId: activeChapterId, data: { status } },
    })
  }

  const navigateChapter = (dir) => {
    const next = sortedChapters[currentIdx + dir]
    if (next) dispatch({ type: 'SET_ACTIVE_CHAPTER', payload: next.id })
  }

  if (!chapter) return null

  const wordCount = chapter.wordCount || 0
  const chapterNum = currentIdx + 1

  return (
    <div className="flex flex-col h-full animate-slide-left">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 bg-slate-850 border-b border-slate-700 bg-slate-800 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {/* Back to project */}
          <Button variant="ghost" size="xs" onClick={() => dispatch({ type: 'GO_TO_PROJECT' })}>
            <ArrowLeft size={13} />
            <span className="hidden sm:inline">Chapters</span>
          </Button>

          <span className="text-slate-600 text-xs font-mono">
            Ch. {String(chapterNum).padStart(2, '0')}
          </span>

          {/* Editable title */}
          {isEditingTitle ? (
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={e => { if (e.key === 'Enter') handleTitleSave(); if (e.key === 'Escape') setIsEditingTitle(false) }}
              className="bg-slate-700 border border-amber text-cream rounded px-2 py-0.5
                         font-display text-base focus:outline-none w-48 sm:w-64"
              autoFocus
            />
          ) : (
            <h2
              className="font-display text-base text-amber hover:text-amber-light cursor-text truncate max-w-[150px] sm:max-w-xs"
              onClick={() => setIsEditingTitle(true)}
              title="Click to rename"
            >
              {chapter.title}
            </h2>
          )}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Word count */}
          <div className="hidden md:flex items-center gap-3 text-xs font-mono text-slate-500 mr-2">
            <span>{formatNumber(wordCount)} words</span>
            <span>{readingTime(wordCount)}</span>
          </div>

          {/* Status */}
          <StatusSelect value={chapter.status || 'draft'} onChange={handleStatusChange} />

          {/* Notes toggle */}
          <Button
            variant={showNotes ? 'outline' : 'ghost'}
            size="xs"
            onClick={() => setShowNotes(v => !v)}
            title="Toggle notes panel"
          >
            <StickyNote size={13} />
            <span className="hidden sm:inline">Notes</span>
          </Button>

          {/* Scene board */}
          <Button variant="ghost" size="xs" onClick={() => dispatch({ type: 'GO_TO_SCENES' })}>
            <LayoutGrid size={13} />
          </Button>

          {/* Chapter navigation */}
          <div className="flex items-center border border-slate-600 rounded overflow-hidden">
            <button
              onClick={() => navigateChapter(-1)}
              disabled={currentIdx === 0}
              className="px-2 py-1 text-slate-400 hover:text-cream hover:bg-slate-700 disabled:opacity-30
                         disabled:cursor-not-allowed transition-colors"
              title="Previous chapter"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => navigateChapter(1)}
              disabled={currentIdx === sortedChapters.length - 1}
              className="px-2 py-1 text-slate-400 hover:text-cream hover:bg-slate-700 disabled:opacity-30
                         disabled:cursor-not-allowed transition-colors border-l border-slate-600"
              title="Next chapter"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main editor */}
        <div className={`flex flex-col flex-1 overflow-hidden ${showNotes ? 'border-r border-slate-700' : ''}`}>
          <RichTextEditor
            key={`editor-${chapter.id}`}
            content={chapter.content}
            onChange={handleContentChange}
            placeholder="Begin your chapter… the cursor awaits."
            className="flex-1 overflow-hidden"
            variant="editor"
          />
        </div>

        {/* Notes panel */}
        {showNotes && (
          <div className="w-72 xl:w-80 flex flex-col shrink-0 overflow-hidden animate-slide-left">
            <div className="px-4 py-2.5 border-b border-slate-700 bg-slate-800 flex items-center gap-2">
              <StickyNote size={13} className="text-amber" />
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Notes & Outline</span>
            </div>
            <div className="flex-1 overflow-hidden bg-slate-800/50">
              <RichTextEditor
                key={`notes-${chapter.id}`}
                content={chapter.notes}
                onChange={handleNotesChange}
                placeholder="Scene notes, outline points, reminders…"
                className="h-full"
                variant="notes"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
