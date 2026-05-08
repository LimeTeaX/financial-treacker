import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Sidebar from './components/Sidebar'
import Dashboard from './Dashboard'
import MessagePage from './pages/MessagePage'
import Analytics from './pages/Analytics'
import TransactionPage from './pages/TransactionPage'
import PaymentPage from './pages/PaymentPage'
import ActivityPage from './pages/ActivityPage'
import ProfilePage from './pages/ProfilePage'
import SettingPage from './pages/SettingPage'

function App() {
  const [currentPage, setCurrentPage] = useState('Dashboard')

  const getDeviceInfo = () => {
    const ua = navigator.userAgent
    if (/iPhone/.test(ua)) return 'iPhone'
    if (/iPad/.test(ua)) return 'iPad'
    if (/Android/.test(ua)) return 'Android Phone'
    if (/Macintosh/.test(ua)) return 'MacBook'
    if (/Windows/.test(ua)) return 'Windows PC'
    return 'Desktop'
  }

  const getBrowserInfo = () => {
    const ua = navigator.userAgent
    if (/Chrome/.test(ua) && !/Edg/.test(ua)) return 'Chrome'
    if (/Firefox/.test(ua)) return 'Firefox'
    if (/Safari/.test(ua) && !/Chrome/.test(ua)) return 'Safari'
    if (/Edg/.test(ua)) return 'Edge'
    return 'Browser'
  }

  useEffect(() => {
    const insertLogin = async () => {
      const device = getDeviceInfo()
      const browser = getBrowserInfo()
      
      await supabase.from('login_history').insert({
        id: Date.now(),
        device: device,
        browser: browser,
        location: 'Medan, ID',
        time: new Date().toISOString(),
        status: 'success'
      })
    }
    
    insertLogin()
  }, [])

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="ml-[260px] p-5 min-h-screen">
        <div key={currentPage} className="animate-fadeIn">
          {currentPage === 'Dashboard' && <Dashboard />}
          {currentPage === 'Message' && <MessagePage />}
          {currentPage === 'Analytics' && <Analytics />}
          {currentPage === 'Transaction' && <TransactionPage />}
          {currentPage === 'Payment' && <PaymentPage />}
          {currentPage === 'Activity' && <ActivityPage />}
          {currentPage === 'Profile' && <ProfilePage />}
          {currentPage === 'Setting' && <SettingPage />}
        </div>
      </main>
    </div>
  )
}

export default App