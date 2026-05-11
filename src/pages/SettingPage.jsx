// src/pages/SettingPage.jsx
import { useState, useEffect } from "react";
import {
  Settings, Bell, Palette, Database, Shield, Info,
  ChevronDown, ToggleLeft, ToggleRight, Download, Upload,
  RotateCcw, AlertTriangle, Globe, Calendar, Type,
  Moon, Sun, Monitor, Smartphone, Lock, ExternalLink,
} from "lucide-react";
import { useAppContext } from '../context/AppContext'
import { supabase } from '../lib/supabase'

// ── TOGGLE SWITCH ──
function ToggleSwitch({ enabled, onChange }) {
  return (
    <button onClick={onChange} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${enabled ? "bg-[#8B5CF6]" : "bg-slate-200"}`}>
      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${enabled ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

// ── RADIO GROUP ──
function RadioGroup({ options, selected, onChange }) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button key={opt.value} onClick={() => onChange(opt.value)}
          className={`rounded-xl px-4 py-2 text-xs font-medium transition-all duration-200 ${selected === opt.value ? "bg-[#8B5CF6] text-white shadow-sm" : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100"}`}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── RESET MODAL ──
function ResetModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm border border-slate-100 shadow-xl">
        <div className="text-center mb-4">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-500 mb-3"><AlertTriangle size={28} /></div>
          <h2 className="text-lg font-bold text-slate-900">Reset All Transactions?</h2>
          <p className="text-sm text-slate-500 mt-1">This will permanently delete all your financial data. This action cannot be undone.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 rounded-xl bg-rose-500 py-2.5 text-sm font-medium text-white hover:bg-rose-600 transition-colors">Yes, Reset All</button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ──
export default function SettingPage() {
  const { transactions } = useAppContext()
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isResetOpen, setIsResetOpen] = useState(false)
  const [resetMessage, setResetMessage] = useState('')

  // Load settings dari Supabase
useEffect(() => {
  const loadSettings = async () => {
    let { data, error } = await supabase.from('user_settings').select('*').eq('id', 1).maybeSingle()
    
    if (!data) {
      // Insert default
      await supabase.from('user_settings').upsert({ id: 1, theme: 'light', currency: 'IDR', date_format: 'DD/MM/YYYY', language: 'Indonesian', email_alerts: true, monthly_reports: false, font_size: 'normal', biometric_login: false, transaction_pin: '' }, { onConflict: 'id' })
      
      // Fetch lagi
      const res = await supabase.from('user_settings').select('*').eq('id', 1).maybeSingle()
      if (res.data) {
        setSettings(res.data)
      }
    } else {
      setSettings(data)
    }
    
    setLoading(false)
  }
  loadSettings()
}, [])

  // SAVE SETTING
const saveSetting = async (key, value) => {
  setSettings(prev => ({ ...prev, [key]: value }))
  await supabase.from('user_settings').update({ [key]: value }).eq('id', 1)
  
  if (key === 'theme') {
    localStorage.setItem('majumoney_theme', value)
  }
}

  // Apply theme
useEffect(() => {
  if (!settings) return
  
  if (settings.theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else if (settings.theme === 'light') {
    document.documentElement.classList.remove('dark')
  } else if (settings.theme === 'system') {
    // Detect Windows/macOS/Android dark mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
}, [settings?.theme])

// Perubahan Sistem Theme
useEffect(() => {
  if (!settings || settings.theme !== 'system') return
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  const handleChange = (e) => {
    if (e.matches) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
  
  mediaQuery.addEventListener('change', handleChange)
  return () => mediaQuery.removeEventListener('change', handleChange)
}, [settings?.theme])

  // Apply font size
  useEffect(() => {
    if (!settings) return
    const html = document.documentElement
    html.style.fontSize = settings.font_size === 'small' ? '14px' : settings.font_size === 'large' ? '18px' : '16px'
  }, [settings?.font_size])

  // Export CSV
  const handleExportCSV = () => {
    const headers = "ID,Date,Merchant,Category,Amount,Type,Status\n"
    const rows = transactions.map(tx => `${tx.id},${tx.date},${tx.merchant},${tx.category},${tx.amount},${tx.type},${tx.status}`).join('\n')
    const csv = headers + rows
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `majumoney_export_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Reset all transactions
  const handleReset = async () => {
    const { error } = await supabase.from('transactions').delete().neq('id', 0)
    if (!error) {
      setResetMessage('All transactions have been reset.')
      setIsResetOpen(false)
      setTimeout(() => setResetMessage(''), 3000)
      window.location.reload()
    }
  }

  // Change PIN
  const handleChangePin = () => {
    const newPin = prompt('Enter new transaction PIN (4-6 digits):')
    if (newPin && newPin.length >= 4) {
      saveSetting('transaction_pin', newPin)
      alert('PIN updated successfully!')
    }
  }

// Apply theme from localStorage BEFORE Supabase loads
useEffect(() => {
  const savedTheme = localStorage.getItem('majumoney_theme')
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark')
  } else if (savedTheme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}, [])

if (loading || !settings) {
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
          <div><p className="text-sm text-slate-400 font-medium">System</p><h1 className="mt-0.5 text-2xl font-bold text-slate-900 tracking-tight">Settings</h1></div>
          {resetMessage && <span className="text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{resetMessage}</span>}
        </header>

        <div className="grid gap-5 xl:grid-cols-2">
          <div className="flex flex-col gap-5">
            {/* Preferences */}
            <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-[#8B5CF6]"><Settings size={18} /></span>
                <div><p className="text-sm font-semibold text-slate-800">Preferences</p><p className="text-xs text-slate-400">Customize your experience</p></div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Globe size={14} className="text-slate-400" /><span className="text-sm text-slate-700">Default Currency</span></div>
                  <select value={settings.currency} onChange={(e) => saveSetting('currency', e.target.value)} className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20">
                    <option value="IDR">IDR (Rp)</option><option value="USD">USD ($)</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Calendar size={14} className="text-slate-400" /><span className="text-sm text-slate-700">Date Format</span></div>
                  <select value={settings.date_format} onChange={(e) => saveSetting('date_format', e.target.value)} className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20">
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option><option value="MM/DD/YYYY">MM/DD/YYYY</option><option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Type size={14} className="text-slate-400" /><span className="text-sm text-slate-700">Language</span></div>
                  <select value={settings.language} onChange={(e) => saveSetting('language', e.target.value)} className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20">
                    <option value="Indonesian">Bahasa Indonesia</option><option value="English">English</option>
                  </select>
                </div>
              </div>
            </article>

            {/* Appearance */}
            <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600"><Palette size={18} /></span>
                <div><p className="text-sm font-semibold text-slate-800">Appearance</p><p className="text-xs text-slate-400">Theme & display settings</p></div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-700 mb-2">Theme</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "light", icon: Sun, label: "Light" },
                      { value: "dark", icon: Moon, label: "Dark" },
                      { value: "system", icon: Monitor, label: "System" },
                    ].map((opt) => (
                      <button key={opt.value} onClick={() => saveSetting('theme', opt.value)}
                        className={`flex flex-col items-center gap-2 rounded-2xl p-4 border transition-all duration-200 ${settings.theme === opt.value ? "border-[#8B5CF6] bg-violet-50 ring-2 ring-[#8B5CF6]/20" : "border-slate-100 hover:bg-slate-50"}`}>
                        <opt.icon size={20} className={settings.theme === opt.value ? "text-[#8B5CF6]" : "text-slate-400"} />
                        <span className={`text-xs font-medium ${settings.theme === opt.value ? "text-[#8B5CF6]" : "text-slate-600"}`}>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-700 mb-2">Font Size</p>
                  <RadioGroup selected={settings.font_size} onChange={(val) => saveSetting('font_size', val)} options={[
                    { value: "small", label: "Small" }, { value: "normal", label: "Normal" }, { value: "large", label: "Large" },
                  ]} />
                </div>
              </div>
            </article>

            {/* About */}
            <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600"><Info size={18} /></span>
                <div><p className="text-sm font-semibold text-slate-800">About</p><p className="text-xs text-slate-400">App information</p></div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 px-3 rounded-2xl bg-slate-50"><span className="text-sm text-slate-500">Version</span><span className="text-sm font-semibold text-slate-800">1.2.0</span></div>
                <div className="flex justify-between items-center py-2 px-3 rounded-2xl bg-slate-50"><span className="text-sm text-slate-500">Developer</span><span className="text-sm font-semibold text-slate-800">Jackson Maju Tambunan</span></div>
                <div className="flex justify-between items-center py-2 px-3 rounded-2xl bg-slate-50"><span className="text-sm text-slate-500">Database</span><span className="text-sm font-semibold text-slate-800">Supabase PostgreSQL</span></div>
                <div className="flex justify-between items-center py-2 px-3 rounded-2xl bg-slate-50"><span className="text-sm text-slate-500">Transactions</span><span className="text-sm font-semibold text-slate-800">{transactions.length} records</span></div>
                <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#8B5CF6] px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700 transition-colors">
                  Check for Updates <ExternalLink size={14} />
                </button>
              </div>
            </article>
          </div>

          <div className="flex flex-col gap-5">
            {/* Notifications */}
            <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-500"><Bell size={18} /></span>
                <div><p className="text-sm font-semibold text-slate-800">Notifications</p><p className="text-xs text-slate-400">Manage your alerts</p></div>
              </div>
              <div className="space-y-3">
                {[
                  { key: 'email_alerts', label: "Email Alerts", desc: "Get notified on major transactions" },
                  { key: 'monthly_reports', label: "Monthly Reports", desc: "Receive financial summary via email" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-3 px-4 rounded-2xl hover:bg-slate-50 transition-colors">
                    <div><p className="text-sm font-medium text-slate-800">{item.label}</p><p className="text-[10px] text-slate-400">{item.desc}</p></div>
                    <ToggleSwitch enabled={settings[item.key]} onChange={() => saveSetting(item.key, !settings[item.key])} />
                  </div>
                ))}
              </div>
            </article>

            {/* Data Management */}
            <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600"><Database size={18} /></span>
                <div><p className="text-sm font-semibold text-slate-800">Data Management</p><p className="text-xs text-slate-400">Backup & restore data</p></div>
              </div>
              <div className="space-y-2">
                <button onClick={handleExportCSV} className="w-full flex items-center gap-3 rounded-2xl p-4 border border-slate-100 hover:bg-slate-50 transition-colors">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600"><Download size={18} /></span>
                  <div className="text-left flex-1"><p className="text-sm font-semibold text-slate-800">Export to CSV</p><p className="text-xs text-slate-400">Download all {transactions.length} transactions</p></div>
                  <ChevronDown size={16} className="text-slate-300 -rotate-90" />
                </button>
                <button onClick={() => alert('Backup feature coming soon!')} className="w-full flex items-center gap-3 rounded-2xl p-4 border border-slate-100 hover:bg-slate-50 transition-colors">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-[#8B5CF6]"><Upload size={18} /></span>
                  <div className="text-left flex-1"><p className="text-sm font-semibold text-slate-800">Backup to Cloud</p><p className="text-xs text-slate-400">Save to Google Drive</p></div>
                  <ChevronDown size={16} className="text-slate-300 -rotate-90" />
                </button>
                <button onClick={() => setIsResetOpen(true)} className="w-full flex items-center gap-3 rounded-2xl p-4 border border-rose-200 hover:bg-rose-50 transition-colors">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-500"><RotateCcw size={18} /></span>
                  <div className="text-left flex-1"><p className="text-sm font-semibold text-rose-600">Reset All Transactions</p><p className="text-xs text-rose-400">This action cannot be undone</p></div>
                  <ChevronDown size={16} className="text-rose-300 -rotate-90" />
                </button>
              </div>
            </article>

            {/* Privacy & Security */}
            <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><Shield size={18} /></span>
                <div><p className="text-sm font-semibold text-slate-800">Privacy & Security</p><p className="text-xs text-slate-400">Protect your account</p></div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 px-4 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div><p className="text-sm font-medium text-slate-800">Biometric Login</p><p className="text-[10px] text-slate-400">Use fingerprint or face ID</p></div>
                  <ToggleSwitch enabled={settings.biometric_login} onChange={() => saveSetting('biometric_login', !settings.biometric_login)} />
                </div>
                <div className="flex items-center justify-between py-3 px-4 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div><p className="text-sm font-medium text-slate-800">Transaction PIN</p><p className="text-[10px] text-slate-400">{settings.transaction_pin ? 'PIN: ****' : 'Required for payments'}</p></div>
                  <button onClick={handleChangePin} className="flex items-center gap-1.5 rounded-xl bg-[#8B5CF6] px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700 transition-colors">
                    <Lock size={12} /> {settings.transaction_pin ? 'Change' : 'Set PIN'}
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </main>

      <ResetModal isOpen={isResetOpen} onClose={() => setIsResetOpen(false)} onConfirm={handleReset} />
    </div>
  );
}