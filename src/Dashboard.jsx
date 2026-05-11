// src/Dashboard.jsx
import { useAppContext } from "./context/AppContext";
import { useToast } from "./context/ToastContext";
import { useState, useMemo } from "react";
import { MoreHorizontal, Plus, X } from "lucide-react";

// ── STAT CARD COMPONENT ──
// Menampilkan 1 kartu statistik (Balance / Spending / Investment)
function StatCard({
  label,
  value,
  change,
  positive,
  sub,
  color,
  iconColor,
  icon,
}) {
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
        <p className="mt-1.5 text-2xl font-bold text-slate-900 tracking-tight">
          {value}
        </p>
        <p className="mt-2 flex items-center gap-1.5 text-xs">
          <span
            className={`font-semibold ${positive ? "text-emerald-500" : "text-rose-500"}`}
          >
            {change}
          </span>
          <span className="text-slate-400">{sub}</span>
        </p>
      </div>
    </article>
  );
}

// ── BAR CHART COMPONENT ──
// Menampilkan grafik batang Income vs Expenses per bulan
function BarChart({ transactions }) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const now = new Date();
  const currentYear = now.getFullYear();

  // Hitung data per bulan
  const barData = months.map((month, index) => {
    const monthNum = String(index + 1).padStart(2, "0");
    const monthTxns = transactions.filter((t) => {
      if (!t.date) return false;
      return t.date.startsWith(`${currentYear}-${monthNum}`);
    });

    const income = monthTxns
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const expenses = monthTxns
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

    return {
      month,
      income: income / 1000,
      scheduled: 0,
      expenses: expenses / 1000,
    };
  });

  const maxVal = Math.max(
    ...barData.map((d) => Math.max(d.income, d.expenses)),
    1,
  );

  return (
    <div className="mt-6">
      <div className="flex items-center gap-5 text-xs text-slate-400 mb-4">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
          Income
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-300" />
          Expenses
        </span>
      </div>
      <div className="relative h-52">
        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-slate-300 pointer-events-none pr-2 w-8">
          {[4, 3, 2, 1, 0].map((n) => (
            <span key={n}>
              {n > 0 ? `${((maxVal * n) / 4).toFixed(0)}k` : "0"}
            </span>
          ))}
        </div>
        <div className="ml-8 h-full flex items-end gap-1.5 pb-6">
          {barData.map((d, i) => (
            <div
              key={d.month}
              className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end relative group"
            >
              <div className="flex items-end gap-0.5 w-full justify-center">
                <div
                  className="w-2 rounded-t-full bg-[#8B5CF6] transition-all"
                  style={{ height: `${(d.income / maxVal) * 140}px` }}
                />
                <div
                  className="w-2 rounded-t-full bg-orange-300 transition-all"
                  style={{ height: `${(d.expenses / maxVal) * 140}px` }}
                />
              </div>
              <span className="text-[9px] text-slate-300 mt-1.5">
                {d.month}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── SPENDING GAUGE COMPONENT ──
// Menampilkan gauge chart Income vs Spending bulan ini
function SpendingGauge({ transactions, settings }) {
  const now = new Date();
  const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
  const currentYear = now.getFullYear();

  const thisMonthTxns = transactions.filter((t) => {
    if (!t.date) return false;
    return t.date.startsWith(`${currentYear}-${currentMonth}`);
  });

  const monthlyIncome = thisMonthTxns
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const monthlyExpenses = thisMonthTxns
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  const total = monthlyIncome + monthlyExpenses;
  const incomePct = total > 0 ? monthlyIncome / total : 0;
  const expensePct = total > 0 ? monthlyExpenses / total : 0;

  const r = 90,
    strokeWidth = 22,
    circumference = Math.PI * r;
  const symbol = settings?.currency === "USD" ? "$" : "Rp"; // 🔥 Currency support

  return (
    <div className="flex flex-col items-center mt-4">
      <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
          Income
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-200" />
          Spend
        </span>
      </div>
      <div className="relative w-[220px] h-[120px] overflow-hidden">
        <svg
          width="220"
          height="220"
          viewBox="0 0 220 120"
          className="absolute top-0 left-0"
        >
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
            strokeDasharray={`${incomePct * circumference} ${circumference}`}
            strokeDashoffset="0"
          />
          <path
            d="M 20 110 A 90 90 0 0 1 200 110"
            fill="none"
            stroke="#fed7aa"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${expensePct * circumference} ${circumference}`}
            strokeDashoffset={`${-incomePct * circumference}`}
          />
        </svg>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">
            Spend
          </span>
          <span className="text-xl font-bold text-slate-800">
            {symbol} {(monthlyExpenses / 1000).toFixed(0)}k
          </span>
        </div>
      </div>
    </div>
  );
}

// ── MAIN DASHBOARD COMPONENT ──
export default function Dashboard() {
  const { showToast } = useToast();
  const {
    transactions,
    settings,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useAppContext();

  // 🔥 Helper format amount sesuai currency setting
  const formatAmount = (amount) => {
    const symbol = settings?.currency === "USD" ? "$" : "Rp";
    return `${symbol} ${Math.abs(amount || 0).toLocaleString(settings?.currency === "USD" ? "en-US" : "id-ID")}`;
  };

  const [txSort, setTxSort] = useState("Newest");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    merchant: "",
    category: "Food",
    amount: "",
    type: "expense",
  });
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingTx, setEditingTx] = useState(null);
  const [editForm, setEditForm] = useState({
    merchant: "",
    category: "Food",
    amount: "",
  });

  // 🔥 Hitung statistik bulan ini (Balance, Spending, Investment)
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
    const currentYear = now.getFullYear();
    const symbol = settings?.currency === "USD" ? "$" : "Rp"; // 🔥 Currency support

    const thisMonthTxns = transactions.filter((t) => {
      if (!t.date) return false;
      return t.date.startsWith(`${currentYear}-${currentMonth}`);
    });

    const monthlyIncome = thisMonthTxns
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const monthlyExpenses = thisMonthTxns
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

    const balance = monthlyIncome - monthlyExpenses;
    const txnCount = thisMonthTxns.filter((t) => t.type === "expense").length;

    return [
      {
        label: "Balance",
        value: `${symbol} ${balance.toLocaleString(settings?.currency === "USD" ? "en-US" : "id-ID")}`, // 🔥 Currency
        change:
          monthlyIncome > 0
            ? `${((balance / monthlyIncome) * 100).toFixed(1)}%`
            : "0%",
        positive: balance >= 0,
        sub: "savings rate this month",
        color: "bg-violet-100",
        iconColor: "text-violet-500",
        icon: (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-5 h-5"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        ),
      },
      {
        label: "Spending",
        value: `${symbol} ${monthlyExpenses.toLocaleString(settings?.currency === "USD" ? "en-US" : "id-ID")}`, // 🔥 Currency
        change: `${txnCount} txns`,
        positive: false,
        sub: "this month",
        color: "bg-rose-100",
        iconColor: "text-rose-400",
        icon: (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-5 h-5"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
            <path d="M12 6v6l4 2" />
          </svg>
        ),
      },
      {
        label: "Investment",
        value: `${symbol} ${Math.max(0, balance * 0.3).toLocaleString(settings?.currency === "USD" ? "en-US" : "id-ID")}`, // 🔥 Currency
        change: "30% of balance",
        positive: true,
        sub: "suggested monthly investment",
        color: "bg-amber-100",
        iconColor: "text-amber-500",
        icon: (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-5 h-5"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
        ),
      },
    ];
  }, [transactions, settings]); // 🔥 Tambahin settings dependency

  // Handle submit Add Transaction
  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount =
      form.type === "expense"
        ? -Math.abs(Number(form.amount))
        : Math.abs(Number(form.amount));
    const success = await addTransaction({
      merchant: form.merchant,
      category: form.category,
      amount,
      type: form.type,
    });
    if (success) {
      setIsModalOpen(false);
      setForm({ merchant: "", category: "Food", amount: "", type: "expense" });
      showToast("Transaksi berhasil ditambahkan! ✅", "success");
    }
  };

  // Sort & limit recent transactions
  const sortedTxns = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    const recent = [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    if (txSort === "Oldest") return [...recent].reverse();
    if (txSort === "Highest")
      return [...recent].sort((a, b) => b.amount - a.amount);
    if (txSort === "Lowest")
      return [...recent].sort((a, b) => a.amount - b.amount);
    return recent;
  }, [transactions, txSort]);

  return (
    <div className="mx-auto max-w-[1600px] gap-5">
      <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
        {/* ── HEADER ── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-slate-500 mt-1">
              Welcome back! Here's what's happening with your finances.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-[#8B5CF6] px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
          >
            <Plus size={16} /> Add Transaction
          </button>
        </div>

        {/* ── STATS CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>

        {/* ── CHARTS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Income vs Expenses
            </h2>
            <BarChart transactions={transactions} />
          </div>
          <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Spending Breakdown
            </h2>
            <SpendingGauge transactions={transactions} settings={settings} />
          </div>
        </div>

        {/* ── RECENT TRANSACTIONS ── */}
        <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Recent Transactions
            </h2>
            <select
              value={txSort}
              onChange={(e) => setTxSort(e.target.value)}
              className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-1.5 text-sm text-slate-700"
            >
              <option>Newest</option>
              <option>Oldest</option>
              <option>Highest</option>
              <option>Lowest</option>
            </select>
          </div>

          <table className="w-full">
            <tbody className="divide-y divide-slate-50">
              {sortedTxns.map((tx) => (
                <tr
                  key={tx.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold bg-violet-100 text-[#8B5CF6]">
                        {tx.merchant?.charAt(0) || "?"}
                      </span>
                      <div>
                        <span className="font-medium text-slate-800 text-sm">
                          {tx.merchant}
                        </span>
                        <p className="text-[10px] text-slate-400">{tx.date}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        tx.status === "Completed"
                          ? "bg-emerald-50 text-emerald-600"
                          : tx.status === "Pending"
                            ? "bg-orange-50 text-orange-500"
                            : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      {tx.status || "Completed"}
                    </span>
                  </td>
                  {/* 🔥 Amount dengan currency */}
                  <td
                    className={`py-3.5 text-right font-bold ${tx.type === "income" ? "text-emerald-500" : "text-slate-800"}`}
                  >
                    {tx.type === "income" ? "+" : "-"}
                    {formatAmount(tx.amount)}
                  </td>
                  <td className="py-3.5 pl-4">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === tx.id ? null : tx.id)
                        }
                        className="text-slate-300 hover:text-slate-500"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                      {openMenuId === tx.id && (
                        <div className="absolute right-0 top-8 bg-white rounded-2xl border border-slate-100 shadow-lg z-30 py-2 w-32">
                          <button
                            onClick={() => {
                              setEditingTx(tx);
                              setEditForm({
                                merchant: tx.merchant,
                                category: tx.category || "Food",
                                amount: String(Math.abs(tx.amount || 0)),
                              });
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={async () => {
                              const success = await deleteTransaction(tx.id);
                              if (success)
                                showToast(
                                  "Transaksi berhasil dihapus!",
                                  "success",
                                );
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-rose-500 hover:bg-rose-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── ADD TRANSACTION MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-100 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Add Transaction
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Merchant
                </label>
                <input
                  type="text"
                  value={form.merchant}
                  onChange={(e) =>
                    setForm({ ...form, merchant: e.target.value })
                  }
                  placeholder="Warung Just Is Resto"
                  required
                  className="w-full mt-1 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="w-full mt-1 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
                >
                  <option>Food</option>
                  <option>Transport</option>
                  <option>Gaming</option>
                  <option>Internet</option>
                  <option>Subscription</option>
                  <option>Shopping</option>
                  <option>Salary</option>
                  <option>Education</option>
                  <option>Entertainment</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Amount
                </label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="50000"
                  required
                  className="w-full mt-1 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Type
                </label>
                <div className="flex gap-2 mt-1">
                  {["expense", "income"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm({ ...form, type })}
                      className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${form.type === type ? "bg-[#8B5CF6] text-white" : "bg-slate-50 text-slate-500 border border-slate-100"}`}
                    >
                      {type === "expense" ? "Expense (-)" : "Income (+)"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#8B5CF6] py-2.5 text-sm font-medium text-white hover:bg-violet-700"
                >
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT TRANSACTION MODAL ── */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-100 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Edit Transaction
              </h2>
              <button
                onClick={() => setEditingTx(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const updatedAmount = Number(editForm.amount);
                const finalAmount =
                  editingTx.amount >= 0
                    ? Math.abs(updatedAmount)
                    : -Math.abs(updatedAmount);
                const success = await updateTransaction(editingTx.id, {
                  merchant: editForm.merchant,
                  category: editForm.category,
                  amount: finalAmount,
                });
                if (success) {
                  showToast("Transaksi berhasil diupdate!", "success");
                  setEditingTx(null);
                } else {
                  showToast("Gagal mengupdate transaksi!", "error");
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Merchant
                </label>
                <input
                  type="text"
                  value={editForm.merchant}
                  onChange={(e) =>
                    setEditForm({ ...editForm, merchant: e.target.value })
                  }
                  className="w-full mt-1 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={editForm.category}
                  onChange={(e) =>
                    setEditForm({ ...editForm, category: e.target.value })
                  }
                  className="w-full mt-1 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
                >
                  <option>Food</option>
                  <option>Transport</option>
                  <option>Gaming</option>
                  <option>Internet</option>
                  <option>Subscription</option>
                  <option>Shopping</option>
                  <option>Salary</option>
                  <option>Education</option>
                  <option>Entertainment</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Amount
                </label>
                <input
                  type="number"
                  value={editForm.amount}
                  onChange={(e) =>
                    setEditForm({ ...editForm, amount: e.target.value })
                  }
                  className="w-full mt-1 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#8B5CF6] py-2.5 text-sm font-medium text-white hover:bg-violet-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
