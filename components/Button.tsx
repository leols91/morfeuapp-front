// components/Button.tsx
'use client'

import React from 'react'
import { useThemeColor } from '@/hooks/useThemeColor'
import { button } from '@/components/ui/buttonStyles'

type ButtonType = 'default' | 'danger' | 'alert' | 'success' | 'neutral'

interface ButtonProps {
  label: string
  type?: ButtonType
  onClick?: () => void
  disabled?: boolean
  className?: string
}

const Button: React.FC<ButtonProps> = ({ label, type = 'default', onClick, disabled, className }) => {
  const { themeColor } = useThemeColor()

  // intent 'neutral' ignora cor do tema (classe já vem completa no variants)
  const classes =
    type === 'neutral'
      ? button({ intent: 'neutral' as any, className })
      : button({ intent: type as any, themeColor, className })

  return (
    <button className={classes} onClick={onClick} disabled={disabled}>
      {label}
    </button>
  )
}

export default Button