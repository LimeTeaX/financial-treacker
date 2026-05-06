import MessagePage from './pages/MessagePage'
import Analytics from './pages/Analytics'
import TransactionPage from './pages/TransactionPage'
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
  { id: 'home', icon: Home, label: 'Home', active: true, badge: null },
  { id: 'messages', icon: MessageSquare, label: 'Message', active: false, badge: 26 },
  { id: 'analytics', icon: BarChart2, label: 'Analytics', active: false, badge: null },
  { id: 'transactions', icon: ArrowLeftRight, label: 'Transaction', active: false, badge: null },
  { id: 'payment', icon: CreditCard, label: 'Payment', active: false, badge: 12 },
]

const ACCOUNT_ITEMS = [
  { id: 'activity', icon: TrendingUp, label: 'Activity', active: false, badge: null },
  { id: 'support', icon: Headphones, label: 'Support', active: false, badge: null },
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
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-200 px-1.5 text-[10px] font-semibold text-slate-600">
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
  const [activeGoal, setActiveGoal] = useState('First home')
  const [txSort, setTxSort] = useState('Newest')

  return (
    <div className="mx-auto max-w-[1600px] gap-5">
      {/* ── Main Content ── */}
      <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-slate-500 mt-1">Welcome back! Here's what's happening with your finances.</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-2xl bg-[#8B5CF6] px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2">
              <path d="M12 4v16m8-8H4" />
            </svg>
            Add Transaction
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {STATS.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Income vs Expenses</h2>
              <button className="text-slate-300 hover:text-slate-500 transition-colors">
                <MoreHorizontal size={18} />
              </button>
            </div>
            <BarChart />
          </div>

          <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Spending Breakdown</h2>
              <button className="text-slate-300 hover:text-slate-500 transition-colors">
                <MoreHorizontal size={18} />
              </button>
            </div>
            <SpendingGauge />
          </div>
        </div>

        {/* Transactions */}
        <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Recent Transactions</h2>
            <div className="flex items-center gap-2">
              <select
                value={txSort}
                onChange={(e) => setTxSort(e.target.value)}
                className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
              >
                <option>Newest</option>
                <option>Oldest</option>
                <option>Highest</option>
                <option>Lowest</option>
              </select>
              <button className="text-slate-300 hover:text-slate-500 transition-colors">
                <MoreHorizontal size={18} />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {TRANSACTIONS.map((tx, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold ${tx.avatarBg}`}>
                    {tx.avatar}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{tx.name}</p>
                    <p className="text-xs text-slate-400">{tx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${tx.status === 'Completed' ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {tx.status}
                  </p>
                  <p className="text-sm font-bold text-slate-900">{tx.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}