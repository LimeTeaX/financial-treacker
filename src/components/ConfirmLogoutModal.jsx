// src/components/ConfirmLogoutModal.jsx
import { LogOut, X } from 'lucide-react'

export default function ConfirmLogoutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-700 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-900/30 text-rose-500">
            <LogOut size={24} />
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Log Out?
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Are you sure you want to log out? You'll need to sign in again to access your account.
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-rose-500 py-2.5 text-sm font-medium text-white hover:bg-rose-600 transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  )
}