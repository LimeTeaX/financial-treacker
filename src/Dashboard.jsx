import MessagePage from './pages/MessagePage'
import { useState } from 'react'
import {
  Home,
  MessageSquare,
  BarChart2,
  ArrowLeftRight,
  CreditCard,
  TrendingUp,
  Headphones,
  Bell,
  Mail,
  ChevronDown,
  Settings,
  LogOut,
  MoreHorizontal,
  Calendar,
} from 'lucide-react'

const NAV_ITEMS = [
  { icon: Home, label: 'Home', active: true, badge: null },
  { icon: MessageSquare, label: 'Message', active: false, badge: 26 },
  { icon: BarChart2, label: 'Analytics', active: false, badge: null },
  { icon: ArrowLeftRight, label: 'Transaction', active: false, badge: null },
  { icon: CreditCard, label: 'Payment', active: false, badge: 12 },
]

const ACCOUNT_ITEMS = [
  { icon: TrendingUp, label: 'Activity', active: false, badge: null },
  { icon: Headphones, label: 'Support', active: false, badge: null },
]

const STATS = [
  {
    label: 'Balance',
    value: '$32,3900',
    change: '+7.4%',
    positive: true,
    sub: 'than last month',
    color: 'bg-violet-100',
    iconColor: 'text-violet-500',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    label: 'Spending',
    value: '$24,4601',
    change: '+3.4%',
    positive: false,
    sub: 'than last month',
    color: 'bg-rose-100',
    iconColor: 'text-rose-400',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    label: 'Investment',
    value: '$21,8722',
    change: '+11.4%',
    positive: true,
    sub: 'than last month',
    color: 'bg-amber-100',
    iconColor: 'text-amber-500',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
  },
]

const BAR_DATA = [
  { month: 'Jan', income: 62, scheduled: 48, expenses: 38 },
  { month: 'Feb', income: 55, scheduled: 60, expenses: 42 },
  { month: 'Mar', income: 70, scheduled: 52, expenses: 55 },
  { month: 'Apr', income: 85, scheduled: 78, expenses: 60 },
  { month: 'May', income: 58, scheduled: 45, expenses: 35 },
  { month: 'Jun', income: 72, scheduled: 65, expenses: 50 },
  { month: 'Jul', income: 68, scheduled: 55, expenses: 45 },
  { month: 'Aug', income: 60, scheduled: 50, expenses: 40 },
  { month: 'Sep', income: 65, scheduled: 58, expenses: 48 },
  { month: 'Oct', income: 75, scheduled: 62, expenses: 52 },
]

const TRANSACTIONS = [
  {
    name: 'Iva Ryan',
    status: 'In progress',
    date: '22 Jan, 2024',
    amount: '$12,334',
    avatar: 'IR',
    avatarBg: 'bg-rose-200 text-rose-700',
  },
  {
    name: 'Kurt Bates',
    status: 'Completed',
    date: '02 Feb, 2024',
    amount: '$20,652',
    avatar: 'KB',
    avatarBg: 'bg-blue-200 text-blue-700',
  },
  {
    name: 'James Hall',
    status: 'In progress',
    date: '18 May, 2024',
    amount: '$16,328',
    avatar: 'JH',
    avatarBg: 'bg-amber-200 text-amber-700',
  },
  {
    name: 'Kenneth Allen',
    status: 'Completed',
    date: '19 Jan, 2024',
    amount: '$17,652',
    avatar: 'KA',
    avatarBg: 'bg-emerald-200 text-emerald-700',
  },
]

function NavItem({ icon: Icon, label, active, badge, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-200 ${
        active
          ? 'bg-violet-50 border-l-[3px] border-[#8B5CF6] text-[#8B5CF6] font-semibold pl-[13px]'
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
      }`}
    >
      <span
        className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${
          active ? 'bg-violet-100 text-[#8B5CF6]' : 'bg-slate-100 text-slate-500'
        }`}
      >
        <Icon size={16} />
      </span>
      <span className="flex-1 text-sm">{label}</span>
      {badge && (
        <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-200 px-1.5 text-[10px] font-semibold text-slate-600">
          {badge}
        </span>
      )}
    </button>
  )
}

function StatCard({ label, value, change, positive, sub, color, iconColor, icon }) {
  return (
    <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <span
          className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${color} ${iconColor}`}
        >
          {icon}
        </span>
        <button className="text-slate-300 hover:text-slate-500 transition-colors">
          <MoreHorizontal size={18} />
        </button>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-400">{label}</p>
        <p className="mt-1.5 text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
        <p className="mt-2 flex items-center gap-1.5 text-xs">
          <span className={`font-semibold ${positive ? 'text-emerald-500' : 'text-rose-500'}`}>
            {change}
          </span>
          <span className="text-slate-400">{sub}</span>
        </p>
      </div>
    </article>
  )
}

function BarChart() {
  const maxVal = 100
  return (
    <div className="mt-6">
      <div className="flex items-center gap-5 text-xs text-slate-400 mb-4">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
          Income
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-violet-200" />
          Scheduled
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-300" />
          Expenses
        </span>
      </div>
      <div className="relative h-52">
        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-slate-300 pointer-events-none pr-2 w-8">
          {['10k', '10k', '10k', '10k', '0k'].map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </div>
        <div className="ml-8 h-full flex items-end gap-1.5 pb-6">
          {BAR_DATA.map((d, i) => (
            <div
              key={d.month}
              className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end relative group"
            >
              {i === 3 && (
                <div className="absolute inset-x-0 bottom-5 top-1 rounded-xl border-2 border-violet-200 bg-violet-50/40 pointer-events-none" />
              )}
              <div className="flex items-end gap-0.5 w-full justify-center">
                <div
                  className="w-2 rounded-t-full bg-[#8B5CF6] transition-all"
                  style={{ height: `${(d.income / maxVal) * 140}px` }}
                />
                <div
                  className="w-2 rounded-t-full bg-violet-200 transition-all"
                  style={{ height: `${(d.scheduled / maxVal) * 140}px` }}
                />
                <div
                  className="w-2 rounded-t-full bg-orange-300 transition-all"
                  style={{ height: `${(d.expenses / maxVal) * 140}px` }}
                />
              </div>
              <span className="text-[9px] text-slate-300 mt-1.5">{d.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SpendingGauge() {
  const r = 90
  const strokeWidth = 22
  const circumference = Math.PI * r

  return (
    <div className="flex flex-col items-center mt-4">
      <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
          Income
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-violet-200" />
          Scheduled
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-200" />
          Spend
        </span>
      </div>
      <div className="relative w-[220px] h-[120px] overflow-hidden">
        <svg width="220" height="220" viewBox="0 0 220 120" className="absolute top-0 left-0">
          <path
            d="M 20 110 A 90 90 0 0 1 200 110"
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <path
            d="M 20 110 A 90 90 0 0 1 200 110"
            fill="none"
            stroke="#8B5CF6"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${0.45 * circumference} ${circumference}`}
            strokeDashoffset="0"
          />
          <path
            d="M 20 110 A 90 90 0 0 1 200 110"
            fill="none"
            stroke="#ddd6fe"
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
            strokeDasharray={`${0.30 * circumference} ${circumference}`}
            strokeDashoffset={`${-0.45 * circumference}`}
          />
          <path
            d="M 20 110 A 90 90 0 0 1 200 110"
            fill="none"
            stroke="#fed7aa"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${0.25 * circumference} ${circumference}`}
            strokeDashoffset={`${-0.75 * circumference}`}
          />
        </svg>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">
            Spend
          </span>
          <span className="text-xl font-bold text-slate-800">$6,058.94</span>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [activePage, setActivePage] = useState('dashboard')
  const [activeGoal, setActiveGoal] = useState('First home')
  const [txSort, setTxSort] = useState('Newest')

  if (activePage === 'messages') {
  return (
    <MessagePage onBack={() => setActivePage('dashboard')} />
  )
  }

  return (
    <div
      className="min-h-screen bg-[#F8FAFC] text-slate-900"
      style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
    >
      <div className="mx-auto flex h-full min-h-screen max-w-[1600px] gap-5 p-5">
        {/* ── Sidebar ── */}
        <aside className="w-[260px] shrink-0 flex flex-col gap-6 rounded-3xl bg-white p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2.5 px-2 pt-1 pb-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#8B5CF6] text-white text-xs font-bold">
              T
            </span>
            <span className="font-bold text-slate-800 text-lg tracking-tight">Thrive</span>
          </div>

          <div className="flex-1 flex flex-col gap-6">
            <div>
              <p className="px-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-3">
                Main Menu
              </p>
              <nav className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.label}
              {...item}
                onClick={() => {
                  if (item.label === 'Message') setActivePage('messages')
                  if (item.label === 'Home') setActivePage('dashboard')
                }}
            />
          ))}
          </nav>
            </div>

            <div>
              <p className="px-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-3">
                Account Management
              </p>
              <nav className="space-y-1">
                {ACCOUNT_ITEMS.map((item) => (
                  <NavItem key={item.label} {...item} />
                ))}
              </nav>
            </div>
          </div>

          <div className="space-y-1 border-t border-slate-100 pt-4">
            <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-left text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors text-sm">
              <Settings size={15} />
              <span>Setting</span>
            </button>
            <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-left text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors text-sm">
              <LogOut size={15} />
              <span>Log out</span>
            </button>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 min-w-0 flex flex-col gap-5">
          {/* Header */}
          <header className="flex items-center justify-between rounded-3xl bg-white px-7 py-5 border border-slate-100 shadow-sm">
            <div>
              <p className="text-sm text-slate-400 font-medium">Welcome back</p>
              <h1 className="mt-0.5 text-2xl font-bold text-slate-900 tracking-tight">
                Welcome to dashboard
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors border border-slate-100">
                <Mail size={16} />
              </button>
              <button className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors border border-slate-100">
                <Bell size={16} />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#8B5CF6] ring-2 ring-white" />
              </button>
              <div className="flex items-center gap-2.5 rounded-2xl bg-slate-50 px-3 py-2 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-300 to-rose-200 flex items-center justify-center text-xs font-bold text-white">
                  EL
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 leading-none">Eddie Lake</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Dashboard user</p>
                </div>
                <ChevronDown size={14} className="text-slate-400 ml-1" />
              </div>
            </div>
          </header>

          {/* Stats Row */}
          <section className="grid grid-cols-3 gap-5">
            {STATS.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </section>

          {/* Charts Row */}
          <section className="grid gap-5 xl:grid-cols-[1.75fr_1fr]">
            <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400 font-medium">Available Balance</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">
                    $24,450.00
                  </p>
                </div>
                <button className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500 border border-slate-100 hover:bg-slate-100 transition-colors">
                  Week <ChevronDown size={12} />
                </button>
              </div>
              <BarChart />
            </article>

            <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400 font-medium">Spendings</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-2xl font-bold text-slate-900 tracking-tight">$1,232</p>
                    <span className="text-xs font-semibold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">
                      +3.4%
                    </span>
                  </div>
                </div>
                <button className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500 border border-slate-100 hover:bg-slate-100 transition-colors">
                  <Calendar size={11} /> Last 30 Days
                </button>
              </div>
              <SpendingGauge />
            </article>
          </section>

          {/* Bottom Row */}
          <section className="grid gap-5 xl:grid-cols-[0.85fr_1.4fr]">
            {/* Finance Goal */}
            <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm flex flex-col">
              <p className="text-sm font-medium text-slate-500">Tracking your finance goal</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {['First home', 'New car', 'Vacation'].map((goal) => (
                  <button
                    key={goal}
                    onClick={() => setActiveGoal(goal)}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 border ${
                      activeGoal === goal
                        ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
              <div className="mt-6">
                <p className="text-4xl font-bold text-slate-900 tracking-tight">$3,190</p>
                <span className="mt-3 inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-[#8B5CF6]">
                  On track
                </span>
              </div>
              <div className="mt-6">
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#8B5CF6]"
                    style={{ width: '13.3%' }}
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                <span>Future savings: $700</span>
                <span>Target: $24,000</span>
              </div>
            </article>

            {/* Transactions */}
            <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <p className="text-lg font-bold text-slate-900">Transactions</p>
                <div className="flex gap-1.5 rounded-2xl bg-slate-50 p-1 border border-slate-100">
                  {['Newest', 'Oldest'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setTxSort(opt)}
                      className={`rounded-xl px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
                        txSort === opt
                          ? 'bg-white text-slate-800 shadow-sm border border-slate-100'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Name', 'Status', 'Date', 'Amount'].map((h) => (
                      <th
                        key={h}
                        className="pb-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider first:pl-0 last:text-right"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {TRANSACTIONS.map((tx) => (
                    <tr key={tx.name} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${tx.avatarBg}`}
                          >
                            {tx.avatar}
                          </span>
                          <span className="font-medium text-slate-800 text-sm">{tx.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            tx.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-orange-50 text-orange-500'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-slate-400 text-xs">{tx.date}</td>
                      <td className="py-3.5 text-right font-bold text-slate-800">{tx.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
          </section>
        </main>
      </div>
    </div>
  )
}