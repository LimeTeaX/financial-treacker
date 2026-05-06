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
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'home', icon: Home, label: 'Home', page: 'Dashboard' },
  { id: 'messages', icon: MessageSquare, label: 'Message', page: 'Message' },
  { id: 'analytics', icon: BarChart2, label: 'Analytics', page: 'Analytics' },
  { id: 'transactions', icon: ArrowLeftRight, label: 'Transaction', page: 'Transaction' },
  { id: 'payment', icon: CreditCard, label: 'Payment', page: 'Payment' },
]

const ACCOUNT_ITEMS = [
  { id: 'activity', icon: TrendingUp, label: 'Activity', page: 'Activity' },
  { id: 'profile', icon: Headphones, label: 'Profile', page: 'Profile' },
]

function NavItem({ icon: Icon, label, active, badge, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-200 ${
        active
          ? 'bg-violet-50 border-l-[3px] border-[#8B5CF6] text-[#8B5CF6] font-semibold pl-[13px]'
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
      }`}
    >
      <span
        className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${
          active ? 'bg-violet-100 text-[#8B5CF6]' : 'bg-slate-100 text-slate-500'
        }`}
      >
        <Icon size={16} />
      </span>
      <span className="flex-1 text-sm">{label}</span>
      {badge && (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-200 px-1.5 text-[10px] font-semibold text-slate-600">
          {badge}
        </span>
      )}
    </button>
  )
}

export default function Sidebar({ currentPage, setCurrentPage }) {
  const getActiveTab = () => {

  const navItem = NAV_ITEMS.find(item => item.page === currentPage)
  if (navItem) return navItem.id
  
  const accountItem = ACCOUNT_ITEMS.find(item => item.page === currentPage)
  if (accountItem) return accountItem.id
  
  return 'home'
    }

  const activeTab = getActiveTab()

  return (
    <aside className="fixed h-screen top-0 left-0 w-[260px] shrink-0 flex flex-col gap-6 rounded-3xl bg-white p-5 border border-slate-100 shadow-sm z-10">
      <div className="flex items-center gap-2.5 px-2 pt-1 pb-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#8B5CF6] text-white text-xs font-bold">
          T
        </span>
        <span className="font-bold text-slate-800 text-lg tracking-tight">Thrive</span>
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
                badge={item.id === 'messages' ? 26 : item.id === 'payment' ? 12 : null}
                active={item.id === activeTab}
                onClick={() => setCurrentPage(item.page)}
              />
            ))}
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
                            if (item.id === 'activity') setCurrentPage('Activity')
                            if (item.id === 'support') setCurrentPage('Support')
                        }}
                />
            ))}
          </nav>
        </div>
      </div>

      <div className="space-y-1 border-t border-slate-100 pt-4">
        <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-left text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors text-sm">
          <Settings size={15} />
          <span>Setting</span>
        </button>
        <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-left text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors text-sm">
          <LogOut size={15} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  )
}