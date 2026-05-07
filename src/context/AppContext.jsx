import { createContext, useContext, useEffect, useState } from 'react'
import {
  deleteFromSheets,
  loadFromSheets,
  saveToSheets,
  syncToSheets,
} from '../utils/sheets'
import { TRANSACTIONS } from '../data/transactions'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFromSheets().then(data => {
      if (data.length > 0) {
        setTransactions(data)
      } else {
        setTransactions(TRANSACTIONS)
      }
      setLoading(false)
    })
  }, [])

  const addTransaction = async (newTx) => {
    const tx = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      ...newTx,
      status: 'Completed',
    }

    const saved = await saveToSheets(tx)
    if (!saved) return false

    setTransactions(prev => [tx, ...prev])
    return true
  }

  const updateTransaction = async (id, updatedData) => {
    const updated = transactions.map(tx =>
      String(tx.id) === String(id) ? { ...tx, ...updatedData } : tx
    )

    const synced = await syncToSheets(updated)
    if (!synced) return false

    setTransactions(updated)
    return true
  }

  const deleteTransaction = async (id) => {
    const filtered = transactions.filter(tx => String(tx.id) !== String(id))

    const deleted = await deleteFromSheets(id)
    if (!deleted) return false

    setTransactions(filtered)
    return true
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
