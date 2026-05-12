// src/Dashboard.jsx
import { useAppContext } from "./context/AppContext";
import { useToast } from "./context/ToastContext";
import { useState, useMemo } from "react";
import { MoreHorizontal, Plus, X, TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";

// ── STAT CARD COMPONENT ──
// Fintech Midnight Theme - Glassmorphism cards with emerald accents
function StatCard({ label, value, change, positive, sub, icon: Icon }) {
  return (
    <article className="stat-card rounded-2xl bg-[#0f172a] p-6 border border-[#1e293b] flex flex-col gap-4 glass-card">
      <div className="flex items-start justify-between">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
          <Icon size={24} />
        </span>
        <button className="text-[#475569] hover:text-[#94a3b8] transition-colors">
          <MoreHorizontal size={18} />
        </button>
      </div>
      <div>
        <p className="text-sm font-medium text-[#94a3b8]">{label}</p>
        <p className="mt-2 text-3xl font-bold text-[#f8fafc] tracking-tight font-mono">
          {value}
        </p>
        <p className="mt-3 flex items-center gap-2 text-xs">
          <span
            className={`font-semibold flex items-center gap-1 ${positive ? "text-emerald-500" : "text-rose-500"}`}
          >
            {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {change}
          </span>
          <span className="text-[#64748b]">{sub}</span>
        </p>
      </div>
    </article>
  );
}

// ── BAR CHART COMPONENT ──
// Emerald gradient bars with improved aesthetics
function BarChart({ transactions }) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  const currentYear = now.getFullYear();

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
      expenses: expenses / 1000,
    };
  });

  const maxVal = Math.max(...barData.map((d) => Math.max(d.income, d.expenses)), 1);

  return (
    <div className="mt-6">
      <div className="flex items-center gap-6 text-xs text-[#94a3b8] mb-6">
        <span className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-gradient-to-t from-emerald-600 to-emerald-400" />
          Income
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-gradient-to-t from-rose-600 to-rose-400" />
          Expenses
        </span>
      </div>
      <div className="relative h-56">
        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[10px] text-[#64748b] pointer-events-none pr-3 w-10 font-mono">
          {[4, 3, 2, 1, 0].map((n) => (
            <span key={n} className="text-right">
              {n > 0 ? `${((maxVal * n) / 4).toFixed(0)}k` : "0"}
            </span>
          ))}
        </div>
        <div className="ml-10 h-full flex items-end gap-2 pb-8">
          {barData.map((d) => (
            <div
              key={d.month}
              className="flex-1 flex flex-col items-center gap-1 h-full justify-end relative group"
            >
              <div className="flex items-end gap-1 w-full justify-center">
                <div
                  className="w-2.5 rounded-t-sm bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all hover:from-emerald-500 hover:to-emerald-300"
                  style={{ height: `${Math.max((d.income / maxVal) * 160, 2)}px` }}
                />
                <div
                  className="w-2.5 rounded-t-sm bg-gradient-to-t from-rose-600 to-rose-400 transition-all hover:from-rose-500 hover:to-rose-300"
                  style={{ height: `${Math.max((d.expenses / maxVal) * 160, 2)}px` }}
                />
              </div>
              <span className="text-[10px] text-[#64748b] mt-2 font-medium">
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
// Emerald themed semi-circle gauge
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

  const r = 90, strokeWidth = 20, circumference = Math.PI * r;
  const symbol = settings?.currency === "USD" ? "$" : "Rp";

  return (
    <div className="flex flex-col items-center mt-6">
      <div className="flex items-center gap-6 text-xs text-[#94a3b8] mb-4">
        <span className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-emerald-500" />
          Income
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-rose-500" />
          Spend
        </span>
      </div>
      <div className="relative w-[220px] h-[120px] overflow-hidden">
        <svg width="220" height="220" viewBox="0 0 220 120" className="absolute top-0 left-0">
          <defs>
            <linearGradient id="incomeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
          </defs>
          <path
            d="M 20 110 A 90 90 0 0 1 200 110"
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <path
            d="M 20 110 A 90 90 0 0 1 200 110"
            fill="none"
            stroke="url(#incomeGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${incomePct * circumference} ${circumference}`}
            strokeDashoffset="0"
          />
          <path
            d="M 20 110 A 90 90 0 0 1 200 110"
            fill="none"
            stroke="url(#expenseGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${expensePct * circumference} ${circumference}`}
            strokeDashoffset={`${-incomePct * circumference}`}
          />
        </svg>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#64748b] font-medium">
            Spend
          </span>
          <span className="text-2xl font-bold text-[#f8fafc] font-mono">
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
  const { transactions, settings, addTransaction, updateTransaction, deleteTransaction } = useAppContext();

  const formatAmount = (amount) => {
    const symbol = settings?.currency === "USD" ? "$" : "Rp";
    return `${symbol} ${Math.abs(amount || 0).toLocaleString(settings?.currency === "USD" ? "en-US" : "id-ID")}`;
  };

  const [txSort, setTxSort] = useState("Newest");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ merchant: "", category: "Food", amount: "", type: "expense" });
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingTx, setEditingTx] = useState(null);
  const [editForm, setEditForm] = useState({ merchant: "", category: "Food", amount: "" });

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
    const currentYear = now.getFullYear();
    const symbol = settings?.currency === "USD" ? "$" : "Rp";

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
    const yearlyInterest = Math.max(0, balance) * 0.025;
    const dailyInterest = yearlyInterest / 365;

    return [
      {
        label: "Total Balance",
        value: `${symbol} ${balance.toLocaleString(settings?.currency === "USD" ? "en-US" : "id-ID")}`,
        change: monthlyIncome > 0 ? `${((balance / monthlyIncome) * 100).toFixed(1)}%` : "0%",
        positive: balance >= 0,
        sub: "savings rate",
        icon: Wallet,
      },
      {
        label: "Monthly Spending",
        value: `${symbol} ${monthlyExpenses.toLocaleString(settings?.currency === "USD" ? "en-US" : "id-ID")}`,
        change: `${txnCount} transactions`,
        positive: false,
        sub: "this month",
        icon: TrendingDown,
      },
      {
        label: "Seabank Savings",
        value: `${symbol} ${Math.max(0, balance).toLocaleString(settings?.currency === "USD" ? "en-US" : "id-ID")}`,
        change: `+${symbol} ${dailyInterest.toLocaleString(settings?.currency === "USD" ? "en-US" : "id-ID")}/day`,
        positive: true,
        sub: "2.5% p.a.",
        icon: PiggyBank,
      },
    ];
  }, [transactions, settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = form.type === "expense" ? -Math.abs(Number(form.amount)) : Math.abs(Number(form.amount));
    const success = await addTransaction({
      merchant: form.merchant,
      category: form.category,
      amount,
      type: form.type,
    });
    if (success) {
      setIsModalOpen(false);
      setForm({ merchant: "", category: "Food", amount: "", type: "expense" });
      showToast("Transaction added successfully!", "success");
    }
  };

  const sortedTxns = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    const recent = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    if (txSort === "Oldest") return [...recent].reverse();
    if (txSort === "Highest") return [...recent].sort((a, b) => b.amount - a.amount);
    if (txSort === "Lowest") return [...recent].sort((a, b) => a.amount - b.amount);
    return recent;
  }, [transactions, txSort]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#f8fafc] tracking-tight">
            Dashboard
          </h1>
          <p className="text-[#94a3b8] mt-1">
            Welcome back! Here&apos;s your financial overview.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white"
        >
          <Plus size={18} /> Add Transaction
        </button>
      </div>

      {/* ── STATS CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* ── CHARTS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-[#0f172a] p-6 border border-[#1e293b] glass-card">
          <h2 className="text-lg font-semibold text-[#f8fafc]">
            Income vs Expenses
          </h2>
          <BarChart transactions={transactions} />
        </div>
        <div className="rounded-2xl bg-[#0f172a] p-6 border border-[#1e293b] glass-card">
          <h2 className="text-lg font-semibold text-[#f8fafc]">
            Spending Breakdown
          </h2>
          <SpendingGauge transactions={transactions} settings={settings} />
        </div>
      </div>

      {/* ── RECENT TRANSACTIONS ── */}
      <div className="rounded-2xl bg-[#0f172a] p-6 border border-[#1e293b] glass-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#f8fafc]">
            Recent Transactions
          </h2>
          <select
            value={txSort}
            onChange={(e) => setTxSort(e.target.value)}
            className="rounded-xl bg-[#1e293b] border border-[#334155] px-4 py-2 text-sm text-[#f8fafc] focus:border-emerald-500 cursor-pointer"
          >
            <option>Newest</option>
            <option>Oldest</option>
            <option>Highest</option>
            <option>Lowest</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody className="divide-y divide-[#1e293b]">
              {sortedTxns.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#1e293b]/50 transition-colors">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold bg-emerald-500/10 text-emerald-500">
                        {tx.merchant?.charAt(0) || "?"}
                      </span>
                      <div>
                        <span className="font-medium text-[#f8fafc] text-sm">
                          {tx.merchant}
                        </span>
                        <p className="text-xs text-[#64748b] font-mono">{tx.date}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <span
                      className={`inline-flex rounded-lg px-3 py-1.5 text-xs font-semibold ${
                        tx.status === "Completed"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : tx.status === "Pending"
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-rose-500/10 text-rose-500"
                      }`}
                    >
                      {tx.status || "Completed"}
                    </span>
                  </td>
                  <td
                    className={`py-4 text-right font-bold font-mono ${
                      tx.type === "income" ? "text-emerald-500" : "text-[#f8fafc]"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"}
                    {formatAmount(tx.amount)}
                  </td>
                  <td className="py-4 pl-4">
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === tx.id ? null : tx.id)}
                        className="text-[#475569] hover:text-[#94a3b8] transition-colors p-1"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                      {openMenuId === tx.id && (
                        <div className="absolute right-0 top-10 bg-[#0f172a] rounded-xl border border-[#1e293b] shadow-xl z-30 py-2 w-32 glass-card">
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
                            className="w-full text-left px-4 py-2.5 text-sm text-[#94a3b8] hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={async () => {
                              const success = await deleteTransaction(tx.id);
                              if (success) showToast("Transaction deleted!", "success");
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-500/10 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay">
          <div className="bg-[#0f172a] rounded-2xl p-6 w-full max-w-md border border-[#1e293b] shadow-2xl glass-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#f8fafc]">Add Transaction</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#64748b] hover:text-[#94a3b8] transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                  Merchant
                </label>
                <input
                  type="text"
                  value={form.merchant}
                  onChange={(e) => setForm({ ...form, merchant: e.target.value })}
                  placeholder="Enter merchant name"
                  required
                  className="w-full mt-2 rounded-xl bg-[#1e293b] border border-[#334155] px-4 py-3 text-sm text-[#f8fafc] placeholder-[#64748b]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full mt-2 rounded-xl bg-[#1e293b] border border-[#334155] px-4 py-3 text-sm text-[#f8fafc] cursor-pointer"
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
                <label className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                  Amount
                </label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0"
                  required
                  className="w-full mt-2 rounded-xl bg-[#1e293b] border border-[#334155] px-4 py-3 text-sm text-[#f8fafc] font-mono placeholder-[#64748b]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                  Type
                </label>
                <div className="flex gap-3 mt-2">
                  {["expense", "income"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm({ ...form, type })}
                      className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                        form.type === type
                          ? type === "expense"
                            ? "bg-rose-500 text-white"
                            : "bg-emerald-500 text-white"
                          : "bg-[#1e293b] text-[#94a3b8] border border-[#334155] hover:border-[#475569]"
                      }`}
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
                  className="flex-1 rounded-xl border border-[#334155] py-3 text-sm font-semibold text-[#94a3b8] hover:bg-[#1e293b] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary rounded-xl py-3 text-sm font-semibold text-white"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay">
          <div className="bg-[#0f172a] rounded-2xl p-6 w-full max-w-md border border-[#1e293b] shadow-2xl glass-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#f8fafc]">Edit Transaction</h2>
              <button
                onClick={() => setEditingTx(null)}
                className="text-[#64748b] hover:text-[#94a3b8] transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const updatedAmount = Number(editForm.amount);
                const finalAmount = editingTx.amount >= 0 ? Math.abs(updatedAmount) : -Math.abs(updatedAmount);
                const success = await updateTransaction(editingTx.id, {
                  merchant: editForm.merchant,
                  category: editForm.category,
                  amount: finalAmount,
                });
                if (success) {
                  showToast("Transaction updated!", "success");
                  setEditingTx(null);
                } else {
                  showToast("Failed to update transaction!", "error");
                }
              }}
              className="space-y-5"
            >
              <div>
                <label className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                  Merchant
                </label>
                <input
                  type="text"
                  value={editForm.merchant}
                  onChange={(e) => setEditForm({ ...editForm, merchant: e.target.value })}
                  className="w-full mt-2 rounded-xl bg-[#1e293b] border border-[#334155] px-4 py-3 text-sm text-[#f8fafc]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full mt-2 rounded-xl bg-[#1e293b] border border-[#334155] px-4 py-3 text-sm text-[#f8fafc] cursor-pointer"
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
                <label className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                  Amount
                </label>
                <input
                  type="number"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                  className="w-full mt-2 rounded-xl bg-[#1e293b] border border-[#334155] px-4 py-3 text-sm text-[#f8fafc] font-mono"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="flex-1 rounded-xl border border-[#334155] py-3 text-sm font-semibold text-[#94a3b8] hover:bg-[#1e293b] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary rounded-xl py-3 text-sm font-semibold text-white"
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
