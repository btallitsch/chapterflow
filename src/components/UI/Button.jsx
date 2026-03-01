import React from 'react'

const variants = {
  primary: 'bg-amber text-slate-900 hover:bg-amber-dark font-semibold shadow-md hover:shadow-lg',
  secondary: 'bg-slate-700 text-cream hover:bg-slate-600 border border-slate-500',
  ghost: 'text-parchment hover:bg-slate-700 hover:text-cream',
  danger: 'bg-red-900 text-red-100 hover:bg-red-800 border border-red-700',
  outline: 'border border-amber text-amber hover:bg-amber hover:text-slate-900',
}

const sizes = {
  xs: 'px-2 py-1 text-xs rounded',
  sm: 'px-3 py-1.5 text-sm rounded',
  md: 'px-4 py-2 text-base rounded-md',
  lg: 'px-6 py-3 text-lg rounded-lg',
}

export default function Button({
  children,
  variant = 'secondary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  title,
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        inline-flex items-center justify-center gap-2 font-body
        transition-all duration-200 select-none
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}
