import { useState, useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import ConfirmModal from "../components/ConfirmModal";
import {
  Search, Plus, ChevronLeft, ChevronRight, X, Edit3, Trash2,
  Wallet, Utensils, Bus, Monitor, ShoppingBag, Gamepad2,
  Briefcase, Gift, Home, Zap
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

function TransactionCard({ tx, settings, onEdit, onDelete }) {
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
    <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-4 space-y-3">
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
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(tx)} className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" title="Edit">
            <Edit3 size={14} />
          </button>
          <button onClick={() => onDelete(tx.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20" title="Delete">
            <Trash2 size={14} />
          </button>
          <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${tx.status === "Completed" ? "bg-emerald-500/10 text-emerald-400" :
            tx.status === "Pending" ? "bg-yellow-500/10 text-yellow-500" : "bg-red-500/10 text-red-400"
            }`}>
            {tx.status}
          </span>
        </div>
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
  const { transactions, settings, addTransaction, updateTransaction, deleteTransaction } = useAppContext();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingTx, setEditingTx] = useState(null);
  const [form, setForm] = useState({ merchant: "", category: "Food", amount: "", type: "expense" });
  const [editForm, setEditForm] = useState({ merchant: "", category: "Food", amount: "" });

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
    let result = transactions?.length > 0 ? [...transactions] : [];
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(tx => tx.merchant?.toLowerCase().includes(query) || tx.category?.toLowerCase().includes(query));
    }
    if (filterStatus !== "All") result = result.filter(tx => tx.status === filterStatus);
    if (sortBy === "Newest") result.sort((a, b) => new Date(b.date) - new Date(a.date));
    else if (sortBy === "Highest") result.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
    return result;
  }, [search, filterStatus, sortBy, transactions]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTxns = filteredTransactions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleAdd = async () => {
    const amount = form.type === "expense" ? -Math.abs(Number(form.amount)) : Math.abs(Number(form.amount));
    const saved = await addTransaction({
      merchant: form.merchant,
      category: form.category,
      amount,
      type: form.type,
    });
    if (saved) {
      setForm({ merchant: "", category: "Food", amount: "", type: "expense" });
      setIsModalOpen(false);
      setCurrentPage(1);
      showToast("Transaction added!", "success");
    }
  };

  const handleEdit = (tx) => {
    setEditingTx(tx);
    setEditForm({
      merchant: tx.merchant,
      category: tx.category || "Food",
      amount: String(Math.abs(tx.amount || 0)),
    });
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    const success = await deleteTransaction(deleteId);
    if (success) {
      showToast("Transaction deleted!", "success");
    }
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const amount = Number(editForm.amount);
    const finalAmount = editingTx.amount >= 0 ? Math.abs(amount) : -Math.abs(amount);
    const success = await updateTransaction(editingTx.id, {
      merchant: editForm.merchant,
      category: editForm.category,
      amount: finalAmount,
    });
    if (success) {
      showToast("Transaction updated!", "success");
      setEditingTx(null);
    }
  };

  if (!transactions?.length) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <p className="text-slate-400 mb-2">No transactions yet</p>
        <button onClick={() => setIsModalOpen(true)} className="text-emerald-400 text-sm hover:underline">
          Add your first transaction
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Transactions</h1>
          <p className="text-slate-400 text-sm">Manage your financial activities</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 w-fit">
          <Plus size={16} /> Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search merchant or category..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2 pl-10 pr-3 text-white placeholder:text-slate-500 focus:border-emerald-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-white"
        >
          <option value="All">All Status</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-white"
        >
          <option value="Newest">Newest</option>
          <option value="Highest">Highest Amount</option>
        </select>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden space-y-3">
        {paginatedTxns.map((tx) => (
          // ✅ YANG BENAR
          <TransactionCard key={tx.id} tx={tx} settings={settings} onEdit={handleEdit} onDelete={handleDeleteClick} />
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/30">
              <tr className="border-b border-slate-700">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Merchant</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {paginatedTxns.map((tx) => {
                const { icon: Icon, bg, color } = getCategoryIcon(tx.category);
                const isIncome = tx.type === "income";
                return (
                  <tr key={tx.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${bg} ${color}`}>
                          <Icon size={14} />
                        </div>
                        <span className="text-white">{tx.merchant}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{tx.category}</td>
                    <td className="px-4 py-3 text-slate-400">{formatDate(tx.date)}</td>
                    <td className={`px-4 py-3 font-medium ${isIncome ? "text-emerald-400" : "text-white"}`}>
                      {isIncome ? "+" : "-"} {symbol} {Math.abs(tx.amount).toLocaleString(locale)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${tx.status === "Completed" ? "bg-emerald-500/20 text-emerald-400" :
                        tx.status === "Pending" ? "bg-yellow-500/20 text-yellow-500" : "bg-red-500/20 text-red-400"
                        }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(tx)} className="text-emerald-400 hover:text-emerald-300" title="Edit">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleDeleteClick(tx.id)} className="text-red-400 hover:text-red-300" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Desktop */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
            <span className="text-sm text-slate-400">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} of {filteredTransactions.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-lg bg-slate-800 disabled:opacity-50 text-white hover:bg-slate-700"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-lg bg-slate-800 disabled:opacity-50 text-white hover:bg-slate-700"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Pagination */}
      {totalPages > 1 && (
        <div className="lg:hidden flex justify-center gap-3 mt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-slate-800 disabled:opacity-50 text-white"
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <span className="text-white">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-slate-800 disabled:opacity-50 text-white"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Add Transaction</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Merchant"
                value={form.merchant}
                onChange={(e) => setForm({ ...form, merchant: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder:text-slate-500 focus:border-emerald-500"
              />
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white"
              >
                <option>Food</option><option>Transport</option><option>Gaming</option>
                <option>Internet</option><option>Shopping</option><option>Salary</option>
              </select>
              <input
                type="number"
                placeholder="Amount"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder:text-slate-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setForm({ ...form, type: "expense" })}
                  className={`flex-1 py-2 rounded-xl ${form.type === "expense" ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-400"}`}
                >
                  Expense
                </button>
                <button
                  onClick={() => setForm({ ...form, type: "income" })}
                  className={`flex-1 py-2 rounded-xl ${form.type === "income" ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-400"}`}
                >
                  Income
                </button>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800">
                  Cancel
                </button>
                <button onClick={handleAdd} className="flex-1 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {editingTx && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Edit Transaction</h2>
              <button onClick={() => setEditingTx(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input
                type="text"
                placeholder="Merchant"
                value={editForm.merchant}
                onChange={(e) => setEditForm({ ...editForm, merchant: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white"
                required
              />
              <select
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white"
              >
                <option>Food</option><option>Transport</option><option>Gaming</option>
                <option>Internet</option><option>Shopping</option><option>Salary</option>
              </select>
              <input
                type="number"
                placeholder="Amount"
                value={editForm.amount}
                onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white"
                required
              />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingTx(null)} className="flex-1 py-2 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
      />
    </div>
  );
}