// src/pages/AuthPage.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Mail, Lock, UserPlus, LogIn, Sparkles, Shield, Wallet, TrendingUp } from "lucide-react";

export default function AuthPage({ defaultMode = "login", onBack }) {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(defaultMode === "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLogin(defaultMode === "login");
  }, [defaultMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    const { error: authError } = isLogin
      ? await signIn(email, password)
      : await signUp(email, password);

    if (authError) {
      setError(authError.message);
    } else if (!isLogin) {
      setMessage("Check your email for confirmation link!");
    }
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const { error } = await signInWithGoogle();
    if (error) setError(error.message);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-5 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 blur-[150px] rounded-full" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[150px] rounded-full" />

      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="max-w-6xl w-full mx-auto relative z-10">
        {/* Tombol back */}
        {onBack && (
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-emerald-500/30 transition-all shadow-sm"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
        )}

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* LEFT SIDE - Info & Benefits */}
          <div className="hidden md:block space-y-6">
            <div className="mb-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-xl font-bold mb-3 shadow-lg shadow-emerald-500/20">
                M
              </div>
              <h1 className="text-3xl font-bold text-white">MoneyPulse</h1>
              <p className="text-sm text-slate-500 mt-1">
                Personal Finance Tracker
              </p>
            </div>

            <div className="space-y-5">
              <h2 className="text-2xl font-bold text-white">
                {isLogin ? "Welcome Back!" : "Join the Financial Revolution"}
              </h2>
              <p className="text-slate-400">
                {isLogin
                  ? "Sign in to continue managing your finances"
                  : "Create an account and start tracking your expenses today"}
              </p>

              <div className="space-y-3 mt-6">
                {[
                  { icon: Wallet, text: "Track every expense effortlessly" },
                  { icon: TrendingUp, text: "Get insights into your spending habits" },
                  { icon: Shield, text: "Bank-level security for your data" },
                  { icon: Sparkles, text: "Smart bill reminders & analytics" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <item.icon size={14} />
                    </div>
                    <span className="text-sm text-slate-400">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Testimonial */}
              <div className="mt-8 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-amber-400 text-xs">★</span>
                  ))}
                </div>
                <p className="text-sm text-slate-400 italic">
                  "MoneyPulse changed the way I manage my money. Saved 30% more this month!"
                </p>
                <p className="text-xs text-slate-500 mt-2 font-medium">
                  — Andi Wijaya, User since 2026
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - Form Login/Register */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 w-full shadow-2xl">
            <div className="text-center md:hidden mb-6">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-lg font-bold mb-2">
                M
              </div>
              <h1 className="text-lg font-bold text-white">MoneyPulse</h1>
            </div>

            <div className="flex gap-2 mb-6 bg-slate-800/50 p-1.5 rounded-xl">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2.5 rounded-lg transition-all duration-300 text-sm font-semibold ${
                  isLogin
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2.5 rounded-lg transition-all duration-300 text-sm font-semibold ${
                  !isLogin
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative mt-1">
                    <UserPlus size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="your name"
                      className="w-full rounded-xl bg-slate-800/50 border border-slate-700 pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Email
                </label>
                <div className="relative mt-1">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="youremail@example.com"
                    className="w-full rounded-xl bg-slate-800/50 border border-slate-700 pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative mt-1">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className="w-full rounded-xl bg-slate-800/50 border border-slate-700 pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative mt-1">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      className="w-full rounded-xl bg-slate-800/50 border border-slate-700 pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>
              )}

              {isLogin && (
                <div className="text-right">
                  <button type="button" className="text-xs text-emerald-400 hover:underline">
                    Forgot password?
                  </button>
                </div>
              )}

              {error && (
                <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-400">
                  {error}
                </p>
              )}

              {message && (
                <p className="rounded-xl bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isLogin ? <LogIn size={16} /> : <UserPlus size={16} />}
                    {isLogin ? "Sign In" : "Create Account"}
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-slate-900 text-slate-500">or continue with</span>
              </div>
            </div>

            {/* Google Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 py-2.5 text-sm font-medium text-white hover:bg-slate-700 transition-all disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}