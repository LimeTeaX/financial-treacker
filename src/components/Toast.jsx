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
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 rounded-2xl px-5 py-3 shadow-lg border transition-all duration-300 ${
      visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    } ${
      type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
      type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-700' :
      'bg-blue-50 border-blue-200 text-blue-700'
    }`}>
      {type === 'success' && <CheckCircle2 size={18} />}
      {type === 'error' && <XCircle size={18} />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={() => { setVisible(false); setTimeout(onClose, 300) }} className="ml-2 opacity-50 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  )
}
