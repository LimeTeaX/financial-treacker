import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AppContext = createContext()

export function AppProvider({ children }) {
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
    }

    const { error } = await supabase.from('transactions').insert([tx])

    if (!error) {
      setTransactions(prev => [tx, ...prev])
      return true
    }
    console.error('Supabase error:', error)
    return false
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
    <AppContext.Provider value={{ transactions, addTransaction, updateTransaction, deleteTransaction }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  return useContext(AppContext)
}