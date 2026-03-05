import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../context/AppContext'

// ─── DB → App transformers ────────────────────────────────────────────────────

function dbToAppProject(p, chapters = []) {
  return {
    id: p.id,
    title: p.title,
    author: p.author || '',
    genre: p.genre || '',
    synopsis: p.synopsis || '',
    coverColor: p.cover_color || '#d4a853',
    chapters,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  }
}

function dbToAppChapter(c, scenes = []) {
  return {
    id: c.id,
    title: c.title,
    content: c.content || '',
    notes: c.notes || '',
    status: c.status || 'draft',
    wordCount: c.word_count || 0,
    order: c.order || 0,
    scenes,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  }
}

// ─── App → DB transformers ────────────────────────────────────────────────────

function appToDbProject(p, userId) {
  return {
    id: p.id,
    user_id: userId,
    title: p.title,
    author: p.author || null,
    genre: p.genre || null,
    synopsis: p.synopsis || null,
    cover_color: p.coverColor,
    updated_at: new Date().toISOString(),
  }
}

function appToDbChapter(c, projectId, userId) {
  return {
    id: c.id,
    project_id: projectId,
    user_id: userId,
    title: c.title,
    content: c.content || null,
    notes: c.notes || null,
    status: c.status || 'draft',
    word_count: c.wordCount || 0,
    order: c.order || 0,
    updated_at: new Date().toISOString(),
  }
}

function appToDbScene(s, chapterId, userId) {
  return {
    id: s.id,
    chapter_id: chapterId,
    user_id: userId,
    title: s.title,
    description: s.description || null,
    color: s.color || null,
    order: s.order || 0,
  }
}

// ─── Main sync hook ───────────────────────────────────────────────────────────

export function useSupabaseSync() {
  const { state, dispatch, notify } = useApp()
  const { user, projects } = state
  const syncTimer = useRef(null)
  const isInitialLoad = useRef(true)

  // Load from Supabase when user logs in
  useEffect(() => {
    if (!user) return
    loadFromSupabase(user.id)
  }, [user?.id])

  // Debounced sync whenever projects change (skip the initial load)
  useEffect(() => {
    if (!user) return
    if (isInitialLoad.current) return

    dispatch({ type: 'SET_AUTOSAVE_STATUS', payload: 'saving' })

    if (syncTimer.current) clearTimeout(syncTimer.current)
    syncTimer.current = setTimeout(async () => {
      try {
        await syncToSupabase(projects, user.id)
        dispatch({ type: 'SET_AUTOSAVE_STATUS', payload: 'saved' })
        setTimeout(() => dispatch({ type: 'SET_AUTOSAVE_STATUS', payload: 'idle' }), 2000)
      } catch (err) {
        console.error('Sync failed:', err)
        dispatch({ type: 'SET_AUTOSAVE_STATUS', payload: 'idle' })
        notify('Sync failed — changes saved locally', 'warning')
      }
    }, 1000)

    return () => clearTimeout(syncTimer.current)
  }, [projects])

  const loadFromSupabase = async (userId) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const { data: dbProjects, error } = await supabase
        .from('projects')
        .select(`*, chapters(*, scenes(*))`)
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (error) throw error

      const appProjects = (dbProjects || []).map(p => {
        const chapters = (p.chapters || [])
          .map(c => {
            const scenes = (c.scenes || []).sort((a, b) => a.order - b.order)
            return dbToAppChapter(c, scenes)
          })
          .sort((a, b) => a.order - b.order)
        return dbToAppProject(p, chapters)
      })

      dispatch({ type: 'LOAD_DATA', payload: { projects: appProjects } })
    } catch (err) {
      console.error('Failed to load from Supabase:', err)
      notify('Could not load cloud data — showing local version', 'warning')
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
      // After the first load is done, allow syncing on future changes
      setTimeout(() => { isInitialLoad.current = false }, 100)
    }
  }

  const syncToSupabase = async (projects, userId) => {
    for (const project of projects) {
      // Upsert project
      const { error: pErr } = await supabase
        .from('projects')
        .upsert(appToDbProject(project, userId))
      if (pErr) throw pErr

      for (const chapter of project.chapters) {
        // Upsert chapter
        const { error: cErr } = await supabase
          .from('chapters')
          .upsert(appToDbChapter(chapter, project.id, userId))
        if (cErr) throw cErr

        for (const scene of chapter.scenes || []) {
          // Upsert scene
          const { error: sErr } = await supabase
            .from('scenes')
            .upsert(appToDbScene(scene, chapter.id, userId))
          if (sErr) throw sErr
        }
      }
    }
  }
}
