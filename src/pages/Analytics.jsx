// src/pages/Analytics.jsx
import { useState, useMemo } from "react";
import { useAppContext } from '../context/AppContext'

// ── HELPER FUNCTIONS ──
// Hitung data per bulan (income vs expenses)
function getChartData(transactions, filter) {
  const now = new Date();
  
  if (filter === 'Week') {
    // 7 hari terakhir
    const data = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayTxns = transactions.filter(t => t.date?.startsWith(dateStr));
      data[`${d.getDate()}/${d.getMonth()+1}`] = {
        income: dayTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expenses: dayTxns.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0),
      };
    }
    return data;
  }
  
if (filter === 'Month') {
  // Tampilin per minggu (M1, M2, M3, M4, M5)
  const data = { 'Week 1': {income:0,expenses:0}, 'Week 2': {income:0,expenses:0}, 'Week 3': {income:0,expenses:0}, 'Week 4': {income:0,expenses:0}, 'Week 5': {income:0,expenses:0} };
  
  transactions.filter(t => t.date).forEach(t => {
    const d = new Date(t.date);
    const day = d.getDate();
    const week = Math.ceil(day / 7);
    const key = `Week ${week}`;
    if (data[key]) {
      if (t.type === 'income') data[key].income += Math.abs(t.amount);
      else data[key].expenses += Math.abs(t.amount);
    }
  });
  return data;
}
  
  if (filter === '6 Months') {
    // 6 bulan terakhir
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
    }
    const data = {};
    months.forEach(m => {
      data[m] = { income: 0, expenses: 0 };
    });
    transactions.filter(t => t.date).forEach(t => {
      const d = new Date(t.date);
      const key = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (data[key]) {
        if (t.type === 'income') data[key].income += t.amount;
        else data[key].expenses += Math.abs(t.amount);
      }
    });
    return data;
  }
  
  // Default Year: 12 bulan terakhir
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
  }
  const data = {};
  months.forEach(m => {
    data[m] = { income: 0, expenses: 0 };
  });
  transactions.filter(t => t.date).forEach(t => {
    const d = new Date(t.date);
    const key = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (data[key]) {
      if (t.type === 'income') data[key].income += t.amount;
      else data[key].expenses += Math.abs(t.amount);
    }
  });
  return data;
}

// Hitung breakdown per kategori (expense doang)
function getCategoryBreakdown(transactions) {
  const expenses = transactions.filter(t => t.type === "expense");
  const totalExpenses = expenses.reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
  const categories = [...new Set(expenses.map(t => t.category))];
  return categories.map(cat => {
    const amount = expenses.filter(t => t.category === cat).reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
    return {
      category: cat,
      amount,
      percentage: totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : 0,
    };
  });
}

// ── SVG DONUT CHART ──
function DonutChart({ data, settings }) {
  const total = data.reduce((sum, d) => sum + d.amount, 0);
  const colors = ["#8B5CF6", "#F59E0B", "#EF4444", "#3B82F6", "#10B981", "#F97316", "#6366F1", "#EC4899"];
  const symbol = settings?.currency === 'USD' ? '$' : 'Rp';  // 🔥 Currency

  const slices = data.map((item, index) => {
    const percent = total > 0 ? item.amount / total : 0;
    const startPercent = data
      .slice(0, index)
      .reduce((sum, previous) => sum + (total > 0 ? previous.amount / total : 0), 0);
    const endPercent = startPercent + percent;
    const startAngle = startPercent * 360;
    const endAngle = endPercent * 360;
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;
    const r = 70, cx = 100, cy = 100;
    const x1 = cx + r * Math.cos(startRad), y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad), y2 = cy + r * Math.sin(endRad);
    const largeArc = percent > 0.5 ? 1 : 0;
    return { path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`, color: colors[index % colors.length], ...item };
  });

  return (
    <div className="flex items-center gap-6">
      <svg width="200" height="200" viewBox="0 0 200 200">
        {slices.map(slice => (
          <path key={slice.category} d={slice.path} fill={slice.color} stroke="white" strokeWidth="2" />
        ))}
        <circle cx="100" cy="100" r="45" fill="white" />
        <text x="100" y="95" textAnchor="middle" className="text-lg font-bold fill-slate-800">{symbol}</text>
        <text x="100" y="115" textAnchor="middle" className="text-sm font-semibold fill-slate-600">{(total / 1000).toFixed(0)}k</text>
      </svg>
      <div className="space-y-2">
        {slices.map(slice => (
          <div key={slice.category} className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: slice.color }} />
            <span className="text-slate-600">{slice.category}</span>
            <span className="text-slate-400 ml-auto">{slice.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── BAR CHART ──
function MonthlyBarChart({ data }) {
  const maxVal = Math.max(...Object.values(data).map(d => Math.max(d.income, d.expenses)), 1);
  return (
    <div className="relative h-56">
      <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-slate-300 w-10">
        {[4, 3, 2, 1, 0].map(n => (
          <span key={n}>{n > 0 ? `${(((maxVal / 1000000) * n) / 4).toFixed(0)}jt` : "0"}</span>
        ))}
      </div>
      <div className="ml-10 h-full flex items-end gap-2 pb-6">
        {Object.entries(data).map(([month, values]) => (
          <div key={month} className="flex-1 flex flex-col items-center h-full justify-end">
            <div className="flex items-end gap-1 mb-1">
              <div className="w-3 rounded-t-full bg-[#8B5CF6]" style={{ height: `${(values.income / maxVal) * 180}px` }} />
              <div className="w-3 rounded-t-full bg-orange-300" style={{ height: `${(values.expenses / maxVal) * 180}px` }} />
            </div>
            <span className="text-[10px] text-slate-400 mt-1">{month}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-2 ml-10">
        <span className="flex items-center gap-1 text-[10px] text-slate-400"><span className="w-2 h-2 rounded-full bg-[#8B5CF6]" /> Income</span>
        <span className="flex items-center gap-1 text-[10px] text-slate-400"><span className="w-2 h-2 rounded-full bg-orange-300" /> Expenses</span>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ──
export default function Analytics() {
  const { transactions, settings } = useAppContext();  // 🔥 Ambil settings
  const [filter, setFilter] = useState("6 Months");

  // 🔥 Format currency
  const symbol = settings?.currency === 'USD' ? '$' : 'Rp';
  const locale = settings?.currency === 'USD' ? 'en-US' : 'id-ID';

  // Filter transaksi sesuai periode
  const filteredTxns = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    const now = new Date();
    let startDate = new Date();
    switch (filter) {
      case 'Week': startDate.setDate(now.getDate() - 7); break;
      case 'Month': startDate.setMonth(now.getMonth() - 1); break;
      case '6 Months': startDate.setMonth(now.getMonth() - 6); break;
      case 'Year': startDate.setFullYear(now.getFullYear() - 1); break;
      default: startDate = new Date(0);
    }
    return transactions.filter(tx => tx.date && new Date(tx.date) >= startDate);
  }, [transactions, filter]);

  const chartData = useMemo(() => getChartData(filteredTxns, filter), [filteredTxns, filter]);
  const categoryData = useMemo(() => getCategoryBreakdown(filteredTxns), [filteredTxns]);

  const totalIncome = filteredTxns.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = filteredTxns.filter(t => t.type === "expense").reduce((s, t) => s + Math.abs(t.amount || 0), 0);

  return (
    <div className="h-[calc(100vh-2.5rem)] flex flex-col gap-5">
      <main className="flex-1 overflow-y-auto flex flex-col gap-5">
        {/* ── HEADER ── */}
        <header className="flex items-center justify-between rounded-3xl bg-white px-7 py-5 border border-slate-100 shadow-sm shrink-0">
          <div>
            <p className="text-sm text-slate-400 font-medium">Analytics</p>
            <h1 className="mt-0.5 text-2xl font-bold text-slate-900 tracking-tight">Financial Overview</h1>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-1 border border-slate-100">
            {["Week", "Month", "6 Months", "Year"].map(opt => (
              <button key={opt} onClick={() => setFilter(opt)}
                className={`rounded-xl px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${filter === opt ? "bg-white text-slate-800 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"}`}>
                {opt}
              </button>
            ))}
          </div>
        </header>

        {/* ── STATS CARDS ── */}
        <section className="grid grid-cols-3 gap-5">
          <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <p className="text-sm text-slate-400">Total Balance</p>
            {/* 🔥 Currency support */}
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {symbol} {(totalIncome - totalExpenses).toLocaleString(locale)}
            </p>
          </article>
          <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <p className="text-sm text-slate-400">Total Spending</p>
            {/* 🔥 Currency support */}
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {symbol} {totalExpenses.toLocaleString(locale)}
            </p>
          </article>
          <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <p className="text-sm text-slate-400">Transaction Count</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{filteredTxns.length}</p>
          </article>
        </section>

        {/* ── CHARTS ── */}
        <section className="grid gap-5 xl:grid-cols-2">
          <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <p className="text-sm font-medium text-slate-400 mb-4">Monthly Income vs Expenses</p>
            <MonthlyBarChart data={chartData} settings={settings} />
          </article>
          <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <p className="text-sm font-medium text-slate-400 mb-4">Spending Breakdown</p>
            <DonutChart data={categoryData} settings={settings} />
          </article>
        </section>
      </main>
    </div>
  );
}
