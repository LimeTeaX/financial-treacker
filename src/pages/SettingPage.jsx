import { useState } from 'react'
import {
  AlertTriangle,
  Bell,
  Calendar,
  Database,
  Download,
  Globe,
  Info,
  Lock,
  Monitor,
  Moon,
  Palette,
  RotateCcw,
  Settings,
  Shield,
  Sun,
  Type,
} from 'lucide-react'
import { useAppContext } from '../context/AppContext'

function ToggleSwitch({ enabled, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${
        enabled ? 'bg-[#8B5CF6]' : 'bg-slate-200'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

function RadioGroup({ options, selected, onChange }) {
  return (
    <div className="flex gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`rounded-xl px-4 py-2 text-xs font-medium transition-all duration-200 ${
            selected === option.value
              ? 'bg-[#8B5CF6] text-white shadow-sm'
              : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function ResetModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm border border-slate-100 shadow-xl">
        <div className="text-center mb-4">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-500 mb-3">
            <AlertTriangle size={28} />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Reset All Transactions?</h2>
          <p className="text-sm text-slate-500 mt-1">
            This will permanently delete all your transaction records.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-rose-500 py-2.5 text-sm font-medium text-white hover:bg-rose-600 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SettingPage() {
  const { transactions, settings, updateSettings, resetTransactions, loading } = useAppContext()
  const [isResetOpen, setIsResetOpen] = useState(false)
  const [resetMessage, setResetMessage] = useState('')
  const [showPinModal, setShowPinModal] = useState(false)
  const [pinData, setPinData] = useState({
    currentPin: '',
    newPin: '',
    confirmPin: '',
  })
  const [pinError, setPinError] = useState('')

  const saveSetting = async (key, value) => {
    await updateSettings({ [key]: value })
  }

  const handleExportCSV = () => {
    const headers = 'ID,Date,Merchant,Category,Amount,Type,Status\n'
    const rows = transactions
      .map(
        (transaction) =>
          `${transaction.id},${transaction.date},${transaction.merchant},${transaction.category},${transaction.amount},${transaction.type},${transaction.status}`,
      )
      .join('\n')
    const csv = headers + rows
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `moneypulse_export_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleReset = async () => {
    const reset = await resetTransactions()
    if (reset) {
      setResetMessage('All transactions have been reset.')
      setIsResetOpen(false)
      setTimeout(() => setResetMessage(''), 3000)
    }
  }

  const handleSavePin = async () => {
    const { currentPin, newPin, confirmPin } = pinData

    if (newPin.length < 4) {
      setPinError('PIN minimal 4 digit')
      return
    }

    if (newPin !== confirmPin) {
      setPinError('PIN tidak cocok')
      return
    }

    if (settings.transaction_pin && currentPin !== settings.transaction_pin) {
      setPinError('PIN lama salah')
      return
    }

    const saved = await updateSettings({ transaction_pin: newPin })
    if (saved) {
      setShowPinModal(false)
      setPinData({ currentPin: '', newPin: '', confirmPin: '' })
      setPinError('')
    } else {
      setPinError('Gagal menyimpan PIN. Coba lagi.')
    }
  }

  if (loading.settings) {
    return (
      <div className="h-[calc(100vh-2.5rem)] flex items-center justify-center">
        <p className="text-slate-400 text-lg">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-2.5rem)] flex flex-col gap-5">
      <main className="flex-1 overflow-y-auto flex flex-col gap-5">
        <header className="flex items-center justify-between rounded-3xl bg-white px-7 py-5 border border-slate-100 shadow-sm shrink-0">
          <div>
            <p className="text-sm text-slate-400 font-medium">System</p>
            <h1 className="mt-0.5 text-2xl font-bold text-slate-900 tracking-tight">
              Settings
            </h1>
          </div>
          {resetMessage && (
            <span className="text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              {resetMessage}
            </span>
          )}
        </header>

        <div className="grid gap-5 xl:grid-cols-2">
          <div className="flex flex-col gap-5">
            <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-[#8B5CF6]">
                  <Settings size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Preferences</p>
                  <p className="text-xs text-slate-400">Synced from Supabase</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe size={14} className="text-slate-400" />
                    <span className="text-sm text-slate-700">Default Currency</span>
                  </div>
                  <select
                    value={settings.currency}
                    onChange={(event) => saveSetting('currency', event.target.value)}
                    className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
                  >
                    <option value="IDR">IDR (Rp)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" />
                    <span className="text-sm text-slate-700">Date Format</span>
                  </div>
                  <select
                    value={settings.date_format}
                    onChange={(event) => saveSetting('date_format', event.target.value)}
                    className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Type size={14} className="text-slate-400" />
                    <span className="text-sm text-slate-700">Language</span>
                  </div>
                  <select
                    value={settings.language}
                    onChange={(event) => saveSetting('language', event.target.value)}
                    className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
                  >
                    <option value="Indonesian">Bahasa Indonesia</option>
                    <option value="English">English</option>
                  </select>
                </div>
              </div>
            </article>

            <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                  <Palette size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Appearance</p>
                  <p className="text-xs text-slate-400">Theme and display settings</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-700 mb-2">Theme</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'light', icon: Sun, label: 'Light' },
                      { value: 'dark', icon: Moon, label: 'Dark' },
                      { value: 'system', icon: Monitor, label: 'System' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => saveSetting('theme', option.value)}
                        className={`flex flex-col items-center gap-2 rounded-2xl p-4 border transition-all duration-200 ${
                          settings.theme === option.value
                            ? 'border-[#8B5CF6] bg-violet-50 ring-2 ring-[#8B5CF6]/20'
                            : 'border-slate-100 hover:bg-slate-50'
                        }`}
                      >
                        <option.icon
                          size={20}
                          className={
                            settings.theme === option.value
                              ? 'text-[#8B5CF6]'
                              : 'text-slate-400'
                          }
                        />
                        <span
                          className={`text-xs font-medium ${
                            settings.theme === option.value
                              ? 'text-[#8B5CF6]'
                              : 'text-slate-600'
                          }`}
                        >
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-700 mb-2">Font Size</p>
                  <RadioGroup
                    selected={settings.font_size}
                    onChange={(value) => saveSetting('font_size', value)}
                    options={[
                      { value: 'small', label: 'Small' },
                      { value: 'normal', label: 'Normal' },
                      { value: 'large', label: 'Large' },
                    ]}
                  />
                </div>
              </div>
            </article>

            <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <Info size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">About</p>
                  <p className="text-xs text-slate-400">App information</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  ['Version', '1.2.0'],
                  ['Database', 'Supabase PostgreSQL'],
                  ['Transactions', `${transactions.length} records`],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between items-center py-2 px-3 rounded-2xl bg-slate-50"
                  >
                    <span className="text-sm text-slate-500">{label}</span>
                    <span className="text-sm font-semibold text-slate-800">{value}</span>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <div className="flex flex-col gap-5">
            <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-500">
                  <Bell size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Notifications</p>
                  <p className="text-xs text-slate-400">Manage your alerts</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  {
                    key: 'email_alerts',
                    label: 'Email Alerts',
                    desc: 'Get notified on major transactions',
                  },
                  {
                    key: 'monthly_reports',
                    label: 'Monthly Reports',
                    desc: 'Receive monthly financial summary',
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between py-3 px-4 rounded-2xl hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">{item.label}</p>
                      <p className="text-[10px] text-slate-400">{item.desc}</p>
                    </div>
                    <ToggleSwitch
                      enabled={settings[item.key]}
                      onChange={() => saveSetting(item.key, !settings[item.key])}
                    />
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Database size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Data Management</p>
                  <p className="text-xs text-slate-400">Export or reset your data</p>
                </div>
              </div>
              <div className="space-y-2">
                <button
                  onClick={handleExportCSV}
                  className="w-full flex items-center gap-3 rounded-2xl p-4 border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Download size={18} />
                  </span>
                  <div className="text-left flex-1">
                    <p className="text-sm font-semibold text-slate-800">Export to CSV</p>
                    <p className="text-xs text-slate-400">
                      Download all {transactions.length} transactions
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => setIsResetOpen(true)}
                  className="w-full flex items-center gap-3 rounded-2xl p-4 border border-rose-200 hover:bg-rose-50 transition-colors"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-500">
                    <RotateCcw size={18} />
                  </span>
                  <div className="text-left flex-1">
                    <p className="text-sm font-semibold text-rose-600">
                      Reset All Transactions
                    </p>
                    <p className="text-xs text-rose-400">This action cannot be undone</p>
                  </div>
                </button>
              </div>
            </article>

            <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <Shield size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Privacy & Security</p>
                  <p className="text-xs text-slate-400">Protect your account</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 px-4 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-slate-800">Biometric Login</p>
                    <p className="text-[10px] text-slate-400">Use fingerprint or face ID</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.biometric_login}
                    onChange={() =>
                      saveSetting('biometric_login', !settings.biometric_login)
                    }
                  />
                </div>
                <div className="flex items-center justify-between py-3 px-4 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-slate-800">Transaction PIN</p>
                    <p className="text-[10px] text-slate-400">
                      {settings.transaction_pin ? 'PIN: ****' : 'Required for payments'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPinModal(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-[#8B5CF6] px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700 transition-colors"
                  >
                    <Lock size={12} /> {settings.transaction_pin ? 'Change' : 'Set PIN'}
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </main>

      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm border border-slate-100 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              {settings.transaction_pin ? 'Change Transaction PIN' : 'Set Transaction PIN'}
            </h2>
            {pinError && (
              <div className="bg-rose-50 text-rose-600 text-sm rounded-xl p-3 mb-4">
                {pinError}
              </div>
            )}
            <div className="space-y-3">
              {settings.transaction_pin && (
                <input
                  type="password"
                  value={pinData.currentPin}
                  onChange={(event) =>
                    setPinData({ ...pinData, currentPin: event.target.value })
                  }
                  maxLength={6}
                  placeholder="Current PIN"
                  className="w-full rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
                />
              )}
              <input
                type="password"
                value={pinData.newPin}
                onChange={(event) => setPinData({ ...pinData, newPin: event.target.value })}
                maxLength={6}
                placeholder="New PIN"
                className="w-full rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
              />
              <input
                type="password"
                value={pinData.confirmPin}
                onChange={(event) =>
                  setPinData({ ...pinData, confirmPin: event.target.value })
                }
                maxLength={6}
                placeholder="Confirm PIN"
                className="w-full rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowPinModal(false)
                  setPinError('')
                  setPinData({ currentPin: '', newPin: '', confirmPin: '' })
                }}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePin}
                className="flex-1 rounded-xl bg-[#8B5CF6] py-2.5 text-sm font-medium text-white hover:bg-violet-700"
              >
                Save PIN
              </button>
            </div>
          </div>
        </div>
      )}

      <ResetModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onConfirm={handleReset}
      />
    </div>
  )
}
