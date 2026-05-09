import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Shield, Users, Trash2, Eye } from 'lucide-react'

export default function AdminPage() {
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({ totalUsers: 0, totalTransactions: 0 })

  useEffect(() => {
    fetchUsers()
    fetchStats()
  }, [])

  const fetchUsers = async () => {
    const { data } = await supabase.from('user_roles').select('*')
    if (data) setUsers(data)
  }

  const fetchStats = async () => {
    // Total users
    const { count: userCount } = await supabase.from('user_roles').select('*', { count: 'exact', head: true })
    
    // Total transactions
    const { count: txnCount } = await supabase.from('transactions').select('*', { count: 'exact', head: true })
    
    setStats({
      totalUsers: userCount || 0,
      totalTransactions: txnCount || 0
    })
  }

  return (
    <div className="h-[calc(100vh-2.5rem)] flex flex-col gap-5">
      <main className="flex-1 overflow-y-auto flex flex-col gap-5">
        {/* Header */}
        <header className="flex items-center justify-between rounded-3xl bg-white px-7 py-5 border border-slate-100 shadow-sm shrink-0">
          <div>
            <p className="text-sm text-slate-400 font-medium">Administrator</p>
            <h1 className="mt-0.5 text-2xl font-bold text-slate-900 tracking-tight">Admin Panel</h1>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-[#8B5CF6]">
            <Shield size={12} /> Admin Access
          </span>
        </header>

        {/* Stats Cards */}
        <section className="grid grid-cols-2 gap-5">
          <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 text-[#8B5CF6]">
                <Users size={20} />
              </span>
              <p className="text-sm font-medium text-slate-400">Total Users</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
          </article>
          <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <Eye size={20} />
              </span>
              <p className="text-sm font-medium text-slate-400">Total Transactions</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.totalTransactions}</p>
          </article>
        </section>

        {/* Users Table */}
        <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
          <p className="text-sm font-medium text-slate-400 mb-4">Registered Users</p>
          
          {users.length === 0 ? (
            <p className="text-center py-8 text-slate-400 text-sm">No users found</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">User ID</th>
                  <th className="pb-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</th>
                  <th className="pb-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="py-3 text-sm text-slate-600 font-mono">{user.user_id?.substring(0, 12)}...</td>
                    <td className="py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        user.role === 'admin' ? 'bg-violet-50 text-[#8B5CF6]' : 'bg-slate-50 text-slate-500'
                      }`}>{user.role}</span>
                    </td>
                    <td className="py-3 text-sm text-slate-400">{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </article>
      </main>
    </div>
  )
}