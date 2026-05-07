// src/utils/storage.js
import { TRANSACTIONS } from '../data/transactions'

const STORAGE_KEY = 'majumoney_transactions'

// Load data dari localStorage atau pakai data awal
export const loadTransactions = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch (e) {
    console.error('Failed to load from localStorage:', e)
  }
  // Kalau belum ada, pakai data awal
  saveTransactions(TRANSACTIONS)
  return TRANSACTIONS
}

// Simpan data ke localStorage
export const saveTransactions = (transactions) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
  } catch (e) {
    console.error('Failed to save to localStorage:', e)
  }
}

// Tambah transaksi baru
export const addTransaction = (newTx) => {
  const transactions = loadTransactions()
  const tx = {
    id: Date.now(),
    ...newTx,
    date: new Date().toISOString().split('T')[0],
    status: 'Completed',
  }
  transactions.unshift(tx)
  saveTransactions(transactions)
  return transactions
}

// Hapus semua data (reset)
export const resetTransactions = () => {
  saveTransactions(TRANSACTIONS)
  return TRANSACTIONS
}