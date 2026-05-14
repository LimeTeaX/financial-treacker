// src/Dashboard.jsx
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "./context/AppContext";
import { useToast } from "./context/ToastContext";
import { MoreHorizontal, Plus, X, TrendingUp, TrendingDown, Wallet, Eye, EyeOff } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Helper: get last 7 days sparkline data dari transaksi real
const getSparklineData = (transactions) => {
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayTxns = transactions.filter(t => t.date?.startsWith(dateStr));
    const income = dayTxns.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = dayTxns.filter(t => t.type === "expense").reduce((s, t) => s + Math.abs(t.amount), 0);
    result.push({ value: income - expense });
  }
  return result;
};

// Helper: get monthly chart data dari transaksi real
const getMonthlyChartData = (transactions) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  const currentYear = now.getFullYear();
  const result = months.map(month => ({ month, income: 0, expense: 0 }));
  transactions.forEach(tx => {
    if (!tx.date) return;
    const date = new Date(tx.date);
    if (date.getFullYear() !== currentYear) return;
    const monthIndex = date.getMonth();
    if (tx.type === "income") result[monthIndex].income += Math.abs(tx.amount);
    else result[monthIndex].expense += Math.abs(tx.amount);
  });
  return result;
};

function StatCard({ label, value, change, positive, sub, icon, iconColor }) {
  return (
    <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5 hover:border-emerald-500/30 transition-all">
      <div className="flex items-start justify-between mb-3"><div className={`p-2 rounded-lg ${iconColor}`}>{icon}</div></div>
      <p className="text-sm text-slate-400">{label}</p><p className="text-2xl font-bold text-white mt-1">{value}</p>
      <p className="text-xs mt-2"><span className={positive ? "text-emerald-400" : "text-red-400"}>{change}</span><span className="text-slate-500 ml-1">{sub}</span></p>
    </div>
  );
}

function HeroStatsCard({ transactions, settings }) {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const totalBalance = transactions.reduce((acc, tx) => acc + (tx.type === "income" ? tx.amount : -Math.abs(tx.amount)), 0);
  const symbol = settings?.currency === "USD" ? "$" : "Rp";
  const formattedBalance = Math.abs(totalBalance).toLocaleString(settings?.currency === "USD" ? "en-US" : "id-ID");
  const monthlyIncome = transactions.filter(t => t.type === "income" && new Date(t.date).getMonth() === new Date().getMonth()).reduce((s, t) => s + t.amount, 0);
  const monthlyExpense = transactions.filter(t => t.type === "expense" && new Date(t.date).getMonth() === new Date().getMonth()).reduce((s, t) => s + Math.abs(t.amount), 0);
  const monthlyChange = monthlyIncome - monthlyExpense;
  const sparklineData = getSparklineData(transactions);

  return (
    <div className="relative bg-gradient-to-br from-slate-900 to-slate-900/80 border border-slate-800 rounded-2xl p-6 overflow-hidden group hover:border-emerald-500/30 transition-all">
      <div className="absolute inset-0 opacity-10 pointer-events-none"><ResponsiveContainer width="100%" height="100%"><LineChart data={sparklineData}><Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={false} /></LineChart></ResponsiveContainer></div>
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 blur-[100px] rounded-full" />
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
          <div><div className="flex items-center gap-3 mb-2"><h2 className="text-sm font-medium text-slate-400">Total Balance</h2><button onClick={() => setIsBalanceVisible(!isBalanceVisible)} className="p-1 hover:bg-slate-800 rounded-lg">{isBalanceVisible ? <Eye size={14} className="text-slate-500" /> : <EyeOff size={14} className="text-slate-500" />}</button></div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">{isBalanceVisible ? `${symbol} ${formattedBalance}` : `${symbol} •••••••`}</h1>
            <div className="flex items-center gap-2 mt-3"><span className={`text-sm font-semibold ${monthlyChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>{monthlyChange >= 0 ? "+" : ""}{symbol} {Math.abs(monthlyChange).toLocaleString()}</span><span className="text-xs text-slate-500">this month</span></div></div>
        </div>
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800">
          <div className="bg-slate-800/30 rounded-xl p-3"><p className="text-xs text-slate-500 mb-1">Monthly Income</p><p className="text-lg font-bold text-white">{symbol} {(monthlyIncome / 1000).toFixed(0)}k</p></div>
          <div className="bg-slate-800/30 rounded-xl p-3"><p className="text-xs text-slate-500 mb-1">Monthly Expense</p><p className="text-lg font-bold text-white">{symbol} {(monthlyExpense / 1000).toFixed(0)}k</p></div>
          <div className="bg-slate-800/30 rounded-xl p-3"><p className="text-xs text-slate-500 mb-1">Transactions</p><p className="text-lg font-bold text-white">{transactions.length}</p></div>
        </div>
      </div>
    </div>
  );
}

function MoneyPulseChart({ transactions }) {
  const chartData = getMonthlyChartData(transactions);
  return (
    <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5 hover:border-emerald-500/30 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"><div><h3 className="text-lg font-semibold text-white">Money Pulse</h3><p className="text-sm text-slate-400">Monthly cash flow</p></div>
        <div className="flex items-center gap-4"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-xs text-slate-400">Income</span></div><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500" /><span className="text-xs text-slate-400">Expense</span></div></div></div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs><linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} /><stop offset="95%" stopColor="#f43f5e" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
            <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "12px" }} labelStyle={{ color: "#f1f5f9", fontWeight: 600 }} formatter={(v) => [`Rp ${(v / 1000000).toFixed(1)}M`, ""]} />
            <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
            <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function RecentTransactions({ transactions, settings }) {
  const symbol = settings?.currency === "USD" ? "$" : "Rp";
  const recent = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  if (recent.length === 0) return <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-8 text-center"><p className="text-slate-500">No transactions yet</p></div>;
  return (
    <div className="rounded-xl bg-slate-900/50 border border-slate-800 overflow-hidden hover:border-emerald-500/30 transition-all">
      <div className="p-5 border-b border-slate-800"><h3 className="text-lg font-semibold text-white">Recent Transactions</h3><p className="text-sm text-slate-400">Last 5 transactions</p></div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800/30"><tr><th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase">Merchant</th><th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase">Date</th><th className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase">Amount</th></tr></thead>
          <tbody className="divide-y divide-slate-800">
            {recent.map(tx => (<tr key={tx.id} className="hover:bg-slate-800/30 transition-colors"><td className="px-5 py-3"><div><p className="text-sm font-medium text-white">{tx.merchant}</p><p className="text-xs text-slate-500 capitalize">{tx.category}</p></div></td>
              <td className="px-5 py-3 text-sm text-slate-400">{new Date(tx.date).toLocaleDateString("id-ID")}</td>
              <td className={`px-5 py-3 text-right text-sm font-semibold ${tx.type === "income" ? "text-emerald-400" : "text-white"}`}>{tx.type === "income" ? "+" : "-"}{symbol} {Math.abs(tx.amount).toLocaleString()}</td></tr>))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function QuickActions({ setIsModalOpen, onNavigate }) {
  return (
    <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5 hover:border-emerald-500/30 transition-all">
      <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
      <div className="space-y-3">
        <button onClick={() => setIsModalOpen(true)} className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white hover:bg-emerald-600 transition-all">
          <Plus size={16} /> Add Transaction
        </button>
        <button onClick={() => onNavigate?.("Analytics")} className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-700 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-all">
          <TrendingUp size={16} /> View Analytics
        </button>
        <button onClick={() => onNavigate?.("Payment")} className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-700 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-all">
          <Wallet size={16} /> Manage Bills
        </button>
      </div>
    </div>
  );
}

export default function Dashboard({ onNavigate }) {
  const { transactions, settings, addTransaction } = useAppContext();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ merchant: "", category: "Food", amount: "", type: "expense" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = form.type === "expense" ? -Math.abs(Number(form.amount)) : Math.abs(Number(form.amount));
    const success = await addTransaction({ merchant: form.merchant, category: form.category, amount, type: form.type });
    if (success) { setIsModalOpen(false); setForm({ merchant: "", category: "Food", amount: "", type: "expense" }); showToast("Transaction added successfully!", "success"); }
  };

const stats = useMemo(() => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const symbol = settings?.currency === "USD" ? "$" : "Rp";

  // Income bulan ini
  const monthlyIncome = transactions
    .filter(t => t.type === "income" && new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear)
    .reduce((s, t) => s + t.amount, 0);

  const monthlyExpense = transactions
    .filter(t => t.type === "expense" && new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear)
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  const balance = monthlyIncome - monthlyExpense;

  // ========== HITUNG DAILY INTEREST ==========
  const totalBalance = transactions.reduce((acc, tx) => {
    return acc + (tx.type === "income" ? tx.amount : -Math.abs(tx.amount));
  }, 0);
  const dailyInterest = (Math.max(0, totalBalance) * 0.025) / 365;

  return [
    {
      label: "Balance",
      value: `${symbol} ${balance.toLocaleString()}`,
      change: `${((balance / monthlyIncome) * 100).toFixed(1)}%`,
      positive: balance >= 0,
      sub: "savings rate",
      icon: <Wallet size={18} />,
      iconColor: "bg-emerald-500/10 text-emerald-400"
    },
    {
      label: "Daily Interest",  // ← GANTI DARI "Income"
      value: `${symbol} ${dailyInterest.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/day`,
      change: "2.5% p.a",
      positive: true,
      sub: "cair setiap hari",
      icon: <TrendingUp size={18} />,
      iconColor: "bg-blue-500/10 text-blue-400"
    },
    {
      label: "Expenses",
      value: `${symbol} ${monthlyExpense.toLocaleString()}`,
      change: `${((monthlyExpense / monthlyIncome) * 100).toFixed(1)}%`,
      positive: false,
      sub: "of income",
      icon: <TrendingDown size={18} />,
      iconColor: "bg-red-500/10 text-red-400"
    },
  ];
}, [transactions, settings]);

  if (transactions.length === 0) {
    return <div className="max-w-4xl mx-auto flex justify-center py-20"><div className="text-center"><p className="text-slate-400 mb-2">No transactions yet</p><button onClick={() => setIsModalOpen(true)} className="text-emerald-400 hover:text-emerald-300 text-sm">Add your first transaction</button></div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">{stats.map((stat, i) => <StatCard key={i} {...stat} />)}</div>
      <HeroStatsCard transactions={transactions} settings={settings} />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6"><MoneyPulseChart transactions={transactions} /><RecentTransactions transactions={transactions} settings={settings} /></div>
        <div className="xl:col-span-1"><QuickActions setIsModalOpen={setIsModalOpen} onNavigate={onNavigate} /></div>
      </div>

      {/* Add Transaction Modal */}
      <AnimatePresence>{isModalOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"><div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold text-white">Add Transaction</h2><button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" value={form.merchant} onChange={(e) => setForm({ ...form, merchant: e.target.value })} placeholder="Merchant" className="w-full rounded-xl bg-slate-800/50 border border-slate-700 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-emerald-500" required />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-xl bg-slate-800/50 border border-slate-700 px-4 py-2.5 text-white focus:border-emerald-500"><option>Food</option><option>Transport</option><option>Gaming</option><option>Internet</option><option>Subscription</option><option>Shopping</option><option>Salary</option><option>Education</option><option>Entertainment</option></select>
          <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="Amount" className="w-full rounded-xl bg-slate-800/50 border border-slate-700 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-emerald-500" required />
          <div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setForm({ ...form, type: "expense" })} className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${form.type === "expense" ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-400"}`}>Expense</button><button type="button" onClick={() => setForm({ ...form, type: "income" })} className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${form.type === "income" ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-400"}`}>Income</button></div>
          <div className="flex gap-3 pt-2"><button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-xl border border-slate-700 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800">Cancel</button><button type="submit" className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-sm font-medium text-white hover:bg-emerald-600">Save</button></div>
        </form>
      </div></div>)}</AnimatePresence>
    </div>
  );
}