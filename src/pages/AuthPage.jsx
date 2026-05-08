import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, UserPlus, LogIn } from 'lucide-react'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    const { data, error } = isLogin 
      ? await signIn(email, password)
      : await signUp(email, password)

    if (error) {
      setError(error.message)
    } else if (!isLogin) {
      setMessage('Check your email for confirmation link!')
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-5">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md border border-slate-100 shadow-sm">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#8B5CF6] to-violet-300 text-white text-2xl font-bold mb-3">
            T
          </div>
          <h1 className="text-2xl font-bold text-slate-900">MoneyPulse</h1>
          <p className="text-sm text-slate-400 mt-1">Personal Finance Tracker</p>
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-slate-800 text-center mb-4">
          {isLogin ? 'Welcome Back!' : 'Create Account'}
        </h2>

        {/* Error / Message */}
        {error && (
          <div className="bg-rose-50 text-rose-600 text-sm rounded-xl p-3 mb-4">{error}</div>
        )}
        {message && (
          <div className="bg-emerald-50 text-emerald-600 text-sm rounded-xl p-3 mb-4">{message}</div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</label>
            <div className="relative mt-1">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                placeholder="youremail@example.com"
                className="w-full rounded-xl bg-slate-50 border border-slate-100 pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Password</label>
            <div className="relative mt-1">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                placeholder="••••••••"
                className="w-full rounded-xl bg-slate-50 border border-slate-100 pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20" />
            </div>
          </div>

          <button type="submit"
            className="w-full rounded-xl bg-[#8B5CF6] py-3 text-sm font-medium text-white hover:bg-violet-700 transition-colors flex items-center justify-center gap-2">
            {isLogin ? <LogIn size={16} /> : <UserPlus size={16} />}
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Toggle */}
        <p className="text-sm text-slate-400 text-center mt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button onClick={() => setIsLogin(!isLogin)}
            className="text-[#8B5CF6] font-medium hover:underline">
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  )
}