import React, { useState } from 'react'
import { Feather, Mail, Lock, Loader, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login') // login | signup | reset
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null) // { type: 'error'|'success', text }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage({ type: 'success', text: 'Check your email to confirm your account.' })
      } else if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onAuth(data.user)
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset`,
        })
        if (error) throw error
        setMessage({ type: 'success', text: 'Password reset email sent.' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  const field = `w-full bg-slate-800 border border-slate-600 text-cream placeholder-slate-500
                 rounded-lg px-4 py-3 font-body focus:outline-none focus:border-amber transition-colors`

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 border border-slate-700 mb-4">
            <Feather size={28} className="text-amber" />
          </div>
          <h1 className="font-display text-3xl text-cream">ChapterFlow</h1>
          <p className="text-slate-500 font-body mt-1 italic">Your novel writing companion</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
          <h2 className="font-display text-xl text-amber mb-6">
            {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create account' : 'Reset password'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className={`${field} pl-10`}
                required
              />
            </div>

            {mode !== 'reset' && (
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  className={`${field} pl-10 pr-10`}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            )}

            {message && (
              <p className={`text-sm font-body rounded-lg px-3 py-2
                ${message.type === 'error'
                  ? 'text-red-300 bg-red-900/30 border border-red-800'
                  : 'text-emerald-300 bg-emerald-900/30 border border-emerald-800'
                }`}>
                {message.text}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber text-slate-900 hover:bg-amber-dark font-semibold font-body
                         py-3 rounded-lg transition-all duration-200 shadow-md
                         disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading
                ? <><Loader size={15} className="animate-spin" /> Working…</>
                : mode === 'login' ? 'Sign In'
                : mode === 'signup' ? 'Create Account'
                : 'Send Reset Email'
              }
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-5 pt-5 border-t border-slate-700 space-y-2 text-center text-sm font-body text-slate-500">
            {mode === 'login' && (
              <>
                <button onClick={() => setMode('signup')} className="hover:text-amber transition-colors block w-full">
                  Don't have an account? <span className="text-amber">Sign up</span>
                </button>
                <button onClick={() => setMode('reset')} className="hover:text-slate-300 transition-colors">
                  Forgot password?
                </button>
              </>
            )}
            {mode !== 'login' && (
              <button onClick={() => setMode('login')} className="hover:text-amber transition-colors">
                ← Back to sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
