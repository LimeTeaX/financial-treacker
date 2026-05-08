// src/pages/PaymentPage.jsx
import { useState, useEffect } from "react";
import {
  Zap, Wifi, GraduationCap, Smartphone, Gamepad2,
  Calendar, CheckCircle2, Clock, AlertTriangle,
  CreditCard, Wallet, QrCode, Building2,
  Receipt, Download, X, ChevronRight, Plus, ShieldCheck,
} from "lucide-react";
import { loadBills, addBill, loadPaymentHistory } from '../lib/bills'

// ── CATEGORIES ──
const BILL_CATEGORIES = [
  { id: "electricity", icon: Zap, label: "Electricity", color: "bg-amber-100 text-amber-600" },
  { id: "internet", icon: Wifi, label: "Internet/WiFi", color: "bg-blue-100 text-blue-600" },
  { id: "tuition", icon: GraduationCap, label: "College Tuition", color: "bg-emerald-100 text-emerald-600" },
  { id: "mobile", icon: Smartphone, label: "Mobile Data", color: "bg-violet-100 text-violet-600" },
  { id: "game", icon: Gamepad2, label: "Game Top-up", color: "bg-rose-100 text-rose-600" },
  { id: "debt", icon: CreditCard, label: "Debt/Hutang", color: "bg-rose-100 text-rose-600" },
];


// ── PAYMENT MODAL ──
function PaymentModal({ isOpen, onClose, bill, selectedMethod, setSelectedMethod, step, setStep }) {
  if (!isOpen || !bill) return null;

  const handlePay = () => {
    setStep("success");
    setTimeout(() => {
      onClose();
      setStep("select");
      setSelectedMethod(null);
    }, 2000);
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-100 shadow-xl">
        {step === "select" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Pay {bill.merchant}</h2>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Amount</span>
                <span className="font-bold text-slate-900">Rp {bill.amount.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-slate-500">Due Date</span>
                <span className="text-slate-700">{new Date(bill.due_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Payment Method</p>
            <div className="space-y-2">
              {[
                { id: "bank", icon: Building2, label: "Bank Transfer", desc: "BSI, Mandiri, BNI", color: "bg-blue-50 border-blue-200" },
                { id: "ewallet", icon: Wallet, label: "E-Wallet", desc: "DANA, ShopeePay, GoPay", color: "bg-violet-50 border-violet-200" },
                { id: "qris", icon: QrCode, label: "QRIS", desc: "Scan & pay instantly", color: "bg-emerald-50 border-emerald-200" },
              ].map((method) => (
                <button key={method.id} onClick={() => setSelectedMethod(method.id)}
                  className={`w-full flex items-center gap-3 rounded-2xl p-4 border transition-all ${
                    selectedMethod === method.id ? `${method.color} border-[#8B5CF6] ring-2 ring-[#8B5CF6]/20` : "border-slate-100 hover:bg-slate-50"
                  }`}>
                  <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${
                    method.id === "bank" ? "bg-blue-100 text-blue-600" : method.id === "ewallet" ? "bg-violet-100 text-violet-600" : "bg-emerald-100 text-emerald-600"
                  }`}><method.icon size={18} /></span>
                  <div className="text-left flex-1"><p className="text-sm font-semibold text-slate-800">{method.label}</p><p className="text-xs text-slate-400">{method.desc}</p></div>
                  {selectedMethod === method.id && <CheckCircle2 size={20} className="text-[#8B5CF6]" />}
                </button>
              ))}
            </div>
            <button onClick={() => selectedMethod && setStep("confirm")} disabled={!selectedMethod}
              className="w-full mt-4 rounded-xl bg-[#8B5CF6] py-3 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Continue to Pay
            </button>
          </>
        )}
        {step === "confirm" && (
          <>
            <div className="text-center mb-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-[#8B5CF6] mb-3"><ShieldCheck size={32} /></div>
              <h2 className="text-lg font-bold text-slate-900">Confirm Payment</h2>
              <p className="text-sm text-slate-500 mt-1">Please confirm your payment details</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 space-y-3">
              <div className="flex justify-between text-sm"><span className="text-slate-500">Merchant</span><span className="font-semibold text-slate-800">{bill.merchant}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">Amount</span><span className="font-bold text-slate-900">Rp {bill.amount.toLocaleString("id-ID")}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">Method</span><span className="text-slate-700 capitalize">{selectedMethod}</span></div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setStep("select")} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Back</button>
              <button onClick={handlePay} className="flex-1 rounded-xl bg-[#8B5CF6] py-2.5 text-sm font-medium text-white hover:bg-violet-700">Pay Now</button>
            </div>
          </>
        )}
        {step === "success" && (
          <div className="text-center py-8">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-500 mb-4"><CheckCircle2 size={40} /></div>
            <h2 className="text-xl font-bold text-slate-900">Payment Successful!</h2>
            <p className="text-sm text-slate-500 mt-2">Your payment has been processed successfully.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ──
export default function PaymentPage() {
  const [isAddBillOpen, setIsAddBillOpen] = useState(false)
  const [newBill, setNewBill] = useState({
  merchant: '',
  category: 'electricity',
  amount: '',
  due_date: '',
})
  const [bills, setBills] = useState([])
  const paidThisMonth = bills
  .filter(b => b.status === 'paid')
  .reduce((sum, b) => sum + Math.abs(b.amount || 0), 0)
  const [activeCategory, setActiveCategory] = useState("all")
  const [selectedBill, setSelectedBill] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [step, setStep] = useState("select")

  useEffect(() => {
    loadBills().then(data => setBills(data))
  }, [])

  const filteredBills = activeCategory === "all"
    ? bills
    : bills.filter((b) => b.category === activeCategory)

  const getUrgencyStyle = (status) => {
    switch (status) {
      case "overdue": return { icon: AlertTriangle, color: "text-rose-500", badge: "bg-rose-50 text-rose-600", label: "Overdue" }
      case "due-today": return { icon: Clock, color: "text-orange-500", badge: "bg-orange-50 text-orange-500", label: "Due Today" }
      default: return { icon: Calendar, color: "text-slate-400", badge: "bg-slate-50 text-slate-500", label: "Upcoming" }
    }
  }

  const handlePayNow = (bill) => {
    setSelectedBill(bill)
    setIsModalOpen(true)
    setStep("select")
    setSelectedMethod(null)
  }

  const handleAddBill = async () => {
  const bill = {
    id: Date.now(),
    date: new Date().toISOString().split('T')[0],
    merchant: newBill.merchant,
    category: newBill.category,
    amount: -Math.abs(Number(newBill.amount)),
    due_date: newBill.due_date,
    status: 'upcoming',
  }
  
  const success = await addBill(bill)
  if (success) {
    setBills(prev => [...prev, bill])
    setIsAddBillOpen(false)
    setNewBill({ merchant: '', category: 'electricity', amount: '', due_date: '' })
  }
}

    const [paymentHistory, setPaymentHistory] = useState([])

    useEffect(() => {
    loadPaymentHistory().then(data => setPaymentHistory(data))
    }, [bills])

  return (
    <div className="h-[calc(100vh-2.5rem)] flex flex-col gap-5">
      <main className="flex-1 overflow-y-auto flex flex-col gap-5">
        <header className="flex items-center justify-between rounded-3xl bg-white px-7 py-5 border border-slate-100 shadow-sm shrink-0">
          <div><p className="text-sm text-slate-400 font-medium">Finance</p><h1 className="mt-0.5 text-2xl font-bold text-slate-900 tracking-tight">Payments</h1></div>
          <button onClick={() => setIsAddBillOpen(true)} 
  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8B5CF6] text-white text-sm font-medium hover:bg-violet-700 transition-colors">
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
    <p className="text-2xl font-bold text-slate-900">{bills.filter(b => b.status !== 'paid').length}</p>
    <p className="mt-2 text-xs text-slate-400">bills due this month</p>
  </article>

  <article className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
    <div className="flex items-center gap-2 mb-3">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-500">
        <CheckCircle2 size={20} />
      </span>
      <p className="text-sm font-medium text-slate-400">Paid This Month</p>
    </div>
    <p className="text-2xl font-bold text-slate-900">Rp {(paidThisMonth / 1000).toFixed(0)}k</p>
    <p className="mt-2 text-xs text-slate-400">{bills.filter(b => b.status === 'paid').length} payments completed</p>
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

        <section>
          <p className="text-sm font-medium text-slate-400 mb-3">Bill Categories</p>
          <div className="grid grid-cols-5 gap-3">
            {BILL_CATEGORIES.map((cat) => (
              <button key={cat.id} onClick={() => setActiveCategory(activeCategory === cat.id ? "all" : cat.id)}
                className={`flex flex-col items-center gap-3 rounded-3xl bg-white p-6 border transition-all ${
                  activeCategory === cat.id ? "border-[#8B5CF6] ring-2 ring-[#8B5CF6]/20 shadow-sm" : "border-slate-100 shadow-sm hover:bg-slate-50"
                }`}>
                <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${cat.color}`}><cat.icon size={22} /></span>
                <span className="text-xs font-medium text-slate-600 text-center">{cat.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
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
                          bill.category === "electricity" ? "bg-amber-100 text-amber-600" :
                          bill.category === "internet" ? "bg-blue-100 text-blue-600" :
                          bill.category === "tuition" ? "bg-emerald-100 text-emerald-600" :
                          bill.category === "mobile" ? "bg-violet-100 text-violet-600" :
                          bill.category === "debt" ? "bg-rose-100 text-rose-600" : "bg-rose-100 text-rose-600"
                          
                        }`}>
                          {bill.category === "electricity" ? <Zap size={16} /> :
                           bill.category === "internet" ? <Wifi size={16} /> :
                           bill.category === "tuition" ? <GraduationCap size={16} /> :
                           bill.category === "mobile" ? <Smartphone size={16} /> : 
                           bill.category === "debt" ? <CreditCard size={16} /> :
                           <Gamepad2 size={16} />}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{bill.merchant}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${urgency.badge}`}>{urgency.label}</span>
                            <span className="text-xs text-slate-400">{new Date(bill.due_date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-900">Rp {bill.amount.toLocaleString("id-ID")}</span>
                        <button onClick={() => handlePayNow(bill)} className="flex items-center gap-1.5 rounded-xl bg-[#8B5CF6] px-4 py-2 text-xs font-medium text-white hover:bg-violet-700 transition-colors">
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
              {paymentHistory.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between py-3 px-4 rounded-2xl hover:bg-slate-50 transition-colors border border-slate-50">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-500"><Receipt size={16} /></span>
                    <div><p className="text-sm font-semibold text-slate-800">{payment.merchant}</p><p className="text-xs text-slate-400">{payment.method} • {payment.date}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-900">Rp {payment.amount.toLocaleString("id-ID")}</span>
                    <button className="text-slate-300 hover:text-[#8B5CF6] transition-colors" title="Download Receipt"><Download size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        {/* Add Bill Modal */}
{isAddBillOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-100 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-900">Add New Bill</h2>
        <button onClick={() => setIsAddBillOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bill Name</label>
          <input type="text" value={newBill.merchant} onChange={(e) => setNewBill({ ...newBill, merchant: e.target.value })}
            placeholder="PLN Electricity" className="w-full mt-1 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20" />
        </div>
        
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</label>
          <select value={newBill.category} onChange={(e) => setNewBill({ ...newBill, category: e.target.value })}
            className="w-full mt-1 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20">
            <option value="electricity">Electricity</option>
            <option value="internet">Internet/WiFi</option>
            <option value="tuition">College Tuition</option>
            <option value="mobile">Mobile Data</option>
            <option value="game">Game Top-up</option>
            <option value="debt">Debt</option>
          </select>
        </div>
        
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount (Rp)</label>
          <input type="number" value={newBill.amount} onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
            placeholder="250000" className="w-full mt-1 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20" />
        </div>
        
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Date</label>
          <input type="date" value={newBill.due_date} onChange={(e) => setNewBill({ ...newBill, due_date: e.target.value })}
            className="w-full mt-1 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20" />
        </div>
      </div>
      
      <div className="flex gap-3 mt-6">
        <button onClick={() => setIsAddBillOpen(false)}
          className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
        <button onClick={handleAddBill}
          className="flex-1 rounded-xl bg-[#8B5CF6] py-2.5 text-sm font-medium text-white hover:bg-violet-700">Add Bill</button>
      </div>
    </div>
  </div>
)}

      </main>

      <PaymentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} bill={selectedBill}
        selectedMethod={selectedMethod} setSelectedMethod={setSelectedMethod} step={step} setStep={setStep} />
    </div>
  );
}