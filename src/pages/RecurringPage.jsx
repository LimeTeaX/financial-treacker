import { useState, useEffect } from 'react'
import { Plus, X, Edit2, Pause, Play, Trash2, RotateCcw, Calendar } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function RecurringPage() {
  const [recurringTxns, setRecurringTxns] = useState([])
  const [history, setHistory] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingTxn, setEditingTxn] = useState(null)
  const [form, setForm] = useState({
    merchant: '',
    category: 'Internet',
    amount: '',
    type: 'expense',
    frequency: 'monthly',
    next_date: ''
  })

  // Fetch recurring transactions
  const fetchRecurring = async () => {
    const { data } = await supabase
      .from('recurring_transactions')
      .select('*')
      .order('next_date')
    if (data) setRecurringTxns(data)
  }

  // Fetch history (transactions that were auto-added)
  const fetchHistory = async () => {
    const { data } = await supabase
      .from('recurring_transactions')
      .select('*')
      .order('next_date')
      .limit(10)
    if (data) setHistory(data)
  }

  useEffect(() => {
    fetchRecurring()
    fetchHistory()
  }, [])

  // Add recurring
  const handleAdd = async (e) => {
    e.preventDefault()
    const amount = form.type === 'expense' ? -Math.abs(Number(form.amount)) : Math.abs(Number(form.amount))
    const newRecurring = {
      id: Date.now(),
      merchant: form.merchant,
      category: form.category,
      amount: amount,
      type: form.type,
      frequency: form.frequency,
      next_date: form.next_date || new Date().toISOString().split('T')[0],
      active: true
    }

    const { error } = await supabase.from('recurring_transactions').insert([newRecurring])
    if (!error) {
      setRecurringTxns(prev => [...prev, newRecurring])
      setShowModal(false)
      setForm({ merchant: '', category: 'Internet', amount: '', type: 'expense', frequency: 'monthly', next_date: '' })
    }
  }

  // Toggle active/pause
  const toggleActive = async (id, currentActive) => {
    const { error } = await supabase.from('recurring_transactions').update({ active: !currentActive }).eq('id', id)
    if (!error) {
      setRecurringTxns(prev => prev.map(t => t.id === id ? { ...t, active: !currentActive } : t))
    }
  }

  // Delete recurring
  const handleDelete = async (id) => {
    const { error } = await supabase.from('recurring_transactions').delete().eq('id', id)
    if (!error) {
      setRecurringTxns(prev => prev.filter(t => t.id !== id))
    }
  }

  // Process now (manual trigger)
  const handleProcessNow = async (rtx) => {
    const tx = {
      id: Date.now(),
      merchant: rtx.merchant,
      category: rtx.category,
      amount: rtx.amount,
      type: rtx.type,
      status: 'Completed',
      date: new Date().toISOString().split('T')[0]
    }

    await supabase.from('transactions').insert([tx])
    
    // Update next_date
    const nextDate = new Date(rtx.next_date)
    if (rtx.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7)
    else if (rtx.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1)
    else if (rtx.frequency === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1)
    
    await supabase.from('recurring_transactions').update({ next_date: nextDate.toISOString().split('T')[0] }).eq('id', rtx.id)
    fetchRecurring()
    alert('✅ Transaction processed!')
  }

  const formatRupiah = (amount) => {
    const prefix = amount >= 0 ? '+' : '-'
    return `${prefix}Rp ${Math.abs(amount).toLocaleString()}`
  }

  return (
    <div className="h-[calc(100vh-2.5rem)] flex flex-col gap-5">
      <main className="flex-1 overflow-y-auto flex flex-col gap-5">
        {/* Header */}
        <header className="flex items-center justify-between rounded-3xl bg-white px-7 py-5 border border-slate-100 shadow-sm shrink-0">
          <div>
            <p className="text-sm text-slate-400 font-medium">Automation</p>
            <h1 className="mt-0.5 text-2xl font-bold text-slate-900 tracking-tight">Recurring Transactions</h1>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8B5CF6] text-white text-sm font-medium hover:bg-violet-700 transition-colors">
            <Plus size={16} /> Add Recurring
          </button>
        </header>

        {/* Active Recurring */}
        <section>
          <p className="text-sm font-medium text-slate-400 mb-3">Active Recurring</p>
          <div className="space-y-3">
            {recurringTxns.filter(r => r.active).length === 0 ? (
              <p className="text-center py-8 text-slate-400 text-sm">No active recurring transactions</p>
            ) : (
              recurringTxns.filter(r => r.active).map(rtx => (
                <div key={rtx.id} className="flex items-center justify-between p-5 rounded-3xl bg-white border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-4">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-[#8B5CF6]">
                      <RotateCcw size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{rtx.merchant}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatRupiah(rtx.amount)} • {rtx.frequency} • Next: {rtx.next_date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleProcessNow(rtx)}
                      className="flex items-center gap-1 rounded-lg bg-[#8B5CF6] px-3 py-1.5 text-[10px] font-medium text-white hover:bg-violet-700">
                      <Calendar size={10} /> Process Now
                    </button>
                    <button onClick={() => toggleActive(rtx.id, rtx.active)}
                      className="flex items-center gap-1 rounded-lg bg-amber-100 px-3 py-1.5 text-[10px] font-medium text-amber-700 hover:bg-amber-200">
                      <Pause size={10} /> Pause
                    </button>
                    <button onClick={() => handleDelete(rtx.id)}
                      className="flex items-center gap-1 rounded-lg bg-rose-100 px-3 py-1.5 text-[10px] font-medium text-rose-600 hover:bg-rose-200">
                      <Trash2 size={10} /> Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Paused Recurring */}
        {recurringTxns.filter(r => !r.active).length > 0 && (
          <section>
            <p className="text-sm font-medium text-slate-400 mb-3">Paused</p>
            <div className="space-y-3">
              {recurringTxns.filter(r => !r.active).map(rtx => (
                <div key={rtx.id} className="flex items-center justify-between p-5 rounded-3xl bg-white border border-slate-100 shadow-sm opacity-60">
                  <div className="flex items-center gap-4">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                      <Pause size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{rtx.merchant}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatRupiah(rtx.amount)} • {rtx.frequency}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => toggleActive(rtx.id, rtx.active)}
                    className="flex items-center gap-1 rounded-lg bg-emerald-100 px-3 py-1.5 text-[10px] font-medium text-emerald-700 hover:bg-emerald-200">
                    <Play size={10} /> Resume
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* History */}
        <section>
          <p className="text-sm font-medium text-slate-400 mb-3">Recent History</p>
          <div className="space-y-2">
            {history.length === 0 ? (
              <p className="text-center py-8 text-slate-400 text-sm">No history yet</p>
            ) : (
              history.map(rtx => (
                <div key={rtx.id} className="flex items-center justify-between py-3 px-4 rounded-2xl bg-white border border-slate-50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      <RotateCcw size={14} />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{rtx.merchant}</p>
                      <p className="text-[10px] text-slate-400">{rtx.frequency} • Next: {rtx.next_date}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${rtx.amount >= 0 ? 'text-emerald-500' : 'text-slate-700'}`}>
                    {formatRupiah(rtx.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Add Recurring Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-100 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Add Recurring Transaction</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Merchant</label>
                <input type="text" value={form.merchant} onChange={(e) => setForm({...form, merchant: e.target.value})} required
                  placeholder="Merchant Name" className="w-full mt-1 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</label>
                  <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}
                    className="w-full mt-1 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20">
                    <option>Food</option><option>Internet</option><option>Gaming</option><option>Transport</option><option>Subscription</option><option>Shopping</option><option>Salary</option><option>Education</option><option>Entertainment</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</label>
                  <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})}
                    className="w-full mt-1 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20">
                    <option value="expense">Expense (-)</option>
                    <option value="income">Income (+)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount (Rp)</label>
                  <input type="number" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} required
                    placeholder="40000" className="w-full mt-1 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Frequency</label>
                  <select value={form.frequency} onChange={(e) => setForm({...form, frequency: e.target.value})}
                    className="w-full mt-1 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20">
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Next Date</label>
                <input type="date" value={form.next_date} onChange={(e) => setForm({...form, next_date: e.target.value})} required
                  className="w-full mt-1 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit"
                  className="flex-1 rounded-xl bg-[#8B5CF6] py-2.5 text-sm font-medium text-white hover:bg-violet-700">Save Recurring</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}