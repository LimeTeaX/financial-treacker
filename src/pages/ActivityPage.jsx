// src/pages/ActivityPage.jsx
import { useState, useMemo } from "react";
import {
  TrendingUp,
  Clock,
  Calendar,
  Activity,
  Zap,
  Coffee,
  Utensils,
  ShoppingBag,
  Gamepad2,
  Wifi,
  DollarSign,
  ChevronUp,
  ChevronDown,
  GraduationCap,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Helper: filter by period
const filterByPeriod = (transactions, period) => {
  const now = new Date();
  let startDate = new Date();
  switch (period) {
    case "Week": startDate.setDate(now.getDate() - 7); break;
    case "Month": startDate.setMonth(now.getMonth() - 1); break;
    case "3 Months": startDate.setMonth(now.getMonth() - 3); break;
    default: startDate = new Date(0);
  }
  return transactions.filter((tx) => tx.date && new Date(tx.date) >= startDate);
};

function getHeatmapColor(intensity) {
  switch (intensity) {
    case 0: return "bg-slate-800/50";
    case 1: return "bg-emerald-500/20";
    case 2: return "bg-emerald-500/30";
    case 3: return "bg-emerald-500/50";
    case 4: return "bg-emerald-500";
    default: return "bg-slate-800/50";
  }
}

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
      const dayTxns = transactions.filter((t) => t.date?.startsWith(dateStr));
      data.push({ date: dateStr, intensity: Math.min(dayTxns.length, 4) });
    }
    return data;
  }, [transactions]);

  const weeks = [];
  for (let w = 0; w < 12; w++) weeks.push(heatmapData.slice(w * 7, (w + 1) * 7));

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-[600px]">
        <div className="flex flex-col gap-1 mr-2 pt-5">
          {["", "Mon", "", "Wed", "", "Fri", ""].map((label, i) => (
            <div key={i} className="h-4 text-[9px] text-slate-500 flex items-center">{label}</div>
          ))}
        </div>
        <div className="flex gap-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day, di) => (
                <div key={di} className={`h-4 w-4 rounded-sm ${getHeatmapColor(day.intensity)}`} title={`${day.date}: ${day.intensity} transactions`} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 text-[10px] text-slate-500">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((i) => <div key={i} className={`h-3 w-3 rounded-sm ${getHeatmapColor(i)}`} />)}
        <span>More</span>
      </div>
    </div>
  );
}

function PeakHoursChart({ data }) {
  const maxVal = Math.max(...data.map((h) => h.value), 1);
  return (
    <div className="relative h-40">
      <div className="absolute left-0 bottom-0 right-0 flex items-end justify-between gap-1 px-4">
        {data.map((peak) => (
          <div key={peak.hour} className="flex-1 flex flex-col items-center gap-2">
            <span className="text-[10px] text-slate-400 font-medium">{peak.value}tx</span>
            <div className="w-full rounded-t-lg bg-emerald-500" style={{ height: `${(peak.value / maxVal) * 120}px`, minWidth: "20px" }} />
            <span className="text-[9px] text-slate-500">{peak.hour}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WeeklyCashFlowChart({ data }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} />
          <YAxis stroke="#64748b" fontSize={12} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "12px" }} labelStyle={{ color: "#f1f5f9", fontWeight: 600 }} formatter={(v) => [`Rp ${v.toLocaleString()}`, ""]} />
          <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
          <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function ActivityPage() {
  const { transactions, settings } = useAppContext();
  const [timeFilter, setTimeFilter] = useState("3 Months");

  const symbol = settings?.currency === "USD" ? "$" : "Rp";
  const locale = settings?.currency === "USD" ? "en-US" : "id-ID";

  const filteredTxns = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    return filterByPeriod(transactions, timeFilter);
  }, [transactions, timeFilter]);

  // Peak hours
  const peakHours = useMemo(() => {
    const hours = Array(24).fill(0);
    filteredTxns.forEach((tx) => { if (tx.date) hours[new Date(tx.date).getHours()]++; });
    return [
      { hour: "6AM", value: hours[6] }, { hour: "8AM", value: hours[8] }, { hour: "10AM", value: hours[10] },
      { hour: "12PM", value: hours[12] }, { hour: "2PM", value: hours[14] }, { hour: "4PM", value: hours[16] },
      { hour: "6PM", value: hours[18] }, { hour: "8PM", value: hours[20] }, { hour: "10PM", value: hours[22] },
    ];
  }, [filteredTxns]);

  // Weekly cash flow
  const weeklyCashflow = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const now = new Date();
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      const dayTxns = filteredTxns.filter((t) => t.date?.startsWith(ds));
      result.push({
        label: days[d.getDay()],
        income: dayTxns.filter((t) => t.type === "income").reduce((s, t) => s + Math.abs(t.amount || 0), 0),
        expense: dayTxns.filter((t) => t.type === "expense").reduce((s, t) => s + Math.abs(t.amount || 0), 0),
      });
    }
    return result;
  }, [filteredTxns]);

  // Most active hour
  const mostActiveHour = useMemo(() => {
    if (!filteredTxns || filteredTxns.length === 0) return { hour: "N/A", label: "No data yet" };
    const hourCounts = {};
    const hourLabels = { 6: "🌅 Morning coffee", 8: "🌅 Morning rush", 10: "☀️ Brunch time", 12: "🍜 Lunch time", 14: "☀️ Afternoon", 16: "🌤️ Evening", 18: "🌙 Dinner time", 20: "🎮 Gaming time", 22: "🌙 Late night" };
    filteredTxns.forEach((tx) => { if (tx.date) hourCounts[new Date(tx.date).getHours()] = (hourCounts[new Date(tx.date).getHours()] || 0) + 1; });
    const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
    return peakHour ? { hour: `${peakHour[0]}:00`, label: hourLabels[peakHour[0]] || "Active time" } : { hour: "N/A", label: "No data yet" };
  }, [filteredTxns]);

  // Category progress
  const categoryProgress = useMemo(() => {
    if (!filteredTxns || filteredTxns.length === 0) return [];
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const prevMonth = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, "0")}`;
    const categories = [...new Set(filteredTxns.filter((t) => t.type === "expense").map((t) => t.category))];
    const icons = { Food: Utensils, Gaming: Gamepad2, Internet: Wifi, Subscription: Zap, Transport: Activity, Shopping: ShoppingBag };
    const colorMap = { Food: "bg-orange-500", Gaming: "bg-emerald-500", Internet: "bg-blue-500", Subscription: "bg-amber-500", Transport: "bg-cyan-500", Shopping: "bg-rose-500", Entertainment: "bg-indigo-500", Education: "bg-teal-500" };
    return categories.map((cat) => {
      const thisMonthTxns = filteredTxns.filter((t) => t.category === cat && t.date?.startsWith(thisMonth));
      const prevMonthTxns = filteredTxns.filter((t) => t.category === cat && t.date?.startsWith(prevMonth));
      const thisMonthAmount = thisMonthTxns.reduce((s, t) => s + Math.abs(t.amount || 0), 0);
      const prevMonthAmount = prevMonthTxns.reduce((s, t) => s + Math.abs(t.amount || 0), 0);
      return {
        id: cat, category: cat, icon: icons[cat] || ShoppingBag, iconBg: "bg-slate-800 text-slate-400",
        thisMonth: thisMonthAmount, limit: Math.max(thisMonthAmount * 1.5, 500000), color: colorMap[cat] || "bg-slate-500",
        percent: Math.round((thisMonthAmount / Math.max(thisMonthAmount * 1.5, 500000)) * 100),
        change: prevMonthAmount > 0 ? Math.round(((thisMonthAmount - prevMonthAmount) / prevMonthAmount) * 100) : 0,
      };
    });
  }, [filteredTxns]);

  // Recent logs
  const recentLogs = useMemo(() => {
    if (!filteredTxns || filteredTxns.length === 0) return [];
    const icons = { Food: Utensils, Gaming: Gamepad2, Internet: Wifi, Subscription: Zap, Transport: Activity, Shopping: ShoppingBag, Entertainment: Coffee, Education: GraduationCap, Salary: DollarSign, Income: TrendingUp };
    const colors = { Food: "bg-orange-500/10 text-orange-400", Gaming: "bg-emerald-500/10 text-emerald-400", Internet: "bg-blue-500/10 text-blue-400", Shopping: "bg-rose-500/10 text-rose-400", Entertainment: "bg-amber-500/10 text-amber-400" };
    const getTimeAgo = (dateStr) => {
      if (!dateStr) return "Unknown";
      const d = new Date(dateStr), n = new Date(), ms = n - d, mins = Math.floor(ms / 60000), hrs = Math.floor(ms / 3600000), days = Math.floor(ms / 86400000);
      if (mins < 1) return "Just now";
      if (mins < 60) return `${mins} min ago`;
      if (hrs < 24) return `${hrs}h ago`;
      if (days < 7) return `${days}d ago`;
      return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    };
    return [...filteredTxns].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10).map((tx) => ({
      id: tx.id, action: tx.type === "income" ? `Received ${tx.merchant}` : `Paid ${tx.merchant}`, amount: tx.amount,
      time: getTimeAgo(tx.date), icon: icons[tx.category] || Activity, iconBg: colors[tx.category] || "bg-slate-800 text-slate-400",
    }));
  }, [filteredTxns]);

  if (transactions.length === 0) {
    return <div className="flex justify-center py-20"><p className="text-slate-400">No transaction data available</p></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Activity</h1>
          <p className="text-slate-400 mt-1">Track your financial behavior and patterns</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-slate-800/30 p-1 border border-slate-700">
          {["Week", "Month", "3 Months"].map((opt) => (
            <button key={opt} onClick={() => setTimeFilter(opt)} className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${timeFilter === opt ? "bg-emerald-500 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}>
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400"><Calendar size={18} /></div>
          <div><p className="text-sm font-semibold text-white">Financial Activity</p><p className="text-xs text-slate-400">Transaction intensity over time</p></div>
        </div>
        <ActivityHeatmap transactions={filteredTxns} />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400"><Clock size={18} /></div>
            <div><p className="text-sm font-semibold text-white">Peak Spending Hours</p><p className="text-xs text-slate-400">When you spend the most</p></div>
          </div>
          <PeakHoursChart data={peakHours} />
          <p className="mt-3 text-xs text-slate-400 text-center">🕗 Most active: <span className="font-semibold text-emerald-400">{mostActiveHour.hour} ({mostActiveHour.label})</span></p>
        </div>

        <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400"><TrendingUp size={18} /></div>
            <div><p className="text-sm font-semibold text-white">Weekly Cash Flow</p><p className="text-xs text-slate-400">Income vs Expenses this week</p></div>
          </div>
          <WeeklyCashFlowChart data={weeklyCashflow} />
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-xs text-slate-400">Income</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /><span className="text-xs text-slate-400">Expense</span></div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Progress */}
        <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">
          <p className="text-sm font-medium text-slate-400 mb-4">Category Progress</p>
          <div className="space-y-4">
            {categoryProgress.length === 0 ? <div className="text-center py-8 text-slate-500">No category data</div> : categoryProgress.map((cat) => {
              const isIncrease = cat.change > 0;
              return (
                <div key={cat.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2"><div className={`p-1.5 rounded-lg ${cat.iconBg}`}><cat.icon size={12} /></div><span className="text-sm font-medium text-white">{cat.category}</span></div>
                    <div className="flex items-center gap-2"><span className="text-xs text-slate-400">{symbol} {(cat.thisMonth / 1000).toFixed(0)}k / {symbol} {(cat.limit / 1000).toFixed(0)}k</span>
                      {cat.change !== 0 && <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${isIncrease ? "text-red-400" : "text-emerald-400"}`}>{isIncrease ? <ChevronUp size={10} /> : <ChevronDown size={10} />}{Math.abs(cat.change)}%</span>}</div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden"><div className={`h-full rounded-full ${cat.color} transition-all`} style={{ width: `${Math.min(cat.percent, 100)}%` }} /></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Logs */}
        <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">
          <p className="text-sm font-medium text-slate-400 mb-4">Recent Logs</p>
          <div className="space-y-2">
            {recentLogs.length === 0 ? <div className="text-center py-8 text-slate-500">No recent activity</div> : recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center gap-3"><div className={`p-1.5 rounded-lg ${log.iconBg}`}><log.icon size={12} /></div><div><p className="text-sm font-medium text-white">{log.action}</p><p className="text-[10px] text-slate-500">{log.time}</p></div></div>
                <span className={`text-sm font-semibold ${log.amount >= 0 ? "text-emerald-400" : "text-white"}`}>{log.amount >= 0 ? "+" : ""}{symbol} {Math.abs(log.amount || 0).toLocaleString(locale)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}