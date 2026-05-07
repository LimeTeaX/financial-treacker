// src/context/AppContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { loadTransactions, saveTransactions, addTransaction as addTx, resetTransactions } from '../utils/storage'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [transactions, setTransactions] = useState([])
  const [refreshKey, setRefreshKey] = useState(0)

  // Load data saat pertama kali
  useEffect(() => {
    const data = loadTransactions()
    setTransactions(data)
  }, [refreshKey])

  const addTransaction = (newTx) => {
    const updated = addTx(newTx)
    setTransactions(updated)
    setRefreshKey((prev) => prev + 1)
  }

  const resetData = () => {
    const data = resetTransactions()
    setTransactions(data)
    setRefreshKey(k => k + 1)
  }

  return (
    <AppContext.Provider value={{ transactions, addTransaction, resetData }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppContext must be used within AppProvider')
  return context
}