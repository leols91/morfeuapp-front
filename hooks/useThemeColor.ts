// hooks/useThemeColor.ts
'use client'

import { useContext } from 'react'
import { ThemeColorContext } from '@/contexts/ThemeColorContext'
import type { ThemeColor } from '@/types/theme'

export const useThemeColor = (): {
  themeColor: ThemeColor
  setThemeColor: (color: ThemeColor) => void
} => {
  const context = useContext(ThemeColorContext)

  if (!context) {
    throw new Error('useThemeColor deve ser usado dentro do ThemeColorProvider')
  }

  return context
}