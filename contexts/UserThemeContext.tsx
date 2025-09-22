'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import Cookies from 'js-cookie'

type ThemeMode = 'light' | 'dark'

interface UserThemeContextProps {
  userTheme: ThemeMode
  setUserTheme: (mode: ThemeMode) => void
}

const UserThemeContext = createContext<UserThemeContextProps | undefined>(undefined)

export const UserThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [userTheme, setUserThemeState] = useState<ThemeMode>('light')

  useEffect(() => {
    const saved = Cookies.get('userTheme') as ThemeMode
    const themeToApply = saved || 'light'
    setUserThemeState(themeToApply)
    applyThemeClass(themeToApply)
  }, [])

  const setUserTheme = (mode: ThemeMode) => {
    Cookies.set('userTheme', mode, { expires: 30 })
    setUserThemeState(mode)
    applyThemeClass(mode)
  }

  const applyThemeClass = (theme: ThemeMode) => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
  }

  return (
    <UserThemeContext.Provider value={{ userTheme, setUserTheme }}>
      {children}
    </UserThemeContext.Provider>
  )
}

export const useUserTheme = () => {
  const context = useContext(UserThemeContext)
  if (!context) throw new Error('useUserTheme deve ser usado dentro de UserThemeProvider')
  return context
}