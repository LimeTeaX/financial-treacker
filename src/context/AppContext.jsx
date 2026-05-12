/* eslint-disable react-refresh/only-export-components, react-hooks/preserve-manual-memoization, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const AppContext = createContext(null)

export const DEFAULT_SETTINGS = {
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

const INITIAL_LOADING = {
  app: true,
  transactions: false,
  settings: false,
  recurringTransactions: false,
  bills: false,
  profile: false,
  loginHistory: false,
}

export const formatCurrency = (amount, settings = DEFAULT_SETTINGS) => {
  const currency = settings?.currency ?? DEFAULT_SETTINGS.currency
  const symbol = currency === 'USD' ? '$' : 'Rp'
  const formatted = Math.abs(amount || 0).toLocaleString(
    currency === 'USD' ? 'en-US' : 'id-ID',
  )
  return `${symbol} ${formatted}`
}

export const formatDate = (dateStr, settings = DEFAULT_SETTINGS) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return ''

  if (settings?.date_format === 'MM/DD/YYYY') return date.toLocaleDateString('en-US')
  if (settings?.date_format === 'YYYY-MM-DD') return date.toISOString().split('T')[0]

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export const applyTheme = (theme) => {
  if (typeof document === 'undefined') return

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

const sortByDateDesc = (rows, field = 'date') =>
  [...rows].sort((a, b) => new Date(b?.[field] ?? 0) - new Date(a?.[field] ?? 0))

const sortByDateAsc = (rows, field = 'date') =>
  [...rows].sort((a, b) => new Date(a?.[field] ?? 0) - new Date(b?.[field] ?? 0))

const upsertByKey = (rows, row, key = 'id') => {
  if (!row?.[key]) return rows
  const exists = rows.some((item) => item?.[key] === row[key])
  if (!exists) return [row, ...rows]
  return rows.map((item) => (item?.[key] === row[key] ? row : item))
}

const normalizeProfile = (profile) => {
  if (!profile) return null
  return {
    ...profile,
    memberSince: profile.member_since ?? profile.memberSince ?? '',
  }
}

const getDeviceInfo = () => {
  const ua = navigator.userAgent
  if (/iPhone/.test(ua)) return 'iPhone'
  if (/iPad/.test(ua)) return 'iPad'
  if (/Android/.test(ua)) return 'Android Phone'
  if (/Macintosh/.test(ua)) return 'MacBook'
  if (/Windows/.test(ua)) return 'Windows PC'
  return 'Desktop'
}

const getBrowserInfo = () => {
  const ua = navigator.userAgent
  if (/Edg/.test(ua)) return 'Edge'
  if (/Chrome/.test(ua)) return 'Chrome'
  if (/Firefox/.test(ua)) return 'Firefox'
  if (/Safari/.test(ua) && !/Chrome/.test(ua)) return 'Safari'
  return 'Browser'
}

const getNextRecurringDate = (currentDate, frequency) => {
  const nextDate = new Date(currentDate)
  if (Number.isNaN(nextDate.getTime())) return new Date().toISOString().split('T')[0]

  if (frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7)
  else if (frequency === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1)
  else nextDate.setMonth(nextDate.getMonth() + 1)

  return nextDate.toISOString().split('T')[0]
}

export function AppProvider({ children }) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [settings, setSettings] = useState(null)
  const [recurringTransactions, setRecurringTransactions] = useState([])
  const [bills, setBills] = useState([])
  const [profile, setProfile] = useState(null)
  const [loginHistory, setLoginHistory] = useState([])
  const [loading, setLoading] = useState(INITIAL_LOADING)
  const [error, setError] = useState(null)
  const recordedLoginForUserRef = useRef(null)

  const clearState = useCallback(() => {
    setTransactions([])
    setSettings(null)
    setRecurringTransactions([])
    setBills([])
    setProfile(null)
    setLoginHistory([])
    setError(null)
    recordedLoginForUserRef.current = null
  }, [])

  const setTableLoading = useCallback((key, value) => {
    setLoading((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleError = useCallback((message, errorObject) => {
    const nextError = errorObject?.message ?? message
    setError(nextError)
    console.error(message, errorObject)
    return false
  }, [])

  const fetchAppData = useCallback(async () => {
    if (!user?.id) {
      clearState()
      setLoading((prev) => ({ ...prev, app: false }))
      return
    }

    setLoading((prev) => ({
      ...prev,
      app: true,
      transactions: true,
      settings: true,
      recurringTransactions: true,
      bills: true,
      profile: true,
      loginHistory: true,
    }))
    setError(null)

    try {
      const [
        transactionsResult,
        settingsResult,
        recurringResult,
        billsResult,
        profileResult,
        loginHistoryResult,
      ] = await Promise.all([
        supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false }),
        supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('recurring_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('next_date', { ascending: true }),
        supabase
          .from('bills')
          .select('*')
          .eq('user_id', user.id)
          .order('due_date', { ascending: true }),
        supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('login_history')
          .select('*')
          .eq('user_id', user.id)
          .order('time', { ascending: false })
          .limit(10),
      ])

      const results = [
        transactionsResult,
        settingsResult,
        recurringResult,
        billsResult,
        profileResult,
        loginHistoryResult,
      ]
      const failed = results.find((result) => result.error)
      if (failed) throw failed.error

      setTransactions(transactionsResult.data ?? [])
      setSettings(settingsResult.data ?? null)
      setRecurringTransactions(recurringResult.data ?? [])
      setBills(billsResult.data ?? [])
      setProfile(normalizeProfile(profileResult.data))
      setLoginHistory(loginHistoryResult.data ?? [])
    } catch (errorObject) {
      handleError('Failed to load app data', errorObject)
    } finally {
      setLoading((prev) => ({
        ...prev,
        app: false,
        transactions: false,
        settings: false,
        recurringTransactions: false,
        bills: false,
        profile: false,
        loginHistory: false,
      }))
    }
  }, [clearState, handleError, user?.id])

  useEffect(() => {
    fetchAppData()
  }, [fetchAppData])

  useEffect(() => {
    if (!user?.id || recordedLoginForUserRef.current === user.id) return

    const recordLogin = async () => {
      recordedLoginForUserRef.current = user.id
      try {
        const { data, error: insertError } = await supabase
          .from('login_history')
          .insert({
            device: getDeviceInfo(),
            browser: getBrowserInfo(),
            location: 'Unknown',
            time: new Date().toISOString(),
            status: 'success',
            user_id: user.id,
          })
          .select()
          .single()

        if (insertError) throw insertError
        if (data) {
          setLoginHistory((prev) =>
            sortByDateDesc(upsertByKey(prev, data), 'time').slice(0, 10),
          )
        }
      } catch (errorObject) {
        recordedLoginForUserRef.current = null
        handleError('Failed to record login history', errorObject)
      }
    }

    recordLogin()
  }, [handleError, user?.id])

  useEffect(() => {
    const effectiveSettings = settings ?? DEFAULT_SETTINGS
    applyTheme(effectiveSettings.theme)

    const html = document.documentElement
    html.style.fontSize =
      effectiveSettings.font_size === 'small'
        ? '14px'
        : effectiveSettings.font_size === 'large'
          ? '18px'
          : '16px'
  }, [settings])

  useEffect(() => {
    if (!settings || settings.theme !== 'system') return undefined

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (event) => {
      document.documentElement.classList.toggle('dark', event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [settings?.theme])

  useEffect(() => {
    if (!user?.id) return undefined

    const handleRealtimeChange = (payload) => {
      const { eventType, new: newRow, old: oldRow, table } = payload

      if (table === 'transactions') {
        if (eventType === 'DELETE') {
          setTransactions((prev) => prev.filter((row) => row.id !== oldRow.id))
          return
        }
        setTransactions((prev) => sortByDateDesc(upsertByKey(prev, newRow)))
      }

      if (table === 'recurring_transactions') {
        if (eventType === 'DELETE') {
          setRecurringTransactions((prev) => prev.filter((row) => row.id !== oldRow.id))
          return
        }
        setRecurringTransactions((prev) =>
          sortByDateAsc(upsertByKey(prev, newRow), 'next_date'),
        )
      }

      if (table === 'bills') {
        if (eventType === 'DELETE') {
          setBills((prev) => prev.filter((row) => row.id !== oldRow.id))
          return
        }
        setBills((prev) => sortByDateAsc(upsertByKey(prev, newRow), 'due_date'))
      }

      if (table === 'user_settings') {
        if (eventType === 'DELETE') setSettings(null)
        else setSettings(newRow)
      }

      if (table === 'user_profiles') {
        if (eventType === 'DELETE') setProfile(null)
        else setProfile(normalizeProfile(newRow))
      }

      if (table === 'login_history') {
        if (eventType === 'DELETE') {
          setLoginHistory((prev) => prev.filter((row) => row.id !== oldRow.id))
          return
        }
        setLoginHistory((prev) =>
          sortByDateDesc(upsertByKey(prev, newRow), 'time').slice(0, 10),
        )
      }
    }

    const channel = supabase
      .channel(`app-data-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`,
        },
        handleRealtimeChange,
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'recurring_transactions',
          filter: `user_id=eq.${user.id}`,
        },
        handleRealtimeChange,
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bills',
          filter: `user_id=eq.${user.id}`,
        },
        handleRealtimeChange,
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_settings',
          filter: `user_id=eq.${user.id}`,
        },
        handleRealtimeChange,
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_profiles',
          filter: `user_id=eq.${user.id}`,
        },
        handleRealtimeChange,
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'login_history',
          filter: `user_id=eq.${user.id}`,
        },
        handleRealtimeChange,
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  const addTransaction = useCallback(
    async (newTransaction) => {
      if (!user?.id) return handleError('Cannot add transaction without a user')
      setTableLoading('transactions', true)

      try {
        const payload = {
          user_id: user.id,
          date: newTransaction.date ?? new Date().toISOString(),
          merchant: newTransaction.merchant,
          category: newTransaction.category,
          amount: Number(newTransaction.amount) || 0,
          type: newTransaction.type ?? (Number(newTransaction.amount) >= 0 ? 'income' : 'expense'),
          status: newTransaction.status ?? 'Completed',
        }

        const { data, error: insertError } = await supabase
          .from('transactions')
          .insert(payload)
          .select()
          .single()

        if (insertError) throw insertError
        setTransactions((prev) => sortByDateDesc(upsertByKey(prev, data)))
        return data
      } catch (errorObject) {
        return handleError('Failed to add transaction', errorObject)
      } finally {
        setTableLoading('transactions', false)
      }
    },
    [handleError, setTableLoading, user?.id],
  )

  const updateTransaction = useCallback(
    async (id, updatedData) => {
      if (!user?.id) return handleError('Cannot update transaction without a user')
      setTableLoading('transactions', true)

      try {
        const { data, error: updateError } = await supabase
          .from('transactions')
          .update(updatedData)
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single()

        if (updateError) throw updateError
        setTransactions((prev) => sortByDateDesc(upsertByKey(prev, data)))
        return true
      } catch (errorObject) {
        return handleError('Failed to update transaction', errorObject)
      } finally {
        setTableLoading('transactions', false)
      }
    },
    [handleError, setTableLoading, user?.id],
  )

  const deleteTransaction = useCallback(
    async (id) => {
      if (!user?.id) return handleError('Cannot delete transaction without a user')
      setTableLoading('transactions', true)

      try {
        const { error: deleteError } = await supabase
          .from('transactions')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id)

        if (deleteError) throw deleteError
        setTransactions((prev) => prev.filter((transaction) => transaction.id !== id))
        return true
      } catch (errorObject) {
        return handleError('Failed to delete transaction', errorObject)
      } finally {
        setTableLoading('transactions', false)
      }
    },
    [handleError, setTableLoading, user?.id],
  )

  const resetTransactions = useCallback(async () => {
    if (!user?.id) return handleError('Cannot reset transactions without a user')
    setTableLoading('transactions', true)

    try {
      const { error: deleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id)

      if (deleteError) throw deleteError
      setTransactions([])
      return true
    } catch (errorObject) {
      return handleError('Failed to reset transactions', errorObject)
    } finally {
      setTableLoading('transactions', false)
    }
  }, [handleError, setTableLoading, user?.id])

const updateSettings = useCallback(
  async (updates) => {
    if (!user?.id) return handleError('Cannot update settings without a user')
    const previousSettings = settings
    const optimisticSettings = {
      ...(settings ?? DEFAULT_SETTINGS),
      ...updates,
      user_id: user.id,
    }

    // 🔥 TERAPIN THEME DULU (OPTIMISTIC UPDATE)
    if (updates.theme) {
      applyTheme(updates.theme)
    }

    setSettings(optimisticSettings)
    setTableLoading('settings', true)

    try {
      const { data, error: updateError } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) throw updateError
      setSettings(data)
      return true
    } catch (errorObject) {
      // 🔥 ROLLBACK THEME KALAU GAGAL
      if (updates.theme && previousSettings) {
        applyTheme(previousSettings.theme)
      }
      setSettings(previousSettings)
      return handleError('Failed to update settings', errorObject)
    } finally {
      setTableLoading('settings', false)
    }
  },
  [handleError, setTableLoading, settings, user?.id],
)

  const addRecurringTransaction = useCallback(
    async (recurringTransaction) => {
      if (!user?.id) return handleError('Cannot add recurring transaction without a user')
      setTableLoading('recurringTransactions', true)

      try {
        const { data, error: insertError } = await supabase
          .from('recurring_transactions')
          .insert({
            user_id: user.id,
            merchant: recurringTransaction.merchant,
            category: recurringTransaction.category,
            amount: Number(recurringTransaction.amount) || 0,
            type: recurringTransaction.type,
            frequency: recurringTransaction.frequency,
            next_date: recurringTransaction.next_date,
            active: recurringTransaction.active ?? true,
          })
          .select()
          .single()

        if (insertError) throw insertError
        setRecurringTransactions((prev) =>
          sortByDateAsc(upsertByKey(prev, data), 'next_date'),
        )
        return data
      } catch (errorObject) {
        return handleError('Failed to add recurring transaction', errorObject)
      } finally {
        setTableLoading('recurringTransactions', false)
      }
    },
    [handleError, setTableLoading, user?.id],
  )

  const updateRecurringTransaction = useCallback(
    async (id, updates) => {
      if (!user?.id) return handleError('Cannot update recurring transaction without a user')
      setTableLoading('recurringTransactions', true)

      try {
        const { data, error: updateError } = await supabase
          .from('recurring_transactions')
          .update(updates)
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single()

        if (updateError) throw updateError
        setRecurringTransactions((prev) =>
          sortByDateAsc(upsertByKey(prev, data), 'next_date'),
        )
        return true
      } catch (errorObject) {
        return handleError('Failed to update recurring transaction', errorObject)
      } finally {
        setTableLoading('recurringTransactions', false)
      }
    },
    [handleError, setTableLoading, user?.id],
  )

  const deleteRecurringTransaction = useCallback(
    async (id) => {
      if (!user?.id) return handleError('Cannot delete recurring transaction without a user')
      setTableLoading('recurringTransactions', true)

      try {
        const { error: deleteError } = await supabase
          .from('recurring_transactions')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id)

        if (deleteError) throw deleteError
        setRecurringTransactions((prev) => prev.filter((row) => row.id !== id))
        return true
      } catch (errorObject) {
        return handleError('Failed to delete recurring transaction', errorObject)
      } finally {
        setTableLoading('recurringTransactions', false)
      }
    },
    [handleError, setTableLoading, user?.id],
  )

  const processRecurringTransaction = useCallback(
    async (recurringTransaction) => {
      const transaction = await addTransaction({
        merchant: recurringTransaction.merchant,
        category: recurringTransaction.category,
        amount: recurringTransaction.amount,
        type: recurringTransaction.type,
        status: 'Completed',
        date: new Date().toISOString(),
      })

      if (!transaction) return false

      return updateRecurringTransaction(recurringTransaction.id, {
        next_date: getNextRecurringDate(
          recurringTransaction.next_date,
          recurringTransaction.frequency,
        ),
      })
    },
    [addTransaction, updateRecurringTransaction],
  )

  const addBill = useCallback(
    async (bill) => {
      if (!user?.id) return handleError('Cannot add bill without a user')
      setTableLoading('bills', true)

      try {
        const { data, error: insertError } = await supabase
          .from('bills')
          .insert({
            user_id: user.id,
            date: bill.date ?? new Date().toISOString().split('T')[0],
            merchant: bill.merchant,
            category: bill.category,
            amount: Number(bill.amount) || 0,
            due_date: bill.due_date,
            status: bill.status ?? 'upcoming',
          })
          .select()
          .single()

        if (insertError) throw insertError
        setBills((prev) => sortByDateAsc(upsertByKey(prev, data), 'due_date'))
        return data
      } catch (errorObject) {
        return handleError('Failed to add bill', errorObject)
      } finally {
        setTableLoading('bills', false)
      }
    },
    [handleError, setTableLoading, user?.id],
  )

  const updateBill = useCallback(
    async (id, updates) => {
      if (!user?.id) return handleError('Cannot update bill without a user')
      setTableLoading('bills', true)

      try {
        const { data, error: updateError } = await supabase
          .from('bills')
          .update(updates)
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single()

        if (updateError) throw updateError
        setBills((prev) => sortByDateAsc(upsertByKey(prev, data), 'due_date'))
        return data
      } catch (errorObject) {
        return handleError('Failed to update bill', errorObject)
      } finally {
        setTableLoading('bills', false)
      }
    },
    [handleError, setTableLoading, user?.id],
  )

  const deleteBill = useCallback(
    async (id) => {
      if (!user?.id) return handleError('Cannot delete bill without a user')
      setTableLoading('bills', true)

      try {
        const { error: deleteError } = await supabase
          .from('bills')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id)

        if (deleteError) throw deleteError
        setBills((prev) => prev.filter((bill) => bill.id !== id))
        return true
      } catch (errorObject) {
        return handleError('Failed to delete bill', errorObject)
      } finally {
        setTableLoading('bills', false)
      }
    },
    [handleError, setTableLoading, user?.id],
  )

  const payBill = useCallback(
    async (bill, method) => {
      const paidDate = new Date().toISOString()
      const updatedBill = await updateBill(bill.id, {
        status: 'paid',
        method,
        date: paidDate.split('T')[0],
        paid_at: paidDate,
      })

      if (!updatedBill) return false

      await addTransaction({
        merchant: bill.merchant,
        category: bill.category,
        amount: -Math.abs(Number(bill.amount) || 0),
        type: 'expense',
        status: 'Completed',
        date: paidDate,
      })

      return true
    },
    [addTransaction, updateBill],
  )

  const updateProfile = useCallback(
    async (updates) => {
      if (!user?.id) return handleError('Cannot update profile without a user')
      setTableLoading('profile', true)

      const payload = {
        name: updates.name,
        title: updates.title,
        location: updates.location,
        member_since: updates.memberSince ?? updates.member_since,
        program: updates.program,
        semester: updates.semester,
        nim: updates.nim,
        faculty: updates.faculty,
        avatar_url: updates.avatar_url,
      }

      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) delete payload[key]
      })

      try {
        const { data, error: updateError } = await supabase
          .from('user_profiles')
          .update(payload)
          .eq('user_id', user.id)
          .select()
          .single()

        if (updateError) throw updateError
        setProfile(normalizeProfile(data))
        return true
      } catch (errorObject) {
        return handleError('Failed to update profile', errorObject)
      } finally {
        setTableLoading('profile', false)
      }
    },
    [handleError, setTableLoading, user?.id],
  )

  const updateProfileAvatar = useCallback(
    async (avatarUrl) => updateProfile({ avatar_url: avatarUrl }),
    [updateProfile],
  )

  const paymentHistory = useMemo(
    () =>
      sortByDateDesc(
        bills.filter((bill) => bill.status === 'paid'),
        'paid_at',
      ),
    [bills],
  )

  const activeBillsCount = useMemo(
    () => bills.filter((bill) => bill.status !== 'paid').length,
    [bills],
  )

  const contextSettings = settings ?? DEFAULT_SETTINGS

  const value = useMemo(
    () => ({
      transactions,
      settings: contextSettings,
      rawSettings: settings,
      recurringTransactions,
      bills,
      paymentHistory,
      activeBillsCount,
      profile,
      loginHistory,
      loading,
      isAppLoading: loading.app,
      error,
      refreshData: fetchAppData,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      resetTransactions,
      updateSettings,
      addRecurringTransaction,
      updateRecurringTransaction,
      deleteRecurringTransaction,
      processRecurringTransaction,
      addBill,
      updateBill,
      deleteBill,
      payBill,
      updateProfile,
      updateProfileAvatar,
    }),
    [
      activeBillsCount,
      addBill,
      addRecurringTransaction,
      addTransaction,
      bills,
      contextSettings,
      deleteBill,
      deleteRecurringTransaction,
      deleteTransaction,
      error,
      fetchAppData,
      loading,
      loginHistory,
      payBill,
      paymentHistory,
      processRecurringTransaction,
      profile,
      recurringTransactions,
      resetTransactions,
      settings,
      transactions,
      updateBill,
      updateProfile,
      updateProfileAvatar,
      updateRecurringTransaction,
      updateSettings,
      updateTransaction,
    ],
  )

  if (loading.app && user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <p className="text-slate-400">Loading data...</p>
      </div>
    )
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}



export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppContext must be used inside AppProvider')
  return context
}
