import React from 'react'
import { Search, X } from 'lucide-react'

export default function SearchBar({ value, onChange, placeholder = 'Search...', className = '' }) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-700 border border-slate-600 text-cream placeholder-slate-400
                   pl-8 pr-8 py-1.5 rounded-lg text-sm font-body
                   focus:outline-none focus:border-amber transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2 text-slate-400 hover:text-cream transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
