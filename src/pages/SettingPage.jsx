// src/pages/SettingPage.jsx
import { useState } from "react";
import {
  Settings,
  Bell,
  Database,
  Shield,
  Info,
  ChevronDown,
  ToggleLeft,
  ToggleRight,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  Globe,
  Calendar,
  Type,
  Smartphone,
  Lock,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

function ToggleSwitch({ enabled, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${
        enabled ? "bg-emerald-500" : "bg-slate-700"
      }`}
    >
      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${enabled ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
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
              ? "bg-emerald-500 text-white shadow-sm"
              : "bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function ResetModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-4">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 mb-3">
            <AlertTriangle size={28} />
          </div>
          <h2 className="text-lg font-bold text-white">Reset All Transactions?</h2>
          <p className="text-sm text-slate-400 mt-1">This will permanently delete all your transaction records.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-700 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800">Cancel</button>
          <button onClick={onConfirm} className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-medium text-white hover:bg-red-600">Reset</button>
        </div>
      </div>
    </div>
  );
}

export default function SettingPage() {
  const { transactions, settings, updateSettings, resetTransactions, loading } = useAppContext();
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [isSettingNewPin, setIsSettingNewPin] = useState(false);
  const [pinData, setPinData] = useState({ currentPin: "", newPin: "", confirmPin: "" });
  const [pinError, setPinError] = useState("");

  const saveSetting = async (key, value) => {
    await updateSettings({ [key]: value });
  };

  const handleExportCSV = () => {
    const headers = "ID,Date,Merchant,Category,Amount,Type,Status\n";
    const rows = transactions.map((t) => `${t.id},${t.date},${t.merchant},${t.category},${t.amount},${t.type},${t.status}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `settings_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = async () => {
    const reset = await resetTransactions();
    if (reset) {
      setResetMessage("All transactions have been reset.");
      setIsResetOpen(false);
      setTimeout(() => setResetMessage(""), 3000);
    }
  };

  const handleChangePin = () => {
    setIsSettingNewPin(!settings?.transaction_pin);
    setShowPinModal(true);
  };

  const handleSavePin = async () => {
    const { currentPin, newPin, confirmPin } = pinData;
    if (newPin.length < 4) { setPinError("PIN minimal 4 digit"); return; }
    if (newPin !== confirmPin) { setPinError("PIN tidak cocok"); return; }
    if (!isSettingNewPin && settings?.transaction_pin && currentPin !== settings.transaction_pin) {
      setPinError("PIN lama salah");
      return;
    }
    const saved = await updateSettings({ transaction_pin: newPin });
    if (saved) {
      setShowPinModal(false);
      setPinData({ currentPin: "", newPin: "", confirmPin: "" });
      setPinError("");
    } else {
      setPinError("Gagal menyimpan PIN");
    }
  };

  if (loading.settings) {
    return <div className="flex justify-center py-20"><div className="animate-pulse text-slate-400">Loading settings...</div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your account preferences</p>
        {resetMessage && <span className="inline-block mt-2 text-sm text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">{resetMessage}</span>}
      </div>

      {/* Preferences */}
      <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400"><Settings size={18} /></div>
          <div><h2 className="text-base font-semibold text-white">Preferences</h2><p className="text-xs text-slate-400">Customize your experience</p></div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Globe size={14} className="text-slate-400" /><span className="text-sm text-white">Default Currency</span></div>
            <select value={settings.currency} onChange={(e) => saveSetting("currency", e.target.value)} className="rounded-xl bg-slate-800/50 border border-slate-700 px-3 py-1.5 text-sm text-white focus:border-emerald-500">
              <option value="IDR">IDR (Rp)</option><option value="USD">USD ($)</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Calendar size={14} className="text-slate-400" /><span className="text-sm text-white">Date Format</span></div>
            <select value={settings.date_format} onChange={(e) => saveSetting("date_format", e.target.value)} className="rounded-xl bg-slate-800/50 border border-slate-700 px-3 py-1.5 text-sm text-white focus:border-emerald-500">
              <option value="DD/MM/YYYY">DD/MM/YYYY</option><option value="MM/DD/YYYY">MM/DD/YYYY</option><option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Type size={14} className="text-slate-400" /><span className="text-sm text-white">Language</span></div>
            <select value={settings.language} onChange={(e) => saveSetting("language", e.target.value)} className="rounded-xl bg-slate-800/50 border border-slate-700 px-3 py-1.5 text-sm text-white focus:border-emerald-500">
              <option value="Indonesian">Bahasa Indonesia</option><option value="English">English</option>
            </select>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-700">
            <div className="flex items-center gap-2"><Type size={14} className="text-slate-400" /><span className="text-sm text-white">Font Size</span></div>
            <RadioGroup selected={settings.font_size} onChange={(v) => saveSetting("font_size", v)} options={[
              { value: "small", label: "Small" }, { value: "normal", label: "Normal" }, { value: "large", label: "Large" },
            ]} />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400"><Bell size={18} /></div>
          <div><h2 className="text-base font-semibold text-white">Notifications</h2><p className="text-xs text-slate-400">Manage your alerts</p></div>
        </div>
        <div className="space-y-3">
          {[
            { key: "email_alerts", label: "Email Alerts", desc: "Get notified on major transactions" },
            { key: "monthly_reports", label: "Monthly Reports", desc: "Receive monthly financial summary" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-slate-800/30 transition-colors">
              <div><p className="text-sm font-medium text-white">{item.label}</p><p className="text-xs text-slate-400">{item.desc}</p></div>
              <ToggleSwitch enabled={settings[item.key]} onChange={() => saveSetting(item.key, !settings[item.key])} />
            </div>
          ))}
        </div>
      </div>

      {/* Data Management */}
      <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400"><Database size={18} /></div>
          <div><h2 className="text-base font-semibold text-white">Data Management</h2><p className="text-xs text-slate-400">Export or reset your data</p></div>
        </div>
        <div className="space-y-2">
          <button onClick={handleExportCSV} className="w-full flex items-center gap-3 rounded-xl p-4 border border-slate-700 hover:bg-slate-800/50 transition-colors">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400"><Download size={18} /></span>
            <div className="text-left flex-1"><p className="text-sm font-semibold text-white">Export to CSV</p><p className="text-xs text-slate-400">Download all {transactions.length} transactions</p></div>
            <ChevronDown size={16} className="text-slate-500 -rotate-90" />
          </button>
          <button onClick={() => alert("Backup coming soon")} className="w-full flex items-center gap-3 rounded-xl p-4 border border-slate-700 hover:bg-slate-800/50 transition-colors">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400"><Upload size={18} /></span>
            <div className="text-left flex-1"><p className="text-sm font-semibold text-white">Backup to Cloud</p><p className="text-xs text-slate-400">Coming soon</p></div>
            <ChevronDown size={16} className="text-slate-500 -rotate-90" />
          </button>
          <button onClick={() => setIsResetOpen(true)} className="w-full flex items-center gap-3 rounded-xl p-4 border border-red-500/20 hover:bg-red-500/10 transition-colors">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-400"><RotateCcw size={18} /></span>
            <div className="text-left flex-1"><p className="text-sm font-semibold text-red-400">Reset All Transactions</p><p className="text-xs text-red-400/70">This action cannot be undone</p></div>
            <ChevronDown size={16} className="text-red-500 -rotate-90" />
          </button>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400"><Shield size={18} /></div>
          <div><h2 className="text-base font-semibold text-white">Privacy & Security</h2><p className="text-xs text-slate-400">Protect your account</p></div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-slate-800/30 transition-colors">
            <div><p className="text-sm font-medium text-white">Biometric Login</p><p className="text-xs text-slate-400">Use fingerprint or face ID</p></div>
            <ToggleSwitch enabled={settings.biometric_login} onChange={() => saveSetting("biometric_login", !settings.biometric_login)} />
          </div>
          <div className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-slate-800/30 transition-colors">
            <div><p className="text-sm font-medium text-white">Transaction PIN</p><p className="text-xs text-slate-400">{settings.transaction_pin ? "PIN: ****" : "Required for payments"}</p></div>
            <button onClick={handleChangePin} className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600"><Lock size={12} /> {settings.transaction_pin ? "Change" : "Set PIN"}</button>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400"><Info size={18} /></div>
          <div><h2 className="text-base font-semibold text-white">About</h2><p className="text-xs text-slate-400">App information</p></div>
        </div>
        <div className="space-y-3">
          {[
            ["Version", "1.2.0"],
            ["Developer", "Jackson Maju Tambunan"],
            ["Database", "Supabase PostgreSQL"],
            ["Transactions", `${transactions.length} records`],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between items-center py-2 px-3 rounded-lg bg-slate-800/30">
              <span className="text-sm text-slate-400">{label}</span>
              <span className="text-sm font-semibold text-white">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-4">{isSettingNewPin ? "Set Transaction PIN" : "Change Transaction PIN"}</h2>
            {pinError && <div className="bg-red-500/10 text-red-400 text-sm rounded-xl p-3 mb-4">{pinError}</div>}
            <div className="space-y-3">
              {!isSettingNewPin && settings?.transaction_pin && (
                <input type="password" value={pinData.currentPin} onChange={(e) => setPinData({ ...pinData, currentPin: e.target.value })} maxLength={6} placeholder="Current PIN" className="w-full rounded-xl bg-slate-800/50 border border-slate-700 px-3 py-2 text-white placeholder:text-slate-500 focus:border-emerald-500" />
              )}
              <input type="password" value={pinData.newPin} onChange={(e) => setPinData({ ...pinData, newPin: e.target.value })} maxLength={6} placeholder="New PIN" className="w-full rounded-xl bg-slate-800/50 border border-slate-700 px-3 py-2 text-white focus:border-emerald-500" />
              <input type="password" value={pinData.confirmPin} onChange={(e) => setPinData({ ...pinData, confirmPin: e.target.value })} maxLength={6} placeholder="Confirm PIN" className="w-full rounded-xl bg-slate-800/50 border border-slate-700 px-3 py-2 text-white focus:border-emerald-500" />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setShowPinModal(false); setPinError(""); setPinData({ currentPin: "", newPin: "", confirmPin: "" }); }} className="flex-1 rounded-xl border border-slate-700 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800">Cancel</button>
              <button onClick={handleSavePin} className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-sm font-medium text-white hover:bg-emerald-600">{isSettingNewPin ? "Set PIN" : "Save PIN"}</button>
            </div>
          </div>
        </div>
      )}

      <ResetModal isOpen={isResetOpen} onClose={() => setIsResetOpen(false)} onConfirm={handleReset} />
    </div>
  );
}