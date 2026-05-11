// src/pages/LandingPage.jsx
import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  LogIn,
  Zap,
  Shield,
  BarChart3,
  Wallet,
  CreditCard,
  Bell,
  Smartphone,
  ChevronRight,
  Star,
  Users,
  TrendingUp,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "../hooks/useTheme";

export default function LandingPage({ onGetStarted, onLogin }) {
  // ========== SEMUA HOOK DIPANGGIL DIATAS (No conditional!) ==========
  const { theme, toggleTheme, loading } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [animated, setAnimated] = useState({});
  const observerRef = useRef(null);

  // ========== useEffect untuk scroll & intersection observer ==========
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setAnimated((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".animate-on-scroll");
    elements.forEach((el) => observerRef.current.observe(el));

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  // ========== Conditional return BOLEH, tapi SETELAH semua hook ==========
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-violet-400 animate-pulse mx-auto mb-4"></div>
          <p className="text-slate-400">Loading MoneyPulse...</p>
        </div>
      </div>
    );
  }

  // ========== DATA STATIC (boleh di sini, bukan hook) ==========
  const features = [
    {
      icon: Wallet,
      title: "Track Expenses",
      desc: "Easily log and categorize every transaction",
      color: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400",
      delay: 0,
    },
    {
      icon: BarChart3,
      title: "Analytics",
      desc: "Visual insights into your spending habits",
      color: "bg-violet-100 dark:bg-violet-900/50 text-[#8B5CF6] dark:text-violet-400",
      delay: 100,
    },
    {
      icon: CreditCard,
      title: "Bill Payments",
      desc: "Pay bills directly from the app",
      color: "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400",
      delay: 200,
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      desc: "Get notified about upcoming bills",
      color: "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400",
      delay: 0,
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      desc: "Your data is encrypted and safe",
      color: "bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400",
      delay: 100,
    },
    {
      icon: Smartphone,
      title: "Mobile Ready",
      desc: "Fully responsive on all devices",
      color: "bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400",
      delay: 200,
    },
  ];

  const stats = [
    { value: "10k+", label: "Active Users", icon: Users, delay: 0 },
    { value: "Rp 50B+", label: "Transactions Tracked", icon: TrendingUp, delay: 100 },
    { value: "4.9", label: "User Rating", icon: Star, delay: 200 },
  ];

  // ========== RENDER ==========
  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-b from-[#F8FAFC] to-white"
      } overflow-x-hidden`}
    >
      {/* ── NAVBAR ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-slate-200 dark:border-slate-700"
            : "border-b border-transparent"
        } bg-white dark:bg-slate-900`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-violet-400 flex items-center justify-center text-white font-bold text-lg">
              M
            </div>
            <span className="font-bold text-xl text-slate-800 dark:text-white">
              MoneyPulse
            </span>
          </div>

          {/* Right buttons */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button
              onClick={onLogin}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <LogIn size={16} /> Sign In
            </button>

            <button
              onClick={onGetStarted}
              className="flex items-center gap-2 rounded-xl bg-[#8B5CF6] px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-700 transition-all shadow-sm"
            >
              Get Started <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 dark:bg-violet-900/50 px-4 py-1.5 text-sm font-medium text-[#8B5CF6] dark:text-violet-400 mb-6">
            <Sparkles size={14} /> Smart Personal Finance
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white tracking-tight mb-6">
            Take Control of{" "}
            <span className="bg-gradient-to-r from-[#8B5CF6] to-violet-400 bg-clip-text text-transparent">
              Your Money
            </span>
          </h1>

          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10">
            Track expenses, pay bills, and achieve your financial goals with
            MoneyPulse. The smart way to manage your personal finances.
          </p>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="group flex items-center gap-2 rounded-2xl bg-[#8B5CF6] px-8 py-4 text-base font-semibold text-white hover:bg-violet-700 transition-all shadow-lg hover:shadow-xl"
            >
              Get Started Free <ChevronRight size={18} />
            </button>
            <button
              onClick={onLogin}
              className="flex items-center gap-2 rounded-2xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-transparent px-8 py-4 text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              Sign In <LogIn size={18} />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-8 border-t border-slate-200 dark:border-slate-700">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mb-3 mx-auto">
                  <stat.icon size={20} />
                </div>
                <p className="text-3xl font-bold text-slate-800 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section
        className={`py-20 border-y ${
          theme === "dark"
            ? "bg-slate-800/30 border-slate-700"
            : "bg-white border-slate-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
              Everything You Need
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Powerful features to help you manage your finances effortlessly
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className={`rounded-3xl p-6 border transition-all hover:-translate-y-2 ${
                  theme === "dark"
                    ? "bg-slate-800/50 border-slate-700 hover:shadow-lg hover:shadow-[#8B5CF6]/10"
                    : "bg-[#F8FAFC] border-slate-100 hover:shadow-lg"
                }`}
              >
                <span
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${feature.color} mb-4`}
                >
                  <feature.icon size={22} />
                </span>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6">
        <div
          className={`max-w-4xl mx-auto text-center rounded-3xl p-12 border backdrop-blur-sm ${
            theme === "dark"
              ? "bg-gradient-to-br from-[#8B5CF6]/20 to-violet-700/20 border-[#8B5CF6]/30"
              : "bg-gradient-to-br from-[#8B5CF6]/10 to-violet-100/30 border-[#8B5CF6]/20"
          }`}
        >
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Ready to Take Control?
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-md mx-auto">
            Join thousands of users who are already managing their finances
            smarter with MoneyPulse.
          </p>
          <button
            onClick={onGetStarted}
            className="group inline-flex items-center gap-2 rounded-2xl bg-[#8B5CF6] px-8 py-4 text-base font-semibold text-white hover:bg-violet-700 transition-all shadow-lg hover:shadow-xl"
          >
            Get Started Now{" "}
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className={`py-8 px-6 border-t ${
          theme === "dark" ? "border-slate-700" : "border-slate-100"
        }`}
      >
        <div className="max-w-7xl mx-auto text-center text-sm text-slate-400">
          <p>© 2026 MoneyPulse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}