import React from 'react'

const configs = {
  draft:         { label: 'Draft',         className: 'badge-draft' },
  'in-progress': { label: 'In Progress',   className: 'badge-in-progress' },
  complete:      { label: 'Complete',      className: 'badge-complete' },
  'needs-editing':{ label: 'Needs Editing', className: 'badge-needs-editing' },
}

export default function Badge({ status, className = '' }) {
  const cfg = configs[status] || configs.draft
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-semibold uppercase tracking-wide ${cfg.className} ${className}`}>
      {cfg.label}
    </span>
  )
}

export function StatusSelect({ value, onChange, className = '' }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`bg-slate-700 border border-slate-500 text-parchment rounded px-2 py-1 text-sm font-mono focus:outline-none focus:border-amber ${className}`}
    >
      <option value="draft">Draft</option>
      <option value="in-progress">In Progress</option>
      <option value="needs-editing">Needs Editing</option>
      <option value="complete">Complete</option>
    </select>
  )
}
