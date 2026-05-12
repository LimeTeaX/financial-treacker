import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './Dashboard'
import RecurringPage from './pages/RecurringPage'
import Analytics from './pages/Analytics'
import TransactionPage from './pages/TransactionPage'
import PaymentPage from './pages/PaymentPage'
import ActivityPage from './pages/ActivityPage'
import ProfilePage from './pages/ProfilePage'
import SettingPage from './pages/SettingPage'
import LandingPage from './pages/LandingPage'
import { useAuth } from './context/AuthContext'
import AuthPage from './pages/AuthPage'
import AdminPage from './pages/AdminPage'

function App() {
  const { user } = useAuth()
  const [currentPage, setCurrentPage] = useState('Dashboard')
  const [showAuth, setShowAuth] = useState(null)

  if (user) {
    return (
  <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
    <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
    {/* 🔥 TAMBAHIN PADDING TOP BUAT MOBILE, SERTA MARGIN LEFT BUAT DESKTOP */}
    <main className="lg:ml-[260px] pt-16 lg:pt-5 p-4 lg:p-5 min-h-screen">
      <div key={currentPage} className="animate-fadeIn">
        {currentPage === "Dashboard" && <Dashboard />}
        {currentPage === "Message" && <RecurringPage />}
        {currentPage === "Analytics" && <Analytics />}
        {currentPage === "Transaction" && <TransactionPage />}
        {currentPage === "Payment" && <PaymentPage />}
        {currentPage === "Activity" && <ActivityPage />}
        {currentPage === "Profile" && <ProfilePage />}
        {currentPage === "Setting" && <SettingPage />}
        {currentPage === "Admin" && <AdminPage />}
      </div>
    </main>
  </div>
)
  }

  if (showAuth) {
    return <AuthPage defaultMode={showAuth} onBack={() => setShowAuth(null)} />
  }

  return (
    <LandingPage
      onGetStarted={() => setShowAuth('register')}
      onLogin={() => setShowAuth('login')}
    />
  )
}

export default App
