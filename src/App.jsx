// src/App.jsx
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import Sidebar from "./components/Sidebar";
import Dashboard from "./Dashboard";
import RecurringPage from "./pages/RecurringPage";
import Analytics from "./pages/Analytics";
import TransactionPage from "./pages/TransactionPage";
import PaymentPage from "./pages/PaymentPage";
import ActivityPage from "./pages/ActivityPage";
import ProfilePage from "./pages/ProfilePage";
import SettingPage from "./pages/SettingPage";
import LandingPage from "./pages/LandingPage";
import { useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import AdminPage from "./pages/AdminPage";

function App() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState("Dashboard");
  const [showAuth, setShowAuth] = useState(null); // null, 'login', atau 'register'

  const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    if (/iPhone/.test(ua)) return "iPhone";
    if (/iPad/.test(ua)) return "iPad";
    if (/Android/.test(ua)) return "Android Phone";
    if (/Macintosh/.test(ua)) return "MacBook";
    if (/Windows/.test(ua)) return "Windows PC";
    return "Desktop";
  };

  const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    if (/Chrome/.test(ua) && !/Edg/.test(ua)) return "Chrome";
    if (/Firefox/.test(ua)) return "Firefox";
    if (/Safari/.test(ua) && !/Chrome/.test(ua)) return "Safari";
    if (/Edg/.test(ua)) return "Edge";
    return "Browser";
  };

  useEffect(() => {
    const insertLogin = async () => {
      if (!user) return; // 🔥 Cek user dulu
      const device = getDeviceInfo();
      const browser = getBrowserInfo();

      await supabase.from("login_history").insert({
        id: Date.now(),
        device: device,
        browser: browser,
        location: "Medan, ID",
        time: new Date().toISOString(),
        status: "success",
        user_id: user.id, // 🔥 Tambahin user_id
      });
    };

    insertLogin();
  }, [user]); // 🔥 Tambah dependency user

  // 🔥 User sudah login, langsung ke Dashboard
  if (user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
        <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <main className="ml-[260px] p-5 min-h-screen">
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
    );
  }

  // 🔥 User belum login, tampilkan Landing Page atau Auth Page
  if (showAuth) {
    return <AuthPage defaultMode={showAuth} onBack={() => setShowAuth(null)} />;
  }

  return (
    <LandingPage
      onGetStarted={() => setShowAuth("register")}
      onLogin={() => setShowAuth("login")}
    />
  );
}

export default App;
