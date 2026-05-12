// src/pages/TransactionPage.jsx
import { useState, useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
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
} from "lucide-react";

const ITEMS_PER_PAGE = 10;

const categoryIcons = {
  Salary: { icon: Briefcase, bg: "bg-emerald-500/10", color: "text-emerald-400" },
  Food: { icon: Utensils, bg: "bg-emerald-500/10", color: "text-emerald-400" },
  Transport: { icon: Bus, bg: "bg-emerald-500/10", color: "text-emerald-400" },
  Internet: { icon: Zap, bg: "bg-emerald-500/10", color: "text-emerald-400" },
  Subscription: { icon: Monitor, bg: "bg-emerald-500/10", color: "text-emerald-400" },
  Gaming: { icon: Gamepad2, bg: "bg-emerald-500/10", color: "text-emerald-400" },
  Shopping: { icon: ShoppingBag, bg: "bg-emerald-500/10", color: "text-emerald-400" },
  Education: { icon: Home, bg: "bg-emerald-500/10", color: "text-emerald-400" },
  Entertainment: { icon: Gift, bg: "bg-emerald-500/10", color: "text-emerald-400" },
  Utilities: { icon: Home, bg: "bg-emerald-500/10", color: "text-emerald-400" },
  Gift: { icon: Gift, bg: "bg-emerald-500/10", color: "text-emerald-400" },
};

function getCategoryIcon(category) {
  return categoryIcons[category] || { icon: Wallet, bg: "bg-slate-800", color: "text-slate-400" };
}

function TransactionCard({ tx, settings }) {
  const { icon: Icon, bg, color } = getCategoryIcon(tx.category);
  const symbol = settings?.currency === "USD" ? "$" : "Rp";
  const locale = settings?.currency === "USD" ? "en-US" : "id-ID";
  const isIncome = tx.type === "income";

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (settings?.date_format === "MM/DD/YYYY") return date.toLocaleDateString("en-US");
    if (settings?.date_format === "YYYY-MM-DD") return dateStr.split("T")[0];
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-4 space-y-3 hover:border-emerald-500/30 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${bg} ${color}`}>
            <Icon size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{tx.merchant}</p>
            <p className="text-xs text-slate-400">{tx.category}</p>
          </div>
        </div>
        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
          tx.status === "Completed" ? "bg-emerald-500/10 text-emerald-400" :
          tx.status === "Pending" ? "bg-yellow-500/10 text-yellow-500" : "bg-red-500/10 text-red-400"
        }`}>
          {tx.status}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">{formatDate(tx.date)}</span>
        <span className={`text-sm font-bold ${isIncome ? "text-emerald-400" : "text-white"}`}>
          {isIncome ? "+" : "-"} {symbol} {Math.abs(tx.amount || 0).toLocaleString(locale)}
        </span>
      </div>
    </div>
  );
}

export default function TransactionPage() {
  const { transactions, settings, addTransaction } = useAppContext();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ merchant: "", category: "Food", amount: "", type: "expense" });

  const symbol = settings?.currency === "USD" ? "$" : "Rp";
  const locale = settings?.currency === "USD" ? "en-US" : "id-ID";

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (settings?.date_format === "MM/DD/YYYY") return date.toLocaleDateString("en-US");
    if (settings?.date_format === "YYYY-MM-DD") return dateStr.split("T")[0];
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  const filteredTransactions = useMemo(() => {
    let result = transactions && transactions.length > 0 ? [...transactions] : [];
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter((tx) => tx.merchant.toLowerCase().includes(query) || tx.category.toLowerCase().includes(query));
    }
    if (filterStatus !== "All") result = result.filter((tx) => tx.status === filterStatus);
    if (sortBy === "Newest") result.sort((a, b) => new Date(b.date) - new Date(a.date));
    else if (sortBy === "Highest") result.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
    return result;
  }, [search, filterStatus, sortBy, transactions]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTxns = filteredTransactions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleAddTransaction = async () => {
    const amount = form.type === "expense" ? -Math.abs(Number(form.amount)) : Math.abs(Number(form.amount));
    const saved = await addTransaction({ merchant: form.merchant, category: form.category, amount, type: form.type });
    if (saved) {
      setForm({ merchant: "", category: "Food", amount: "", type: "expense" });
      setIsModalOpen(false);
      setCurrentPage(1);
    }
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto flex justify-center py-20">
        <div className="text-center">
          <p className="text-slate-400 mb-2">No transactions yet</p>
          <button onClick={() => setIsModalOpen(true)} className="text-emerald-400 hover:text-emerald-300 text-sm">Add your first transaction</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Transactions</h1>
          <p className="text-slate-400 mt-1">Manage and track all your financial activities</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-600 transition-all">
          <Plus size={16} /> Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 min-w-[200px] w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Search merchant or category..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="w-full rounded-xl bg-slate-800/50 border border-slate-700 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500" />
        </div>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="rounded-xl bg-slate-800/50 border border-slate-700 px-4 py-2.5 text-sm text-white focus:border-emerald-500">
          <option value="All">All Status</option><option value="Completed">Completed</option><option value="Pending">Pending</option><option value="Cancelled">Cancelled</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-xl bg-slate-800/50 border border-slate-700 px-4 py-2.5 text-sm text-white focus:border-emerald-500">
          <option value="Newest">Newest</option><option value="Highest">Highest Amount</option>
        </select>
      </div>

      {/* Mobile View */}
      <div className="block lg:hidden space-y-3">
        {paginatedTxns.length === 0 ? <div className="text-center py-12 text-slate-500">No transactions found</div> : paginatedTxns.map((tx) => <TransactionCard key={tx.id} tx={tx} settings={settings} />)}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block rounded-xl bg-slate-900/50 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/30"><tr className="border-b border-slate-700">
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Merchant</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Category</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Amount</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-800">
              {paginatedTxns.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No transactions found</td></tr>
              ) : (
                paginatedTxns.map((tx) => {
                  const { icon: Icon, bg, color } = getCategoryIcon(tx.category);
                  const isIncome = tx.type === "income";
                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4"><div className="flex items-center gap-3"><div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${bg} ${color}`}><Icon size={16} /></div><span className="text-sm font-medium text-white">{tx.merchant}</span></div></td>
                      <td className="px-6 py-4 text-sm text-slate-400">{tx.category}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">{formatDate(tx.date)}</td>
                      <td className={`px-6 py-4 text-sm font-bold ${isIncome ? "text-emerald-400" : "text-white"}`}>{isIncome ? "+" : "-"} {symbol} {Math.abs(tx.amount || 0).toLocaleString(locale)}</td>
                      <td className="px-6 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${tx.status === "Completed" ? "bg-emerald-500/10 text-emerald-400" : tx.status === "Pending" ? "bg-yellow-500/10 text-yellow-500" : "bg-red-500/10 text-red-400"}`}>{tx.status}</span></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Desktop */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800">
            <p className="text-sm text-slate-400">Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} of {filteredTransactions.length}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 disabled:opacity-40"><ChevronLeft size={14} /> Previous</button>
              {[...Array(totalPages)].map((_, i) => (<button key={i} onClick={() => setCurrentPage(i + 1)} className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${currentPage === i + 1 ? "bg-emerald-500 text-white" : "text-slate-400 hover:bg-slate-800"}`}>{i + 1}</button>))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 disabled:opacity-40">Next <ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Pagination */}
      {totalPages > 1 && (
        <div className="flex lg:hidden items-center justify-center gap-2">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium bg-slate-800/50 border border-slate-700 text-white disabled:opacity-40"><ChevronLeft size={14} /> Prev</button>
          <span className="text-sm text-slate-400">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium bg-slate-800/50 border border-slate-700 text-white disabled:opacity-40">Next <ChevronRight size={14} /></button>
        </div>
      )}

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Add Transaction</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <input type="text" value={form.merchant} onChange={(e) => setForm({ ...form, merchant: e.target.value })} placeholder="Merchant" className="w-full rounded-xl bg-slate-800/50 border border-slate-700 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-emerald-500" />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-xl bg-slate-800/50 border border-slate-700 px-4 py-2.5 text-white focus:border-emerald-500">
                <option>Food</option><option>Transport</option><option>Gaming</option><option>Internet</option><option>Subscription</option><option>Shopping</option><option>Salary</option><option>Education</option><option>Entertainment</option>
              </select>
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="Amount" className="w-full rounded-xl bg-slate-800/50 border border-slate-700 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-emerald-500" />
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setForm({ ...form, type: "expense" })} className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${form.type === "expense" ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}>Expense</button>
                <button onClick={() => setForm({ ...form, type: "income" })} className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${form.type === "income" ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}>Income</button>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 rounded-xl border border-slate-700 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800">Cancel</button>
                <button onClick={handleAddTransaction} className="flex-1 rounded-xl bg-emerald-500 py-2 text-sm font-medium text-white hover:bg-emerald-600">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}