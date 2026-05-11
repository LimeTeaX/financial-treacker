import { useCallback, useEffect, useState } from 'react'
import { applyTheme } from '../context/AppContext'
import { useAppContext } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'

export function useTheme() {
  const { user } = useAuth()
  const { settings, updateSettings, loading } = useAppContext()
  const [guestTheme, setGuestTheme] = useState('light')

  useEffect(() => {
    if (user) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const syncSystemTheme = () => {
      const nextTheme = mediaQuery.matches ? 'dark' : 'light'
      setGuestTheme(nextTheme)
      applyTheme(nextTheme)
    }

    syncSystemTheme()
    mediaQuery.addEventListener('change', syncSystemTheme)
    return () => mediaQuery.removeEventListener('change', syncSystemTheme)
  }, [user])

  const theme = user ? settings.theme : guestTheme

  const toggleTheme = useCallback(async () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    applyTheme(nextTheme)

    if (!user) {
      setGuestTheme(nextTheme)
      return true
    }

    return updateSettings({ theme: nextTheme })
  }, [theme, updateSettings, user])

  return {
    theme,
    toggleTheme,
    loading: user ? loading.settings : false,
  }
}
