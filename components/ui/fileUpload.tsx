'use client'

import React, { useState } from 'react'
import clsx from 'clsx'
import { useThemeColor } from '@/hooks/useThemeColor'

interface FileUploadProps {
  label: string
  onChange: (file: File | null) => void
}

const FileUpload: React.FC<FileUploadProps> = ({ label, onChange }) => {
  const { themeColor } = useThemeColor()
  const [isFocused, setIsFocused] = useState(false)

  const themeBorder: Record<string, string> = {
    purple: 'border-reabilis-purple',
    blue: 'border-reabilis-blue',
    green: 'border-reabilis-green',
    orange: 'border-reabilis-orange',
    red: 'border-reabilis-red',
  }

  const fileColorClass: Record<string, string> = {
    purple: 'file:bg-reabilis-purple hover:file:bg-purple-700',
    blue: 'file:bg-reabilis-blue hover:file:bg-blue-700',
    green: 'file:bg-reabilis-green hover:file:bg-green-700',
    orange: 'file:bg-reabilis-orange hover:file:bg-orange-700',
    red: 'file:bg-reabilis-red hover:file:bg-red-700',
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">{label}</label>
      <input
        type="file"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={clsx(
          'block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg',
          'file:border-0 file:text-white file:bg-opacity-90',
          'border-2 rounded-lg transition duration-300',
          'bg-white text-gray-900 dark:bg-[#2b2b2b] dark:text-white',
          'placeholder-gray-400 dark:placeholder-gray-500',
          isFocused
            ? themeBorder[themeColor]
            : 'border-gray-300 dark:border-[#3a3a3a]',
          fileColorClass[themeColor] || fileColorClass.purple
        )}
      />
    </div>
  )
}

export default FileUpload