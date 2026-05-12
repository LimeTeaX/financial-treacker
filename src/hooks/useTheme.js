// src/hooks/useTheme.js
import { useCallback, useEffect, useState } from 'react'
import { useAppContext, applyTheme } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'

export function useTheme() {
  const { user } = useAuth()
  const { settings, updateSettings, loading } = useAppContext()
  const [guestTheme, setGuestTheme] = useState('light')
  const [isLoading, setIsLoading] = useState(true)

  // Guest mode: ikutin system preference
  useEffect(() => {
    if (user) {
      setIsLoading(false)
      return
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const syncSystemTheme = () => {
      const nextTheme = mediaQuery.matches ? 'dark' : 'light'
      setGuestTheme(nextTheme)
      applyTheme(nextTheme)
      setIsLoading(false)
    }

    syncSystemTheme()
    mediaQuery.addEventListener('change', syncSystemTheme)
    return () => mediaQuery.removeEventListener('change', syncSystemTheme)
  }, [user])

  // User mode: ambil dari settings
  useEffect(() => {
    if (user && settings?.theme) {
      applyTheme(settings.theme)
      setIsLoading(false)
    } else if (user && !settings) {
      // Masih loading settings
      setIsLoading(true)
    }
  }, [user, settings])

  const theme = user ? settings?.theme : guestTheme

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
    loading: isLoading || (user ? loading?.settings : false),
  }
}