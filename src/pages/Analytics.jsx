// src/pages/Analytics.jsx
import { useState, useMemo } from 'react'
import { TrendingUp, TrendingDown, PiggyBank, AlertTriangle } from 'lucide-react'
import { TRANSACTIONS, filterByPeriod } from '../data/transactions'

// ── HELPER FUNCTIONS ──
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

function getMonthlyData(transactions) {
  const data = {}
  MONTHS.forEach((month, index) => {
    const monthNum = String(index + 1).padStart(2, '0')
    const monthTxns = transactions.filter(t => t.date.startsWith(`2026-${monthNum}`))
    data[month] = {
      income: monthTxns.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
      expenses: monthTxns.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
    }
  })
  return data
}

function getCategoryBreakdown(transactions) {
  const expenses = transactions.filter(t => t.type === 'expense')
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0)
  const categories = ['Food', 'Internet', 'Subscription', 'Gaming/Top-up']
  
  return categories.map(cat => {
    const amount = expenses.filter(t => t.category === cat).reduce((sum, t) => sum + t.amount, 0)
    return {
      category: cat,
      amount,
      percentage: totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : 0,
    }
  })
}

function getComparison(currentMonth, previousMonth, type) {
  if (!previousMonth || previousMonth[type] === 0) return { change: 0, positive: true }
  const change = ((currentMonth[type] - previousMonth[type]) / previousMonth[type] * 100).toFixed(1)
  return {
    change: Math.abs(change),
    positive: type === 'income' ? change >= 0 : change <= 0,
  }
}

// ── SVG DONUT CHART ──
function DonutChart({ data }) {
  const total = data.reduce((sum, d) => sum + d.amount, 0)
  const colors = ['#8B5CF6', '#F59E0B', '#EF4444', '#3B82F6']
  let cumulativePercent = 0

  const slices = data.map((item, index) => {
    const percent = total > 0 ? item.amount / total : 0
    const startPercent = cumulativePercent
    cumulativePercent += percent

    const startAngle = startPercent * 360
    const endAngle = cumulativePercent * 360

    const startRad = (startAngle - 90) * Math.PI / 180
    const endRad = (endAngle - 90) * Math.PI / 180

    const r = 70
    const cx = 100, cy = 100
    const x1 = cx + r * Math.cos(startRad)
    const y1 = cy + r * Math.sin(startRad)
    const x2 = cx + r * Math.cos(endRad)
    const y2 = cy + r * Math.sin(endRad)

    const largeArc = percent > 0.5 ? 1 : 0

    return { path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`, color: colors[index], ...item }
  })

  return (
    <div className="flex items-center gap-6">
      <svg width="200" height="200" viewBox="0 0 200 200">
        {slices.map((slice) => (
          <path key={slice.category} d={slice.path} fill={slice.color} stroke="white" strokeWidth="2" />
        ))}
        <circle cx="100" cy="100" r="45" fill="white" />
        <text x="100" y="95" textAnchor="middle" className="text-lg font-bold fill-slate-800">Rp</text>
        <text x="100" y="115" textAnchor="middle" className="text-sm font-semibold fill-slate-600">
          {(total / 1000).toFixed(0)}k
        </text>
      </svg>

      <div className="space-y-2">
        {slices.map((slice) => (
          <div key={slice.category} className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: slice.color }} />
            <span className="text-slate-600">{slice.category}</span>
            <span className="text-slate-400 ml-auto">{slice.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── BAR CHART ──
function MonthlyBarChart({ data }) {
  const maxVal = Math.max(...Object.values(data).map(d => Math.max(d.income, d.expenses)), 1)

  return (
    <div className="relative h-56">
      <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-slate-300 w-10">
        {[4, 3, 2, 1, 0].map(n => (
          <span key={n}>{n > 0 ? `${(maxVal / 1000000 * n / 4).toFixed(0)}jt` : '0'}</span>
        ))}
      </div>

      <div className="ml-10 h-full flex items-end gap-2 pb-6">
        {Object.entries(data).map(([month, values]) => (
          <div key={month} className="flex-1 flex flex-col items-center h-full justify-end">
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
  )
}

// ── SAVING GOAL ──
function SavingGoal() {
  const target = 12000000
  const saved = 3190000
  const percent = ((saved / target) * 100).toFixed(1)

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-600">🎯 Target: Laptop Gaming</span>
        <span className="text-xs text-slate-400">Rp {(target / 1000000).toFixed(0)}jt</span>
      </div>
      <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-violet-400 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs font-semibold text-[#8B5CF6]">Rp {(saved / 1000000).toFixed(1)}jt terkumpul</span>
        <span className="text-xs text-slate-400">{percent}%</span>
      </div>
    </div>
  )
}

// ── MAIN COMPONENT ──
export default function Analytics() {
  const [filter, setFilter] = useState('6 Months')
  
  // Filter transaksi berdasarkan periode
  const filteredTxns = useMemo(() => filterByPeriod(TRANSACTIONS, filter), [filter])
  
  const monthlyData = useMemo(() => getMonthlyData(filteredTxns), [filteredTxns])
  const categoryData = useMemo(() => getCategoryBreakdown(filteredTxns), [filteredTxns])

  // Totals
  const totalIncome = filteredTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpenses = filteredTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const savingsRate = totalIncome > 0 ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1) : 0

  // This month vs last month
  const thisMonthData = monthlyData[MONTHS[MONTHS.length - 1]]
  const lastMonthData = monthlyData[MONTHS[MONTHS.length - 2]]
  const incomeComp = getComparison(thisMonthData, lastMonthData, 'income')
  const expenseComp = getComparison(thisMonthData, lastMonthData, 'expenses')

  // Gaming spending check
  const gamingTotal = categoryData.find(c => c.category === 'Gaming/Top-up')?.amount || 0
  const gamingPercent = totalExpenses > 0 ? ((gamingTotal / totalExpenses) * 100).toFixed(0) : 0
  const gamingWarning = gamingPercent > 20

  return (
    <div className="h-[calc(100vh-2.5rem)] flex flex-col gap-5">
      <main className="flex-1 overflow-y-auto flex flex-col gap-5">
        
        {/* Header */}
        <header className="flex items-center justify-between rounded-3xl bg-white px-7 py-5 border border-slate-100 shadow-sm shrink-0">
          <div>
            <p className="text-sm text-slate-400 font-medium">Analytics</p>
            <h1 className="mt-0.5 text-2xl font-bold text-slate-900 tracking-tight">Financial Overview</h1>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-1 border border-slate-100">
            {['Week', 'Month', '6 Months', 'Year'].map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`rounded-xl px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  filter === opt
                    ? 'bg-white text-slate-800 shadow-sm border border-slate-100'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </header>

        {/* Top Stat Cards */}
        <section className="grid grid-cols-3 gap-5">
          <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 text-[#8B5CF6]">
                <PiggyBank size={20} />
              </span>
              <p className="text-sm font-medium text-slate-400">Total Balance</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">Rp {(totalIncome - totalExpenses).toLocaleString('id-ID')}</p>
            <p className="mt-2 flex items-center gap-1.5 text-xs">
              <span className={`font-semibold ${incomeComp.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
                {incomeComp.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {incomeComp.change}%
              </span>
              <span className="text-slate-400">vs last month</span>
            </p>
          </article>

          <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-500">
                <TrendingDown size={20} />
              </span>
              <p className="text-sm font-medium text-slate-400">Total Spending</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">Rp {totalExpenses.toLocaleString('id-ID')}</p>
            <p className="mt-2 flex items-center gap-1.5 text-xs">
              <span className={`font-semibold ${expenseComp.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
                {expenseComp.positive ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                {expenseComp.change}%
              </span>
              <span className="text-slate-400">vs last month</span>
            </p>
          </article>

          <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-500">
                <TrendingUp size={20} />
              </span>
              <p className="text-sm font-medium text-slate-400">Savings Rate</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">{savingsRate}%</p>
            <p className="mt-2 text-xs text-slate-400">from total income</p>
          </article>
        </section>

        {/* Charts Row */}
        <section className="grid gap-5 xl:grid-cols-2">
          <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <p className="text-sm font-medium text-slate-400 mb-4">Monthly Income vs Expenses</p>
            <MonthlyBarChart data={monthlyData} />
          </article>

          <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <p className="text-sm font-medium text-slate-400 mb-4">Spending Breakdown</p>
            <DonutChart data={categoryData} />
          </article>
        </section>

        {/* Bottom Row */}
        <section className="grid gap-5 xl:grid-cols-2">
          <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <SavingGoal />
            <div className="mt-4 p-4 rounded-2xl bg-violet-50 border border-violet-100">
              <p className="text-xs text-violet-600 font-medium">
                💡 Tips: Sisihkan Rp 50.000/hari. Dalam 8 bulan kamu bisa beli laptop impian!
              </p>
            </div>
          </article>

          <article className={`rounded-3xl bg-white p-6 border shadow-sm ${
            gamingWarning ? 'border-amber-200' : 'border-slate-100'
          }`}>
            <div className="flex items-start gap-3">
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${
                gamingWarning ? 'bg-amber-100 text-amber-500' : 'bg-emerald-100 text-emerald-500'
              }`}>
                <AlertTriangle size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {gamingWarning ? '⚠️ Spending Alert' : '✅ Great Job!'}
                </p>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {gamingWarning
                    ? `Lu udah habisin ${gamingPercent}% dari total pengeluaran buat MLBB top-up bulan ini. Mending sisihin buat semester depan di USU, bre!`
                    : 'Pengeluaran lu sehat! Tetap konsisten dan kejar target tabungan laptop gaming.'
                  }
                </p>
                {gamingWarning && (
                  <button className="mt-3 text-xs font-semibold text-[#8B5CF6] hover:text-violet-700 transition-colors">
                    Set spending limit →
                  </button>
                )}
              </div>
            </div>
          </article>
        </section>

      </main>
    </div>
  )
}