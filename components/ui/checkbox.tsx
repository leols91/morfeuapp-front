'use client'

import React, { InputHTMLAttributes, useState } from 'react'
import clsx from 'clsx'
import { useThemeColor } from '@/hooks/useThemeColor'

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

const Checkbox: React.FC<CheckboxProps> = ({ label, className, ...props }) => {
  const { themeColor } = useThemeColor()
  const [isFocused, setIsFocused] = useState(false)

  const borderColor: Record<string, string> = {
    purple: 'accent-reabilis-purple',
    blue: 'accent-reabilis-blue',
    green: 'accent-reabilis-green',
    orange: 'accent-reabilis-orange',
    red: 'accent-reabilis-red',
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        className={clsx(
          'rounded focus:ring-0 transition duration-200',
          borderColor[themeColor],
          className
        )}
        onFocus={(e) => {
          setIsFocused(true)
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          setIsFocused(false)
          props.onBlur?.(e)
        }}
        {...props}
      />
      <span className="text-gray-900 dark:text-white">{label}</span>
    </label>
  )
}

export default Checkbox