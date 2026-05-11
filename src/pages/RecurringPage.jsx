import { useMemo, useState } from 'react'
import { Calendar, Pause, Play, Plus, RotateCcw, Trash2, X } from 'lucide-react'
import { useAppContext } from '../context/AppContext'

const emptyForm = {
  merchant: '',
  category: 'Internet',
  amount: '',
  type: 'expense',
  frequency: 'monthly',
  next_date: '',
}

export default function RecurringPage() {
  const {
    settings,
    recurringTransactions,
    addRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    processRecurringTransaction,
    loading,
  } = useAppContext()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const symbol = settings?.currency === 'USD' ? '$' : 'Rp'
  const locale = settings?.currency === 'USD' ? 'en-US' : 'id-ID'
  const activeRecurring = recurringTransactions.filter((item) => item.active)
  const pausedRecurring = recurringTransactions.filter((item) => !item.active)
  const history = useMemo(() => recurringTransactions.slice(0, 10), [recurringTransactions])

  const formatAmount = (amount) => {
    const prefix = amount >= 0 ? '+' : '-'
    return `${prefix}${symbol} ${Math.abs(amount || 0).toLocaleString(locale)}`
  }

  const handleAdd = async (event) => {
    event.preventDefault()
    const amount =
      form.type === 'expense'
        ? -Math.abs(Number(form.amount))
        : Math.abs(Number(form.amount))

    const saved = await addRecurringTransaction({
      merchant: form.merchant,
      category: form.category,
      amount,
      type: form.type,
      frequency: form.frequency,
      next_date: form.next_date || new Date().toISOString().split('T')[0],
      active: true,
    })

    if (saved) {
      setForm(emptyForm)
      setShowModal(false)
    }
  }

  const toggleActive = async (item) => {
    await updateRecurringTransaction(item.id, { active: !item.active })
  }

  return (
    <div className="h-[calc(100vh-2.5rem)] flex flex-col gap-5">
      <main className="flex-1 overflow-y-auto flex flex-col gap-5">
        <header className="flex items-center justify-between rounded-3xl bg-white px-7 py-5 border border-slate-100 shadow-sm shrink-0">
          <div>
            <p className="text-sm text-slate-400 font-medium">Automation</p>
            <h1 className="mt-0.5 text-2xl font-bold text-slate-900 tracking-tight">
              Recurring Transactions
            </h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8B5CF6] text-white text-sm font-medium hover:bg-violet-700 transition-colors"
          >
            <Plus size={16} /> Add Recurring
          </button>
        </header>

        {loading.recurringTransactions && (
          <p className="rounded-2xl bg-white border border-slate-100 px-4 py-3 text-sm text-slate-400">
            Syncing recurring transactions...
          </p>
        )}

        <section>
          <p className="text-sm font-medium text-slate-400 mb-3">Active Recurring</p>
          <div className="space-y-3">
            {activeRecurring.length === 0 ? (
              <p className="text-center py-8 text-slate-400 text-sm">
                No active recurring transactions
              </p>
            ) : (
              activeRecurring.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-5 rounded-3xl bg-white border border-slate-100 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-[#8B5CF6]">
                      <RotateCcw size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{item.merchant}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatAmount(item.amount)} - {item.frequency} - Next: {item.next_date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => processRecurringTransaction(item)}
                      className="flex items-center gap-1 rounded-lg bg-[#8B5CF6] px-3 py-1.5 text-[10px] font-medium text-white hover:bg-violet-700"
                    >
                      <Calendar size={10} /> Process Now
                    </button>
                    <button
                      onClick={() => toggleActive(item)}
                      className="flex items-center gap-1 rounded-lg bg-amber-100 px-3 py-1.5 text-[10px] font-medium text-amber-700 hover:bg-amber-200"
                    >
                      <Pause size={10} /> Pause
                    </button>
                    <button
                      onClick={() => deleteRecurringTransaction(item.id)}
                      className="flex items-center gap-1 rounded-lg bg-rose-100 px-3 py-1.5 text-[10px] font-medium text-rose-600 hover:bg-rose-200"
                    >
                      <Trash2 size={10} /> Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {pausedRecurring.length > 0 && (
          <section>
            <p className="text-sm font-medium text-slate-400 mb-3">Paused</p>
            <div className="space-y-3">
              {pausedRecurring.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-5 rounded-3xl bg-white border border-slate-100 shadow-sm opacity-70"
                >
                  <div className="flex items-center gap-4">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                      <Pause size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{item.merchant}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatAmount(item.amount)} - {item.frequency}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleActive(item)}
                    className="flex items-center gap-1 rounded-lg bg-emerald-100 px-3 py-1.5 text-[10px] font-medium text-emerald-700 hover:bg-emerald-200"
                  >
                    <Play size={10} /> Resume
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <p className="text-sm font-medium text-slate-400 mb-3">Recent Schedule</p>
          <div className="space-y-2">
            {history.length === 0 ? (
              <p className="text-center py-8 text-slate-400 text-sm">No schedule yet</p>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3 px-4 rounded-2xl bg-white border border-slate-50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      <RotateCcw size={14} />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{item.merchant}</p>
                      <p className="text-[10px] text-slate-400">
                        {item.frequency} - Next: {item.next_date}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      item.amount >= 0 ? 'text-emerald-500' : 'text-slate-700'
                    }`}
                  >
                    {formatAmount(item.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-100 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Add Recurring Transaction
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Merchant
                </label>
                <input
                  type="text"
                  value={form.merchant}
                  onChange={(event) => setForm({ ...form, merchant: event.target.value })}
                  required
                  placeholder="Merchant Name"
                  className="w-full mt-1 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(event) => setForm({ ...form, category: event.target.value })}
                    className="w-full mt-1 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
                  >
                    <option>Food</option>
                    <option>Internet</option>
                    <option>Gaming</option>
                    <option>Transport</option>
                    <option>Subscription</option>
                    <option>Shopping</option>
                    <option>Salary</option>
                    <option>Education</option>
                    <option>Entertainment</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(event) => setForm({ ...form, type: event.target.value })}
                    className="w-full mt-1 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
                  >
                    <option value="expense">Expense (-)</option>
                    <option value="income">Income (+)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(event) => setForm({ ...form, amount: event.target.value })}
                    required
                    placeholder="40000"
                    className="w-full mt-1 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Frequency
                  </label>
                  <select
                    value={form.frequency}
                    onChange={(event) => setForm({ ...form, frequency: event.target.value })}
                    className="w-full mt-1 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Next Date
                </label>
                <input
                  type="date"
                  value={form.next_date}
                  onChange={(event) => setForm({ ...form, next_date: event.target.value })}
                  required
                  className="w-full mt-1 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#8B5CF6] py-2.5 text-sm font-medium text-white hover:bg-violet-700"
                >
                  Save Recurring
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
