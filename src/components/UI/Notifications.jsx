import React from 'react'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const icons = {
  success: <CheckCircle size={16} className="text-emerald-400" />,
  error:   <AlertCircle size={16} className="text-red-400" />,
  info:    <Info size={16} className="text-blue-400" />,
  warning: <AlertCircle size={16} className="text-amber" />,
}

export default function Notifications() {
  const { state, dispatch } = useApp()

  if (state.notifications.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {state.notifications.map(n => (
        <div
          key={n.id}
          className="flex items-start gap-3 bg-slate-700 border border-slate-500 
                     rounded-lg px-4 py-3 shadow-xl animate-slide-left"
        >
          {icons[n.type] || icons.info}
          <span className="text-sm font-body text-parchment flex-1">{n.message}</span>
          <button
            onClick={() => dispatch({ type: 'REMOVE_NOTIFICATION', payload: n.id })}
            className="text-slate-400 hover:text-cream transition-colors mt-0.5"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
