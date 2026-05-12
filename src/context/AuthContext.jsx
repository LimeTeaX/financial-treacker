/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase, isDemoMode } from '../lib/supabase'

const AuthContext = createContext(null)

// Demo user for design preview
const DEMO_USER = {
  id: 'demo-user-id',
  email: 'demo@example.com',
  user_metadata: { full_name: 'Demo User' }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(isDemoMode ? DEMO_USER : null)
  const [role, setRole] = useState('user')
  const [loading, setLoading] = useState(!isDemoMode)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    // Skip auth initialization in demo mode
    if (isDemoMode) return

    let isMounted = true

    const syncSession = (nextSession) => {
      if (!isMounted) return
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      if (!nextSession?.user) setRole('user')
    }

    const initSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        syncSession(data.session)
      } catch (error) {
        if (isMounted) setAuthError(error.message)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    initSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      syncSession(nextSession)
      if (event === 'SIGNED_OUT') setAuthError(null)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!user?.id || isDemoMode) return

    let isMounted = true

    const fetchRole = async () => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle()

        if (error) throw error
        if (isMounted) setRole(data?.role ?? 'user')
      } catch (error) {
        if (isMounted) {
          setRole('user')
          setAuthError(error.message)
        }
      }
    }

    fetchRole()

    const channel = supabase
      .channel(`auth-role-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'DELETE') setRole('user')
          else setRole(payload.new?.role ?? 'user')
        },
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  const signUp = async (email, password) => {
    if (isDemoMode) return { data: null, error: { message: 'Demo mode - Supabase not connected' } }
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) setAuthError(error.message)
    return { data, error }
  }

  const signIn = async (email, password) => {
    if (isDemoMode) return { data: null, error: { message: 'Demo mode - Supabase not connected' } }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) setAuthError(error.message)
    return { data, error }
  }

  const signOut = async () => {
    if (isDemoMode) {
      setUser(null)
      return { error: null }
    }
    const { error } = await supabase.auth.signOut()
    if (error) {
      setAuthError(error.message)
      return { error }
    }

    setSession(null)
    setUser(null)
    setRole('user')
    setAuthError(null)
    return { error: null }
  }

  const signInWithGoogle = async () => {
    if (isDemoMode) return { data: null, error: { message: 'Demo mode - Supabase not connected' } }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
    if (error) setAuthError(error.message)
    return { data, error }
  }

  const value = useMemo(
    () => ({
      session,
      user,
      role,
      loading,
      authError,
      isDemoMode,
      signUp,
      signIn,
      signOut,
      signInWithGoogle,
    }),
    [session, user, role, loading, authError],
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <p className="text-slate-400">Checking session...</p>
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
