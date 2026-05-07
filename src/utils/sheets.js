// src/utils/sheets.js
const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbyk6_RE-Xzl3rk3PjW6FliY5_xTPulF1yvBc32GY7kD9bX6d7Myir9_0oMoRbKxzFGi2Q/exec'

export const loadFromSheets = async () => {
  try {
    const res = await fetch(SHEETS_URL)
    const data = await res.json()
    return data
  } catch (e) {
    console.warn('Gagal load dari Sheets:', e)
    return []
  }
}

export const saveToSheets = async (transaction) => {
  try {
    await fetch(SHEETS_URL, {
      method: 'POST',
      body: JSON.stringify(transaction)
    })
    return true
  } catch (e) {
    console.warn('Gagal simpan ke Sheets:', e)
    return false
  }
}