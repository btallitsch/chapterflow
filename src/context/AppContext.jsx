import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'

const AppContext = createContext(null)

const STORAGE_KEY = 'chapterflow_data'
const SETTINGS_KEY = 'chapterflow_settings'

// ─── Initial State ────────────────────────────────────────────────────────────
const initialState = {
  projects: [],
  activeProjectId: null,
  activeChapterId: null,
  activeView: 'dashboard', // dashboard | project | editor | scenes
  searchQuery: '',
  statusFilter: 'all',
  isDarkMode: true,
  isSidebarOpen: true,
  autosaveStatus: 'idle', // idle | saving | saved
  notifications: [],
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
function appReducer(state, action) {
  switch (action.type) {
    // Projects
    case 'CREATE_PROJECT': {
      const project = {
        id: uuidv4(),
        title: action.payload.title || 'Untitled Novel',
        author: action.payload.author || '',
        genre: action.payload.genre || '',
        synopsis: action.payload.synopsis || '',
        coverColor: action.payload.coverColor || '#d4a853',
        chapters: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      return { ...state, projects: [...state.projects, project] }
    }

    case 'UPDATE_PROJECT': {
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.id
            ? { ...p, ...action.payload.data, updatedAt: new Date().toISOString() }
            : p
        ),
      }
    }

    case 'DELETE_PROJECT': {
      const newProjects = state.projects.filter(p => p.id !== action.payload)
      return {
        ...state,
        projects: newProjects,
        activeProjectId: state.activeProjectId === action.payload ? null : state.activeProjectId,
        activeView: state.activeProjectId === action.payload ? 'dashboard' : state.activeView,
      }
    }

    // Chapters
    case 'CREATE_CHAPTER': {
      const chapter = {
        id: uuidv4(),
        title: action.payload.title || 'Untitled Chapter',
        content: '',
        notes: '',
        status: 'draft',
        wordCount: 0,
        scenes: [],
        order: action.payload.order || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId
            ? { ...p, chapters: [...p.chapters, chapter], updatedAt: new Date().toISOString() }
            : p
        ),
      }
    }

    case 'UPDATE_CHAPTER': {
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId
            ? {
                ...p,
                updatedAt: new Date().toISOString(),
                chapters: p.chapters.map(c =>
                  c.id === action.payload.chapterId
                    ? { ...c, ...action.payload.data, updatedAt: new Date().toISOString() }
                    : c
                ),
              }
            : p
        ),
      }
    }

    case 'DELETE_CHAPTER': {
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId
            ? {
                ...p,
                chapters: p.chapters.filter(c => c.id !== action.payload.chapterId),
                updatedAt: new Date().toISOString(),
              }
            : p
        ),
        activeChapterId:
          state.activeChapterId === action.payload.chapterId ? null : state.activeChapterId,
        activeView:
          state.activeChapterId === action.payload.chapterId ? 'project' : state.activeView,
      }
    }

    case 'REORDER_CHAPTERS': {
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId
            ? { ...p, chapters: action.payload.chapters, updatedAt: new Date().toISOString() }
            : p
        ),
      }
    }

    // Scenes
    case 'CREATE_SCENE': {
      const scene = {
        id: uuidv4(),
        title: action.payload.title || 'New Scene',
        description: '',
        color: action.payload.color || '#2e384d',
        order: action.payload.order || 0,
      }
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId
            ? {
                ...p,
                chapters: p.chapters.map(c =>
                  c.id === action.payload.chapterId
                    ? { ...c, scenes: [...c.scenes, scene] }
                    : c
                ),
              }
            : p
        ),
      }
    }

    case 'UPDATE_SCENE': {
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId
            ? {
                ...p,
                chapters: p.chapters.map(c =>
                  c.id === action.payload.chapterId
                    ? {
                        ...c,
                        scenes: c.scenes.map(s =>
                          s.id === action.payload.sceneId
                            ? { ...s, ...action.payload.data }
                            : s
                        ),
                      }
                    : c
                ),
              }
            : p
        ),
      }
    }

    case 'DELETE_SCENE': {
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId
            ? {
                ...p,
                chapters: p.chapters.map(c =>
                  c.id === action.payload.chapterId
                    ? { ...c, scenes: c.scenes.filter(s => s.id !== action.payload.sceneId) }
                    : c
                ),
              }
            : p
        ),
      }
    }

    case 'REORDER_SCENES': {
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId
            ? {
                ...p,
                chapters: p.chapters.map(c =>
                  c.id === action.payload.chapterId
                    ? { ...c, scenes: action.payload.scenes }
                    : c
                ),
              }
            : p
        ),
      }
    }

    // Navigation
    case 'SET_ACTIVE_PROJECT':
      return { ...state, activeProjectId: action.payload, activeView: 'project', activeChapterId: null }

    case 'SET_ACTIVE_CHAPTER':
      return { ...state, activeChapterId: action.payload, activeView: 'editor' }

    case 'SET_ACTIVE_VIEW':
      return { ...state, activeView: action.payload }

    case 'GO_TO_DASHBOARD':
      return { ...state, activeView: 'dashboard', activeProjectId: null, activeChapterId: null }

    case 'GO_TO_PROJECT':
      return { ...state, activeView: 'project', activeChapterId: null }

    case 'GO_TO_SCENES':
      return { ...state, activeView: 'scenes' }

    // UI
    case 'TOGGLE_DARK_MODE':
      return { ...state, isDarkMode: !state.isDarkMode }

    case 'TOGGLE_SIDEBAR':
      return { ...state, isSidebarOpen: !state.isSidebarOpen }

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload }

    case 'SET_STATUS_FILTER':
      return { ...state, statusFilter: action.payload }

    case 'SET_AUTOSAVE_STATUS':
      return { ...state, autosaveStatus: action.payload }

    case 'ADD_NOTIFICATION': {
      const notification = { id: uuidv4(), ...action.payload }
      return { ...state, notifications: [...state.notifications, notification] }
    }

    case 'REMOVE_NOTIFICATION':
      return { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) }

    case 'LOAD_DATA':
      return { ...state, ...action.payload }

    default:
      return state
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const settings = localStorage.getItem(SETTINGS_KEY)
      const payload = {}
      if (stored) payload.projects = JSON.parse(stored)
      if (settings) {
        const s = JSON.parse(settings)
        if (s.isDarkMode !== undefined) payload.isDarkMode = s.isDarkMode
      }
      if (Object.keys(payload).length > 0) dispatch({ type: 'LOAD_DATA', payload })
    } catch (e) {
      console.warn('Failed to load saved data', e)
    }
  }, [])

  // Persist projects to localStorage whenever they change
  useEffect(() => {
    try {
      dispatch({ type: 'SET_AUTOSAVE_STATUS', payload: 'saving' })
      const timeout = setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.projects))
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({ isDarkMode: state.isDarkMode }))
        dispatch({ type: 'SET_AUTOSAVE_STATUS', payload: 'saved' })
        setTimeout(() => dispatch({ type: 'SET_AUTOSAVE_STATUS', payload: 'idle' }), 2000)
      }, 800)
      return () => clearTimeout(timeout)
    } catch (e) {
      console.warn('Autosave failed', e)
    }
  }, [state.projects])

  // Apply dark mode class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.isDarkMode)
  }, [state.isDarkMode])

  // Notifications auto-dismiss
  useEffect(() => {
    state.notifications.forEach(n => {
      if (!n.persistent) {
        setTimeout(() => dispatch({ type: 'REMOVE_NOTIFICATION', payload: n.id }), n.duration || 3000)
      }
    })
  }, [state.notifications])

  const notify = useCallback((message, type = 'info', duration = 3000) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: { message, type, duration } })
  }, [])

  return (
    <AppContext.Provider value={{ state, dispatch, notify }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
