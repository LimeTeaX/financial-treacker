// src/pages/RecurringPage.jsx
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Pause, Play, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const emptyForm = { merchant: "", category: "Internet", amount: "", type: "expense", frequency: "monthly", next_date: "" };

export default function RecurringPage() {
  const { settings, recurringTransactions, addRecurringTransaction, updateRecurringTransaction, deleteRecurringTransaction, processRecurringTransaction, loading } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const symbol = settings?.currency === "USD" ? "$" : "Rp";
  const locale = settings?.currency === "USD" ? "en-US" : "id-ID";
  const activeRecurring = recurringTransactions.filter((item) => item.active);
  const pausedRecurring = recurringTransactions.filter((item) => !item.active);
  const history = useMemo(() => recurringTransactions.slice(0, 10), [recurringTransactions]);

  const formatAmount = (amount) => {
    const prefix = amount >= 0 ? "+" : "-";
    return `${prefix}${symbol} ${Math.abs(amount || 0).toLocaleString(locale)}`;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const amount = form.type === "expense" ? -Math.abs(Number(form.amount)) : Math.abs(Number(form.amount));
    const saved = await addRecurringTransaction({ merchant: form.merchant, category: form.category, amount, type: form.type, frequency: form.frequency, next_date: form.next_date || new Date().toISOString().split("T")[0], active: true });
    if (saved) { setForm(emptyForm); setShowModal(false); }
  };

  const toggleActive = async (item) => { await updateRecurringTransaction(item.id, { active: !item.active }); };

  if (loading.recurringTransactions) return <div className="max-w-4xl mx-auto flex justify-center py-20"><div className="animate-pulse text-slate-400">Loading recurring transactions...</div></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-white tracking-tight">Recurring Transactions</h1><p className="text-slate-400 mt-1">Manage your automated recurring bills and income</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-600 transition-all"><Plus size={16} /> Add Recurring</button>
      </div>

      {/* Active Recurring */}
      <div><p className="text-sm font-medium text-slate-400 mb-3">Active Recurring</p>
        <div className="space-y-3">
          {activeRecurring.length === 0 ? <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-8 text-center"><RotateCcw size={32} className="mx-auto text-slate-600 mb-2" /><p className="text-slate-500">No active recurring transactions</p></div> : activeRecurring.map((item, idx) => (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/30 transition-all gap-4">
              <div className="flex items-center gap-4"><div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400"><RotateCcw size={18} /></div><div><p className="text-sm font-semibold text-white">{item.merchant}</p><p className="text-xs text-slate-400 mt-0.5">{formatAmount(item.amount)} • {item.frequency} • Next: {item.next_date}</p></div></div>
              <div className="flex items-center gap-2">
                <button onClick={() => processRecurringTransaction(item)} className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20"><Calendar size={10} /> Process Now</button>
                <button onClick={() => toggleActive(item)} className="flex items-center gap-1 rounded-lg bg-yellow-500/10 px-3 py-1.5 text-xs font-medium text-yellow-500 hover:bg-yellow-500/20"><Pause size={10} /> Pause</button>
                <button onClick={() => deleteRecurringTransaction(item.id)} className="flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20"><Trash2 size={10} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Paused Recurring */}
      {pausedRecurring.length > 0 && (<div><p className="text-sm font-medium text-slate-400 mb-3">Paused</p>
        <div className="space-y-3">
          {pausedRecurring.map((item, idx) => (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-800 opacity-70 gap-4">
              <div className="flex items-center gap-4"><div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-500"><Pause size={18} /></div><div><p className="text-sm font-semibold text-white">{item.merchant}</p><p className="text-xs text-slate-400 mt-0.5">{formatAmount(item.amount)} • {item.frequency}</p></div></div>
              <button onClick={() => toggleActive(item)} className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20"><Play size={10} /> Resume</button>
            </div>
          ))}
        </div>
      </div>)}

      {/* History */}
      <div><p className="text-sm font-medium text-slate-400 mb-3">Recent Schedule</p>
        <div className="space-y-2">
          {history.length === 0 ? <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-8 text-center"><RotateCcw size={32} className="mx-auto text-slate-600 mb-2" /><p className="text-slate-500">No schedule yet</p></div> : history.map((item, idx) => (
            <div key={item.id} className="flex items-center justify-between py-3 px-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:bg-slate-800/30 transition-colors">
              <div className="flex items-center gap-3"><div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-500"><RotateCcw size={14} /></div><div><p className="text-sm font-medium text-white">{item.merchant}</p><p className="text-[10px] text-slate-400">{item.frequency} - Next: {item.next_date}</p></div></div>
              <span className={`text-sm font-semibold ${item.amount >= 0 ? "text-emerald-400" : "text-white"}`}>{formatAmount(item.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Add Recurring Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold text-white">Add Recurring Transaction</h2><button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button></div>
              <form onSubmit={handleAdd} className="space-y-4">
                <div><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Merchant</label><input type="text" value={form.merchant} onChange={(e) => setForm({ ...form, merchant: e.target.value })} required placeholder="Merchant Name" className="w-full mt-1 rounded-xl bg-slate-800/50 border border-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full mt-1 rounded-xl bg-slate-800/50 border border-slate-700 px-3 py-2 text-sm text-white focus:border-emerald-500"><option>Food</option><option>Internet</option><option>Gaming</option><option>Transport</option><option>Subscription</option><option>Shopping</option><option>Salary</option><option>Education</option><option>Entertainment</option></select></div>
                  <div><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full mt-1 rounded-xl bg-slate-800/50 border border-slate-700 px-3 py-2 text-sm text-white focus:border-emerald-500"><option value="expense">Expense (-)</option><option value="income">Income (+)</option></select></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</label><input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required placeholder="40000" className="w-full mt-1 rounded-xl bg-slate-800/50 border border-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500" /></div>
                  <div><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Frequency</label><select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="w-full mt-1 rounded-xl bg-slate-800/50 border border-slate-700 px-3 py-2 text-sm text-white focus:border-emerald-500"><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select></div>
                </div>
                <div><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Next Date</label><input type="date" value={form.next_date} onChange={(e) => setForm({ ...form, next_date: e.target.value })} required className="w-full mt-1 rounded-xl bg-slate-800/50 border border-slate-700 px-3 py-2 text-sm text-white focus:border-emerald-500" /></div>
                <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-xl border border-slate-700 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800">Cancel</button><button type="submit" className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-sm font-medium text-white hover:bg-emerald-600">Save Recurring</button></div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}