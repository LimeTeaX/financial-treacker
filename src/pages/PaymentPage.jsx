// src/pages/PaymentPage.jsx
import { useState } from 'react'
import {
  Zap,
  Wifi,
  GraduationCap,
  Smartphone,
  Gamepad2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CreditCard,
  Wallet,
  QrCode,
  Building2,
  Receipt,
  Download,
  X,
  ChevronRight,
  Plus,
  Banknote,
  ShieldCheck,
} from 'lucide-react'

// ── MOCK DATA ──
const BILL_CATEGORIES = [
  { id: 'electricity', icon: Zap, label: 'Electricity', color: 'bg-amber-100 text-amber-600', hoverColor: 'hover:bg-amber-50' },
  { id: 'internet', icon: Wifi, label: 'Internet/WiFi', color: 'bg-blue-100 text-blue-600', hoverColor: 'hover:bg-blue-50' },
  { id: 'tuition', icon: GraduationCap, label: 'College Tuition', color: 'bg-emerald-100 text-emerald-600', hoverColor: 'hover:bg-emerald-50' },
  { id: 'mobile', icon: Smartphone, label: 'Mobile Data', color: 'bg-violet-100 text-violet-600', hoverColor: 'hover:bg-violet-50' },
  { id: 'game', icon: Gamepad2, label: 'Game Top-up', color: 'bg-rose-100 text-rose-600', hoverColor: 'hover:bg-rose-50' },
]

const UPCOMING_BILLS = [
  { id: 1, merchant: 'PLN Electricity', category: 'electricity', dueDate: '2026-05-08', amount: 250000, status: 'due-today' },
  { id: 2, merchant: 'IndiHome WiFi', category: 'internet', dueDate: '2026-05-10', amount: 350000, status: 'upcoming' },
  { id: 3, merchant: 'UKT Semester 4', category: 'tuition', dueDate: '2026-05-15', amount: 4500000, status: 'upcoming' },
  { id: 4, merchant: 'Telkomsel Data', category: 'mobile', dueDate: '2026-05-05', amount: 100000, status: 'overdue' },
  { id: 5, merchant: 'MLBB Weekly Pass', category: 'game', dueDate: '2026-05-12', amount: 50000, status: 'upcoming' },
]

const PAYMENT_HISTORY = [
  { id: 1, merchant: 'PLN Electricity', date: '2026-04-25', amount: 245000, method: 'BSI Transfer', status: 'success' },
  { id: 2, merchant: 'IndiHome WiFi', date: '2026-04-10', amount: 350000, method: 'QRIS', status: 'success' },
  { id: 3, merchant: 'Google Play Top-up', date: '2026-04-05', amount: 150000, method: 'DANA', status: 'success' },
  { id: 4, merchant: 'Telkomsel Data', date: '2026-03-28', amount: 100000, method: 'ShopeePay', status: 'success' },
  { id: 5, merchant: 'UKT Semester 3', date: '2026-03-15', amount: 4500000, method: 'Mandiri Transfer', status: 'success' },
]

const TOTAL_PAID_THIS_MONTH = PAYMENT_HISTORY.filter(p => p.date.startsWith('2026-04')).reduce((sum, p) => sum + p.amount, 0)

// ── PAYMENT METHOD MODAL ──
function PaymentModal({ isOpen, onClose, bill }) {
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [step, setStep] = useState('select') // 'select' | 'confirm' | 'success'

  if (!isOpen || !bill) return null

  const handlePay = () => {
    setStep('success')
    setTimeout(() => {
      onClose()
      setStep('select')
      setSelectedMethod(null)
    }, 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-100 shadow-xl">
        
        {step === 'select' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Pay {bill.merchant}</h2>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Amount</span>
                <span className="font-bold text-slate-900">Rp {bill.amount.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-slate-500">Due Date</span>
                <span className="text-slate-700">{new Date(bill.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>

            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Payment Method</p>
            
            <div className="space-y-2">
              {[
                { id: 'bank', icon: Building2, label: 'Bank Transfer', desc: 'BSI, Mandiri, BNI', color: 'bg-blue-50 border-blue-200' },
                { id: 'ewallet', icon: Wallet, label: 'E-Wallet', desc: 'DANA, ShopeePay, GoPay', color: 'bg-violet-50 border-violet-200' },
                { id: 'qris', icon: QrCode, label: 'QRIS', desc: 'Scan & pay instantly', color: 'bg-emerald-50 border-emerald-200' },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`w-full flex items-center gap-3 rounded-2xl p-4 border transition-all duration-200 ${
                    selectedMethod === method.id
                      ? `${method.color} border-[#8B5CF6] ring-2 ring-[#8B5CF6]/20`
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${
                    method.id === 'bank' ? 'bg-blue-100 text-blue-600' :
                    method.id === 'ewallet' ? 'bg-violet-100 text-violet-600' :
                    'bg-emerald-100 text-emerald-600'
                  }`}>
                    <method.icon size={18} />
                  </span>
                  <div className="text-left flex-1">
                    <p className="text-sm font-semibold text-slate-800">{method.label}</p>
                    <p className="text-xs text-slate-400">{method.desc}</p>
                  </div>
                  {selectedMethod === method.id && (
                    <CheckCircle2 size={20} className="text-[#8B5CF6]" />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => selectedMethod && setStep('confirm')}
              disabled={!selectedMethod}
              className="w-full mt-4 rounded-xl bg-[#8B5CF6] py-3 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Continue to Pay
            </button>
          </>
        )}

        {step === 'confirm' && (
          <>
            <div className="text-center mb-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-[#8B5CF6] mb-3">
                <ShieldCheck size={32} />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Confirm Payment</h2>
              <p className="text-sm text-slate-500 mt-1">Please confirm your payment details</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Merchant</span>
                <span className="font-semibold text-slate-800">{bill.merchant}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Amount</span>
                <span className="font-bold text-slate-900">Rp {bill.amount.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Method</span>
                <span className="text-slate-700 capitalize">{selectedMethod}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={() => setStep('select')} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                Back
              </button>
              <button onClick={handlePay} className="flex-1 rounded-xl bg-[#8B5CF6] py-2.5 text-sm font-medium text-white hover:bg-violet-700 transition-colors">
                Pay Now
              </button>
            </div>
          </>
        )}

        {step === 'success' && (
          <div className="text-center py-8">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-500 mb-4">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Payment Successful!</h2>
            <p className="text-sm text-slate-500 mt-2">Your payment has been processed successfully.</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── MAIN COMPONENT ──
export default function PaymentPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedBill, setSelectedBill] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredBills = activeCategory === 'all'
    ? UPCOMING_BILLS
    : UPCOMING_BILLS.filter(b => b.category === activeCategory)

  const getUrgencyStyle = (status) => {
    switch (status) {
      case 'overdue': return { icon: AlertTriangle, color: 'text-rose-500', badge: 'bg-rose-50 text-rose-600', label: 'Overdue' }
      case 'due-today': return { icon: Clock, color: 'text-orange-500', badge: 'bg-orange-50 text-orange-500', label: 'Due Today' }
      default: return { icon: Calendar, color: 'text-slate-400', badge: 'bg-slate-50 text-slate-500', label: 'Upcoming' }
    }
  }

  const handlePayNow = (bill) => {
    setSelectedBill(bill)
    setIsModalOpen(true)
  }

  return (
    <div className="h-[calc(100vh-2.5rem)] flex flex-col gap-5">
      <main className="flex-1 overflow-y-auto flex flex-col gap-5">
        
        {/* Header */}
        <header className="flex items-center justify-between rounded-3xl bg-white px-7 py-5 border border-slate-100 shadow-sm shrink-0">
          <div>
            <p className="text-sm text-slate-400 font-medium">Finance</p>
            <h1 className="mt-0.5 text-2xl font-bold text-slate-900 tracking-tight">Payments</h1>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8B5CF6] text-white text-sm font-medium hover:bg-violet-700 transition-colors">
            <Plus size={16} /> Add Bill
          </button>
        </header>

        {/* Stats Cards */}
        <section className="grid grid-cols-3 gap-5">
          <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-100 text-orange-500">
                <AlertTriangle size={20} />
              </span>
              <p className="text-sm font-medium text-slate-400">Upcoming Bills</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">{UPCOMING_BILLS.length}</p>
            <p className="mt-2 text-xs text-slate-400">bills due this month</p>
          </article>

          <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-500">
                <CheckCircle2 size={20} />
              </span>
              <p className="text-sm font-medium text-slate-400">Paid This Month</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">Rp {(TOTAL_PAID_THIS_MONTH / 1000).toFixed(0)}k</p>
            <p className="mt-2 text-xs text-slate-400">5 payments completed</p>
          </article>

          <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-500">
                <CreditCard size={20} />
              </span>
              <p className="text-sm font-medium text-slate-400">Linked Accounts</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">3</p>
            <p className="mt-2 text-xs text-slate-400">BSI, DANA, ShopeePay</p>
          </article>
        </section>

        {/* Bill Categories Grid */}
        <section>
          <p className="text-sm font-medium text-slate-400 mb-3">Bill Categories</p>
          <div className="grid grid-cols-5 gap-3">
            {BILL_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(activeCategory === cat.id ? 'all' : cat.id)}
                className={`flex flex-col items-center gap-3 rounded-3xl bg-white p-6 border transition-all duration-200 ${
                  activeCategory === cat.id
                    ? 'border-[#8B5CF6] ring-2 ring-[#8B5CF6]/20 shadow-sm'
                    : 'border-slate-100 shadow-sm hover:bg-slate-50'
                }`}
              >
                <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${cat.color}`}>
                  <cat.icon size={22} />
                </span>
                <span className="text-xs font-medium text-slate-600 text-center">{cat.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Active Bills + History */}
        <section className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
          {/* Upcoming Bills */}
          <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <p className="text-sm font-medium text-slate-400 mb-4">Active Bills</p>
            
            <div className="space-y-3">
              {filteredBills.length === 0 ? (
                <p className="text-center py-8 text-slate-400 text-sm">No bills in this category</p>
              ) : (
                filteredBills.map((bill) => {
                  const urgency = getUrgencyStyle(bill.status)
                  return (
                    <div key={bill.id} className="flex items-center justify-between py-3 px-4 rounded-2xl hover:bg-slate-50 transition-colors border border-slate-50">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${
                          bill.category === 'electricity' ? 'bg-amber-100 text-amber-600' :
                          bill.category === 'internet' ? 'bg-blue-100 text-blue-600' :
                          bill.category === 'tuition' ? 'bg-emerald-100 text-emerald-600' :
                          bill.category === 'mobile' ? 'bg-violet-100 text-violet-600' :
                          'bg-rose-100 text-rose-600'
                        }`}>
                          {bill.category === 'electricity' ? <Zap size={16} /> :
                           bill.category === 'internet' ? <Wifi size={16} /> :
                           bill.category === 'tuition' ? <GraduationCap size={16} /> :
                           bill.category === 'mobile' ? <Smartphone size={16} /> :
                           <Gamepad2 size={16} />}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{bill.merchant}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${urgency.badge}`}>
                              {urgency.label}
                            </span>
                            <span className="text-xs text-slate-400">
                              {new Date(bill.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-900">Rp {bill.amount.toLocaleString('id-ID')}</span>
                        <button
                          onClick={() => handlePayNow(bill)}
                          className="flex items-center gap-1.5 rounded-xl bg-[#8B5CF6] px-4 py-2 text-xs font-medium text-white hover:bg-violet-700 transition-colors"
                        >
                          Pay Now <ChevronRight size={12} />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </article>

          {/* Payment History */}
          <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <p className="text-sm font-medium text-slate-400 mb-4">Recent Payments</p>
            
            <div className="space-y-3">
              {PAYMENT_HISTORY.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between py-3 px-4 rounded-2xl hover:bg-slate-50 transition-colors border border-slate-50">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-500">
                      <Receipt size={16} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{payment.merchant}</p>
                      <p className="text-xs text-slate-400">{payment.method} • {payment.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-900">Rp {payment.amount.toLocaleString('id-ID')}</span>
                    <button className="text-slate-300 hover:text-[#8B5CF6] transition-colors" title="Download Receipt">
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

      </main>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bill={selectedBill}
      />
    </div>
  )
}