'use client'

import React, { useEffect, useState } from 'react'
import clsx from 'clsx'
import { useThemeColor } from '@/hooks/useThemeColor'

interface TextAreaWithLabelProps {
  label: string
  value: string
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
}

const TextAreaWithLabel: React.FC<TextAreaWithLabelProps> = ({ label, value, onChange }) => {
  const [isFocused, setIsFocused] = useState(false)
  const { themeColor } = useThemeColor()
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }
  }, [])

  const themeBorder: Record<string, string> = {
    purple: 'border-reabilis-purple',
    blue: 'border-reabilis-blue',
    green: 'border-reabilis-green',
    orange: 'border-reabilis-orange',
    red: 'border-reabilis-red',
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <textarea
        rows={4}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={clsx(
          'w-full resize-none px-4 py-3 border-2 rounded-lg outline-none transition duration-300',
          'bg-white text-gray-900 dark:bg-[#2b2b2b] dark:text-white',
          'placeholder-gray-400 dark:placeholder-gray-500',
          isFocused
            ? themeBorder[themeColor]
            : 'border-gray-300 dark:border-[#3a3a3a]'
        )}
      />
    </div>
  )
}

export default TextAreaWithLabel