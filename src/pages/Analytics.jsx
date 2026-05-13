// src/pages/Analytics.jsx
import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, PiggyBank, AlertTriangle } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

// Helper: get week of month
const getWeekOfMonth = (date) => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  return Math.ceil((date.getDate() + firstDay.getDay()) / 7);
};

// Helper: filter config
const getFilterConfig = (filter) => {
  const now = new Date();
  let startDate = new Date();
  let groupBy;
  switch (filter) {
    case "Week": startDate.setDate(now.getDate() - 7); groupBy = "day"; break;
    case "Month": startDate.setMonth(now.getMonth() - 1); groupBy = "week"; break;
    case "6 Months": startDate.setMonth(now.getMonth() - 6); groupBy = "month"; break;
    case "Year": startDate.setFullYear(now.getFullYear() - 1); groupBy = "month"; break;
    default: startDate.setMonth(now.getMonth() - 6); groupBy = "month";
  }
  return { startDate, endDate: now, groupBy };
};

// Helper: format label
const formatLabel = (date, groupBy) => {
  if (groupBy === "day") return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  if (groupBy === "week") return `Week ${getWeekOfMonth(date)} (${date.toLocaleDateString("en-US", { month: "short" })})`;
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

// Get chart data from transactions
const getChartData = (transactions, filter) => {
  const { startDate, endDate, groupBy } = getFilterConfig(filter);
  const dataMap = new Map();
  const filtered = transactions.filter(tx => tx.date && new Date(tx.date) >= startDate && new Date(tx.date) <= endDate);

  filtered.forEach(tx => {
    const date = new Date(tx.date);
    let key;
    if (groupBy === "day") key = date.toISOString().split("T")[0];
    else if (groupBy === "week") key = `${date.getFullYear()}-${date.getMonth()}-week${getWeekOfMonth(date)}`;
    else key = `${date.getFullYear()}-${date.getMonth()}`;

    if (!dataMap.has(key)) dataMap.set(key, { label: formatLabel(date, groupBy), date, income: 0, expense: 0 });
    const entry = dataMap.get(key);
    if (tx.type === "income") entry.income += Math.abs(tx.amount);
    else entry.expense += Math.abs(tx.amount);
  });

  return Array.from(dataMap.values()).sort((a, b) => a.date - b.date);
};

// Get category breakdown
const getCategoryBreakdown = (transactions, filter) => {
  const { startDate, endDate } = getFilterConfig(filter);
  const filtered = transactions.filter(tx => tx.date && tx.type === "expense" && new Date(tx.date) >= startDate && new Date(tx.date) <= endDate);
  const total = filtered.reduce((s, t) => s + Math.abs(t.amount || 0), 0);
  const categories = [...new Set(filtered.map(t => t.category))];
  return categories.map(cat => {
    const amount = filtered.filter(t => t.category === cat).reduce((s, t) => s + Math.abs(t.amount || 0), 0);
    return { name: cat, value: amount, percentage: total > 0 ? ((amount / total) * 100).toFixed(1) : 0 };
  }).filter(item => item.value > 0).sort((a, b) => b.value - a.value);
};

export default function Analytics() {
  const { transactions, settings } = useAppContext();
  const [timeFilter, setTimeFilter] = useState("6 Months");
  const symbol = settings?.currency === "USD" ? "$" : "Rp";
  const locale = settings?.currency === "USD" ? "en-US" : "id-ID";

  const chartData = useMemo(() => getChartData(transactions, timeFilter), [transactions, timeFilter]);
  const categoryData = useMemo(() => getCategoryBreakdown(transactions, timeFilter), [transactions, timeFilter]);

  const { startDate, endDate } = getFilterConfig(timeFilter);
  const filteredTxns = transactions.filter(tx => tx.date && new Date(tx.date) >= startDate && new Date(tx.date) <= endDate);
  const totalIncome = filteredTxns.filter(t => t.type === "income").reduce((s, t) => s + Math.abs(t.amount || 0), 0);
  const totalExpenses = filteredTxns.filter(t => t.type === "expense").reduce((s, t) => s + Math.abs(t.amount || 0), 0);
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  if (transactions.length === 0) {
    return <div className="max-w-4xl mx-auto flex justify-center py-20"><div className="text-center"><p className="text-slate-400 mb-2">No transaction data available</p><p className="text-sm text-slate-500">Add some transactions to see analytics</p></div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-white tracking-tight">Analytics</h1><p className="text-slate-400 mt-1">Insights into your financial health</p></div>
        <div className="flex items-center gap-2 rounded-xl bg-slate-800/30 p-1 border border-slate-700">
          {["Week", "Month", "6 Months", "Year"].map(opt => (
            <button key={opt} onClick={() => setTimeFilter(opt)} className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${timeFilter === opt ? "bg-emerald-500 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}>{opt}</button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5"><p className="text-sm text-slate-400 mb-2">Total Balance</p><p className="text-2xl font-bold text-white">{symbol} {(totalIncome - totalExpenses).toLocaleString(locale)}</p><div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs mt-2 ${savingsRate >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>{savingsRate >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}{Math.abs(savingsRate).toFixed(1)}% savings rate</div></div>
        <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5"><p className="text-sm text-slate-400 mb-2">Total Spending</p><p className="text-2xl font-bold text-white">{symbol} {totalExpenses.toLocaleString(locale)}</p><p className="text-xs text-slate-500 mt-2">{filteredTxns.length} transactions</p></div>
        <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5"><p className="text-sm text-slate-400 mb-2">Avg per Transaction</p><p className="text-2xl font-bold text-white">{symbol} {(totalExpenses / Math.max(1, filteredTxns.length)).toLocaleString(locale)}</p><p className="text-xs text-slate-500 mt-2">in selected period</p></div>
      </div>

      {/* Income vs Expense Chart */}
      <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5 hover:border-emerald-500/30 transition-all">
        <h3 className="text-lg font-semibold text-white mb-4">{timeFilter === "Week" ? "Daily" : timeFilter === "Month" ? "Weekly" : "Monthly"} Income vs Expenses</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs><linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} angle={-45} textAnchor="end" height={60} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} tickFormatter={(v) => `${symbol}${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "12px" }} labelStyle={{ color: "#f1f5f9", fontWeight: 600 }} formatter={(v) => [`${symbol} ${v.toLocaleString(locale)}`, ""]} />
              <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
              <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-xs text-slate-400">Income</span></div><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /><span className="text-xs text-slate-400">Expenses</span></div></div>
      </div>

      {/* Two Column Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Pie Chart */}
        <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5 hover:border-emerald-500/30 transition-all">
          <h3 className="text-lg font-semibold text-white mb-4">Spending by Category</h3>
          {categoryData.length === 0 ? <div className="flex items-center justify-center h-80 text-slate-500">No expense data</div> : (
            <div className="flex flex-col md:flex-row items-center gap-6">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    // label dihilangkan
                    labelLine={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "12px" }}
                    formatter={(v) => [`${symbol} ${v.toLocaleString(locale)}`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 w-full">{categoryData.slice(0, 5).map((cat, i) => (<div key={cat.name} className="flex items-center justify-between text-sm"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} /><span className="text-slate-300">{cat.name}</span></div><span className="text-white font-semibold">{cat.percentage}%</span></div>))}</div>
            </div>
          )}
        </div>

        {/* Period Summary */}
        <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5 hover:border-emerald-500/30 transition-all">
          <h3 className="text-lg font-semibold text-white mb-4">Period Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800"><span className="text-slate-400">Period</span><span className="text-white font-semibold">{timeFilter}</span></div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-800"><span className="text-slate-400">Total Income</span><span className="text-emerald-400 font-semibold">+{symbol} {totalIncome.toLocaleString(locale)}</span></div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-800"><span className="text-slate-400">Total Expenses</span><span className="text-red-400 font-semibold">-{symbol} {totalExpenses.toLocaleString(locale)}</span></div>
            <div className="flex justify-between items-center pt-2"><span className="text-slate-400">Net Cash Flow</span><span className={`font-bold ${totalIncome - totalExpenses >= 0 ? "text-emerald-400" : "text-red-400"}`}>{symbol} {(totalIncome - totalExpenses).toLocaleString(locale)}</span></div>
          </div>
        </div>
      </div>

      {/* Savings Tips */}
      {savingsRate < 20 && savingsRate >= 0 && (<div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400"><PiggyBank size={18} /></div><div><p className="text-sm font-semibold text-emerald-400">Savings Tip</p><p className="text-xs text-slate-400">Your savings rate is only {savingsRate.toFixed(1)}%. Try reducing unnecessary expenses to reach 20% savings goal.</p></div></div></div>)}
      {savingsRate < 0 && (<div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-red-500/20 text-red-400"><AlertTriangle size={18} /></div><div><p className="text-sm font-semibold text-red-400">Warning: Spending Exceeds Income</p><p className="text-xs text-slate-400">Your expenses are {Math.abs(savingsRate).toFixed(1)}% higher than your income. Review your budget immediately.</p></div></div></div>)}
    </div>
  );
}