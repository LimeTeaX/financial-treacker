// src/components/ConfirmModal.jsx
import { AlertTriangle, X } from "lucide-react";

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
            <AlertTriangle size={24} />
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <h2 className="text-lg font-bold text-white mb-2">{title || "Confirm Delete"}</h2>
        <p className="text-sm text-slate-400 mb-6">{message || "Are you sure?"}</p>
        
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-700 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-medium text-white hover:bg-red-600">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}