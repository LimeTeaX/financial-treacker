// src/components/Toast.jsx
import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'

export default function Toast({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-2xl border backdrop-blur-sm transition-all duration-300 ${
      visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    } ${
      type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' :
      type === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' :
      'bg-blue-500/10 border-blue-500/30 text-blue-500'
    }`}>
      {type === 'success' && <CheckCircle2 size={18} />}
      {type === 'error' && <XCircle size={18} />}
      <span className="text-sm font-medium">{message}</span>
      <button 
        onClick={() => { setVisible(false); setTimeout(onClose, 300) }} 
        className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X size={14} />
      </button>
    </div>
  )
}
