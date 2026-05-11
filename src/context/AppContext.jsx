import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const AppContext = createContext()
export const formatCurrency = (amount, settings) => {
  const symbol = settings?.currency === 'USD' ? '$' : 'Rp'
  const formatted = Math.abs(amount || 0).toLocaleString(
    settings?.currency === 'USD' ? 'en-US' : 'id-ID'
  )
  return `${symbol} ${formatted}`
}

export const formatDate = (dateStr, settings) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (settings?.date_format === 'MM/DD/YYYY') {
    return date.toLocaleDateString('en-US')
  } else if (settings?.date_format === 'YYYY-MM-DD') {
    return date.toISOString().split('T')[0]
  }
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const DEFAULT_SETTINGS = {
  theme: 'light',
  currency: 'IDR',
  date_format: 'DD/MM/YYYY',
  language: 'Indonesian',
  email_alerts: true,
  monthly_reports: false,
  font_size: 'normal',
  biometric_login: false,
  transaction_pin: '',
}

const applyTheme = (theme) => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
    return
  }

  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.classList.toggle('dark', prefersDark)
    return
  }

  document.documentElement.classList.remove('dark')
}

export function AppProvider({ children }) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  // Load transactions on mount
  useEffect(() => {
    loadTransactions()
  }, [])

  // Auto-process recurring transactions
  useEffect(() => {
    const processRecurring = async () => {
      const today = new Date().toISOString().split('T')[0]
      
      const { data: dueRecurrings } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('active', true)
        .lte('next_date', today)

      if (dueRecurrings && dueRecurrings.length > 0) {
        for (const rtx of dueRecurrings) {
          await supabase.from('transactions').insert({
            id: Date.now() + Math.random(),
            date: today,
            merchant: rtx.merchant,
            category: rtx.category,
            amount: rtx.amount,
            type: rtx.type,
            status: 'Completed'
          })

          const nextDate = new Date(rtx.next_date)
          if (rtx.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7)
          else if (rtx.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1)
          else if (rtx.frequency === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1)

          await supabase.from('recurring_transactions')
            .update({ next_date: nextDate.toISOString().split('T')[0] })
            .eq('id', rtx.id)
        }

        await loadTransactions()
      }
    }

    processRecurring()
    const interval = setInterval(processRecurring, 60000)
    return () => clearInterval(interval)
  }, [])

  const loadTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })

    if (!error && data) {
      setTransactions(data)
    }
    setLoading(false)
  }

  const [settings, setSettings] = useState(null)

  useEffect(() => {
    if (!user?.id) {
      setSettings(null)
      return
    }

    supabase.from('user_settings').select('*').eq('user_id', user.id).maybeSingle()
    .then(async ({ data, error }) => {
      if (error) {
        console.error('Failed to load user settings:', error.message)
        return
      }

      if (!data) {
        const { data: createdSettings, error: createError } = await supabase
          .from('user_settings')
          .upsert(
            {
              user_id: user.id,
              ...DEFAULT_SETTINGS,
            },
            { onConflict: 'user_id' },
          )
          .select()
          .single()

        if (createError) {
          console.error('Failed to create user settings:', createError.message)
          return
        }

        setSettings(createdSettings)
        applyTheme(createdSettings.theme)
        return
      }

      if (data) {
        setSettings(data)
        // 🔥 Apply theme langsung
        applyTheme(data.theme)
      }
    })
  }, [user?.id])

  const addTransaction = async (newTx) => {
    const now = new Date()
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    
    const tx = {
      id: Date.now(),
      date: `${dateStr} ${timeStr}`,
      merchant: newTx.merchant,
      category: newTx.category,
      amount: newTx.amount,
      type: newTx.type || 'expense',
      status: 'Completed',
      user_id: user?.id,
    }

    const { error } = await supabase.from('transactions').insert([tx])

    if (!error) {
      setTransactions(prev => [tx, ...prev])
      return true
    }
  }

  const updateTransaction = async (id, updatedData) => {
    const { error } = await supabase
      .from('transactions')
      .update(updatedData)
      .eq('id', id)

    if (!error) {
      await loadTransactions()
      return true
    }
    return false
  }

  const deleteTransaction = async (id) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (!error) {
      setTransactions(prev => prev.filter(tx => String(tx.id) !== String(id)))
      return true
    }
    return false
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <p className="text-slate-400">Loading data...</p>
      </div>
    )
  }

 return (
  <AppContext.Provider value={{ transactions, settings, addTransaction, updateTransaction, deleteTransaction }}>
    {children}
  </AppContext.Provider>
)
}

export function useAppContext() {
  return useContext(AppContext)
}
