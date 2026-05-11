import { useMemo, useState } from 'react'
import {
  Calendar,
  Clock,
  Database,
  Download,
  Edit3,
  FileText,
  GraduationCap,
  LogOut,
  MapPin,
  Save,
  ShieldCheck,
  Smartphone,
  ToggleLeft,
  ToggleRight,
  X,
} from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { useAppContext } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

function DownloadModal({ isOpen, onClose, transactions }) {
  if (!isOpen) return null

  const downloadBlob = (content, type, filename) => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
    onClose()
  }

  const handleExportCSV = () => {
    const headers = 'ID,Date,Merchant,Category,Amount,Type,Status\n'
    const rows = transactions
      .map(
        (transaction) =>
          `${transaction.id},${transaction.date},${transaction.merchant},${transaction.category},${transaction.amount},${transaction.type},${transaction.status}`,
      )
      .join('\n')
    downloadBlob(
      headers + rows,
      'text/csv',
      `moneypulse_export_${new Date().toISOString().split('T')[0]}.csv`,
    )
  }

  const handleExportJSON = () => {
    downloadBlob(
      JSON.stringify(transactions, null, 2),
      'application/json',
      `moneypulse_export_${new Date().toISOString().split('T')[0]}.json`,
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm border border-slate-100 shadow-xl">
        <div className="text-center mb-4">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-[#8B5CF6] mb-3">
            <Download size={28} />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Export Data</h2>
          <p className="text-sm text-slate-500 mt-1">
            Download all {transactions.length} financial records
          </p>
        </div>
        <div className="space-y-2">
          <button
            onClick={handleExportCSV}
            className="w-full flex items-center gap-3 rounded-2xl p-4 border border-slate-100 hover:bg-slate-50 transition-colors"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <FileText size={18} />
            </span>
            <div className="text-left flex-1">
              <p className="text-sm font-semibold text-slate-800">CSV Format</p>
              <p className="text-xs text-slate-400">Spreadsheet compatible</p>
            </div>
          </button>
          <button
            onClick={handleExportJSON}
            className="w-full flex items-center gap-3 rounded-2xl p-4 border border-slate-100 hover:bg-slate-50 transition-colors"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Database size={18} />
            </span>
            <div className="text-left flex-1">
              <p className="text-sm font-semibold text-slate-800">JSON Format</p>
              <p className="text-xs text-slate-400">Developer friendly</p>
            </div>
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

export default function ProfilePage() {
  const {
    transactions,
    settings,
    profile: storedProfile,
    loginHistory,
    updateProfile,
    updateProfileAvatar,
    loading,
  } = useAppContext()
  const { signOut } = useAuth()
  const [draftProfile, setDraftProfile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isDownloadOpen, setIsDownloadOpen] = useState(false)
  const [toggles, setToggles] = useState({
    biometric: false,
    alerts: true,
  })
  const [show2FA, setShow2FA] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [factorId, setFactorId] = useState('')
  const [verifyCode, setVerifyCode] = useState('')
  const [twoFactorMessage, setTwoFactorMessage] = useState('')

  const profile = isEditing ? draftProfile ?? storedProfile : storedProfile
  const avatarUrl = profile?.avatar_url || null

  const stats = useMemo(() => {
    const totalIncome = transactions
      .filter((transaction) => transaction.type === 'income')
      .reduce((sum, transaction) => sum + (transaction.amount || 0), 0)
    const totalExpenses = transactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount || 0), 0)
    return {
      totalTxns: transactions.length,
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
    }
  }, [transactions])

  const currencySymbol = settings?.currency === 'USD' ? '$' : 'Rp'

  const start2FASetup = async () => {
    setTwoFactorMessage('')
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
    })

    if (error) {
      setTwoFactorMessage(error.message)
      return
    }

    setQrCode(data.totp.qr_code)
    setFactorId(data.id)
    setShow2FA(true)
  }

  const verify2FA = async () => {
    setTwoFactorMessage('')
    const { data: challenge, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId })

    if (challengeError) {
      setTwoFactorMessage(challengeError.message)
      return
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: verifyCode,
    })

    if (verifyError) {
      setTwoFactorMessage(verifyError.message)
      return
    }

    setShow2FA(false)
    setVerifyCode('')
    setTwoFactorMessage('Two-factor authentication is enabled.')
  }

  const handleAvatarChange = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (readerEvent) => {
      const base64 = readerEvent.target.result
      setDraftProfile((prev) => ({ ...(prev ?? profile), avatar_url: base64 }))
      await updateProfileAvatar(base64)
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async () => {
    const saved = await updateProfile(profile)
    if (saved) {
      setDraftProfile(null)
      setIsEditing(false)
    }
  }

  if (loading.profile && !profile) {
    return (
      <div className="h-[calc(100vh-2.5rem)] flex items-center justify-center">
        <p className="text-slate-400 text-lg">Loading profile...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="h-[calc(100vh-2.5rem)] flex items-center justify-center">
        <p className="text-slate-400 text-lg">Profile data is not available yet.</p>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-2.5rem)] flex flex-col gap-5">
      <main className="flex-1 overflow-y-auto flex flex-col gap-5">
        <header className="rounded-3xl bg-white p-8 border border-slate-100 shadow-sm">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-5">
              <div className="relative">
                <label className="cursor-pointer">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      className="h-20 w-20 rounded-full object-cover ring-4 ring-violet-50"
                      alt="Avatar"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#8B5CF6] to-violet-300 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-violet-50">
                      {profile.name
                        ?.split(' ')
                        .map((name) => name[0])
                        .join('') || 'U'}
                    </div>
                  )}
                  {isEditing && (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                      <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white shadow-sm">
                        <Edit3 size={12} />
                      </div>
                    </>
                  )}
                </label>
              </div>

              {isEditing ? (
                <div className="space-y-2 flex-1">
                  <input
                    value={profile.name || ''}
                    onChange={(event) =>
                      setDraftProfile({ ...profile, name: event.target.value })
                    }
                    className="w-full text-2xl font-bold bg-slate-50 rounded-xl px-3 py-1 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
                  />
                  <input
                    value={profile.title || ''}
                    onChange={(event) =>
                      setDraftProfile({ ...profile, title: event.target.value })
                    }
                    className="w-full text-slate-500 bg-slate-50 rounded-xl px-3 py-1 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
                  />
                </div>
              ) : (
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {profile.name || 'User'}
                  </h1>
                  <p className="text-slate-500 flex items-center gap-1.5 mt-1">
                    <GraduationCap size={14} />
                    {profile.title || 'Dashboard user'}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                      <Calendar size={11} /> Member since {profile.memberSince || '-'}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-[#8B5CF6]">
                      <MapPin size={11} /> {profile.location || '-'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                if (isEditing) {
                  handleSaveProfile()
                } else {
                  setDraftProfile(storedProfile)
                  setIsEditing(true)
                }
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                isEditing
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-[#8B5CF6] text-white hover:bg-violet-700'
              }`}
            >
              {isEditing ? <Save size={14} /> : <Edit3 size={14} />}
              {isEditing ? 'Save Profile' : 'Edit Profile'}
            </button>
          </div>
        </header>

        <section className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total Transactions', value: stats.totalTxns, color: 'bg-violet-50 text-violet-600' },
            { label: 'Total Income', value: `${currencySymbol} ${(stats.totalIncome / 1000).toFixed(0)}k`, color: 'bg-emerald-50 text-emerald-600' },
            { label: 'Total Expenses', value: `${currencySymbol} ${(stats.totalExpenses / 1000).toFixed(0)}k`, color: 'bg-rose-50 text-rose-600' },
            { label: 'Balance', value: `${currencySymbol} ${(stats.balance / 1000).toFixed(0)}k`, color: 'bg-amber-50 text-amber-600' },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-2xl p-4 ${stat.color}`}>
              <p className="text-xs font-medium opacity-70">{stat.label}</p>
              <p className="text-lg font-bold mt-1">{stat.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
          <div className="flex flex-col gap-5">
            <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                  <GraduationCap size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Academic Info</p>
                  <p className="text-xs text-slate-400">Stored in user_profiles</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Program', key: 'program' },
                  { label: 'Semester', key: 'semester' },
                  { label: 'NIM', key: 'nim' },
                  { label: 'Faculty', key: 'faculty' },
                ].map((item) => (
                  <div key={item.key} className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">{item.label}</p>
                    {isEditing ? (
                      <input
                        value={profile[item.key] || ''}
                        onChange={(event) =>
                          setDraftProfile({ ...profile, [item.key]: event.target.value })
                        }
                        className="text-sm font-semibold text-slate-800 mt-1 bg-transparent border-b border-slate-200 focus:outline-none focus:border-[#8B5CF6] w-full"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-slate-800 mt-1">
                        {profile[item.key] || '-'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <Database size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Supabase Sync</p>
                  <p className="text-xs text-slate-400">All core data is stored in the database</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Transactions', transactions.length],
                  ['Login records', loginHistory.length],
                  ['Settings source', 'user_settings'],
                  ['Profile source', 'user_profiles'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="text-sm font-semibold text-slate-800 mt-1">{value}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <div className="flex flex-col gap-5">
            <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-[#8B5CF6]">
                  <ShieldCheck size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Security Settings</p>
                  <p className="text-xs text-slate-400">Manage account security</p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between py-3 px-4 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      Two-Factor Authentication
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Secure your account with an authenticator app
                    </p>
                  </div>
                  <button
                    onClick={start2FASetup}
                    className="flex items-center gap-1.5 rounded-xl bg-[#8B5CF6] px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700 transition-colors"
                  >
                    <ShieldCheck size={12} /> Setup
                  </button>
                </div>

                {[
                  {
                    id: 'biometric',
                    label: 'Biometric Login',
                    desc: 'Use fingerprint or face ID',
                    icon: Smartphone,
                  },
                  {
                    id: 'alerts',
                    label: 'Transaction Alerts',
                    desc: 'Get notified on every transaction',
                    icon: ShieldCheck,
                  },
                ].map((setting) => (
                  <div
                    key={setting.id}
                    className="flex items-center justify-between py-3 px-4 rounded-2xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        <setting.icon size={14} />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{setting.label}</p>
                        <p className="text-[10px] text-slate-400">{setting.desc}</p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setToggles((prev) => ({
                          ...prev,
                          [setting.id]: !prev[setting.id],
                        }))
                      }
                      className="text-slate-300 hover:text-[#8B5CF6] transition-colors"
                    >
                      {toggles[setting.id] ? (
                        <ToggleRight size={28} className="text-[#8B5CF6]" />
                      ) : (
                        <ToggleLeft size={28} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
              {twoFactorMessage && (
                <p className="mt-3 text-xs text-slate-500">{twoFactorMessage}</p>
              )}
            </article>

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
                {loginHistory.map((login, index) => (
                  <div
                    key={login.id}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-2xl hover:bg-slate-50 transition-colors"
                  >
                    <span
                      className={`inline-flex h-2 w-2 rounded-full ${
                        index === 0 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-300'
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">
                        {login.device || 'Unknown'} - {login.browser || 'Browser'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {login.location || 'Unknown'} - {login.time || 'Unknown'}
                      </p>
                    </div>
                    {index === 0 && (
                      <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </article>

            <div className="flex gap-3">
              <button
                onClick={() => setIsDownloadOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-white border border-slate-100 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <Download size={16} /> Export Data
              </button>
              <button
                onClick={signOut}
                className="flex items-center justify-center gap-2 rounded-2xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-100 transition-colors"
              >
                <LogOut size={16} /> Log Out
              </button>
            </div>
          </div>
        </section>
      </main>

      {show2FA && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm border border-slate-100 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Verify 2FA</h2>
              <button onClick={() => setShow2FA(false)} className="text-slate-400">
                <X size={20} />
              </button>
            </div>
            {qrCode && (
              <div className="flex justify-center rounded-2xl bg-slate-50 p-4 mb-4">
                <QRCodeCanvas value={qrCode} size={180} />
              </div>
            )}
            <input
              value={verifyCode}
              onChange={(event) => setVerifyCode(event.target.value)}
              placeholder="Authenticator code"
              className="w-full rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
            />
            <button
              onClick={verify2FA}
              className="w-full mt-4 rounded-xl bg-[#8B5CF6] py-2.5 text-sm font-medium text-white hover:bg-violet-700"
            >
              Verify
            </button>
          </div>
        </div>
      )}

      <DownloadModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
        transactions={transactions}
      />
    </div>
  )
}
