'use client'

import React, { useEffect, useState } from 'react'
import Select, { SingleValue, ActionMeta } from 'react-select'
import clsx from 'clsx'
import { useThemeColor } from '@/hooks/useThemeColor'

export interface Option {
  value: string
  label: string
}

interface CustomSelectProps {
  label: string
  value: Option | null
  onChange: (value: Option | null) => void
  options: Option[]
}

const SelectWithLabel: React.FC<CustomSelectProps> = ({ label, value, onChange, options }) => {
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

  const getHexColor = (color: string): string => {
    const hexMap: Record<string, string> = {
      purple: '#9F67FF',
      blue: '#6CA7FF',
      green: '#50AC68',
      orange: '#EA7B40',
      red: '#E74C3C',
    }
    return hexMap[color] || '#9F67FF'
  }

  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: isDarkMode ? '#2b2b2b' : '#fff',
      color: isDarkMode ? '#fff' : '#000',
      border: 'none',
      boxShadow: 'none',
      height: '3rem',
      paddingLeft: '1rem',
      paddingRight: '1rem',
      fontSize: '1rem',
      lineHeight: '1.5rem',
      borderRadius: '0.5rem',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? getHexColor(themeColor)
        : isDarkMode
        ? '#3b3b3b'
        : '#fff',
      color: state.isSelected ? '#fff' : isDarkMode ? '#fff' : '#000',
      cursor: 'pointer',
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: isDarkMode ? '#2b2b2b' : '#fff',
      color: isDarkMode ? '#fff' : '#000',
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: isDarkMode ? '#fff' : '#000',
    }),
  }

  const handleChange = (
    selectedOption: SingleValue<Option>,
    _actionMeta: ActionMeta<Option>
  ) => {
    onChange(selectedOption || null)
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div
        className={clsx(
          'border-2 rounded-lg transition duration-300',
          isFocused ? themeBorder[themeColor] : 'border-gray-300 dark:border-[#3a3a3a]'
        )}
      >
        <Select
          classNamePrefix="custom-select"
          styles={customStyles}
          value={value}
          onChange={handleChange}
          options={options}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </div>
    </div>
  )
}

export default SelectWithLabel