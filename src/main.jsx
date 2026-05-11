import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProvider } from './context/AppContext'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')).render(
<AuthProvider>
  <AppProvider>
    <ToastProvider>
      <App />
    </ToastProvider>
  </AppProvider>
</AuthProvider>

)