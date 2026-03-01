import React from 'react'
import { AppProvider, useApp } from './context/AppContext'
import Sidebar from './components/Layout/Sidebar'
import Header from './components/Layout/Header'
import ProjectDashboard from './components/Projects/ProjectDashboard'
import ChapterList from './components/Chapters/ChapterList'
import ChapterEditor from './components/Chapters/ChapterEditor'
import SceneBoard from './components/Scenes/SceneBoard'
import Notifications from './components/UI/Notifications'

function AppContent() {
  const { state } = useApp()
  const { activeView } = state

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
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Header />
        <main
          className={`flex-1 ${isFullHeight ? 'overflow-hidden' : 'overflow-y-auto'}`}
        >
          {renderView()}
        </main>
      </div>

      {/* Global notifications */}
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
