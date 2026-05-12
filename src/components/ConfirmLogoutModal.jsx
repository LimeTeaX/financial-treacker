// src/components/ConfirmLogoutModal.jsx
import { LogOut, X } from 'lucide-react'

export default function ConfirmLogoutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay">
      <div className="bg-[#0f172a] rounded-2xl p-6 w-full max-w-sm border border-[#1e293b] shadow-2xl glass-card">
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
            <LogOut size={24} />
          </div>
          <button
            onClick={onClose}
            className="text-[#64748b] hover:text-[#94a3b8] transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>
        
        <h2 className="text-lg font-bold text-[#f8fafc] mb-2">
          Log Out?
        </h2>
        <p className="text-sm text-[#94a3b8] mb-6">
          Are you sure you want to log out? You&apos;ll need to sign in again to access your account.
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-[#334155] py-3 text-sm font-semibold text-[#94a3b8] hover:bg-[#1e293b] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white hover:bg-rose-600 transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  )
}
