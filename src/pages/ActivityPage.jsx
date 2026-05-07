// src/pages/ActivityPage.jsx
import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
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
} from "lucide-react";
import { TRANSACTIONS, filterByPeriod } from "../data/transactions";
import { useAppContext } from '../context/AppContext'

// ── STATIC DATA ──
const RECENT_LOGS = [
  {
    id: 1,
    action: "Paid Spotify Premium",
    type: "expense",
    amount: -54990,
    time: "2 hours ago",
    icon: Wifi,
    iconBg: "bg-violet-100 text-violet-600",
  },
  {
    id: 2,
    action: "Received transfer from Emak",
    type: "income",
    amount: 500000,
    time: "5 hours ago",
    icon: DollarSign,
    iconBg: "bg-emerald-100 text-emerald-600",
  },
  {
    id: 3,
    action: "Top up DANA",
    type: "expense",
    amount: -200000,
    time: "8 hours ago",
    icon: Zap,
    iconBg: "bg-blue-100 text-blue-600",
  },
  {
    id: 4,
    action: "Warung Just Is Resto",
    type: "expense",
    amount: -35000,
    time: "12 hours ago",
    icon: Utensils,
    iconBg: "bg-orange-100 text-orange-600",
  },
  {
    id: 5,
    action: "Top-up MLBB",
    type: "expense",
    amount: -150000,
    time: "Yesterday",
    icon: Gamepad2,
    iconBg: "bg-rose-100 text-rose-600",
  },
  {
    id: 6,
    action: "Freelance payment received",
    type: "income",
    amount: 1500000,
    time: "Yesterday",
    icon: TrendingUp,
    iconBg: "bg-emerald-100 text-emerald-600",
  },
  {
    id: 7,
    action: "IndiHome Internet",
    type: "expense",
    amount: -350000,
    time: "2 days ago",
    icon: Wifi,
    iconBg: "bg-indigo-100 text-indigo-600",
  },
  {
    id: 8,
    action: "Jajan Indomaret",
    type: "expense",
    amount: -15000,
    time: "2 days ago",
    icon: ShoppingBag,
    iconBg: "bg-pink-100 text-pink-600",
  },
  {
    id: 9,
    action: "Grab ke Kampus",
    type: "expense",
    amount: -25000,
    time: "3 days ago",
    icon: Activity,
    iconBg: "bg-slate-100 text-slate-600",
  },
  {
    id: 10,
    action: "Bakso Pak Kumis",
    type: "expense",
    amount: -28000,
    time: "3 days ago",
    icon: Coffee,
    iconBg: "bg-amber-100 text-amber-600",
  },
];

const PEAK_HOURS = [
  { hour: "6AM", value: 5 },
  { hour: "8AM", value: 15 },
  { hour: "10AM", value: 25 },
  { hour: "12PM", value: 45 },
  { hour: "2PM", value: 30 },
  { hour: "4PM", value: 20 },
  { hour: "6PM", value: 35 },
  { hour: "8PM", value: 50 },
  { hour: "10PM", value: 28 },
];

const CATEGORY_PROGRESS = [
  {
    id: 1,
    category: "Food & Drinks",
    icon: Utensils,
    iconBg: "bg-orange-100 text-orange-600",
    thisMonth: 1250000,
    lastMonth: 1500000,
    limit: 2000000,
    color: "bg-orange-400",
  },
  {
    id: 2,
    category: "Gaming/Top-up",
    icon: Gamepad2,
    iconBg: "bg-rose-100 text-rose-600",
    thisMonth: 850000,
    lastMonth: 1000000,
    limit: 1500000,
    color: "bg-[#8B5CF6]",
  },
  {
    id: 3,
    category: "Internet",
    icon: Wifi,
    iconBg: "bg-indigo-100 text-indigo-600",
    thisMonth: 350000,
    lastMonth: 350000,
    limit: 400000,
    color: "bg-blue-400",
  },
  {
    id: 4,
    category: "Transport",
    icon: Activity,
    iconBg: "bg-slate-100 text-slate-600",
    thisMonth: 280000,
    lastMonth: 320000,
    limit: 500000,
    color: "bg-emerald-400",
  },
  {
    id: 5,
    category: "Subscriptions",
    icon: Zap,
    iconBg: "bg-violet-100 text-violet-600",
    thisMonth: 230000,
    lastMonth: 230000,
    limit: 300000,
    color: "bg-amber-400",
  },
];

const WEEKLY_CASHFLOW = [
  { day: "Mon", income: 200000, expense: 150000 },
  { day: "Tue", income: 500000, expense: 350000 },
  { day: "Wed", income: 150000, expense: 450000 },
  { day: "Thu", income: 800000, expense: 280000 },
  { day: "Fri", income: 300000, expense: 600000 },
  { day: "Sat", income: 1000000, expense: 200000 },
  { day: "Sun", income: 50000, expense: 100000 },
];

function getHeatmapColor(intensity) {
  switch (intensity) {
    case 0:
      return "bg-slate-100";
    case 1:
      return "bg-violet-200";
    case 2:
      return "bg-violet-300";
    case 3:
      return "bg-[#8B5CF6]";
    case 4:
      return "bg-violet-800";
    default:
      return "bg-slate-100";
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
            <div
              key={i}
              className="h-4 text-[9px] text-slate-300 flex items-center"
            >
              {label}
            </div>
          ))}
        </div>
        <div className="flex gap-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day, di) => (
                <div
                  key={di}
                  className={`h-4 w-4 rounded-sm ${getHeatmapColor(day.intensity)}`}
                  title={`${day.date}: ${day.intensity} transactions`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 text-[10px] text-slate-400">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-3 w-3 rounded-sm ${getHeatmapColor(i)}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

// ── PEAK HOURS CHART ──
function PeakHoursChart() {
  const maxVal = Math.max(...PEAK_HOURS.map((h) => h.value));
  return (
    <div className="relative h-40">
      <div className="absolute left-0 bottom-0 right-0 flex items-end justify-between gap-1 px-4">
        {PEAK_HOURS.map((peak) => (
          <div
            key={peak.hour}
            className="flex-1 flex flex-col items-center gap-2"
          >
            <span className="text-[10px] text-slate-500 font-medium">
              {peak.value}tx
            </span>
            <div
              className="w-full rounded-t-lg bg-[#8B5CF6]"
              style={{
                height: `${(peak.value / maxVal) * 120}px`,
                minWidth: "20px",
              }}
            />
            <span className="text-[9px] text-slate-400">{peak.hour}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── WEEKLY CASH FLOW CHART ──
function WeeklyCashFlowChart() {
  const width = 600;
  const height = 180;
  const pad = { top: 20, right: 30, bottom: 20, left: 10 };
  const cw = width - pad.left - pad.right;
  const ch = height - pad.top - pad.bottom;
  const maxVal = Math.max(
    ...WEEKLY_CASHFLOW.map((d) => Math.max(d.income, d.expense)),
  );
  const stepX = cw / (WEEKLY_CASHFLOW.length - 1);

  const incomePoints = WEEKLY_CASHFLOW.map((d, i) => ({
    x: pad.left + i * stepX,
    y: pad.top + ch - (d.income / maxVal) * ch,
  }));
  const expensePoints = WEEKLY_CASHFLOW.map((d, i) => ({
    x: pad.left + i * stepX,
    y: pad.top + ch - (d.expense / maxVal) * ch,
  }));
  const incomeLine = incomePoints.map((p) => `${p.x},${p.y}`).join(" ");
  const expenseLine = expensePoints.map((p) => `${p.x},${p.y}`).join(" ");
  const incomeArea = `${incomePoints[0].x},${pad.top + ch} ${incomeLine} ${incomePoints[incomePoints.length - 1].x},${pad.top + ch}`;

  return (
    <div className="overflow-x-auto">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="min-w-[500px] w-full"
      >
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
          <line
            key={i}
            x1={pad.left}
            y1={pad.top + ch * (1 - pct)}
            x2={pad.left + cw}
            y2={pad.top + ch * (1 - pct)}
            stroke="#f1f5f9"
            strokeWidth="1"
          />
        ))}
        <polygon
          points={incomeArea}
          fill="url(#incomeGradient)"
          opacity="0.3"
        />
        <polyline
          points={expenseLine}
          fill="none"
          stroke="#F97316"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="6 3"
        />
        <polyline
          points={incomeLine}
          fill="none"
          stroke="#8B5CF6"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {incomePoints.map((p, i) => (
          <circle
            key={`inc-${i}`}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="#8B5CF6"
            stroke="white"
            strokeWidth="2"
          />
        ))}
        {WEEKLY_CASHFLOW.map((d, i) => (
          <text
            key={d.day}
            x={pad.left + i * stepX}
            y={height - 5}
            textAnchor="middle"
            className="fill-slate-400 text-[10px]"
          >
            {d.day}
          </text>
        ))}
        <defs>
          <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <div className="flex items-center gap-4 mt-2">
        <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <span className="w-3 h-0.5 rounded-full bg-[#8B5CF6] inline-block" />{" "}
          Income
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <span className="w-3 h-0.5 rounded-full bg-orange-400 inline-block border-dashed" />{" "}
          Expenses
        </span>
      </div>
    </div>
  );
}

// ── MAIN ──
export default function ActivityPage() {
    const { transactions } = useAppContext()
  const [timeFilter, setTimeFilter] = useState("3 Months");
  const filteredTxns = useMemo(() => filterByPeriod(transactions, timeFilter), [transactions, timeFilter])

  return (
    <div className="h-[calc(100vh-2.5rem)] flex flex-col gap-5">
      <main className="flex-1 overflow-y-auto flex flex-col gap-5">
        <header className="flex items-center justify-between rounded-3xl bg-white px-7 py-5 border border-slate-100 shadow-sm shrink-0">
          <div>
            <p className="text-sm text-slate-400 font-medium">Account</p>
            <h1 className="mt-0.5 text-2xl font-bold text-slate-900 tracking-tight">
              Activity
            </h1>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-1 border border-slate-100">
            {["Week", "Month", "3 Months"].map((opt) => (
              <button
                key={opt}
                onClick={() => setTimeFilter(opt)}
                className={`rounded-xl px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${timeFilter === opt ? "bg-white text-slate-800 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </header>

        <section className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-[#8B5CF6]">
              <Calendar size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Financial Activity
              </p>
              <p className="text-xs text-slate-400">
                Transaction intensity over time
              </p>
            </div>
          </div>
          <ActivityHeatmap transactions={filteredTxns} />
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-500">
                <Clock size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Peak Spending Hours
                </p>
                <p className="text-xs text-slate-400">
                  When you spend the most
                </p>
              </div>
            </div>
            <PeakHoursChart />
            <p className="mt-3 text-xs text-slate-400 text-center">
              🕗 Most active:{" "}
              <span className="font-semibold text-[#8B5CF6]">
                8PM (Gaming time)
              </span>
            </p>
          </article>
          <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-500">
                <TrendingUp size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Weekly Cash Flow
                </p>
                <p className="text-xs text-slate-400">
                  Income vs Expenses this week
                </p>
              </div>
            </div>
            <WeeklyCashFlowChart />
          </article>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
          <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <p className="text-sm font-medium text-slate-400 mb-4">
              Category Progress
            </p>
            <div className="space-y-4">
              {CATEGORY_PROGRESS.map((cat) => {
                const percent = Math.round((cat.thisMonth / cat.limit) * 100);
                const change =
                  cat.lastMonth > 0
                    ? Math.round(
                        ((cat.thisMonth - cat.lastMonth) / cat.lastMonth) * 100,
                      )
                    : 0;
                const isIncrease = change > 0;
                return (
                  <div key={cat.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${cat.iconBg}`}
                        >
                          <cat.icon size={14} />
                        </span>
                        <span className="text-sm font-medium text-slate-700">
                          {cat.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">
                          Rp {(cat.thisMonth / 1000).toFixed(0)}k / Rp{" "}
                          {(cat.limit / 1000).toFixed(0)}k
                        </span>
                        {change !== 0 && (
                          <span
                            className={`flex items-center gap-0.5 text-[10px] font-semibold ${isIncrease ? "text-rose-500" : "text-emerald-500"}`}
                          >
                            {isIncrease ? (
                              <ChevronUp size={10} />
                            ) : (
                              <ChevronDown size={10} />
                            )}
                            {Math.abs(change)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${cat.color} transition-all`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>
                    {change !== 0 && (
                      <p className="mt-1 text-[10px] text-slate-400">
                        {isIncrease ? "Spent" : "Saved"} {Math.abs(change)}%{" "}
                        {isIncrease ? "more" : "less"} than last month
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </article>
          <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <p className="text-sm font-medium text-slate-400 mb-4">
              Recent Logs
            </p>
            <div className="space-y-2">
              {RECENT_LOGS.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between py-2.5 px-3 rounded-2xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-xl ${log.iconBg}`}
                    >
                      <log.icon size={14} />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {log.action}
                      </p>
                      <p className="text-[10px] text-slate-400">{log.time}</p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold ${log.amount >= 0 ? "text-emerald-500" : "text-slate-700"}`}
                  >
                    {log.amount >= 0 ? "+" : ""}Rp{" "}
                    {Math.abs(log.amount).toLocaleString("id-ID")}
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
