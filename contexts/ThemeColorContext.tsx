'use client'

import React, { createContext, useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import type { ThemeColor } from '@/types/theme'

export interface ThemeColorContextType {
  themeColor: ThemeColor
  setThemeColor: (color: ThemeColor) => void
}

export const ThemeColorContext = createContext<ThemeColorContextType | null>(null)

export const ThemeColorProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeColor, setThemeColorState] = useState<ThemeColor>('purple')

  useEffect(() => {
    const saved = Cookies.get('themeColor') as ThemeColor
    if (saved) {
      setThemeColorState(saved)
    }
  }, [])

  const setThemeColor = (color: ThemeColor) => {
    Cookies.set('themeColor', color, { expires: 30 })
    setThemeColorState(color)
  }

  return (
    <ThemeColorContext.Provider value={{ themeColor, setThemeColor }}>
      {children}
    </ThemeColorContext.Provider>
  )
}