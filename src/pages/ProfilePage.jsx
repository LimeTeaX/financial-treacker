// src/pages/ProfilePage.jsx
import { useState, useEffect, useMemo } from "react";
import {
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
  Eye,
  FileText,
  Database,
  Save,
  X,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { QRCodeCanvas } from "qrcode.react";

// ── CONNECTED APPS ──
const CONNECTED_APPS = [
  {
    id: "seabank",
    name: "SeaBank",
    icon: "🏦",
    bg: "bg-orange-50 border-orange-200",
    iconBg: "bg-orange-100 text-orange-600",
    status: "authorized",
    lastSync: "2 hours ago",
    account: "**** 2849",
  },
  {
    id: "dana",
    name: "DANA",
    icon: "💳",
    bg: "bg-blue-50 border-blue-200",
    iconBg: "bg-blue-100 text-blue-600",
    status: "authorized",
    lastSync: "1 day ago",
    account: "0878****",
  },
  {
    id: "gopay",
    name: "GoPay",
    icon: "🛵",
    bg: "bg-green-50 border-green-200",
    iconBg: "bg-green-100 text-green-600",
    status: "authorized",
    lastSync: "3 hours ago",
    account: "0878****",
  },
  {
    id: "shopeepay",
    name: "ShopeePay",
    icon: "🛒",
    bg: "bg-orange-50 border-orange-200",
    iconBg: "bg-orange-100 text-orange-600",
    status: "disconnected",
    lastSync: "Never",
    account: "—",
  },
];

// ── DOWNLOAD MODAL ──
function DownloadModal({ isOpen, onClose, transactions }) {
  if (!isOpen) return null;

  const handleExportCSV = () => {
    const headers = "ID,Date,Merchant,Category,Amount,Type,Status\n";
    const rows = transactions
      .map(
        (tx) =>
          `${tx.id},${tx.date},${tx.merchant},${tx.category},${tx.amount},${tx.type},${tx.status}`,
      )
      .join("\n");
    const csv = headers + rows;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `moneypulse_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(transactions, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `moneypulse_export_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onClose();
  };

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
            <ChevronRight size={16} className="text-slate-300" />
          </button>
          <button
            onClick={handleExportJSON}
            className="w-full flex items-center gap-3 rounded-2xl p-4 border border-slate-100 hover:bg-slate-50 transition-colors"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Database size={18} />
            </span>
            <div className="text-left flex-1">
              <p className="text-sm font-semibold text-slate-800">
                JSON Format
              </p>
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
  );
}

// ── MAIN COMPONENT ──
export default function ProfilePage() {
  const { transactions, settings } = useAppContext();
  const { user, signOut } = useAuth();
  const [toggles, setToggles] = useState({
    "2fa": true,
    biometric: false,
    alerts: true,
  });
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null); // Start null, load from Supabase
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);
  const [show2FA, setShow2FA] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [factorId, setFactorId] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  const start2FASetup = async () => {
    const { data, error } = await supabase.auth.mfa.enroll();
    if (data) {
      setQrCode(data.totp.qr_code);
      setFactorId(data.id);
      setShow2FA(true);
    }
  };

  const verify2FA = async () => {
    const { error } = await supabase.auth.mfa.challenge({ factorId });
    if (!error) {
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        code: verifyCode,
      });
      if (!verifyError) {
        setIs2FAEnabled(true);
        setShow2FA(false);
        alert("✅ 2FA Enabled!");
      } else {
        alert("❌ Wrong code!");
      }
    }
  };

  // 🔥 Load profile from Supabase FIRST
  useEffect(() => {
    if (user) {
      supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setProfile(data);
            localStorage.setItem("moneypulse_profile", JSON.stringify(data));
            if (data.avatar_url) {
              setAvatarUrl(data.avatar_url);
              localStorage.setItem("moneypulse_avatar", data.avatar_url);
            }
          } else {
            // Fallback default
            const defaultProfile = {
              name: "User",
              title: "Dashboard user",
              memberSince: "May 2026",
              location: "Medan, ID",
              program: "",
              semester: "",
              nim: "",
              faculty: "",
            };
            setProfile(defaultProfile);
            supabase
              .from("user_profiles")
              .upsert(
                { id: Date.now(), user_id: user.id, ...defaultProfile },
                { onConflict: "user_id" },
              );
          }
        });
    }
  }, [user]);

  // 🔥 Load avatar from localStorage or Supabase
  useEffect(() => {
    const savedAvatar = localStorage.getItem("moneypulse_avatar");
    if (savedAvatar) setAvatarUrl(savedAvatar);
    else if (user) {
      supabase
        .from("user_profiles")
        .select("avatar_url")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.avatar_url) {
            setAvatarUrl(data.avatar_url);
            localStorage.setItem("moneypulse_avatar", data.avatar_url);
          }
        });
    }
  }, [user]);

  // 🔥 Load login history
  useEffect(() => {
    const fetchLoginHistory = async () => {
      const { data, error } = await supabase
        .from("login_history")
        .select("*")
        .order("time", { ascending: false })
        .limit(5);

      if (!error && data) {
        const formatted = data.map((log, i) => ({
          ...log,
          status: i === 0 ? "current" : "success",
        }));
        setLoginHistory(formatted);
      }
    };
    fetchLoginHistory();
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target.result;
        setAvatarUrl(base64);
        localStorage.setItem("moneypulse_avatar", base64);
        if (user) {
          await supabase
            .from("user_profiles")
            .upsert(
              { user_id: user.id, avatar_url: base64 },
              { onConflict: "user_id" },
            );
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    localStorage.setItem("moneypulse_profile", JSON.stringify(profile));
    if (user) {
      const { error } = await supabase.from("user_profiles").upsert(
        {
          user_id: user.id,
          name: profile.name,
          title: profile.title,
          location: profile.location,
          memberSince: profile.memberSince,
          program: profile.program,
          semester: profile.semester,
          nim: profile.nim,
          faculty: profile.faculty,
        },
        { onConflict: "user_id" },
      );

      if (!error) {
        console.log("✅ Profile saved to Supabase");
        window.dispatchEvent(new Event("profileUpdated"));
      } else {
        console.error("❌ Supabase error:", error);
      }
    }
    setIsEditing(false);
  };

  const handleToggle = (id) => {
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Realtime stats
  const stats = useMemo(() => {
    const totalTxns = transactions.length;
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + (t.amount || 0), 0);
    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + Math.abs(t.amount || 0), 0);
    return {
      totalTxns,
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
    };
  }, [transactions]);

  // Loading
  if (!profile) {
    return (
      <div className="h-[calc(100vh-2.5rem)] flex items-center justify-center">
        <p className="text-slate-400 text-lg">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-2.5rem)] flex flex-col gap-5">
      <main className="flex-1 overflow-y-auto flex flex-col gap-5">
        {/* ── Profile Header ── */}
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
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "U"}
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
                    value={profile.name || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    className="w-full text-2xl font-bold bg-slate-50 rounded-xl px-3 py-1 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
                  />
                  <input
                    value={profile.title || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, title: e.target.value })
                    }
                    className="w-full text-slate-500 bg-slate-50 rounded-xl px-3 py-1 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
                  />
                </div>
              ) : (
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {profile.name || "User"}
                  </h1>
                  <p className="text-slate-500 flex items-center gap-1.5 mt-1">
                    <GraduationCap size={14} />
                    {profile.title || "Dashboard user"}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                      <Calendar size={11} /> Member since{" "}
                      {profile.memberSince || "May 2026"}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-[#8B5CF6]">
                      <MapPin size={11} /> {profile.location || "Medan, ID"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() =>
                isEditing ? handleSaveProfile() : setIsEditing(true)
              }
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                isEditing
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : "bg-[#8B5CF6] text-white hover:bg-violet-700"
              }`}
            >
              {isEditing ? <Save size={14} /> : <Edit3 size={14} />}
              {isEditing ? "Save Profile" : "Edit Profile"}
            </button>
          </div>
        </header>

        {/* ── Stats Cards ── */}
        <section className="grid grid-cols-4 gap-3">
          {[
            {
              label: "Total Transactions",
              value: stats.totalTxns,
              color: "bg-violet-50 text-violet-600",
            },
            {
              label: "Total Income",
              value: `${settings?.currency === "USD" ? "$" : "Rp"} ${(stats.totalIncome / 1000).toFixed(0)}k`,
              color: "bg-emerald-50 text-emerald-600",
            },
            {
              label: "Total Expenses",
              value: `${settings?.currency === "USD" ? "$" : "Rp"} ${(stats.totalExpenses / 1000).toFixed(0)}k`,
              color: "bg-rose-50 text-rose-600",
            },
            {
              label: "Balance",
              value: `${settings?.currency === "USD" ? "$" : "Rp"} ${(stats.balance / 1000).toFixed(0)}k`,
              color: "bg-amber-50 text-amber-600",
            },
          ].map((stat, i) => (
            <div key={i} className={`rounded-2xl p-4 ${stat.color}`}>
              <p className="text-xs font-medium opacity-70">{stat.label}</p>
              <p className="text-lg font-bold mt-1">{stat.value}</p>
            </div>
          ))}
        </section>

        {/* ── Main Grid ── */}
        <section className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
          <div className="flex flex-col gap-5">
            {/* Academic Info */}
            <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                    <GraduationCap size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Academic Info
                    </p>
                    <p className="text-xs text-slate-400">
                      Universitas Sumatera Utara
                    </p>
                  </div>
                </div>
                {isEditing && <Edit3 size={14} className="text-slate-400" />}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Program", value: profile.program, key: "program" },
                  {
                    label: "Semester",
                    value: profile.semester,
                    key: "semester",
                  },
                  { label: "NIM", value: profile.nim, key: "nim" },
                  { label: "Faculty", value: profile.faculty, key: "faculty" },
                ].map((item) => (
                  <div key={item.key} className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">{item.label}</p>
                    {isEditing ? (
                      <input
                        value={profile[item.key] || ""}
                        onChange={(e) =>
                          setProfile({ ...profile, [item.key]: e.target.value })
                        }
                        className="text-sm font-semibold text-slate-800 mt-1 bg-transparent border-b border-slate-200 focus:outline-none focus:border-[#8B5CF6] w-full"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-slate-800 mt-1">
                        {profile[item.key] || "—"}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </article>

            {/* Connected Apps */}
            <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <Link size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Connected Apps
                  </p>
                  <p className="text-xs text-slate-400">
                    Financial integrations
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {CONNECTED_APPS.map((app) => (
                  <div
                    key={app.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border ${app.bg} transition-colors`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-lg ${app.iconBg}`}
                      >
                        {app.icon}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {app.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {app.account} • {app.lastSync}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {app.status === "authorized" ? (
                        <>
                          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                            <CheckCircle2 size={10} /> Authorized
                          </span>
                          <button className="flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-700 px-2.5 py-1.5 text-[10px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
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

          <div className="flex flex-col gap-5">
            {/* Security Settings */}
            <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-[#8B5CF6]">
                  <ShieldCheck size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Security Settings
                  </p>
                  <p className="text-xs text-slate-400">
                    Manage your account security
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                {/* 🔥 2FA - Special button (DI LUAR .map) */}
                <div className="flex items-center justify-between py-3 px-4 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      <ShieldCheck size={14} />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        Two-Factor Authentication
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {is2FAEnabled
                          ? "✅ Secured with authenticator app"
                          : "Secure your account with OTP"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={start2FASetup}
                    className="flex items-center gap-1.5 rounded-xl bg-[#8B5CF6] px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700 transition-colors"
                  >
                    <ShieldCheck size={12} /> Setup 2FA
                  </button>
                </div>

                {/* 🔥 Biometric & Alerts - dari .map() */}
                {[
                  {
                    id: "biometric",
                    label: "Biometric Login",
                    desc: "Use fingerprint or face ID",
                    icon: Smartphone,
                  },
                  {
                    id: "alerts",
                    label: "Transaction Alerts",
                    desc: "Get notified on every transaction",
                    icon: Eye,
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
                        <p className="text-sm font-medium text-slate-800">
                          {setting.label}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {setting.desc}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggle(setting.id)}
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
            </article>

            {/* Login Activity */}
            <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                  <Clock size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Login Activity
                  </p>
                  <p className="text-xs text-slate-400">Recent sessions</p>
                </div>
              </div>
              <div className="space-y-2">
                {loginHistory.map((login) => (
                  <div
                    key={login.id}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-2xl hover:bg-slate-50 transition-colors"
                  >
                    <span
                      className={`inline-flex h-2 w-2 rounded-full ${login.status === "current" ? "bg-emerald-400 animate-pulse" : "bg-slate-300"}`}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">
                        {login.device || "Unknown"}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {login.location || "Unknown"} •{" "}
                        {login.time || "Unknown"}
                      </p>
                    </div>
                    {login.status === "current" && (
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
                <Download size={16} /> Export Data
              </button>
              <button
                onClick={async () => {
                  await signOut();
                  window.location.reload();
                }}
                className="flex items-center justify-center gap-2 rounded-2xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-100 transition-colors"
              >
                <LogOut size={16} /> Log Out
              </button>
            </div>
          </div>
        </section>
      </main>

      <DownloadModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
        transactions={transactions}
      />
    </div>
  );
}
