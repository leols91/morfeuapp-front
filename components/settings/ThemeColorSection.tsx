'use client'
import React from 'react'
import Button from '@/components/Button'
import { ThemeColor } from '@/types/theme'

const COLOR_OPTIONS: { name: ThemeColor; label: string; bg: string }[] = [
  { name: 'purple', label: 'Roxo', bg: 'bg-reabilis-purple' },
  { name: 'blue', label: 'Azul', bg: 'bg-reabilis-blue' },
  { name: 'orange', label: 'Laranja', bg: 'bg-reabilis-orange' },
  { name: 'green', label: 'Verde', bg: 'bg-reabilis-green' },
  { name: 'red', label: 'Vermelho', bg: 'bg-reabilis-red' },
]

type Props = {
  selectedColor: ThemeColor
  onSelectColor: (c: ThemeColor) => void
  onSave: () => void
}

const ThemeColorSection: React.FC<Props> = ({ selectedColor, onSelectColor, onSave }) => {
  return (
    <>
      <h2 className="section-title">Cor do Tema</h2>
      <p className="section-description">Selecione a cor principal do sistema:</p>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mb-8">
        {COLOR_OPTIONS.map((color) => (
          <button
            key={color.name}
            type="button"
            className={`h-12 rounded-md transition border-2 ${color.bg} hover:opacity-80 hover:scale-105 duration-200 ${
              selectedColor === color.name
                ? 'ring-4 ring-offset-2 ring-reabilis-gray'
                : 'border-transparent'
            }`}
            onClick={() => onSelectColor(color.name)}
          />
        ))}
      </div>

      <Button label="Salvar Cor" onClick={onSave} />
    </>
  )
}

export default ThemeColorSection