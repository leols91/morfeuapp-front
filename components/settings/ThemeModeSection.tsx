'use client'
import React from 'react'
import Button from '@/components/Button'
import SelectableButton from '@/components/SelectableButton'

type Props = {
  selectedTheme: 'light' | 'dark' | null
  onSelectTheme: (t: 'light' | 'dark') => void
  onSave: () => void
}

const THEME_OPTIONS = [
  { name: 'light', label: 'Claro' },
  { name: 'dark', label: 'Escuro' },
] as const

const ThemeModeSection: React.FC<Props> = ({ selectedTheme, onSelectTheme, onSave }) => {
  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold mb-2">Tema Claro / Escuro</h2>
      <p className="mb-6 text-gray-500">Escolha o modo de exibição:</p>

      <div className="flex gap-4 mb-6">
        {THEME_OPTIONS.map((option) => (
          <SelectableButton
            key={option.name}
            label={option.label}
            selected={selectedTheme === option.name}
            onClick={() => onSelectTheme(option.name)}
          />
        ))}
      </div>

      <Button label="Salvar Tema" onClick={onSave} />
    </div>
  )
}

export default ThemeModeSection