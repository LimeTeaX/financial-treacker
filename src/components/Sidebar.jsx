// src/components/Sidebar.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import {
  Home,
  MessageSquare,
  BarChart2,
  ArrowLeftRight,
  CreditCard,
  TrendingUp,
  Headphones,
  Settings,
  LogOut,
  Shield,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAppContext } from "../context/AppContext";
import ConfirmLogoutModal from "./ConfirmLogoutModal";

const NAV_ITEMS = [
  { id: "home", icon: Home, label: "Dashboard", page: "Dashboard" },
  { id: "messages", icon: MessageSquare, label: "Recurring", page: "Message" },
  { id: "analytics", icon: BarChart2, label: "Analytics", page: "Analytics" },
  { id: "transactions", icon: ArrowLeftRight, label: "Transaction", page: "Transaction" },
  { id: "payment", icon: CreditCard, label: "Payment", page: "Payment" },
];

const ACCOUNT_ITEMS = [
  { id: "activity", icon: TrendingUp, label: "Activity", page: "Activity" },
  { id: "profile", icon: Headphones, label: "Profile", page: "Profile" },
];

const BOTTOM_ITEMS = [
  { id: "settings", icon: Settings, label: "Setting", page: "Setting" },
  { id: "logout", icon: LogOut, label: "Log out", page: null },
];

function NavItem({ icon: Icon, label, active, badge, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 hover:bg-slate-800/50"
    >
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute left-0 w-1 h-8 bg-emerald-500 rounded-r-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}

      <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 ${active ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800/50 text-slate-400 group-hover:bg-slate-700 group-hover:text-white"
        }`}>
        <Icon size={18} />
      </span>

      {/* 🔥 HAPUS hidden lg:block, biar label tetap muncul di mobile */}
      <span className={`flex-1 text-sm font-medium ${active ? "text-emerald-400" : "text-slate-400"}`}>
        {label}
      </span>

      {badge && (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[10px] font-semibold text-white">
          {badge}
        </span>
      )}
    </button>
  );
}

export default function Sidebar({ currentPage, onNavigate }) {
  const { user, role, signOut } = useAuth();
  const { profile, activeBillsCount } = useAppContext();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const avatarUrl = profile?.avatar_url || null;

  const getActiveTab = () => {
    const navItem = NAV_ITEMS.find((item) => item.page === currentPage);
    if (navItem) return navItem.id;
    const accountItem = ACCOUNT_ITEMS.find((item) => item.page === currentPage);
    if (accountItem) return accountItem.id;
    const bottomItem = BOTTOM_ITEMS.find((item) => item.page === currentPage);
    if (bottomItem) return bottomItem.id;
    if (currentPage === "Admin") return "admin";
    return "home";
  };

  const activeTab = getActiveTab();

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-3 px-2 pt-4 pb-6 border-b border-slate-800 mb-4">
        <div className="relative">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden shadow-lg shadow-emerald-500/20">
            {avatarUrl ? (
              <img src={avatarUrl} className="h-full w-full object-cover" alt="Avatar" />
            ) : (
              profile?.name?.split(" ").map((n) => n[0]).join("") || "JM"
            )}
          </div>
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-slate-950" />
        </div>
        <div className="hidden lg:block flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">
            {profile?.name || user?.email || "Account"}
          </p>
          <p className="text-[10px] text-slate-400 truncate">
            {profile?.title || role}
          </p>
        </div>
      </div>

      <div className="flex-1">
        <p className="hidden lg:block px-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-3">
          Main Menu
        </p>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              badge={item.id === "payment" && activeBillsCount > 0 ? activeBillsCount : null}
              active={item.id === activeTab}
              onClick={() => {
                onNavigate?.(item.page);
                setIsMobileMenuOpen(false);
              }}
            />
          ))}
          {role === "admin" && (
            <NavItem
              icon={Shield}
              label="Admin"
              active={activeTab === "admin"}
              onClick={() => {
                onNavigate?.("Admin");
                setIsMobileMenuOpen(false);
              }}
            />
          )}
        </nav>
      </div>

      <div>
        <p className="hidden lg:block px-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-3">
          Account Management
        </p>
        <nav className="space-y-1">
          {ACCOUNT_ITEMS.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={item.id === activeTab}
              onClick={() => {
                onNavigate?.(item.page);
                setIsMobileMenuOpen(false);
              }}
            />
          ))}
        </nav>
      </div>

      <div className="mt-auto space-y-1 pt-4 border-t border-slate-800">
        {BOTTOM_ITEMS.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeTab === item.id}
            onClick={async () => {
              if (item.id === "logout") {
                setShowLogoutModal(true);
                setIsMobileMenuOpen(false);
              } else if (item.page) {
                onNavigate?.(item.page);
                setIsMobileMenuOpen(false);
              }
            }}
          />
        ))}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed top-0 left-0 z-30 hidden h-screen w-[280px] flex-col border-r border-slate-800 bg-slate-900/80 backdrop-blur-xl lg:flex overflow-y-auto">
        <div className="flex h-full flex-col px-4 py-2">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/20">
            M
          </div>
          <span className="font-bold text-white">MoneyPulse</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl bg-slate-800/50 text-white"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 z-50 h-screen w-[280px] bg-slate-900 border-r border-slate-800 shadow-2xl lg:hidden overflow-y-auto"
            >
              <div className="flex h-full flex-col px-4 py-2">
                <SidebarContent />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <ConfirmLogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={async () => {
          await signOut();
          window.location.reload();
        }}
      />
    </>
  );
}