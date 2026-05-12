// src/pages/PaymentPage.jsx
import { useMemo, useState } from "react";
import { useAppContext } from "../context/AppContext";
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
} from "lucide-react";

const BILL_CATEGORIES = [
  { id: "electricity", icon: Zap, label: "Electricity", color: "bg-emerald-500/10 text-emerald-400" },
  { id: "internet", icon: Wifi, label: "Internet/WiFi", color: "bg-emerald-500/10 text-emerald-400" },
  { id: "tuition", icon: GraduationCap, label: "College Tuition", color: "bg-emerald-500/10 text-emerald-400" },
  { id: "mobile", icon: Smartphone, label: "Mobile Data", color: "bg-emerald-500/10 text-emerald-400" },
  { id: "game", icon: Gamepad2, label: "Game Top-up", color: "bg-emerald-500/10 text-emerald-400" },
  { id: "debt", icon: CreditCard, label: "Debt/Hutang", color: "bg-emerald-500/10 text-emerald-400" },
];

const PAYMENT_METHODS = [
  { id: "bank", icon: Building2, label: "Bank Transfer", desc: "Manual bank transfer", color: "bg-blue-500/10 text-blue-400" },
  { id: "ewallet", icon: Wallet, label: "E-Wallet", desc: "Digital wallet payment", color: "bg-purple-500/10 text-purple-400" },
  { id: "qris", icon: QrCode, label: "QRIS", desc: "QR code payment", color: "bg-emerald-500/10 text-emerald-400" },
];

const emptyBill = { merchant: "", category: "electricity", amount: "", due_date: "" };

function getBillIcon(category) {
  return BILL_CATEGORIES.find((item) => item.id === category) ?? BILL_CATEGORIES[0];
}

function PaymentModal({ isOpen, onClose, bill, selectedMethod, setSelectedMethod, step, setStep, settings, onPay }) {
  if (!isOpen || !bill) return null;

  const symbol = settings?.currency === "USD" ? "$" : "Rp";
  const locale = settings?.currency === "USD" ? "en-US" : "id-ID";

  const formatDueDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (settings?.date_format === "MM/DD/YYYY") return date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
    if (settings?.date_format === "YYYY-MM-DD") return dateStr;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  };

  const handlePay = async () => {
    const paid = await onPay(bill, selectedMethod);
    if (!paid) return;
    setStep("success");
    setTimeout(() => { onClose(); setStep("select"); setSelectedMethod(null); }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        {step === "select" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Pay {bill.merchant}</h2>
              <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="rounded-xl bg-slate-800/50 p-4 mb-4">
              <div className="flex justify-between text-sm"><span className="text-slate-400">Amount</span><span className="font-bold text-white">{symbol} {Math.abs(bill.amount || 0).toLocaleString(locale)}</span></div>
              <div className="flex justify-between text-sm mt-2"><span className="text-slate-400">Due Date</span><span className="text-white">{formatDueDate(bill.due_date)}</span></div>
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Payment Method</p>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((method) => (
                <button key={method.id} onClick={() => setSelectedMethod(method.id)} className={`w-full flex items-center gap-3 rounded-xl p-4 border transition-all ${selectedMethod === method.id ? `${method.color} border-emerald-500 ring-1 ring-emerald-500` : "border-slate-700 hover:bg-slate-800/50"}`}>
                  <span className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${method.id === "bank" ? "bg-blue-500/10 text-blue-400" : method.id === "ewallet" ? "bg-purple-500/10 text-purple-400" : "bg-emerald-500/10 text-emerald-400"}`}><method.icon size={18} /></span>
                  <div className="text-left flex-1"><p className="text-sm font-semibold text-white">{method.label}</p><p className="text-xs text-slate-400">{method.desc}</p></div>
                  {selectedMethod === method.id && <CheckCircle2 size={20} className="text-emerald-400" />}
                </button>
              ))}
            </div>
            <button onClick={() => selectedMethod && setStep("confirm")} disabled={!selectedMethod} className="w-full mt-4 rounded-xl bg-emerald-500 py-3 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-40">Continue to Pay</button>
          </>
        )}

        {step === "confirm" && (
          <>
            <div className="text-center mb-4"><div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 mb-3"><ShieldCheck size={32} /></div><h2 className="text-lg font-bold text-white">Confirm Payment</h2><p className="text-sm text-slate-400 mt-1">Please confirm your payment details</p></div>
            <div className="rounded-xl bg-slate-800/50 p-4 space-y-3">
              <div className="flex justify-between text-sm"><span className="text-slate-400">Merchant</span><span className="font-semibold text-white">{bill.merchant}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">Amount</span><span className="font-bold text-white">{symbol} {Math.abs(bill.amount || 0).toLocaleString(locale)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">Method</span><span className="text-white capitalize">{selectedMethod}</span></div>
            </div>
            <div className="flex gap-3 mt-4"><button onClick={() => setStep("select")} className="flex-1 rounded-xl border border-slate-700 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800">Back</button><button onClick={handlePay} className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-sm font-medium text-white hover:bg-emerald-600">Pay Now</button></div>
          </>
        )}

        {step === "success" && (
          <div className="text-center py-8"><div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mb-4"><CheckCircle2 size={40} /></div><h2 className="text-xl font-bold text-white">Payment Successful</h2><p className="text-sm text-slate-400 mt-2">Your bill and payment history are synced to Supabase.</p></div>
        )}
      </div>
    </div>
  );
}

export default function PaymentPage() {
  const { settings, bills, paymentHistory, addBill, payBill, loading } = useAppContext();
  const symbol = settings?.currency === "USD" ? "$" : "Rp";
  const locale = settings?.currency === "USD" ? "en-US" : "id-ID";

  const [isAddBillOpen, setIsAddBillOpen] = useState(false);
  const [newBill, setNewBill] = useState(emptyBill);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedBill, setSelectedBill] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [step, setStep] = useState("select");

  const unpaidBills = bills.filter((bill) => bill.status !== "paid");
  const paidThisMonth = useMemo(() => {
    const now = new Date();
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return paymentHistory.filter((bill) => (bill.paid_at ?? bill.date ?? "").startsWith(monthPrefix)).reduce((sum, bill) => sum + Math.abs(bill.amount || 0), 0);
  }, [paymentHistory]);

  const filteredBills = activeCategory === "all" ? unpaidBills : unpaidBills.filter((bill) => bill.category === activeCategory);

  const getUrgencyStyle = (bill) => {
    const today = new Date().toISOString().split("T")[0];
    if (bill.due_date < today) return { icon: AlertTriangle, badge: "bg-red-500/10 text-red-400", label: "Overdue" };
    if (bill.due_date === today) return { icon: Clock, badge: "bg-yellow-500/10 text-yellow-500", label: "Due Today" };
    return { icon: Calendar, badge: "bg-slate-800 text-slate-400", label: "Upcoming" };
  };

  const handlePayNow = (bill) => { setSelectedBill(bill); setIsModalOpen(true); setStep("select"); setSelectedMethod(null); };
  const handleAddBill = async () => {
    const saved = await addBill({ merchant: newBill.merchant, category: newBill.category, amount: -Math.abs(Number(newBill.amount)), due_date: newBill.due_date, status: "upcoming" });
    if (saved) { setIsAddBillOpen(false); setNewBill(emptyBill); }
  };

  if (loading.bills && bills.length === 0) {
    return <div className="max-w-4xl mx-auto flex justify-center py-20"><div className="animate-pulse text-slate-400">Loading bills...</div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Payments</h1>
          <p className="text-slate-400 mt-1">Manage and pay your bills</p>
        </div>
        <button onClick={() => setIsAddBillOpen(true)} className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-600 transition-all">
          <Plus size={16} /> Add Bill
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-3"><div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400"><AlertTriangle size={20} /></div><p className="text-sm font-medium text-slate-400">Upcoming Bills</p></div>
          <p className="text-2xl font-bold text-white">{unpaidBills.length}</p><p className="mt-2 text-xs text-slate-500">open bills</p>
        </div>
        <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-3"><div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400"><CheckCircle2 size={20} /></div><p className="text-sm font-medium text-slate-400">Paid This Month</p></div>
          <p className="text-2xl font-bold text-white">{symbol} {(paidThisMonth / 1000).toFixed(0)}k</p><p className="mt-2 text-xs text-slate-500">{paymentHistory.length} payments completed</p>
        </div>
        <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-3"><div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400"><CreditCard size={20} /></div><p className="text-sm font-medium text-slate-400">Payment Methods</p></div>
          <p className="text-2xl font-bold text-white">{PAYMENT_METHODS.length}</p><p className="mt-2 text-xs text-slate-500">available methods</p>
        </div>
      </div>

      {/* Bill Categories */}
      <div><p className="text-sm font-medium text-slate-400 mb-3">Bill Categories</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {BILL_CATEGORIES.map((category) => (
            <button key={category.id} onClick={() => setActiveCategory(activeCategory === category.id ? "all" : category.id)} className={`flex flex-col items-center gap-2 rounded-xl p-4 border transition-all ${activeCategory === category.id ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500" : "border-slate-700 bg-slate-800/30 hover:bg-slate-800/50"}`}>
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${category.color}`}><category.icon size={18} /></div>
              <span className="text-xs font-medium text-center text-white">{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Bills + Recent Payments */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">
          <p className="text-sm font-medium text-slate-400 mb-4">Active Bills</p>
          <div className="space-y-3">
            {filteredBills.length === 0 ? <p className="text-center py-8 text-slate-500 text-sm">No bills in this category</p> : filteredBills.map((bill) => {
              const urgency = getUrgencyStyle(bill);
              const category = getBillIcon(bill.category);
              return (
                <div key={bill.id} className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-slate-800/30 transition-colors border border-slate-800">
                  <div className="flex items-center gap-3"><div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${category.color}`}><category.icon size={16} /></div>
                    <div><p className="text-sm font-semibold text-white">{bill.merchant}</p><div className="flex items-center gap-2 mt-0.5"><span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${urgency.badge}`}>{urgency.label}</span><span className="text-xs text-slate-500">{new Date(bill.due_date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</span></div></div>
                  </div>
                  <div className="flex items-center gap-3"><span className="text-sm font-bold text-white">{symbol} {Math.abs(bill.amount || 0).toLocaleString(locale)}</span><button onClick={() => handlePayNow(bill)} className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600">Pay Now <ChevronRight size={12} /></button></div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">
          <p className="text-sm font-medium text-slate-400 mb-4">Recent Payments</p>
          <div className="space-y-3">
            {paymentHistory.length === 0 ? <p className="text-center py-8 text-slate-500 text-sm">No recent payments</p> : paymentHistory.slice(0, 5).map((payment) => (
              <div key={payment.id} className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-slate-800/30 transition-colors border border-slate-800">
                <div className="flex items-center gap-3"><div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400"><Receipt size={16} /></div>
                  <div><p className="text-sm font-semibold text-white">{payment.merchant}</p><p className="text-xs text-slate-500">{payment.method || "manual"} - {payment.date}</p></div>
                </div>
                <div className="flex items-center gap-3"><span className="text-sm font-bold text-white">{symbol} {Math.abs(payment.amount || 0).toLocaleString(locale)}</span><button className="text-slate-500 hover:text-emerald-400 transition-colors" title="Download Receipt"><Download size={16} /></button></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Bill Modal */}
      {isAddBillOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold text-white">Add New Bill</h2><button onClick={() => setIsAddBillOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button></div>
            <div className="space-y-4">
              <div><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bill Name</label><input type="text" value={newBill.merchant} onChange={(e) => setNewBill({ ...newBill, merchant: e.target.value })} placeholder="PLN Electricity" className="w-full mt-1 rounded-xl bg-slate-800/50 border border-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500" /></div>
              <div><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</label><select value={newBill.category} onChange={(e) => setNewBill({ ...newBill, category: e.target.value })} className="w-full mt-1 rounded-xl bg-slate-800/50 border border-slate-700 px-3 py-2 text-sm text-white focus:border-emerald-500">{BILL_CATEGORIES.map((cat) => (<option key={cat.id} value={cat.id}>{cat.label}</option>))}</select></div>
              <div><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</label><input type="number" value={newBill.amount} onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })} placeholder="250000" className="w-full mt-1 rounded-xl bg-slate-800/50 border border-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500" /></div>
              <div><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Due Date</label><input type="date" value={newBill.due_date} onChange={(e) => setNewBill({ ...newBill, due_date: e.target.value })} className="w-full mt-1 rounded-xl bg-slate-800/50 border border-slate-700 px-3 py-2 text-sm text-white focus:border-emerald-500" /></div>
            </div>
            <div className="flex gap-3 mt-6"><button onClick={() => setIsAddBillOpen(false)} className="flex-1 rounded-xl border border-slate-700 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800">Cancel</button><button onClick={handleAddBill} className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-sm font-medium text-white hover:bg-emerald-600">Add Bill</button></div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {isModalOpen && <PaymentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} bill={selectedBill} selectedMethod={selectedMethod} setSelectedMethod={setSelectedMethod} step={step} setStep={setStep} settings={settings} onPay={payBill} />}
    </div>
  );
}