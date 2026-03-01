import React, { useState } from 'react'
import { Download, FileText, Globe, Loader } from 'lucide-react'
import Modal from '../UI/Modal'
import Button from '../UI/Button'
import { exportPlainText, downloadText, exportPDF, exportHTML } from '../../utils/exportUtils'
import { projectWordCount, formatNumber } from '../../utils/wordCount'
import { useApp } from '../../context/AppContext'

const formats = [
  {
    id: 'pdf',
    label: 'PDF',
    description: 'Formatted PDF with title page, TOC, and page numbers',
    icon: '📄',
    ext: '.pdf',
  },
  {
    id: 'html',
    label: 'HTML / Word',
    description: 'Open in browser or import into Word/Google Docs',
    icon: '🌐',
    ext: '.html',
  },
  {
    id: 'txt',
    label: 'Plain Text',
    description: 'Simple .txt file with all chapters',
    icon: '📝',
    ext: '.txt',
  },
]

export default function ExportModal({ isOpen, onClose, project }) {
  const { notify } = useApp()
  const [format, setFormat] = useState('pdf')
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState({
    includeHeaders: true,
    includePageNumbers: true,
    includeTOC: true,
    includeNotes: false,
  })

  if (!project) return null

  const wordCount = projectWordCount(project)

  const handleExport = async () => {
    setLoading(true)
    try {
      const safeTitle = project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
      if (format === 'pdf') {
        await exportPDF(project, options)
        notify('PDF exported successfully!', 'success')
      } else if (format === 'html') {
        exportHTML(project, options)
        notify('HTML file exported!', 'success')
      } else if (format === 'txt') {
        const content = exportPlainText(project, options)
        downloadText(content, `${safeTitle}.txt`)
        notify('Text file exported!', 'success')
      }
      onClose()
    } catch (err) {
      console.error('Export error', err)
      notify('Export failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const toggle = key => setOptions(o => ({ ...o, [key]: !o[key] }))

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Manuscript" size="md">
      <div className="space-y-5">
        {/* Project info */}
        <div className="bg-slate-700/40 rounded-lg p-4 border border-slate-600">
          <p className="font-display text-lg text-amber">{project.title}</p>
          {project.author && <p className="text-sm text-slate-400 italic">by {project.author}</p>}
          <div className="flex gap-4 mt-2 text-xs font-mono text-slate-500">
            <span>{project.chapters.length} chapters</span>
            <span>{formatNumber(wordCount)} words</span>
          </div>
        </div>

        {/* Format selection */}
        <div>
          <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
            Export Format
          </label>
          <div className="grid grid-cols-3 gap-2">
            {formats.map(f => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id)}
                className={`
                  flex flex-col items-center gap-1 p-3 rounded-lg border text-center
                  transition-all duration-200 text-sm
                  ${format === f.id
                    ? 'border-amber bg-amber/10 text-amber'
                    : 'border-slate-600 text-slate-400 hover:border-slate-500 hover:text-parchment'
                  }
                `}
              >
                <span className="text-xl">{f.icon}</span>
                <span className="font-mono font-semibold text-xs">{f.label}</span>
                <span className="text-slate-500 text-[10px] font-body">{f.ext}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 font-body mt-2 italic">
            {formats.find(f => f.id === format)?.description}
          </p>
        </div>

        {/* Options */}
        <div>
          <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
            Options
          </label>
          <div className="space-y-2">
            {[
              { key: 'includeHeaders', label: 'Include chapter headers & title page' },
              ...(format === 'pdf' ? [
                { key: 'includePageNumbers', label: 'Include page numbers' },
                { key: 'includeTOC', label: 'Include table of contents' },
              ] : []),
              { key: 'includeNotes', label: 'Include notes/outline sections' },
            ].map(opt => (
              <label key={opt.key} className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => toggle(opt.key)}
                  className={`
                    w-9 h-5 rounded-full border transition-all duration-200 relative
                    ${options[opt.key]
                      ? 'bg-amber border-amber-dark'
                      : 'bg-slate-700 border-slate-500'
                    }
                  `}
                >
                  <div
                    className={`
                      absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200
                      ${options[opt.key] ? 'left-4' : 'left-0.5'}
                    `}
                  />
                </div>
                <span className="text-sm font-body text-slate-300 group-hover:text-cream transition-colors">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleExport}
            disabled={loading}
          >
            {loading ? (
              <><Loader size={14} className="animate-spin" /> Exporting…</>
            ) : (
              <><Download size={14} /> Export {formats.find(f => f.id === format)?.label}</>
            )}
          </Button>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
}
