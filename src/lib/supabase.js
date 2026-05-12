import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY

// Create a mock supabase client for demo/design mode when env vars are not available
const createMockClient = () => ({
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ data: null, error: { message: 'Demo mode - Supabase not connected' } }),
    signUp: async () => ({ data: null, error: { message: 'Demo mode - Supabase not connected' } }),
    signOut: async () => ({ error: null }),
  },
  from: () => ({
    select: () => ({ data: [], error: null, order: () => ({ data: [], error: null }) }),
    insert: () => ({ data: null, error: { message: 'Demo mode' } }),
    update: () => ({ eq: () => ({ data: null, error: { message: 'Demo mode' } }) }),
    delete: () => ({ eq: () => ({ data: null, error: { message: 'Demo mode' } }) }),
  }),
})

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey)
  : createMockClient()

export const isDemoMode = !supabaseUrl || !supabaseKey
