import { Eye, Shield, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useAppContext } from '../context/AppContext'

export default function AdminPage() {
  const { user, role } = useAuth()
  const { transactions, profile } = useAppContext()

  return (
    <div className="h-[calc(100vh-2.5rem)] flex flex-col gap-5">
      <main className="flex-1 overflow-y-auto flex flex-col gap-5">
        <header className="flex items-center justify-between rounded-3xl bg-white px-7 py-5 border border-slate-100 shadow-sm shrink-0">
          <div>
            <p className="text-sm text-slate-400 font-medium">Administrator</p>
            <h1 className="mt-0.5 text-2xl font-bold text-slate-900 tracking-tight">
              Admin Panel
            </h1>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-[#8B5CF6]">
            <Shield size={12} /> {role} access
          </span>
        </header>

        <section className="grid grid-cols-2 gap-5">
          <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 text-[#8B5CF6]">
                <Users size={20} />
              </span>
              <p className="text-sm font-medium text-slate-400">Current User</p>
            </div>
            <p className="text-lg font-bold text-slate-900">{profile?.name || user?.email}</p>
            <p className="mt-2 text-xs text-slate-400 font-mono">{user?.id}</p>
          </article>
          <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <Eye size={20} />
              </span>
              <p className="text-sm font-medium text-slate-400">Your Transactions</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">{transactions.length}</p>
            <p className="mt-2 text-xs text-slate-400">RLS only exposes rows owned by this user</p>
          </article>
        </section>

        <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
          <p className="text-sm font-medium text-slate-400 mb-4">Role</p>
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-500">Current role</span>
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                role === 'admin'
                  ? 'bg-violet-50 text-[#8B5CF6]'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {role}
            </span>
          </div>
        </article>
      </main>
    </div>
  )
}
