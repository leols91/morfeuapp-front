'use client'

import React, { InputHTMLAttributes, useState } from 'react'
import clsx from 'clsx'
import { useThemeColor } from '@/hooks/useThemeColor'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

const themeFocusBorder: Record<string, string> = {
  purple: 'border-reabilis-purple focus:border-reabilis-purple',
  blue: 'border-reabilis-blue focus:border-reabilis-blue',
  green: 'border-reabilis-green focus:border-reabilis-green',
  orange: 'border-reabilis-orange focus:border-reabilis-orange',
  red: 'border-reabilis-red focus:border-reabilis-red',
}

const Input: React.FC<InputProps> = ({ label, className, ...props }) => {
  const [isFocused, setIsFocused] = useState(false)
  const { themeColor } = useThemeColor()
  const focusClass = themeFocusBorder[themeColor] || themeFocusBorder.purple

  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        {...props}
        onFocus={(e) => {
          props.onFocus?.(e)
          setIsFocused(true)
        }}
        onBlur={(e) => {
          props.onBlur?.(e)
          setIsFocused(false)
        }}
        className={clsx(
          'w-full px-4 py-3 border-2 rounded-lg outline-none transition duration-300',
          'bg-white text-gray-900 dark:bg-[#2b2b2b] dark:text-white',
          'placeholder-gray-400 dark:placeholder-gray-500',
          isFocused ? focusClass : 'border-gray-300 dark:border-[#3a3a3a]',
          className
        )}
      />
    </div>
  )
}

export default Input