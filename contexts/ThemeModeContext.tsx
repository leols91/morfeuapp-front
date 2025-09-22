'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type ThemeMode = 'light' | 'dark'

interface ThemeModeContextProps {
  themeMode: ThemeMode
  toggleThemeMode: (mode: ThemeMode) => void
}

const ThemeModeContext = createContext<ThemeModeContextProps | undefined>(undefined)

export const ThemeModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light')

  // Carrega a preferência salva no localStorage
  useEffect(() => {
    const stored = localStorage.getItem('themeMode') as ThemeMode | null
    if (stored === 'light' || stored === 'dark') {
      setThemeMode(stored)
      document.documentElement.classList.add(stored)
    } else {
      document.documentElement.classList.add('light')
    }
  }, [])

  // Atualiza DOM e localStorage quando mudar
  const toggleThemeMode = (mode: ThemeMode) => {
    document.documentElement.classList.remove(themeMode)
    document.documentElement.classList.add(mode)
    setThemeMode(mode)
    localStorage.setItem('themeMode', mode)
  }

  return (
    <ThemeModeContext.Provider value={{ themeMode, toggleThemeMode }}>
      {children}
    </ThemeModeContext.Provider>
  )
}

export const useThemeMode = () => {
  const context = useContext(ThemeModeContext)
  if (!context) {
    throw new Error('useThemeMode deve ser usado dentro de ThemeModeProvider')
  }
  return context
}