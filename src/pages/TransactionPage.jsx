// src/pages/TransactionPage.jsx
import { useState, useMemo } from "react";
import { useAppContext } from '../context/AppContext'
import {
  Search, Plus, ChevronLeft, ChevronRight, X,
  Wallet, Utensils, Bus, Monitor, ShoppingBag,
  Gamepad2, Briefcase, Gift, Home, Zap,
} from "lucide-react";

const ITEMS_PER_PAGE = 10;

// ── CATEGORY ICONS ──
// Map ikon & warna untuk setiap kategori transaksi
const categoryIcons = {
  Salary: { icon: Briefcase, bg: "bg-emerald-100", color: "text-emerald-600" },
  Food: { icon: Utensils, bg: "bg-orange-100", color: "text-orange-600" },
  Transport: { icon: Bus, bg: "bg-blue-100", color: "text-blue-600" },
  Internet: { icon: Zap, bg: "bg-indigo-100", color: "text-indigo-600" },
  Subscription: { icon: Monitor, bg: "bg-violet-100", color: "text-violet-600" },
  Gaming: { icon: Gamepad2, bg: "bg-purple-100", color: "text-purple-600" },
  Shopping: { icon: ShoppingBag, bg: "bg-pink-100", color: "text-pink-600" },
  Education: { icon: Home, bg: "bg-teal-100", color: "text-teal-600" },
  Entertainment: { icon: Gift, bg: "bg-rose-100", color: "text-rose-600" },
  Utilities: { icon: Home, bg: "bg-amber-100", color: "text-amber-600" },
  Gift: { icon: Gift, bg: "bg-cyan-100", color: "text-cyan-600" },
};

// Ambil ikon kategori, fallback ke Wallet kalau gak ditemukan
function getCategoryIcon(category) {
  return categoryIcons[category] || { icon: Wallet, bg: "bg-slate-100", color: "text-slate-500" };
}

// ── MOBILE CARD ──
// Tampilan kartu transaksi untuk layar kecil (mobile)
function TransactionCard({ tx, settings }) {
  const { icon: Icon, bg, color } = getCategoryIcon(tx.category);
  const symbol = settings?.currency === 'USD' ? '$' : 'Rp';
  const locale = settings?.currency === 'USD' ? 'en-US' : 'id-ID';

  // Format tanggal sesuai setting
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (settings?.date_format === 'MM/DD/YYYY') return date.toLocaleDateString('en-US');
    if (settings?.date_format === 'YYYY-MM-DD') return dateStr.split('T')[0];
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

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
        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
          tx.status === "Completed" ? "bg-emerald-50 text-emerald-600" :
          tx.status === "Pending" ? "bg-orange-50 text-orange-500" : "bg-rose-50 text-rose-600"
        }`}>{tx.status}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">{formatDate(tx.date)}</span>
        {/* 🔥 Currency support */}
        <span className={`text-sm font-bold ${tx.amount >= 0 ? "text-emerald-500" : "text-slate-800"}`}>
          {tx.amount >= 0 ? '+' : '-'}{symbol} {Math.abs(tx.amount || 0).toLocaleString(locale)}
        </span>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ──
export default function TransactionPage() {
  const { transactions, settings } = useAppContext();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🔥 Format mata uang sesuai setting
  const symbol = settings?.currency === 'USD' ? '$' : 'Rp';
  const locale = settings?.currency === 'USD' ? 'en-US' : 'id-ID';

  // 🔥 Format tanggal sesuai setting
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (settings?.date_format === 'MM/DD/YYYY') return date.toLocaleDateString('en-US');
    if (settings?.date_format === 'YYYY-MM-DD') return dateStr.split('T')[0];
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Filter & Sort Logic
  const filteredTransactions = useMemo(() => {
    let result = transactions && transactions.length > 0 ? [...transactions] : [];
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(tx => tx.merchant.toLowerCase().includes(query) || tx.category.toLowerCase().includes(query));
    }
    if (filterStatus !== "All") result = result.filter(tx => tx.status === filterStatus);
    if (sortBy === "Newest") result.sort((a, b) => new Date(b.date) - new Date(a.date));
    else if (sortBy === "Highest") result.sort((a, b) => b.amount - a.amount);
    return result;
  }, [search, filterStatus, sortBy, transactions]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTxns = filteredTransactions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="h-[calc(100vh-2.5rem)] flex flex-col gap-5">
      <main className="flex-1 flex flex-col gap-5">
        {/* ── HEADER ── */}
        <header className="flex items-center justify-between rounded-3xl bg-white px-7 py-5 border border-slate-100 shadow-sm shrink-0">
          <div>
            <p className="text-sm text-slate-400 font-medium">Finance</p>
            <h1 className="mt-0.5 text-2xl font-bold text-slate-900 tracking-tight">Transactions</h1>
          </div>
          <button onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8B5CF6] text-white text-sm font-medium hover:bg-violet-700 transition-colors">
            <Plus size={16} /> Add New
          </button>
        </header>

        {/* ── FILTERS ── */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search merchant or category..." value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full rounded-2xl bg-white border border-slate-100 py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20" />
          </div>
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="rounded-2xl bg-white border border-slate-100 px-4 py-2.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20">
            <option value="All">All Status</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="rounded-2xl bg-white border border-slate-100 px-4 py-2.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20">
            <option value="Newest">Newest</option>
            <option value="Highest">Highest Amount</option>
          </select>
        </div>

        {/* ── MOBILE VIEW ── */}
        <div className="block md:hidden space-y-3">
          {paginatedTxns.length === 0 ? (
            <div className="text-center py-12 text-slate-400"><p className="text-lg font-medium">No transactions found</p></div>
          ) : (
            paginatedTxns.map((tx) => <TransactionCard key={tx.id} tx={tx} settings={settings} />)
          )}
        </div>

        {/* ── DESKTOP TABLE ── */}
        <article className="hidden md:block rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {["Merchant", "Category", "Date", "Amount", "Status"].map(h => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedTxns.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No transactions found</td></tr>
                ) : (
                  paginatedTxns.map((tx) => {
                    const { icon: Icon, bg, color } = getCategoryIcon(tx.category);
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${bg} ${color}`}><Icon size={16} /></span>
                            <span className="text-sm font-medium text-slate-800">{tx.merchant}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">{tx.category}</td>
                        <td className="px-6 py-4 text-sm text-slate-400">{formatDate(tx.date)}</td>
                        {/* 🔥 Currency support */}
                        <td className={`px-6 py-4 text-sm font-bold ${tx.amount >= 0 ? "text-emerald-500" : "text-slate-800"}`}>
                          {tx.amount >= 0 ? '+' : '-'}{symbol} {Math.abs(tx.amount || 0).toLocaleString(locale)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            tx.status === "Completed" ? "bg-emerald-50 text-emerald-600" :
                            tx.status === "Pending" ? "bg-orange-50 text-orange-500" : "bg-rose-50 text-rose-600"
                          }`}>{tx.status}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── PAGINATION ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
              <p className="text-sm text-slate-400">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} of {filteredTransactions.length}
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft size={14} /> Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i + 1)}
                    className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${currentPage === i + 1 ? "bg-[#8B5CF6] text-white" : "text-slate-500 hover:bg-slate-100"}`}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </article>

        {/* ── MOBILE PAGINATION ── */}
        {totalPages > 1 && (
          <div className="flex md:hidden items-center justify-center gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-medium bg-white border border-slate-100 text-slate-600 disabled:opacity-40 transition-colors">
              <ChevronLeft size={14} /> Prev
            </button>
            <span className="text-sm text-slate-400">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-medium bg-white border border-slate-100 text-slate-600 disabled:opacity-40 transition-colors">
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </main>

      {/* ── ADD MODAL (SIMPEL) ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-100 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Add Transaction</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Merchant" className="w-full rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20" />
              <input type="number" placeholder="Amount" className="w-full rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20" />
              <div className="flex gap-3">
                <button onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl bg-[#8B5CF6] py-2 text-sm font-medium text-white hover:bg-violet-700">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}