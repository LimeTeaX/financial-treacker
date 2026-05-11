import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Download,
  Gamepad2,
  GraduationCap,
  Plus,
  QrCode,
  Receipt,
  ShieldCheck,
  Smartphone,
  Wallet,
  Wifi,
  X,
  Zap,
} from 'lucide-react'
import { useAppContext } from '../context/AppContext'

const BILL_CATEGORIES = [
  { id: 'electricity', icon: Zap, label: 'Electricity', color: 'bg-amber-100 text-amber-600' },
  { id: 'internet', icon: Wifi, label: 'Internet/WiFi', color: 'bg-blue-100 text-blue-600' },
  { id: 'tuition', icon: GraduationCap, label: 'College Tuition', color: 'bg-emerald-100 text-emerald-600' },
  { id: 'mobile', icon: Smartphone, label: 'Mobile Data', color: 'bg-violet-100 text-violet-600' },
  { id: 'game', icon: Gamepad2, label: 'Game Top-up', color: 'bg-rose-100 text-rose-600' },
  { id: 'debt', icon: CreditCard, label: 'Debt/Hutang', color: 'bg-rose-100 text-rose-600' },
]

const PAYMENT_METHODS = [
  { id: 'bank', icon: Building2, label: 'Bank Transfer', desc: 'Manual bank transfer', color: 'bg-blue-50 border-blue-200' },
  { id: 'ewallet', icon: Wallet, label: 'E-Wallet', desc: 'Digital wallet payment', color: 'bg-violet-50 border-violet-200' },
  { id: 'qris', icon: QrCode, label: 'QRIS', desc: 'QR code payment', color: 'bg-emerald-50 border-emerald-200' },
]

const emptyBill = {
  merchant: '',
  category: 'electricity',
  amount: '',
  due_date: '',
}

function getBillIcon(category) {
  return BILL_CATEGORIES.find((item) => item.id === category) ?? BILL_CATEGORIES[0]
}

function PaymentModal({
  isOpen,
  onClose,
  bill,
  selectedMethod,
  setSelectedMethod,
  step,
  setStep,
  settings,
  onPay,
}) {
  if (!isOpen || !bill) return null

  const symbol = settings?.currency === 'USD' ? '$' : 'Rp'
  const locale = settings?.currency === 'USD' ? 'en-US' : 'id-ID'

  const formatDueDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    if (settings?.date_format === 'MM/DD/YYYY') {
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    }
    if (settings?.date_format === 'YYYY-MM-DD') return dateStr
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const handlePay = async () => {
    const paid = await onPay(bill, selectedMethod)
    if (!paid) return
    setStep('success')
    setTimeout(() => {
      onClose()
      setStep('select')
      setSelectedMethod(null)
    }, 1600)
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
                <span className="font-bold text-slate-900">
                  {symbol} {Math.abs(bill.amount || 0).toLocaleString(locale)}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-slate-500">Due Date</span>
                <span className="text-slate-700">{formatDueDate(bill.due_date)}</span>
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Payment Method
            </p>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`w-full flex items-center gap-3 rounded-2xl p-4 border transition-all ${
                    selectedMethod === method.id
                      ? `${method.color} border-[#8B5CF6] ring-2 ring-[#8B5CF6]/20`
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${
                      method.id === 'bank'
                        ? 'bg-blue-100 text-blue-600'
                        : method.id === 'ewallet'
                          ? 'bg-violet-100 text-violet-600'
                          : 'bg-emerald-100 text-emerald-600'
                    }`}
                  >
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
                <span className="font-bold text-slate-900">
                  {symbol} {Math.abs(bill.amount || 0).toLocaleString(locale)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Method</span>
                <span className="text-slate-700 capitalize">{selectedMethod}</span>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setStep('select')}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Back
              </button>
              <button
                onClick={handlePay}
                className="flex-1 rounded-xl bg-[#8B5CF6] py-2.5 text-sm font-medium text-white hover:bg-violet-700"
              >
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
            <h2 className="text-xl font-bold text-slate-900">Payment Successful</h2>
            <p className="text-sm text-slate-500 mt-2">
              Your bill and payment history are synced to Supabase.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PaymentPage() {
  const { settings, bills, paymentHistory, addBill, payBill, loading } = useAppContext()
  const symbol = settings?.currency === 'USD' ? '$' : 'Rp'
  const locale = settings?.currency === 'USD' ? 'en-US' : 'id-ID'

  const [isAddBillOpen, setIsAddBillOpen] = useState(false)
  const [newBill, setNewBill] = useState(emptyBill)
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedBill, setSelectedBill] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [step, setStep] = useState('select')

  const unpaidBills = bills.filter((bill) => bill.status !== 'paid')
  const paidThisMonth = useMemo(() => {
    const now = new Date()
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    return paymentHistory
      .filter((bill) => (bill.paid_at ?? bill.date ?? '').startsWith(monthPrefix))
      .reduce((sum, bill) => sum + Math.abs(bill.amount || 0), 0)
  }, [paymentHistory])

  const filteredBills =
    activeCategory === 'all'
      ? unpaidBills
      : unpaidBills.filter((bill) => bill.category === activeCategory)

  const getUrgencyStyle = (bill) => {
    const today = new Date().toISOString().split('T')[0]
    if (bill.due_date < today) {
      return {
        icon: AlertTriangle,
        badge: 'bg-rose-50 text-rose-600',
        label: 'Overdue',
      }
    }
    if (bill.due_date === today) {
      return {
        icon: Clock,
        badge: 'bg-orange-50 text-orange-500',
        label: 'Due Today',
      }
    }
    return {
      icon: Calendar,
      badge: 'bg-slate-50 text-slate-500',
      label: 'Upcoming',
    }
  }

  const handlePayNow = (bill) => {
    setSelectedBill(bill)
    setIsModalOpen(true)
    setStep('select')
    setSelectedMethod(null)
  }

  const handleAddBill = async () => {
    const saved = await addBill({
      merchant: newBill.merchant,
      category: newBill.category,
      amount: -Math.abs(Number(newBill.amount)),
      due_date: newBill.due_date,
      status: 'upcoming',
    })

    if (saved) {
      setIsAddBillOpen(false)
      setNewBill(emptyBill)
    }
  }

  return (
    <div className="h-[calc(100vh-2.5rem)] flex flex-col gap-5">
      <main className="flex-1 overflow-y-auto flex flex-col gap-5">
        <header className="flex items-center justify-between rounded-3xl bg-white px-7 py-5 border border-slate-100 shadow-sm shrink-0">
          <div>
            <p className="text-sm text-slate-400 font-medium">Finance</p>
            <h1 className="mt-0.5 text-2xl font-bold text-slate-900 tracking-tight">
              Payments
            </h1>
          </div>
          <button
            onClick={() => setIsAddBillOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8B5CF6] text-white text-sm font-medium hover:bg-violet-700 transition-colors"
          >
            <Plus size={16} /> Add Bill
          </button>
        </header>

        {loading.bills && (
          <p className="rounded-2xl bg-white border border-slate-100 px-4 py-3 text-sm text-slate-400">
            Syncing bills...
          </p>
        )}

        <section className="grid grid-cols-3 gap-5">
          <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-100 text-orange-500">
                <AlertTriangle size={20} />
              </span>
              <p className="text-sm font-medium text-slate-400">Upcoming Bills</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">{unpaidBills.length}</p>
            <p className="mt-2 text-xs text-slate-400">open bills</p>
          </article>
          <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-500">
                <CheckCircle2 size={20} />
              </span>
              <p className="text-sm font-medium text-slate-400">Paid This Month</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {symbol} {(paidThisMonth / 1000).toFixed(0)}k
            </p>
            <p className="mt-2 text-xs text-slate-400">
              {paymentHistory.length} payments completed
            </p>
          </article>
          <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-500">
                <CreditCard size={20} />
              </span>
              <p className="text-sm font-medium text-slate-400">Payment Methods</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">{PAYMENT_METHODS.length}</p>
            <p className="mt-2 text-xs text-slate-400">available methods</p>
          </article>
        </section>

        <section>
          <p className="text-sm font-medium text-slate-400 mb-3">Bill Categories</p>
          <div className="grid grid-cols-6 gap-3">
            {BILL_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() =>
                  setActiveCategory(activeCategory === category.id ? 'all' : category.id)
                }
                className={`flex flex-col items-center gap-3 rounded-3xl bg-white p-6 border transition-all ${
                  activeCategory === category.id
                    ? 'border-[#8B5CF6] ring-2 ring-[#8B5CF6]/20 shadow-sm'
                    : 'border-slate-100 shadow-sm hover:bg-slate-50'
                }`}
              >
                <span
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${category.color}`}
                >
                  <category.icon size={22} />
                </span>
                <span className="text-xs font-medium text-slate-600 text-center">
                  {category.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
          <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <p className="text-sm font-medium text-slate-400 mb-4">Active Bills</p>
            <div className="space-y-3">
              {filteredBills.length === 0 ? (
                <p className="text-center py-8 text-slate-400 text-sm">
                  No bills in this category
                </p>
              ) : (
                filteredBills.map((bill) => {
                  const urgency = getUrgencyStyle(bill)
                  const category = getBillIcon(bill.category)
                  return (
                    <div
                      key={bill.id}
                      className="flex items-center justify-between py-3 px-4 rounded-2xl hover:bg-slate-50 transition-colors border border-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${category.color}`}
                        >
                          <category.icon size={16} />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{bill.merchant}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${urgency.badge}`}
                            >
                              {urgency.label}
                            </span>
                            <span className="text-xs text-slate-400">
                              {new Date(bill.due_date).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-900">
                          {symbol} {Math.abs(bill.amount || 0).toLocaleString(locale)}
                        </span>
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

          <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <p className="text-sm font-medium text-slate-400 mb-4">Recent Payments</p>
            <div className="space-y-3">
              {paymentHistory.length === 0 ? (
                <p className="text-center py-8 text-slate-400 text-sm">No recent payments</p>
              ) : (
                paymentHistory.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between py-3 px-4 rounded-2xl hover:bg-slate-50 transition-colors border border-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-500">
                        <Receipt size={16} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {payment.merchant}
                        </p>
                        <p className="text-xs text-slate-400">
                          {payment.method || 'manual'} - {payment.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-900">
                        {symbol} {Math.abs(payment.amount || 0).toLocaleString(locale)}
                      </span>
                      <button
                        className="text-slate-300 hover:text-[#8B5CF6] transition-colors"
                        title="Download Receipt"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>

        {isAddBillOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-100 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Add New Bill</h2>
                <button
                  onClick={() => setIsAddBillOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Bill Name
                  </label>
                  <input
                    type="text"
                    value={newBill.merchant}
                    onChange={(event) =>
                      setNewBill({ ...newBill, merchant: event.target.value })
                    }
                    placeholder="PLN Electricity"
                    className="w-full mt-1 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Category
                  </label>
                  <select
                    value={newBill.category}
                    onChange={(event) =>
                      setNewBill({ ...newBill, category: event.target.value })
                    }
                    className="w-full mt-1 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
                  >
                    {BILL_CATEGORIES.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={newBill.amount}
                    onChange={(event) => setNewBill({ ...newBill, amount: event.target.value })}
                    placeholder="250000"
                    className="w-full mt-1 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newBill.due_date}
                    onChange={(event) => setNewBill({ ...newBill, due_date: event.target.value })}
                    className="w-full mt-1 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsAddBillOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBill}
                  className="flex-1 rounded-xl bg-[#8B5CF6] py-2.5 text-sm font-medium text-white hover:bg-violet-700"
                >
                  Add Bill
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bill={selectedBill}
        selectedMethod={selectedMethod}
        setSelectedMethod={setSelectedMethod}
        step={step}
        setStep={setStep}
        settings={settings}
        onPay={payBill}
      />
    </div>
  )
}
