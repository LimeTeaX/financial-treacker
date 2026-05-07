import { supabase } from './supabase'

export const loadBills = async () => {
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .order('due_date', { ascending: true })
  
  if (error) return []
  return data
}

export const addBill = async (bill) => {
  const { error } = await supabase.from('bills').insert([bill])
  return !error
}

export const deleteBill = async (id) => {
  const { error } = await supabase.from('bills').delete().eq('id', id)
  return !error
}