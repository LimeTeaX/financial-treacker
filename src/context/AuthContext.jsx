/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [role, setRole] = useState('user')
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
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
    if (!user?.id) return

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
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) setAuthError(error.message)
    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) setAuthError(error.message)
    return { data, error }
  }

  const signOut = async () => {
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
      signUp,
      signIn,
      signOut,
      signInWithGoogle,
    }),
    [session, user, role, loading, authError],
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
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
