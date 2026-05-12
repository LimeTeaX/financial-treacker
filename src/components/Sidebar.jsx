// src/components/Sidebar.jsx
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
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
import ConfirmLogoutModal from './ConfirmLogoutModal';

const NAV_ITEMS = [
  { id: "home", icon: Home, label: "Home", page: "Dashboard" },
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
      className={`nav-item flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200 ${
        active
          ? "active bg-emerald-500/10 border-l-[3px] border-emerald-500 text-emerald-500 font-semibold pl-[13px]"
          : "text-[#94a3b8] hover:bg-emerald-500/5 hover:text-[#f8fafc]"
      }`}
    >
      <span
        className={`inline-flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
          active 
            ? "bg-emerald-500/20 text-emerald-500" 
            : "bg-[#1e293b] text-[#64748b] group-hover:text-[#94a3b8]"
        }`}
      >
        <Icon size={18} />
      </span>
      <span className="flex-1 text-sm">{label}</span>
      {badge && (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[10px] font-semibold text-white">
          {badge}
        </span>
      )}
    </button>
  );
}

export default function Sidebar({ currentPage, setCurrentPage }) {
  const { user, role, signOut } = useAuth();
  const { profile, activeBillsCount } = useAppContext();
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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
      {/* Profile Header */}
      <div className="flex items-center gap-3 px-2 pt-1 pb-4 border-b border-[#1e293b] mb-4">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden shadow-lg shadow-emerald-500/20">
          {avatarUrl ? (
            <img src={avatarUrl} className="h-full w-full object-cover" alt="" />
          ) : (
            profile?.name?.split(" ").map((n) => n[0]).join("") || "JM"
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#f8fafc] truncate">
            {profile?.name || user?.email || "Account"}
          </p>
          <p className="text-[10px] text-[#64748b] truncate">
            {profile?.title || role}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        <div>
          <p className="px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#475569] mb-3">
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
                  setCurrentPage(item.page)
                  setIsMobileMenuOpen(false)
                }}
              />
            ))}
            {role === "admin" && (
              <NavItem
                icon={Shield}
                label="Admin"
                page="Admin"
                active={activeTab === "admin"}
                onClick={() => {
                  setCurrentPage("Admin")
                  setIsMobileMenuOpen(false)
                }}
              />
            )}
          </nav>
        </div>

        <div>
          <p className="px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#475569] mb-3">
            Account
          </p>
          <nav className="space-y-1">
            {ACCOUNT_ITEMS.map((item) => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                badge={null}
                active={item.id === activeTab}
                onClick={() => {
                  if (item.page) setCurrentPage(item.page)
                  setIsMobileMenuOpen(false)
                }}
              />
            ))}
          </nav>
        </div>
      </div>

      <div className="space-y-1 border-t border-[#1e293b] pt-4">
        {BOTTOM_ITEMS.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeTab === item.id}
            onClick={async () => {
              if (item.id === "logout") {
                setShowLogoutModal(true);
                setIsMobileMenuOpen(false)
              } else if (item.page) {
                setCurrentPage(item.page);
                setIsMobileMenuOpen(false)
              }
            }}
          />
        ))}
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed h-screen top-0 left-0 w-[260px] shrink-0 flex flex-col gap-4 rounded-r-2xl bg-[#0f172a] p-5 border-r border-[#1e293b] z-20 overflow-y-auto max-lg:hidden lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 mobile-header border-b border-[#1e293b] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/20">
            M
          </div>
          <span className="font-bold text-[#f8fafc]">MoneyPulse</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl bg-[#1e293b] text-[#94a3b8] hover:text-emerald-500 transition-colors"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-[#020617]/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="fixed top-0 left-0 h-screen w-[280px] bg-[#0f172a] z-50 flex flex-col p-5 shadow-2xl overflow-y-auto lg:hidden border-r border-[#1e293b]">
            <SidebarContent />
          </aside>
        </>
      )}

      <ConfirmLogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={async () => {
          await signOut()
          window.location.reload()
        }}
      />
    </>
  );
}
