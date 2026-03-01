import React, { useState, useEffect } from 'react'
import Modal from '../UI/Modal'
import Button from '../UI/Button'
import { useApp } from '../../context/AppContext'

const GENRES = [
  'Fantasy', 'Sci-Fi', 'Romance', 'Mystery', 'Thriller',
  'Horror', 'Literary Fiction', 'Historical', 'Young Adult', 'Other',
]

const COLORS = [
  '#d4a853', '#e07a5f', '#3d6b8c', '#6a8f6a', '#9b72aa',
  '#c0715c', '#5b7fa6', '#7a9e7e', '#b5838d', '#4a7c8a',
]

export default function CreateProjectModal({ isOpen, onClose, project = null }) {
  const { dispatch, notify } = useApp()
  const isEdit = !!project

  const [form, setForm] = useState({
    title: '', author: '', genre: '', synopsis: '', coverColor: '#d4a853',
  })

  useEffect(() => {
    if (project) setForm({
      title: project.title || '',
      author: project.author || '',
      genre: project.genre || '',
      synopsis: project.synopsis || '',
      coverColor: project.coverColor || '#d4a853',
    })
  }, [project])

  const reset = () => setForm({ title: '', author: '', genre: '', synopsis: '', coverColor: '#d4a853' })

  const handleSubmit = e => {
    e.preventDefault()
    if (!form.title.trim()) return

    if (isEdit) {
      dispatch({ type: 'UPDATE_PROJECT', payload: { id: project.id, data: form } })
      notify('Project updated!', 'success')
    } else {
      dispatch({ type: 'CREATE_PROJECT', payload: form })
      notify('New project created!', 'success')
    }
    reset()
    onClose()
  }

  const field = 'bg-slate-700 border border-slate-600 text-cream placeholder-slate-500 rounded-lg px-3 py-2 w-full font-body focus:outline-none focus:border-amber transition-colors text-sm'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Project' : 'New Novel Project'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
            Title *
          </label>
          <input
            type="text"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="The name of your novel…"
            className={field}
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
            Author
          </label>
          <input
            type="text"
            value={form.author}
            onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
            placeholder="Your name or pen name…"
            className={field}
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
            Genre
          </label>
          <select
            value={form.genre}
            onChange={e => setForm(f => ({ ...f, genre: e.target.value }))}
            className={`${field} cursor-pointer`}
          >
            <option value="">Select genre…</option>
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
            Synopsis
          </label>
          <textarea
            value={form.synopsis}
            onChange={e => setForm(f => ({ ...f, synopsis: e.target.value }))}
            placeholder="A brief description of your story…"
            className={`${field} h-24 resize-none`}
            rows={4}
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
            Accent Color
          </label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setForm(f => ({ ...f, coverColor: color }))}
                className={`
                  w-7 h-7 rounded-full transition-all duration-150
                  ${form.coverColor === color ? 'ring-2 ring-cream ring-offset-2 ring-offset-slate-800 scale-110' : 'hover:scale-105'}
                `}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" variant="primary" className="flex-1">
            {isEdit ? 'Save Changes' : 'Create Project'}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  )
}
