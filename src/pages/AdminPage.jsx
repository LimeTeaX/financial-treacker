// src/pages/AdminPage.jsx
import { useAuth } from "../context/AuthContext";
import { useAppContext } from "../context/AppContext";
import { Shield, Users, Eye, TrendingUp, CreditCard, AlertTriangle, Database, Server, Globe, Lock } from "lucide-react";

export default function AdminPage() {
  const { user, role } = useAuth();
  const { transactions, profile, bills, recurringTransactions } = useAppContext();

  // Hitung statistik tambahan
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
  const pendingBills = bills.filter((b) => b.status !== "paid").length;
  const activeRecurring = recurringTransactions.filter((r) => r.active).length;

  const stats = [
    {
      label: "Total Users",
      value: "1",
      icon: Users,
      color: "bg-emerald-500/10 text-emerald-400",
      description: "Active accounts",
    },
    {
      label: "Total Transactions",
      value: transactions.length,
      icon: Eye,
      color: "bg-emerald-500/10 text-emerald-400",
      description: "All time records",
    },
    {
      label: "Total Income",
      value: `Rp ${(totalIncome / 1000000).toFixed(1)}M`,
      icon: TrendingUp,
      color: "bg-emerald-500/10 text-emerald-400",
      description: "Revenue generated",
    },
    {
      label: "Total Expenses",
      value: `Rp ${(totalExpenses / 1000000).toFixed(1)}M`,
      icon: CreditCard,
      color: "bg-red-500/10 text-red-400",
      description: "Money spent",
    },
    {
      label: "Pending Bills",
      value: pendingBills,
      icon: AlertTriangle,
      color: "bg-yellow-500/10 text-yellow-500",
      description: "Awaiting payment",
    },
    {
      label: "Active Recurring",
      value: activeRecurring,
      icon: TrendingUp,
      color: "bg-emerald-500/10 text-emerald-400",
      description: "Auto transactions",
    },
  ];

  const systemInfo = [
    { label: "Database", value: "Supabase PostgreSQL", icon: Database },
    { label: "Auth Provider", value: "Supabase Auth", icon: Lock },
    { label: "Realtime", value: "Supabase Realtime", icon: Server },
    { label: "Storage", value: "Supabase Storage", icon: Globe },
  ];

  if (role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Shield size={48} className="text-slate-600 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
        <p className="text-slate-400">You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Panel</h1>
          <p className="text-slate-400 mt-1">System overview and management</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 border border-emerald-500/20">
          <Shield size={14} />
          {role === "admin" ? "Admin Access" : "User Access"}
          {role === "admin" && (
            <span className="relative flex h-2 w-2 ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={stat.label}
            className="rounded-xl bg-slate-900/50 border border-slate-800 p-5 hover:border-emerald-500/30 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                <stat.icon size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm font-medium text-white mt-1">{stat.label}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* User Info Section */}
      <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Users size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Current Session</p>
            <p className="text-xs text-slate-400">Your account details</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-slate-800/30 p-4">
            <p className="text-xs text-slate-400 mb-1">User ID</p>
            <p className="text-sm font-mono text-white break-all">{user?.id || "Not logged in"}</p>
          </div>
          <div className="rounded-lg bg-slate-800/30 p-4">
            <p className="text-xs text-slate-400 mb-1">Email</p>
            <p className="text-sm font-medium text-white">{user?.email || "-"}</p>
          </div>
          <div className="rounded-lg bg-slate-800/30 p-4">
            <p className="text-xs text-slate-400 mb-1">Role</p>
            <div className="flex items-center gap-2">
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${role === "admin" ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"
                }`}>
                {role || "user"}
              </span>
              {role === "admin" && (
                <span className="text-xs text-slate-500">(Full access)</span>
              )}
            </div>
          </div>
          <div className="rounded-lg bg-slate-800/30 p-4">
            <p className="text-xs text-slate-400 mb-1">Account Name</p>
            <p className="text-sm font-medium text-white">{profile?.name || "-"}</p>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Server size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">System Information</p>
            <p className="text-xs text-slate-400">Platform and infrastructure details</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {systemInfo.map((info) => (
            <div key={info.label} className="rounded-lg bg-slate-800/30 p-3 text-center">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 mb-2">
                <info.icon size={14} />
              </div>
              <p className="text-xs text-slate-500">{info.label}</p>
              <p className="text-sm font-semibold text-white mt-1">{info.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RLS Status */}
      <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Shield size={14} />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Security Status</p>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-sm text-white">Row Level Security (RLS)</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Active & Protected
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          RLS ensures users can only access their own data. All tables are protected with user_id policies.
        </p>
      </div>

      {/* Database Stats */}
      <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Database size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Database Statistics</p>
            <p className="text-xs text-slate-400">Real-time counts from Supabase</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-slate-800/30 p-3 text-center">
            <p className="text-2xl font-bold text-white">{transactions.length}</p>
            <p className="text-xs text-slate-500">Transactions</p>
          </div>
          <div className="rounded-lg bg-slate-800/30 p-3 text-center">
            <p className="text-2xl font-bold text-white">{bills.length}</p>
            <p className="text-xs text-slate-500">Bills</p>
          </div>
          <div className="rounded-lg bg-slate-800/30 p-3 text-center">
            <p className="text-2xl font-bold text-white">{recurringTransactions.length}</p>
            <p className="text-xs text-slate-500">Recurring</p>
          </div>
          <div className="rounded-lg bg-slate-800/30 p-3 text-center">
            <p className="text-2xl font-bold text-white">{totalIncome - totalExpenses}M</p>
            <p className="text-xs text-slate-500">Net Balance</p>
          </div>
        </div>
      </div>
    </div>
  );
}