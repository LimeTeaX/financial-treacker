// src/pages/ActivityPage.jsx
import { useState, useMemo } from "react";
import {
  TrendingUp, TrendingDown, Clock, Calendar, Activity,
  Zap, Coffee, Utensils, ShoppingBag, Gamepad2, Wifi,
  DollarSign, ChevronUp, ChevronDown, GraduationCap
} from "lucide-react";
import { useAppContext } from '../context/AppContext'
import { filterByPeriod } from '../data/transactions'


function getHeatmapColor(intensity) {
  switch (intensity) {
    case 0: return "bg-slate-100";
    case 1: return "bg-violet-200";
    case 2: return "bg-violet-300";
    case 3: return "bg-[#8B5CF6]";
    case 4: return "bg-violet-800";
    default: return "bg-slate-100";
  }
}

// ── HEATMAP COMPONENT ──
function ActivityHeatmap({ transactions }) {
  const heatmapData = useMemo(() => {
    const data = [];
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - 84);
    for (let i = 0; i < 84; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const dayTxns = transactions.filter((t) => t.date === dateStr);
      data.push({ date: dateStr, intensity: Math.min(dayTxns.length, 4) });
    }
    return data;
  }, [transactions]);

  const weeks = [];
  for (let w = 0; w < 12; w++) {
    weeks.push(heatmapData.slice(w * 7, (w + 1) * 7));
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-[600px]">
        <div className="flex flex-col gap-1 mr-2 pt-5">
          {["", "Mon", "", "Wed", "", "Fri", ""].map((label, i) => (
            <div key={i} className="h-4 text-[9px] text-slate-300 flex items-center">{label}</div>
          ))}
        </div>
        <div className="flex gap-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day, di) => (
                <div key={di} className={`h-4 w-4 rounded-sm ${getHeatmapColor(day.intensity)}`}
                  title={`${day.date}: ${day.intensity} transactions`} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 text-[10px] text-slate-400">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((i) => <div key={i} className={`h-3 w-3 rounded-sm ${getHeatmapColor(i)}`} />)}
        <span>More</span>
      </div>
    </div>
  );
}

// ── PEAK HOURS CHART ──
function PeakHoursChart({ data }) {
  const maxVal = Math.max(...data.map((h) => h.value), 1);
  return (
    <div className="relative h-40">
      <div className="absolute left-0 bottom-0 right-0 flex items-end justify-between gap-1 px-4">
        {data.map((peak) => (
          <div key={peak.hour} className="flex-1 flex flex-col items-center gap-2">
            <span className="text-[10px] text-slate-500 font-medium">{peak.value}tx</span>
            <div className="w-full rounded-t-lg bg-[#8B5CF6]" style={{ height: `${(peak.value / maxVal) * 120}px`, minWidth: "20px" }} />
            <span className="text-[9px] text-slate-400">{peak.hour}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── WEEKLY CASH FLOW CHART ──
function WeeklyCashFlowChart({ data }) {
  const width = 600; const height = 180;
  const pad = { top: 20, right: 30, bottom: 20, left: 10 };
  const cw = width - pad.left - pad.right; const ch = height - pad.top - pad.bottom;
  const maxVal = Math.max(...data.map((d) => Math.max(d.income, d.expense)), 1);
  const stepX = cw / (data.length - 1);

  const incomePoints = data.map((d, i) => ({ x: pad.left + i * stepX, y: pad.top + ch - (d.income / maxVal) * ch }));
  const expensePoints = data.map((d, i) => ({ x: pad.left + i * stepX, y: pad.top + ch - (d.expense / maxVal) * ch }));
  const incomeLine = incomePoints.map((p) => `${p.x},${p.y}`).join(" ");
  const expenseLine = expensePoints.map((p) => `${p.x},${p.y}`).join(" ");
  const incomeArea = `${incomePoints[0].x},${pad.top + ch} ${incomeLine} ${incomePoints[incomePoints.length - 1].x},${pad.top + ch}`;

  return (
    <div className="overflow-x-auto">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="min-w-[500px] w-full">
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
          <line key={i} x1={pad.left} y1={pad.top + ch * (1 - pct)} x2={pad.left + cw} y2={pad.top + ch * (1 - pct)} stroke="#f1f5f9" strokeWidth="1" />
        ))}
        <polygon points={incomeArea} fill="url(#incomeGradient)" opacity="0.3" />
        <polyline points={expenseLine} fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 3" />
        <polyline points={incomeLine} fill="none" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" />
        {incomePoints.map((p, i) => <circle key={`inc-${i}`} cx={p.x} cy={p.y} r="4" fill="#8B5CF6" stroke="white" strokeWidth="2" />)}
        {data.map((d, i) => (
          <text key={d.day} x={pad.left + i * stepX} y={height - 5} textAnchor="middle" className="fill-slate-400 text-[10px]">{d.day}</text>
        ))}
        <defs>
          <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <div className="flex items-center gap-4 mt-2">
        <span className="flex items-center gap-1.5 text-[10px] text-slate-400"><span className="w-3 h-0.5 rounded-full bg-[#8B5CF6] inline-block" /> Income</span>
        <span className="flex items-center gap-1.5 text-[10px] text-slate-400"><span className="w-3 h-0.5 rounded-full bg-orange-400 inline-block border-dashed" /> Expenses</span>
      </div>
    </div>
  );
}

// ── MAIN ──
export default function ActivityPage() {
  const { transactions } = useAppContext()
  const [timeFilter, setTimeFilter] = useState("3 Months");

  const filteredTxns = useMemo(() => {
    if (!transactions || transactions.length === 0) return []
    return filterByPeriod(transactions, timeFilter)
  }, [transactions, timeFilter])

  const peakHours = useMemo(() => {
    const hours = Array(24).fill(0)
    filteredTxns.forEach(tx => {
      if (tx.date) {
        const hour = new Date(tx.date + 'T00:00:00').getHours() || new Date(tx.date).getHours()
        hours[hour]++
      }
    })
    return [
      { hour: "6AM", value: hours[6] },
      { hour: "8AM", value: hours[8] },
      { hour: "10AM", value: hours[10] },
      { hour: "12PM", value: hours[12] },
      { hour: "2PM", value: hours[14] },
      { hour: "4PM", value: hours[16] },
      { hour: "6PM", value: hours[18] },
      { hour: "8PM", value: hours[20] },
      { hour: "10PM", value: hours[22] },
    ]
  }, [filteredTxns])

  const mostActiveHour = useMemo(() => {
    if (!filteredTxns || filteredTxns.length === 0) return { hour: "N/A", label: "No data yet" }
    const hourCounts = {}
    const hourLabels = {
      6: "🌅 Morning coffee", 8: "🌅 Morning rush", 10: "☀️ Brunch time",
      12: "🍜 Lunch time", 14: "☀️ Afternoon", 16: "🌤️ Evening",
      18: "🌙 Dinner time", 20: "🎮 Gaming time", 22: "🌙 Late night"
    }
    filteredTxns.forEach(tx => {
      if (tx.date) {
        const hour = new Date(tx.date + 'T00:00:00').getHours() || new Date(tx.date).getHours()
        hourCounts[hour] = (hourCounts[hour] || 0) + 1
      }
    })
    const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]
    if (!peakHour) return { hour: "N/A", label: "No data yet" }
    return { hour: `${peakHour[0]}:00`, label: hourLabels[peakHour[0]] || "Active time" }
  }, [filteredTxns])

  const weeklyCashflow = useMemo(() => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const now = new Date()
  const result = []
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const dayTxns = filteredTxns.filter(t => t.date?.startsWith(dateStr))
    
    result.push({
      day: days[d.getDay()],
      date: dateStr,
      income: dayTxns.filter(t => t.type === 'income').reduce((s, t) => s + Math.abs(t.amount || 0), 0),
      expense: dayTxns.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount || 0), 0),
    })
  }
  
  return result
}, [filteredTxns])

  const categoryProgress = useMemo(() => {
  if (!filteredTxns || filteredTxns.length === 0) return []

  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const prevMonth = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`

  // Ambil semua kategori unik
  const categories = [...new Set(filteredTxns.filter(t => t.type === 'expense').map(t => t.category))]

  return categories.map(cat => {
    const thisMonthTxns = filteredTxns.filter(t => t.category === cat && t.date?.startsWith(thisMonth))
    const prevMonthTxns = filteredTxns.filter(t => t.category === cat && t.date?.startsWith(prevMonth))

    const thisMonthAmount = thisMonthTxns.reduce((s, t) => s + Math.abs(t.amount || 0), 0)
    const prevMonthAmount = prevMonthTxns.reduce((s, t) => s + Math.abs(t.amount || 0), 0)

    const limit = Math.max(thisMonthAmount * 1.5, 500000) // estimasi limit 1.5x pengeluaran
    const percent = Math.round((thisMonthAmount / limit) * 100)
    const change = prevMonthAmount > 0 ? Math.round(((thisMonthAmount - prevMonthAmount) / prevMonthAmount) * 100) : 0

    const icons = {
      Food: Utensils, 'Food & Drink': Utensils,
      Gaming: Gamepad2, 'Gaming/Top-up': Gamepad2,
      Internet: Wifi, Subscription: Zap,
      Transport: Activity, Shopping: ShoppingBag,
    }
    const colorMap = {
  'Food': 'bg-orange-400',
  'Food & Drink': 'bg-orange-400',
  'Gaming': 'bg-[#8B5CF6]',
  'Gaming/Top-up': 'bg-[#8B5CF6]',
  'Internet': 'bg-blue-400',
  'Subscription': 'bg-amber-400',
  'Transport': 'bg-emerald-400',
  'Shopping': 'bg-rose-400',
  'Entertainment': 'bg-indigo-400',
  'Education': 'bg-teal-400',
  'Utilities': 'bg-slate-400',
  'Other': 'bg-gray-400',
}
    const colors = ['bg-orange-400', 'bg-[#8B5CF6]', 'bg-blue-400', 'bg-emerald-400', 'bg-amber-400', 'bg-rose-400', 'bg-indigo-400']

    return {
      id: cat,
      category: cat,
      icon: icons[cat] || Activity,
      iconBg: "bg-slate-100 text-slate-600",
      thisMonth: thisMonthAmount,
      lastMonth: prevMonthAmount,
      limit: limit,
      color: colorMap[cat] || 'bg-gray-400',
      percent,
      change,
    }
  })
}, [filteredTxns])

  const recentLogs = useMemo(() => {
  if (!filteredTxns || filteredTxns.length === 0) return []

  const icons = {
    Food: Utensils, 'Food & Drink': Utensils,
    Gaming: Gamepad2, 'Gaming/Top-up': Gamepad2,
    Internet: Wifi, Subscription: Zap,
    Transport: Activity, Shopping: ShoppingBag,
    Entertainment: Coffee, Education: GraduationCap,
    Utilities: Zap, Salary: DollarSign, Income: TrendingUp,
  }
  const colors = {
    Food: 'bg-orange-100 text-orange-600',
    'Food & Drink': 'bg-orange-100 text-orange-600',
    Gaming: 'bg-rose-100 text-rose-600',
    'Gaming/Top-up': 'bg-rose-100 text-rose-600',
    Internet: 'bg-indigo-100 text-indigo-600',
    Subscription: 'bg-violet-100 text-violet-600',
    Transport: 'bg-slate-100 text-slate-600',
    Shopping: 'bg-pink-100 text-pink-600',
    Entertainment: 'bg-amber-100 text-amber-600',
    Education: 'bg-teal-100 text-teal-600',
    Utilities: 'bg-blue-100 text-blue-600',
    Salary: 'bg-emerald-100 text-emerald-600',
    Income: 'bg-emerald-100 text-emerald-600',
    Other: 'bg-gray-100 text-gray-600',
  }
  const timeLabels = {
    0: 'Just now', 1: '1 hour ago', 2: '2 hours ago', 3: '3 hours ago',
    5: '5 hours ago', 8: '8 hours ago', 12: '12 hours ago',
  }

  return [...filteredTxns]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10)
    .map(tx => ({
      id: tx.id,
      action: tx.type === 'income' ? `Received ${tx.merchant}` : `Paid ${tx.merchant}`,
      type: tx.type,
      amount: tx.amount,
      time: timeLabels[Math.floor(Math.random() * Object.keys(timeLabels).length)] || 'Recently',
      icon: icons[tx.category] || Activity,
      iconBg: colors[tx.category] || colors['Other'],
    }))
}, [filteredTxns])

  return (
    <div className="h-[calc(100vh-2.5rem)] flex flex-col gap-5">
      <main className="flex-1 overflow-y-auto flex flex-col gap-5">
        <header className="flex items-center justify-between rounded-3xl bg-white px-7 py-5 border border-slate-100 shadow-sm shrink-0">
          <div><p className="text-sm text-slate-400 font-medium">Account</p><h1 className="mt-0.5 text-2xl font-bold text-slate-900 tracking-tight">Activity</h1></div>
          <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-1 border border-slate-100">
            {["Week", "Month", "3 Months"].map((opt) => (
              <button key={opt} onClick={() => setTimeFilter(opt)}
                className={`rounded-xl px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${timeFilter === opt ? "bg-white text-slate-800 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"}`}>
                {opt}
              </button>
            ))}
          </div>
        </header>

        <section className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-[#8B5CF6]"><Calendar size={18} /></span>
            <div><p className="text-sm font-semibold text-slate-800">Financial Activity</p><p className="text-xs text-slate-400">Transaction intensity over time</p></div>
          </div>
          <ActivityHeatmap transactions={filteredTxns} />
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-500"><Clock size={18} /></span>
              <div><p className="text-sm font-semibold text-slate-800">Peak Spending Hours</p><p className="text-xs text-slate-400">When you spend the most</p></div>
            </div>
            <PeakHoursChart data={peakHours} />
            <p className="mt-3 text-xs text-slate-400 text-center">
              🕗 Most active: <span className="font-semibold text-[#8B5CF6]">{mostActiveHour.hour} ({mostActiveHour.label})</span>
            </p>
          </article>
          <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-500"><TrendingUp size={18} /></span>
              <div><p className="text-sm font-semibold text-slate-800">Weekly Cash Flow</p><p className="text-xs text-slate-400">Income vs Expenses this week</p></div>
            </div>
            <WeeklyCashFlowChart data={weeklyCashflow} />
          </article>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
          <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <p className="text-sm font-medium text-slate-400 mb-4">Category Progress</p>
            <div className="space-y-4">
{categoryProgress.map((cat) => {
  const isIncrease = cat.change > 0;
  return (
    <div key={cat.id}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${cat.iconBg}`}>
            <cat.icon size={14} />
          </span>
          <span className="text-sm font-medium text-slate-700">{cat.category}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Rp {(cat.thisMonth / 1000).toFixed(0)}k / Rp {(cat.limit / 1000).toFixed(0)}k</span>
          {cat.change !== 0 && (
            <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${isIncrease ? "text-rose-500" : "text-emerald-500"}`}>
              {isIncrease ? <ChevronUp size={10} /> : <ChevronDown size={10} />}{Math.abs(cat.change)}%
            </span>
          )}
        </div>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${cat.color} transition-all`} style={{ width: `${Math.min(cat.percent, 100)}%` }} />
      </div>
      {cat.change !== 0 && (
        <p className="mt-1 text-[10px] text-slate-400">
          {isIncrease ? "Spent" : "Saved"} {Math.abs(cat.change)}% {isIncrease ? "more" : "less"} than last month
        </p>
      )}
    </div>
  );
})}
            </div>
          </article>
          <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <p className="text-sm font-medium text-slate-400 mb-4">Recent Logs</p>
            <div className="space-y-2">
{recentLogs.map((log) => (
  <div key={log.id} className="flex items-center justify-between py-2.5 px-3 rounded-2xl hover:bg-slate-50 transition-colors">
    <div className="flex items-center gap-3">
      <span className={`inline-flex h-8 w-8 items-center justify-center rounded-xl ${log.iconBg}`}>
        <log.icon size={14} />
      </span>
      <div>
        <p className="text-sm font-medium text-slate-800">{log.action}</p>
        <p className="text-[10px] text-slate-400">{log.time}</p>
      </div>
    </div>
    <span className={`text-sm font-semibold ${log.amount >= 0 ? "text-emerald-500" : "text-slate-700"}`}>
      {log.amount >= 0 ? "+" : ""}Rp {Math.abs(log.amount || 0).toLocaleString("id-ID")}
    </span>
  </div>
))}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}