import React, { useEffect, useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import { supabase } from './lib/supabase'
import { useSupabaseSync } from './hooks/useSupabaseSync'
import Sidebar from './components/Layout/Sidebar'
import Header from './components/Layout/Header'
import ProjectDashboard from './components/Projects/ProjectDashboard'
import ChapterList from './components/Chapters/ChapterList'
import ChapterEditor from './components/Chapters/ChapterEditor'
import SceneBoard from './components/Scenes/SceneBoard'
import AuthScreen from './components/Auth/AuthScreen'
import Notifications from './components/UI/Notifications'

function AppContent() {
  const { state, dispatch } = useApp()
  const { activeView, user, isLoadingData } = state

  // Wire up Supabase sync
  useSupabaseSync()

  // Listen for auth state changes (handles page refresh, token expiry, etc.)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch({ type: 'SET_USER', payload: session?.user ?? null })
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch({ type: 'SET_USER', payload: session?.user ?? null })
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    dispatch({ type: 'SET_USER', payload: null })
    dispatch({ type: 'LOAD_DATA', payload: { projects: [] } })
    dispatch({ type: 'GO_TO_DASHBOARD' })
  }

  // Not logged in → show auth screen
  if (!user) {
    return <AuthScreen onAuth={(user) => dispatch({ type: 'SET_USER', payload: user })} />
  }

  // Loading initial data from Supabase
  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-amber border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 font-body text-sm">Loading your library…</p>
        </div>
      </div>
    )
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <ProjectDashboard />
      case 'project':   return <ChapterList />
      case 'editor':    return <ChapterEditor />
      case 'scenes':    return <SceneBoard />
      default:          return <ProjectDashboard />
    }
  }

  const isFullHeight = activeView === 'editor' || activeView === 'scenes'

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900 text-cream">
      <Sidebar onSignOut={handleSignOut} />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Header />
        <main className={`flex-1 ${isFullHeight ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          {renderView()}
        </main>
      </div>
      <Notifications />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
