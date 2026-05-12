// src/pages/ProfilePage.jsx
import { useMemo, useState } from "react";
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
  Crosshair,
  Loader2,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

function DownloadModal({ isOpen, onClose, transactions }) {
  if (!isOpen) return null;

  const downloadBlob = (content, type, filename) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  const handleExportCSV = () => {
    const headers = "ID,Date,Merchant,Category,Amount,Type,Status\n";
    const rows = transactions
      .map(
        (t) => `${t.id},${t.date},${t.merchant},${t.category},${t.amount},${t.type},${t.status}`
      )
      .join("\n");
    downloadBlob(headers + rows, "text/csv", `export_${new Date().toISOString().split("T")[0]}.csv`);
  };

  const handleExportJSON = () => {
    downloadBlob(
      JSON.stringify(transactions, null, 2),
      "application/json",
      `export_${new Date().toISOString().split("T")[0]}.json`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-4">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 mb-3">
            <Download size={28} />
          </div>
          <h2 className="text-lg font-bold text-white">Export Data</h2>
          <p className="text-sm text-slate-400 mt-1">Download all {transactions.length} records</p>
        </div>
        <div className="space-y-2">
          <button onClick={handleExportCSV} className="w-full flex items-center gap-3 rounded-xl p-4 border border-slate-700 hover:bg-slate-800/50 transition-colors">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400"><FileText size={18} /></span>
            <div className="text-left flex-1"><p className="text-sm font-semibold text-white">CSV Format</p><p className="text-xs text-slate-400">Spreadsheet compatible</p></div>
          </button>
          <button onClick={handleExportJSON} className="w-full flex items-center gap-3 rounded-xl p-4 border border-slate-700 hover:bg-slate-800/50 transition-colors">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400"><Database size={18} /></span>
            <div className="text-left flex-1"><p className="text-sm font-semibold text-white">JSON Format</p><p className="text-xs text-slate-400">Developer friendly</p></div>
          </button>
        </div>
        <button onClick={onClose} className="w-full mt-4 rounded-xl border border-slate-700 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 transition-colors">Cancel</button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { transactions, settings, profile: storedProfile, loginHistory, updateProfile, updateProfileAvatar, loading } = useAppContext();
  const { signOut } = useAuth();
  const [draftProfile, setDraftProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [toggles, setToggles] = useState({ biometric: false, alerts: true });
  const [show2FA, setShow2FA] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [factorId, setFactorId] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [twoFactorMessage, setTwoFactorMessage] = useState("");

  const profile = isEditing ? draftProfile ?? storedProfile : storedProfile;
  const avatarUrl = profile?.avatar_url || null;

  const stats = useMemo(() => {
    const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + (t.amount || 0), 0);
    const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + Math.abs(t.amount || 0), 0);
    return { totalTxns: transactions.length, totalIncome, totalExpenses, balance: totalIncome - totalExpenses };
  }, [transactions]);

  const currencySymbol = settings?.currency === "USD" ? "$" : "Rp";

  const start2FASetup = async () => {
    setTwoFactorMessage("");
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    if (error) { setTwoFactorMessage(error.message); return; }
    setQrCode(data.totp.qr_code);
    setFactorId(data.id);
    setShow2FA(true);
  };

  const verify2FA = async () => {
    setTwoFactorMessage("");
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) { setTwoFactorMessage(challengeError.message); return; }
    const { error: verifyError } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code: verifyCode });
    if (verifyError) { setTwoFactorMessage(verifyError.message); return; }
    setShow2FA(false);
    setVerifyCode("");
    setTwoFactorMessage("2FA enabled.");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      setDraftProfile((prev) => ({ ...(prev ?? profile), avatar_url: base64 }));
      await updateProfileAvatar(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    const saved = await updateProfile(profile);
    if (saved) { setDraftProfile(null); setIsEditing(false); }
  };

  const detectLocation = () => {
    setIsDetectingLocation(true);
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      setIsDetectingLocation(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&zoom=10`);
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || "Unknown";
          const country = data.address?.country_code?.toUpperCase() || "ID";
          await updateProfile({ location: `${city}, ${country}` });
        } catch (err) { alert("Failed to get location"); }
        finally { setIsDetectingLocation(false); }
      },
      () => { alert("Location permission denied"); setIsDetectingLocation(false); }
    );
  };

  if (loading.profile && !profile) return <div className="flex justify-center py-20"><div className="animate-pulse text-slate-400">Loading profile...</div></div>;
  if (!profile) return <div className="flex justify-center py-20"><p className="text-slate-400">Profile not available</p></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="relative">
              <label className="cursor-pointer">
                {avatarUrl ? (
                  <img src={avatarUrl} className="h-20 w-20 rounded-full object-cover ring-4 ring-emerald-500/20" alt="Avatar" />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-emerald-500/20">
                    {profile.name?.split(" ").map(n => n[0]).join("") || "U"}
                  </div>
                )}
                {isEditing && (
                  <>
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-sm">
                      <Edit3 size={12} />
                    </div>
                  </>
                )}
              </label>
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <input value={profile.name || ""} onChange={(e) => setDraftProfile({ ...profile, name: e.target.value })} className="w-full text-2xl font-bold bg-slate-800/50 rounded-xl px-3 py-1 border border-slate-700 text-white focus:border-emerald-500" />
                <input value={profile.title || ""} onChange={(e) => setDraftProfile({ ...profile, title: e.target.value })} className="w-full text-slate-400 bg-slate-800/50 rounded-xl px-3 py-1 border border-slate-700 focus:border-emerald-500" />
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-bold text-white">{profile.name || "User"}</h1>
                <p className="text-slate-400 flex items-center gap-1.5 mt-1"><GraduationCap size={14} /> {profile.title || "Dashboard user"}</p>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400"><Calendar size={11} /> Member since {profile.memberSince || "-"}</span>
                  <div className="flex items-center gap-1">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400"><MapPin size={11} /> {profile.location || "-"}</span>
                    <button onClick={detectLocation} disabled={isDetectingLocation} className="inline-flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 w-6 h-6 transition-colors disabled:opacity-50" title="Detect location">
                      {isDetectingLocation ? <Loader2 size={12} className="animate-spin text-slate-400" /> : <Crosshair size={12} className="text-slate-400" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button onClick={() => isEditing ? handleSaveProfile() : (setDraftProfile(storedProfile), setIsEditing(true))} className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${isEditing ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"}`}>
            {isEditing ? <Save size={14} /> : <Edit3 size={14} />}{isEditing ? "Save" : "Edit"}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Transactions", value: stats.totalTxns, color: "bg-emerald-500/10 text-emerald-400" },
          { label: "Total Income", value: `${currencySymbol} ${(stats.totalIncome / 1000).toFixed(0)}k`, color: "bg-emerald-500/10 text-emerald-400" },
          { label: "Total Expenses", value: `${currencySymbol} ${(stats.totalExpenses / 1000).toFixed(0)}k`, color: "bg-red-500/10 text-red-400" },
          { label: "Balance", value: `${currencySymbol} ${(stats.balance / 1000).toFixed(0)}k`, color: "bg-emerald-500/10 text-emerald-400" },
        ].map((stat, i) => (
          <div key={i} className={`rounded-xl p-4 ${stat.color}`}><p className="text-xs font-medium opacity-70">{stat.label}</p><p className="text-lg font-bold mt-1">{stat.value}</p></div>
        ))}
      </div>

      {/* Academic Info */}
      <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-4"><div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400"><GraduationCap size={18} /></div><div><h2 className="text-base font-semibold text-white">Academic Info</h2><p className="text-xs text-slate-400">Universitas Sumatera Utara</p></div></div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Program", key: "program" },
            { label: "Semester", key: "semester" },
            { label: "NIM", key: "nim" },
            { label: "Faculty", key: "faculty" },
          ].map((item) => (
            <div key={item.key} className="rounded-lg bg-slate-800/30 p-4">
              <p className="text-xs text-slate-400">{item.label}</p>
              {isEditing ? (
                <input value={profile[item.key] || ""} onChange={(e) => setDraftProfile({ ...profile, [item.key]: e.target.value })} className="text-sm font-semibold text-white mt-1 bg-transparent border-b border-slate-700 focus:border-emerald-500 w-full" />
              ) : (
                <p className="text-sm font-semibold text-white mt-1">{profile[item.key] || "-"}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Security Settings */}
      <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-4"><div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400"><ShieldCheck size={18} /></div><div><h2 className="text-base font-semibold text-white">Security Settings</h2><p className="text-xs text-slate-400">Manage account security</p></div></div>
        <div className="space-y-1">
          <div className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-slate-800/30 transition-colors">
            <div><p className="text-sm font-medium text-white">Two-Factor Authentication</p><p className="text-xs text-slate-400">Secure with authenticator app</p></div>
            <button onClick={start2FASetup} className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600"><ShieldCheck size={12} /> Setup</button>
          </div>
          {[
            { id: "biometric", label: "Biometric Login", desc: "Use fingerprint or face ID", icon: Smartphone },
            { id: "alerts", label: "Transaction Alerts", desc: "Get notified on every transaction", icon: ShieldCheck },
          ].map((setting) => (
            <div key={setting.id} className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-slate-800/30 transition-colors">
              <div className="flex items-center gap-3"><div className="p-1.5 rounded-lg bg-slate-800 text-slate-400"><setting.icon size={14} /></div><div><p className="text-sm font-medium text-white">{setting.label}</p><p className="text-xs text-slate-400">{setting.desc}</p></div></div>
              <button onClick={() => setToggles(prev => ({ ...prev, [setting.id]: !prev[setting.id] }))} className="text-slate-400 hover:text-emerald-400">
                {toggles[setting.id] ? <ToggleRight size={28} className="text-emerald-400" /> : <ToggleLeft size={28} />}
              </button>
            </div>
          ))}
        </div>
        {twoFactorMessage && <p className="mt-3 text-xs text-slate-400">{twoFactorMessage}</p>}
      </div>

      {/* Login Activity */}
      <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-4"><div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400"><Clock size={18} /></div><div><h2 className="text-base font-semibold text-white">Login Activity</h2><p className="text-xs text-slate-400">Recent sessions</p></div></div>
        <div className="space-y-2">
          {loginHistory.slice(0, 4).map((login, idx) => (
            <div key={login.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-slate-800/30 transition-colors">
              <span className={`inline-flex h-2 w-2 rounded-full ${idx === 0 ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
              <div className="flex-1"><p className="text-sm font-medium text-white">{login.device || "Unknown"} - {login.browser || "Browser"}</p><p className="text-xs text-slate-400">{login.location || "Unknown"} - {login.time || "Unknown"}</p></div>
              {idx === 0 && <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Current</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Supabase Sync */}
      <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-4"><div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400"><Database size={18} /></div><div><h2 className="text-base font-semibold text-white">Database Sync</h2><p className="text-xs text-slate-400">All data stored in Supabase</p></div></div>
        <div className="grid grid-cols-2 gap-3">
          {[["Transactions", transactions.length], ["Login records", loginHistory.length], ["Settings", "user_settings"], ["Profile", "user_profiles"]].map(([label, val]) => (
            <div key={label} className="rounded-lg bg-slate-800/30 p-4"><p className="text-xs text-slate-400">{label}</p><p className="text-sm font-semibold text-white mt-1">{val}</p></div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button onClick={() => setIsDownloadOpen(true)} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-800/50 border border-slate-700 px-4 py-3 text-sm font-medium text-white hover:bg-slate-700"><Download size={16} /> Export</button>
        <button onClick={signOut} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/20"><LogOut size={16} /> Logout</button>
      </div>

      {/* 2FA Modal */}
      {show2FA && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex justify-between mb-4"><h2 className="text-lg font-bold text-white">Verify 2FA</h2><button onClick={() => setShow2FA(false)} className="text-slate-400 hover:text-white"><X size={20} /></button></div>
            {qrCode && <div className="flex justify-center bg-slate-800/50 p-4 mb-4 rounded-xl"><img src={qrCode} alt="QR" className="w-40 h-40" /></div>}
            <input value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} placeholder="Authenticator code" className="w-full rounded-xl bg-slate-800/50 border border-slate-700 px-3 py-2 text-white focus:border-emerald-500" />
            <button onClick={verify2FA} className="w-full mt-4 rounded-xl bg-emerald-500 py-2.5 text-white hover:bg-emerald-600">Verify</button>
          </div>
        </div>
      )}

      <DownloadModal isOpen={isDownloadOpen} onClose={() => setIsDownloadOpen(false)} transactions={transactions} />
    </div>
  );
}