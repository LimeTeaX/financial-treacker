import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProvider } from './context/AppContext'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import App from './App'

// 🔥 APPLY THEME INSTANTLY - sebelum React render!
(function() {
  const savedTheme = localStorage.getItem('majumoney_theme')
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark')
  } else if (savedTheme === 'system') {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark')
    }
  }
})()

createRoot(document.getElementById('root')).render(
<AuthProvider>
  <AppProvider>
    <ToastProvider>
      <App />
    </ToastProvider>
  </AppProvider>
</AuthProvider>

)