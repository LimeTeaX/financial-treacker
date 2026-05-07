// src/pages/Analytics.jsx
import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  AlertTriangle,
} from "lucide-react";
import { TRANSACTIONS, filterByPeriod } from "../data/transactions";
import { useAppContext } from '../context/AppContext'

// ── HELPER FUNCTIONS ──
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

function getMonthlyData(transactions) {
  const data = {};
  MONTHS.forEach((month, index) => {
    const monthNum = String(index + 1).padStart(2, "0");
    const monthTxns = transactions.filter((t) =>
      t.date.startsWith(`2026-${monthNum}`),
    );
    data[month] = {
      income: monthTxns
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0),
      expenses: monthTxns
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0),
    };
  });
  return data;
}

function getCategoryBreakdown(transactions) {
  const expenses = transactions.filter((t) => t.type === "expense");
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
  const categories = ["Food", "Internet", "Subscription", "Gaming/Top-up"];

  return categories.map((cat) => {
    const amount = expenses
      .filter((t) => t.category === cat)
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      category: cat,
      amount,
      percentage:
        totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : 0,
    };
  });
}

// ── SVG DONUT CHART ──
function DonutChart({ data }) {
  const total = data.reduce((sum, d) => sum + d.amount, 0);
  const colors = ["#8B5CF6", "#F59E0B", "#EF4444", "#3B82F6"];
  let cumulativePercent = 0;

  const slices = data.map((item, index) => {
    const percent = total > 0 ? item.amount / total : 0;
    const startPercent = cumulativePercent;
    cumulativePercent += percent;

    const startAngle = startPercent * 360;
    const endAngle = cumulativePercent * 360;

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const r = 70;
    const cx = 100,
      cy = 100;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    const largeArc = percent > 0.5 ? 1 : 0;

    return {
      path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`,
      color: colors[index],
      ...item,
    };
  });

  return (
    <div className="flex items-center gap-6">
      <svg width="200" height="200" viewBox="0 0 200 200">
        {slices.map((slice) => (
          <path
            key={slice.category}
            d={slice.path}
            fill={slice.color}
            stroke="white"
            strokeWidth="2"
          />
        ))}
        <circle cx="100" cy="100" r="45" fill="white" />
        <text
          x="100"
          y="95"
          textAnchor="middle"
          className="text-lg font-bold fill-slate-800"
        >
          Rp
        </text>
        <text
          x="100"
          y="115"
          textAnchor="middle"
          className="text-sm font-semibold fill-slate-600"
        >
          {(total / 1000).toFixed(0)}k
        </text>
      </svg>
      <div className="space-y-2">
        {slices.map((slice) => (
          <div key={slice.category} className="flex items-center gap-2 text-xs">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: slice.color }}
            />
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
  const maxVal = Math.max(
    ...Object.values(data).map((d) => Math.max(d.income, d.expenses)),
    1,
  );

  return (
    <div className="relative h-56">
      <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-slate-300 w-10">
        {[4, 3, 2, 1, 0].map((n) => (
          <span key={n}>
            {n > 0 ? `${(((maxVal / 1000000) * n) / 4).toFixed(0)}jt` : "0"}
          </span>
        ))}
      </div>
      <div className="ml-10 h-full flex items-end gap-2 pb-6">
        {Object.entries(data).map(([month, values]) => (
          <div
            key={month}
            className="flex-1 flex flex-col items-center h-full justify-end"
          >
            <div className="flex items-end gap-1 mb-1">
              <div
                className="w-3 rounded-t-full bg-[#8B5CF6]"
                style={{ height: `${(values.income / maxVal) * 180}px` }}
              />
              <div
                className="w-3 rounded-t-full bg-orange-300"
                style={{ height: `${(values.expenses / maxVal) * 180}px` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1">{month}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-2 ml-10">
        <span className="flex items-center gap-1 text-[10px] text-slate-400">
          <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" /> Income
        </span>
        <span className="flex items-center gap-1 text-[10px] text-slate-400">
          <span className="w-2 h-2 rounded-full bg-orange-300" /> Expenses
        </span>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ──
export default function Analytics() {
  const { transactions, addTransaction } = useAppContext()
  const [filter, setFilter] = useState("6 Months");
  const filteredTxns = useMemo(() => filterByPeriod(transactions, filter), [transactions, filter])

  const monthlyData = useMemo(
    () => getMonthlyData(filteredTxns),
    [filteredTxns],
  );
  const categoryData = useMemo(
    () => getCategoryBreakdown(filteredTxns),
    [filteredTxns],
  );

  const totalIncome = filteredTxns
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpenses = filteredTxns
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="h-[calc(100vh-2.5rem)] flex flex-col gap-5">
      <main className="flex-1 overflow-y-auto flex flex-col gap-5">
        <header className="flex items-center justify-between rounded-3xl bg-white px-7 py-5 border border-slate-100 shadow-sm shrink-0">
          <div>
            <p className="text-sm text-slate-400 font-medium">Analytics</p>
            <h1 className="mt-0.5 text-2xl font-bold text-slate-900 tracking-tight">
              Financial Overview
            </h1>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-1 border border-slate-100">
            {["Week", "Month", "6 Months", "Year"].map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`rounded-xl px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${filter === opt ? "bg-white text-slate-800 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </header>

        <section className="grid grid-cols-3 gap-5">
          <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <p className="text-sm text-slate-400">Total Balance</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              Rp {(totalIncome - totalExpenses).toLocaleString("id-ID")}
            </p>
          </article>
          <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <p className="text-sm text-slate-400">Total Spending</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              Rp {totalExpenses.toLocaleString("id-ID")}
            </p>
          </article>
          <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <p className="text-sm text-slate-400">Transaction Count</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {filteredTxns.length}
            </p>
          </article>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <p className="text-sm font-medium text-slate-400 mb-4">
              Monthly Income vs Expenses
            </p>
            <MonthlyBarChart data={monthlyData} />
          </article>
          <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <p className="text-sm font-medium text-slate-400 mb-4">
              Spending Breakdown
            </p>
            <DonutChart data={categoryData} />
          </article>
        </section>
      </main>
    </div>
  );
}
