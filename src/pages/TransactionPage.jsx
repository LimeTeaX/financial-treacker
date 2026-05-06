// src/pages/TransactionPage.jsx
import { useState, useMemo } from 'react'
import {
  Search,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowUpDown,
  Wallet,
  Utensils,
  Bus,
  Monitor,
  ShoppingBag,
  Gamepad2,
  Briefcase,
  Gift,
  Home,
  Zap,
} from 'lucide-react'

// ── MOCK DATA: 55 TRANSACTIONS ──
const MOCK_TRANSACTIONS = [
  { id: 1, date: '2026-05-06', merchant: 'Gaji Bulanan', category: 'Salary', amount: 5000000, status: 'Completed' },
  { id: 2, date: '2026-05-05', merchant: 'Warung Just Is Resto', category: 'Food', amount: -45000, status: 'Completed' },
  { id: 3, date: '2026-05-05', merchant: 'Top-up MLBB', category: 'Gaming', amount: -150000, status: 'Completed' },
  { id: 4, date: '2026-05-04', merchant: 'IndiHome Internet', category: 'Internet', amount: -350000, status: 'Completed' },
  { id: 5, date: '2026-05-04', merchant: 'Spotify Premium', category: 'Subscription', amount: -54990, status: 'Completed' },
  { id: 6, date: '2026-05-03', merchant: 'Gojek (Makan Siang)', category: 'Food', amount: -35000, status: 'Completed' },
  { id: 7, date: '2026-05-03', merchant: 'Top-up Genshin', category: 'Gaming', amount: -200000, status: 'Cancelled' },
  { id: 8, date: '2026-05-02', merchant: 'Listrik PLN', category: 'Utilities', amount: -250000, status: 'Pending' },
  { id: 9, date: '2026-05-02', merchant: 'Freelance Design', category: 'Salary', amount: 1500000, status: 'Completed' },
  { id: 10, date: '2026-05-01', merchant: 'Netflix Subscription', category: 'Subscription', amount: -120000, status: 'Completed' },
  { id: 11, date: '2026-05-01', merchant: 'Grab (Ke Kampus)', category: 'Transport', amount: -25000, status: 'Completed' },
  { id: 12, date: '2026-04-30', merchant: 'Bakso Pak Kumis', category: 'Food', amount: -28000, status: 'Completed' },
  { id: 13, date: '2026-04-30', merchant: 'Top-up Valorant', category: 'Gaming', amount: -100000, status: 'Completed' },
  { id: 14, date: '2026-04-29', merchant: 'Beli Buku Kuliah', category: 'Education', amount: -350000, status: 'Completed' },
  { id: 15, date: '2026-04-28', merchant: 'Nonton Bioskop', category: 'Entertainment', amount: -40000, status: 'Completed' },
  { id: 16, date: '2026-04-28', merchant: 'Jajan Indomaret', category: 'Food', amount: -15000, status: 'Completed' },
  { id: 17, date: '2026-04-27', merchant: 'Pulsa XL', category: 'Internet', amount: -50000, status: 'Completed' },
  { id: 18, date: '2026-04-26', merchant: 'YouTube Premium', category: 'Subscription', amount: -59000, status: 'Pending' },
  { id: 19, date: '2026-04-25', merchant: 'Joki Tugas', category: 'Education', amount: -150000, status: 'Completed' },
  { id: 20, date: '2026-04-25', merchant: 'Gaji Freelance', category: 'Salary', amount: 2000000, status: 'Completed' },
  { id: 21, date: '2026-04-24', merchant: 'Bensin Motor', category: 'Transport', amount: -50000, status: 'Completed' },
  { id: 22, date: '2026-04-23', merchant: 'Pecel Lele Lampung', category: 'Food', amount: -20000, status: 'Completed' },
  { id: 23, date: '2026-04-22', merchant: 'Top-up Free Fire', category: 'Gaming', amount: -75000, status: 'Cancelled' },
  { id: 24, date: '2026-04-21', merchant: 'IndiHome Internet', category: 'Internet', amount: -350000, status: 'Completed' },
  { id: 25, date: '2026-04-20', merchant: 'Bakso Bakar', category: 'Food', amount: -25000, status: 'Completed' },
  { id: 26, date: '2026-04-19', merchant: 'Steam Wallet', category: 'Gaming', amount: -120000, status: 'Completed' },
  { id: 27, date: '2026-04-18', merchant: 'GoCar (Pulang)', category: 'Transport', amount: -40000, status: 'Completed' },
  { id: 28, date: '2026-04-17', merchant: 'Beli Charger HP', category: 'Shopping', amount: -85000, status: 'Completed' },
  { id: 29, date: '2026-04-16', merchant: 'Disney+ Hotstar', category: 'Subscription', amount: -39000, status: 'Pending' },
  { id: 30, date: '2026-04-15', merchant: 'Gaji Bulanan', category: 'Salary', amount: 5000000, status: 'Completed' },
  { id: 31, date: '2026-04-14', merchant: 'Martabak Manis', category: 'Food', amount: -35000, status: 'Completed' },
  { id: 32, date: '2026-04-13', merchant: 'Top-up Mobile Legend', category: 'Gaming', amount: -200000, status: 'Completed' },
  { id: 33, date: '2026-04-12', merchant: 'Aqua Galon', category: 'Utilities', amount: -22000, status: 'Completed' },
  { id: 34, date: '2026-04-11', merchant: 'Jilbab Online', category: 'Shopping', amount: -150000, status: 'Completed' },
  { id: 35, date: '2026-04-10', merchant: 'Freelance Web Dev', category: 'Salary', amount: 3000000, status: 'Completed' },
  { id: 36, date: '2026-04-09', merchant: 'Chatime Boba', category: 'Food', amount: -30000, status: 'Completed' },
  { id: 37, date: '2026-04-08', merchant: 'Top-up Genshin', category: 'Gaming', amount: -300000, status: 'Cancelled' },
  { id: 38, date: '2026-04-07', merchant: 'Parkir Mall', category: 'Transport', amount: -5000, status: 'Completed' },
  { id: 39, date: '2026-04-06', merchant: 'Beli Casing HP', category: 'Shopping', amount: -50000, status: 'Completed' },
  { id: 40, date: '2026-04-05', merchant: 'IndiHome Internet', category: 'Internet', amount: -350000, status: 'Completed' },
  { id: 41, date: '2026-04-04', merchant: 'Nasi Padang', category: 'Food', amount: -25000, status: 'Completed' },
  { id: 42, date: '2026-04-03', merchant: 'Ojol (Ke Kost)', category: 'Transport', amount: -15000, status: 'Completed' },
  { id: 43, date: '2026-04-02', merchant: 'Spotify Premium', category: 'Subscription', amount: -54990, status: 'Completed' },
  { id: 44, date: '2026-04-01', merchant: 'Token Listrik', category: 'Utilities', amount: -100000, status: 'Completed' },
  { id: 45, date: '2026-03-30', merchant: 'Kado Ultah Teman', category: 'Gift', amount: -100000, status: 'Completed' },
  { id: 46, date: '2026-03-29', merchant: 'Nonton MotoGP', category: 'Entertainment', amount: -75000, status: 'Completed' },
  { id: 47, date: '2026-03-28', merchant: 'Bakso Granat', category: 'Food', amount: -20000, status: 'Completed' },
  { id: 48, date: '2026-03-27', merchant: 'Top-up FF', category: 'Gaming', amount: -50000, status: 'Cancelled' },
  { id: 49, date: '2026-03-26', merchant: 'GoFood (Mie Ayam)', category: 'Food', amount: -18000, status: 'Completed' },
  { id: 50, date: '2026-03-25', merchant: 'Netflix', category: 'Subscription', amount: -120000, status: 'Completed' },
  { id: 51, date: '2026-03-24', merchant: 'Beli Headset', category: 'Shopping', amount: -250000, status: 'Completed' },
  { id: 52, date: '2026-03-23', merchant: 'Transport Bus', category: 'Transport', amount: -13000, status: 'Completed' },
  { id: 53, date: '2026-03-22', merchant: 'Jajan Pasar', category: 'Food', amount: -10000, status: 'Completed' },
  { id: 54, date: '2026-03-21', merchant: 'Top-up CODM', category: 'Gaming', amount: -80000, status: 'Pending' },
  { id: 55, date: '2026-03-20', merchant: 'Gaji Bulanan', category: 'Salary', amount: 5000000, status: 'Completed' },
]

const ITEMS_PER_PAGE = 10

// ── CATEGORY ICONS ──
const categoryIcons = {
  Salary: { icon: Briefcase, bg: 'bg-emerald-100', color: 'text-emerald-600' },
  Food: { icon: Utensils, bg: 'bg-orange-100', color: 'text-orange-600' },
  Transport: { icon: Bus, bg: 'bg-blue-100', color: 'text-blue-600' },
  Internet: { icon: Zap, bg: 'bg-indigo-100', color: 'text-indigo-600' },
  Subscription: { icon: Monitor, bg: 'bg-violet-100', color: 'text-violet-600' },
  Gaming: { icon: Gamepad2, bg: 'bg-purple-100', color: 'text-purple-600' },
  Shopping: { icon: ShoppingBag, bg: 'bg-pink-100', color: 'text-pink-600' },
  Education: { icon: Home, bg: 'bg-teal-100', color: 'text-teal-600' },
  Entertainment: { icon: Gift, bg: 'bg-rose-100', color: 'text-rose-600' },
  Utilities: { icon: Home, bg: 'bg-amber-100', color: 'text-amber-600' },
  Gift: { icon: Gift, bg: 'bg-cyan-100', color: 'text-cyan-600' },
}

function getCategoryIcon(category) {
  return categoryIcons[category] || { icon: Wallet, bg: 'bg-slate-100', color: 'text-slate-500' }
}

function formatCurrency(amount) {
  const prefix = amount >= 0 ? '+Rp ' : '-Rp '
  return prefix + Math.abs(amount).toLocaleString('id-ID')
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── MODAL COMPONENT ──
function AddTransactionModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-100 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Add Transaction</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Merchant</label>
            <input type="text" placeholder="Warung Just Is Resto" className="w-full mt-1 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</label>
            <select className="w-full mt-1 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20">
              <option>Food</option>
              <option>Transport</option>
              <option>Gaming</option>
              <option>Internet</option>
              <option>Subscription</option>
              <option>Shopping</option>
              <option>Salary</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</label>
            <input type="number" placeholder="50000" className="w-full mt-1 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20" />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</label>
              <select className="w-full mt-1 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20">
                <option>Expense</option>
                <option>Income</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</label>
              <select className="w-full mt-1 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20">
                <option>Completed</option>
                <option>Pending</option>
                <option>Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={onClose} className="flex-1 rounded-xl bg-[#8B5CF6] py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors">
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

// ── MOBILE CARD ──
function TransactionCard({ tx }) {
  const { icon: Icon, bg, color } = getCategoryIcon(tx.category)

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${bg} ${color}`}>
            <Icon size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">{tx.merchant}</p>
            <p className="text-xs text-slate-400">{tx.category}</p>
          </div>
        </div>
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            tx.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
            tx.status === 'Pending' ? 'bg-orange-50 text-orange-500' :
            'bg-rose-50 text-rose-600'
          }`}
        >
          {tx.status}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">{formatDate(tx.date)}</span>
        <span className={`text-sm font-bold ${tx.amount >= 0 ? 'text-emerald-500' : 'text-slate-800'}`}>
          {formatCurrency(tx.amount)}
        </span>
      </div>
    </div>
  )
}

// ── MAIN COMPONENT ──
export default function TransactionPage() {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [sortBy, setSortBy] = useState('Newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filter & Sort Logic
  const filteredTransactions = useMemo(() => {
    let result = [...MOCK_TRANSACTIONS]

    // Search
    if (search.trim()) {
      const query = search.toLowerCase()
      result = result.filter(tx =>
        tx.merchant.toLowerCase().includes(query) ||
        tx.category.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (filterStatus !== 'All') {
      result = result.filter(tx => tx.status === filterStatus)
    }

    // Sort
    if (sortBy === 'Newest') {
      result.sort((a, b) => new Date(b.date) - new Date(a.date))
    } else if (sortBy === 'Highest') {
      result.sort((a, b) => b.amount - a.amount)
    }

    return result
  }, [search, filterStatus, sortBy])

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE)
  const paginatedTxns = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <div className="h-[calc(100vh-2.5rem)] flex flex-col gap-5">
      <main className="flex-1 flex flex-col gap-5">
        {/* Header */}
        <header className="flex items-center justify-between rounded-3xl bg-white px-7 py-5 border border-slate-100 shadow-sm">
          <div>
            <p className="text-sm text-slate-400 font-medium">Finance</p>
            <h1 className="mt-0.5 text-2xl font-bold text-slate-900 tracking-tight">
              Transactions
            </h1>
          </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8B5CF6] text-white text-sm font-medium hover:bg-violet-700 transition-colors"
            >
              <Plus size={16} />
              Add New
            </button>
          </header>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search merchant or category..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                className="w-full rounded-2xl bg-white border border-slate-100 py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1) }}
              className="rounded-2xl bg-white border border-slate-100 px-4 py-2.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
            >
              <option value="All">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-2xl bg-white border border-slate-100 px-4 py-2.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
            >
              <option value="Newest">Newest</option>
              <option value="Highest">Highest Amount</option>
            </select>
          </div>

          {/* ── MOBILE VIEW ── */}
          <div className="block md:hidden space-y-3">
            {paginatedTxns.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p className="text-lg font-medium">No transactions found</p>
                <p className="text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              paginatedTxns.map(tx => <TransactionCard key={tx.id} tx={tx} />)
            )}
          </div>

          {/* ── DESKTOP TABLE ── */}
          <article className="hidden md:block rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    {['Merchant', 'Category', 'Date', 'Amount', 'Status'].map((h) => (
                      <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedTxns.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                        <p className="text-lg font-medium">No transactions found</p>
                        <p className="text-sm mt-1">Try adjusting your filters</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedTxns.map((tx) => {
                      const { icon: Icon, bg, color } = getCategoryIcon(tx.category)
                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${bg} ${color}`}>
                                <Icon size={16} />
                              </span>
                              <span className="text-sm font-medium text-slate-800">{tx.merchant}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">{tx.category}</td>
                          <td className="px-6 py-4 text-sm text-slate-400">{formatDate(tx.date)}</td>
                          <td className={`px-6 py-4 text-sm font-bold ${tx.amount >= 0 ? 'text-emerald-500' : 'text-slate-800'}`}>
                            {formatCurrency(tx.amount)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                tx.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                                tx.status === 'Pending' ? 'bg-orange-50 text-orange-500' :
                                'bg-rose-50 text-rose-600'
                              }`}
                            >
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                <p className="text-sm text-slate-400">
                  Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} of {filteredTransactions.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === i + 1
                          ? 'bg-[#8B5CF6] text-white'
                          : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </article>

          {/* Mobile Pagination */}
          {totalPages > 1 && (
            <div className="flex md:hidden items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-medium bg-white border border-slate-100 text-slate-600 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <span className="text-sm text-slate-400">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-medium bg-white border border-slate-100 text-slate-600 disabled:opacity-40 transition-colors"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </main>

      {/* Modal */}
      <AddTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}