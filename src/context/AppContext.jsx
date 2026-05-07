import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTransactions()
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
    const tx = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      merchant: newTx.merchant,
      category: newTx.category,
      amount: newTx.amount,
      type: newTx.type || 'expense',
      status: 'Completed',
    }

    console.log('Sending to Supabase:', tx)

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