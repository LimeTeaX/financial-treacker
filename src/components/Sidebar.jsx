// src/components/Sidebar.jsx
import { useState } from 'react'
import { Menu, X } from 'lucide-react' // 🔥 TAMBAHIN IMPORT
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
      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-200 ${
        active
          ? "bg-violet-50 border-l-[3px] border-[#8B5CF6] text-[#8B5CF6] font-semibold pl-[13px]"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
      }`}
    >
      <span
        className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${active ? "bg-violet-100 text-[#8B5CF6]" : "bg-slate-100 text-slate-500"}`}
      >
        <Icon size={16} />
      </span>
      <span className="flex-1 text-sm">{label}</span>
      {badge && (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#8B5CF6] px-1.5 text-[10px] font-semibold text-white">
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false) // 🔥 TAMBAHIN
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

  // 🔥 KONTEN SIDEBAR (buat reusable)
  const SidebarContent = () => (
    <>
      {/* Profile Header */}
      <div className="flex items-center gap-3 px-2 pt-1 pb-3 border-b border-slate-100 mb-2">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#8B5CF6] to-violet-300 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} className="h-full w-full object-cover" alt="" />
          ) : (
            profile?.name?.split(" ").map((n) => n[0]).join("") || "JM"
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 truncate">
            {profile?.name || user?.email || "Account"}
          </p>
          <p className="text-[10px] text-slate-400 truncate">
            {profile?.title || role}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        <div>
          <p className="px-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-3">
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
                  setIsMobileMenuOpen(false) // 🔥 TUTUP MOBILE MENU
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
          <p className="px-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-3">
            Account Management
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

      <div className="space-y-1 border-t border-slate-100 pt-4">
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
      {/* 🔥 DESKTOP SIDEBAR (fixed, selalu kelihatan di lg ke atas) */}
      <aside className="fixed h-screen top-0 left-0 w-[260px] shrink-0 flex flex-col gap-6 rounded-3xl bg-white p-5 border border-slate-100 shadow-sm z-20 overflow-y-auto hidden lg:flex">
        <SidebarContent />
      </aside>

      {/* 🔥 MOBILE HEADER + HAMBURGER MENU */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-violet-400 flex items-center justify-center text-white font-bold text-sm">
            M
          </div>
          <span className="font-bold text-slate-800 dark:text-white">MoneyPulse</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* 🔥 MOBILE SIDEBAR (OVERLAY) */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay gelap */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Sidebar mobile */}
          <aside className="fixed top-0 left-0 h-screen w-[280px] bg-white dark:bg-slate-900 z-50 flex flex-col p-5 shadow-xl overflow-y-auto lg:hidden">
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