const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbzFDdGaaCUqcKn6Q6nCuYvIRkM9zRdcX5C8rYlWjCC9RGeq-RjixcgpbaUi-DLwSROrSw/exec'

const postToSheets = async (payload) => {
  const res = await fetch(SHEETS_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error(`Sheets request failed with ${res.status}`)
  }

  return res
}

export const loadFromSheets = async () => {
  try {
    const res = await fetch(SHEETS_URL)
    if (!res.ok) throw new Error(`Sheets request failed with ${res.status}`)

    const data = await res.json()
    return data
  } catch (e) {
    console.warn('Gagal load dari Sheets:', e)
    return []
  }
}

export const saveToSheets = async (transaction) => {
  try {
    await postToSheets(transaction)
    return true
  } catch (e) {
    console.warn('Gagal simpan ke Sheets:', e)
    return false
  }
}

export const syncToSheets = async (transactions) => {
  try {
    await postToSheets({ action: 'sync', transactions })
    return true
  } catch (e) {
    console.warn('Gagal sync ke Sheets:', e)
    return false
  }
}

export const deleteFromSheets = async (id) => {
  try {
    await postToSheets({ action: 'delete', id: String(id) })
    return true
  } catch (e) {
    console.warn('Gagal hapus dari Sheets:', e)
    return false
  }
}
