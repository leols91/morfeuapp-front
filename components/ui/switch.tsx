'use client'

import React from 'react'
import clsx from 'clsx'
import { useThemeColor } from '@/hooks/useThemeColor'

interface SwitchProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

const themeClass: Record<string, string> = {
  purple: 'bg-reabilis-purple',
  blue: 'bg-reabilis-blue',
  green: 'bg-reabilis-green',
  orange: 'bg-reabilis-orange',
  red: 'bg-reabilis-red',
}

const Switch: React.FC<SwitchProps> = ({ label, checked, onChange }) => {
  const { themeColor } = useThemeColor()

  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={clsx(
            'w-11 h-6 rounded-full transition-colors duration-300',
            checked
              ? themeClass[themeColor]
              : 'bg-gray-300 dark:bg-gray-600'
          )}
        />
        <div
          className={clsx(
            'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300',
            checked && 'translate-x-5'
          )}
        />
      </div>
      <span className="text-sm text-gray-800 dark:text-white">{label}</span>
    </label>
  )
}

export default Switch