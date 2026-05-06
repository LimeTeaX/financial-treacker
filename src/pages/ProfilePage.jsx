// src/pages/ProfilePage.jsx
import { useState } from 'react'
import {
  User,
  Link,
  ShieldCheck,
  LogOut,
  Edit3,
  Calendar,
  Download,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  ExternalLink,
  Smartphone,
  GraduationCap,
  Mail,
  MapPin,
  Clock,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Key,
  Eye,
  FileText,
  Database,
} from 'lucide-react'

// ── CONNECTED APPS ──
const CONNECTED_APPS = [
  {
    id: 'seabank',
    name: 'SeaBank',
    icon: '🏦',
    bg: 'bg-orange-50 border-orange-200',
    iconBg: 'bg-orange-100 text-orange-600',
    status: 'authorized',
    lastSync: '2 hours ago',
    account: '**** 2849',
  },
  {
    id: 'dana',
    name: 'DANA',
    icon: '💳',
    bg: 'bg-blue-50 border-blue-200',
    iconBg: 'bg-blue-100 text-blue-600',
    status: 'authorized',
    lastSync: '1 day ago',
    account: '0878****',
  },
  {
    id: 'gopay',
    name: 'GoPay',
    icon: '🛵',
    bg: 'bg-green-50 border-green-200',
    iconBg: 'bg-green-100 text-green-600',
    status: 'authorized',
    lastSync: '3 hours ago',
    account: '0878****',
  },
  {
    id: 'shopeepay',
    name: 'ShopeePay',
    icon: '🛒',
    bg: 'bg-orange-50 border-orange-200',
    iconBg: 'bg-orange-100 text-orange-600',
    status: 'disconnected',
    lastSync: 'Never',
    account: '—',
  },
]

// ── LOGIN ACTIVITY ──
const LOGIN_ACTIVITY = [
  { id: 1, device: 'Chrome on Windows', location: 'Medan, ID', time: 'Active now', status: 'current' },
  { id: 2, device: 'iPhone 15 Pro', location: 'Medan, ID', time: '2 hours ago', status: 'success' },
  { id: 3, device: 'Chrome on MacBook', location: 'Medan, ID', time: 'Yesterday', status: 'success' },
]

// ── SETTINGS TOGGLES ──
const SETTINGS_TOGGLES = [
  { id: '2fa', label: 'Two-Factor Authentication', desc: 'Secure your account with OTP', icon: ShieldCheck, enabled: true },
  { id: 'biometric', label: 'Biometric Login', desc: 'Use fingerprint or face ID', icon: Smartphone, enabled: false },
  { id: 'alerts', label: 'Transaction Alerts', desc: 'Get notified on every transaction', icon: Eye, enabled: true },
]

// ── DOWNLOAD MODAL ──
function DownloadModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm border border-slate-100 shadow-xl">
        <div className="text-center mb-4">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-[#8B5CF6] mb-3">
            <Download size={28} />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Export Data</h2>
          <p className="text-sm text-slate-500 mt-1">Download all your financial records</p>
        </div>

        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 rounded-2xl p-4 border border-slate-100 hover:bg-slate-50 transition-colors">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <FileText size={18} />
            </span>
            <div className="text-left flex-1">
              <p className="text-sm font-semibold text-slate-800">CSV Format</p>
              <p className="text-xs text-slate-400">Spreadsheet compatible</p>
            </div>
            <ChevronRight size={16} className="text-slate-300" />
          </button>

          <button className="w-full flex items-center gap-3 rounded-2xl p-4 border border-slate-100 hover:bg-slate-50 transition-colors">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Database size={18} />
            </span>
            <div className="text-left flex-1">
              <p className="text-sm font-semibold text-slate-800">JSON Format</p>
              <p className="text-xs text-slate-400">Developer friendly</p>
            </div>
            <ChevronRight size={16} className="text-slate-300" />
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// ── MAIN COMPONENT ──
export default function ProfilePage() {
  const [toggles, setToggles] = useState(SETTINGS_TOGGLES)
  const [isDownloadOpen, setIsDownloadOpen] = useState(false)

  const handleToggle = (id) => {
    setToggles(toggles.map(t =>
      t.id === id ? { ...t, enabled: !t.enabled } : t
    ))
  }

  return (
    <div className="h-[calc(100vh-2.5rem)] flex flex-col gap-5">
      <main className="flex-1 overflow-y-auto flex flex-col gap-5">
        
        {/* ── Profile Header ── */}
        <header className="rounded-3xl bg-white p-8 border border-slate-100 shadow-sm">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#8B5CF6] to-violet-300 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-violet-50">
                  JT
                </div>
                <button className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#8B5CF6] transition-colors shadow-sm">
                  <Edit3 size={12} />
                </button>
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Jackson Maju Tambunan</h1>
                <p className="text-slate-500 flex items-center gap-1.5 mt-1">
                  <GraduationCap size={14} />
                  Digital Office Administration @ USU
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                    <Calendar size={11} />
                    Member since April 2026
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-[#8B5CF6]">
                    <MapPin size={11} />
                    Medan, ID
                  </span>
                </div>
              </div>
            </div>

            <button className="flex items-center gap-2 rounded-xl bg-[#8B5CF6] px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700 transition-colors">
              <Edit3 size={14} />
              Edit Profile
            </button>
          </div>
        </header>

        {/* ── Main Grid ── */}
        <section className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
          
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-5">
            
            {/* Academic Info */}
            <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                  <GraduationCap size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Academic Info</p>
                  <p className="text-xs text-slate-400">Universitas Sumatera Utara</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">Program</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">D3 Digital Office Admin</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">Semester</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">4 (Genap 2026)</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">NIM</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">2024****</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">Faculty</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">Vokasi</p>
                </div>
              </div>
            </article>

            {/* Connected Apps */}
            <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <Link size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Connected Apps</p>
                  <p className="text-xs text-slate-400">Financial integrations</p>
                </div>
              </div>

              <div className="space-y-2">
                {CONNECTED_APPS.map((app) => (
                  <div key={app.id} className={`flex items-center justify-between p-4 rounded-2xl border ${app.bg} transition-colors`}>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-lg ${app.iconBg}`}>
                        {app.icon}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{app.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {app.account} • {app.lastSync}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {app.status === 'authorized' ? (
                        <>
                          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                            <CheckCircle2 size={10} /> Authorized
                          </span>
                          <button className="flex items-center gap-1 rounded-lg bg-white/80 px-2.5 py-1.5 text-[10px] font-medium text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200">
                            <RefreshCw size={10} /> Sync
                          </button>
                        </>
                      ) : (
                        <button className="flex items-center gap-1 rounded-lg bg-[#8B5CF6] px-3 py-1.5 text-[10px] font-medium text-white hover:bg-violet-700 transition-colors">
                          <Link size={10} /> Connect
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-5">
            
            {/* Security Settings */}
            <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-[#8B5CF6]">
                  <ShieldCheck size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Security Settings</p>
                  <p className="text-xs text-slate-400">Manage your account security</p>
                </div>
              </div>

              <div className="space-y-1">
                {toggles.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between py-3 px-4 rounded-2xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        <setting.icon size={14} />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{setting.label}</p>
                        <p className="text-[10px] text-slate-400">{setting.desc}</p>
                      </div>
                    </div>
                    <button onClick={() => handleToggle(setting.id)} className="text-slate-300 hover:text-[#8B5CF6] transition-colors">
                      {setting.enabled ? (
                        <ToggleRight size={28} className="text-[#8B5CF6]" />
                      ) : (
                        <ToggleLeft size={28} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </article>

            {/* Login Activity */}
            <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                  <Clock size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Login Activity</p>
                  <p className="text-xs text-slate-400">Recent sessions</p>
                </div>
              </div>

              <div className="space-y-2">
                {LOGIN_ACTIVITY.map((login) => (
                  <div key={login.id} className="flex items-center gap-3 py-2.5 px-3 rounded-2xl hover:bg-slate-50 transition-colors">
                    <span className={`inline-flex h-2 w-2 rounded-full ${
                      login.status === 'current' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-300'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{login.device}</p>
                      <p className="text-[10px] text-slate-400">{login.location} • {login.time}</p>
                    </div>
                    {login.status === 'current' && (
                      <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </article>

            {/* Data Export + Logout */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsDownloadOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-white border border-slate-100 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <Download size={16} />
                Export Data
              </button>
              <button className="flex items-center justify-center gap-2 rounded-2xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-100 transition-colors">
                <LogOut size={16} />
                Log Out
              </button>
            </div>
          </div>

        </section>

      </main>

      {/* Download Modal */}
      <DownloadModal isOpen={isDownloadOpen} onClose={() => setIsDownloadOpen(false)} />
    </div>
  )
}