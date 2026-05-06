import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './Dashboard'
import MessagePage from './pages/MessagePage'
import Analytics from './pages/Analytics'
import TransactionPage from './pages/TransactionPage'
import PaymentPage from './pages/PaymentPage'
import ActivityPage from './pages/ActivityPage'

function App() {
  const [currentPage, setCurrentPage] = useState('Dashboard')

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
        </div>
      </main>
    </div>
  )
}

export default App