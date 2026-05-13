// src/pages/LandingPage.jsx
import { useState, useEffect } from "react";
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
} from "lucide-react";

export default function LandingPage({ onGetStarted, onLogin }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    { icon: Wallet, title: "Track Expenses", desc: "Easily log and categorize every transaction" },
    { icon: BarChart3, title: "Analytics", desc: "Visual insights into your spending habits" },
    { icon: CreditCard, title: "Bill Payments", desc: "Pay bills directly from the app" },
    { icon: Bell, title: "Smart Alerts", desc: "Get notified about upcoming bills" },
    { icon: Shield, title: "Bank-Level Security", desc: "Your data is encrypted and safe" },
    { icon: Smartphone, title: "Mobile Ready", desc: "Fully responsive on all devices" },
  ];

  const stats = [
    { value: "10k+", label: "Active Users", icon: Users },
    { value: "Rp 50B+", label: "Transactions Tracked", icon: TrendingUp },
    { value: "4.9", label: "User Rating", icon: Star },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500/30 overflow-x-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-slate-900/80 backdrop-blur-lg border-b border-slate-800" : "bg-transparent"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/20">
              M
            </div>
            <span className="font-bold text-xl text-white">MoneyPulse</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onLogin}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            >
              <LogIn size={16} /> Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
            >
              Get Started <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-sm font-medium text-emerald-400 mb-6">
            <Sparkles size={14} /> Smart Personal Finance
            <span className="relative flex h-2 w-2 ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-6">
            Take Control of{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Your Money
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
            Track expenses, pay bills, and achieve your financial goals with MoneyPulse.
            The smart way to manage your personal finances.
          </p>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="group flex items-center gap-2 rounded-2xl bg-emerald-500 px-8 py-4 text-base font-semibold text-white hover:bg-emerald-600 transition-all shadow-lg hover:shadow-xl hover:shadow-emerald-500/20"
            >
              Get Started Free <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onLogin}
              className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-transparent px-8 py-4 text-base font-semibold text-slate-300 hover:bg-slate-800 transition-all"
            >
              Sign In <LogIn size={18} />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-8 border-t border-slate-800">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-400 mb-3 mx-auto">
                  <stat.icon size={20} />
                </div>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating Cards Preview */}
      <div className="max-w-7xl mx-auto px-6 -mt-10 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 text-center hover:border-emerald-500/30 transition-all">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-3">
              <Wallet size={22} />
            </div>
            <p className="text-2xl font-bold text-white">Rp 0</p>
            <p className="text-sm text-slate-500">Starting balance</p>
          </div>
          <div className="rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 text-center hover:border-emerald-500/30 transition-all">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-3">
              <TrendingUp size={22} />
            </div>
            <p className="text-2xl font-bold text-white">0%</p>
            <p className="text-sm text-slate-500">Growth this month</p>
          </div>
          <div className="rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 text-center hover:border-emerald-500/30 transition-all">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-3">
              <Shield size={22} />
            </div>
            <p className="text-2xl font-bold text-white">Secure</p>
            <p className="text-sm text-slate-500">Bank-level encryption</p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <section className="py-20 border-y border-slate-800 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Everything You Need</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Powerful features to help you manage your finances effortlessly
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 border border-slate-800 bg-slate-900/50 transition-all hover:-translate-y-2 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-4">
                  <feature.icon size={22} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center rounded-3xl p-12 border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 backdrop-blur-sm">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Take Control?</h2>
          <p className="text-slate-300 mb-8 max-w-md mx-auto">
            Join thousands of users who are already managing their finances smarter with MoneyPulse.
          </p>
          <button
            onClick={onGetStarted}
            className="group inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-8 py-4 text-base font-semibold text-white hover:bg-emerald-600 transition-all shadow-lg hover:shadow-xl hover:shadow-emerald-500/20"
          >
            Get Started Now{" "}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto text-center text-sm text-slate-500">
          <p>© 2026 MoneyPulse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}