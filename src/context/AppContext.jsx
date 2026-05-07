import { createContext, useContext, useState, useEffect } from 'react'
import { loadFromSheets, saveToSheets } from '../utils/sheets'
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
        setTransactions(TRANSACTIONS) // fallback ke data dummy
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
    await saveToSheets(tx)
    setTransactions(prev => [tx, ...prev])
  }

  if (loading) {
    return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <p className="text-slate-400">Loading data...</p>
    </div>
  }

  return (
    <AppContext.Provider value={{ transactions, addTransaction }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  return useContext(AppContext)
}