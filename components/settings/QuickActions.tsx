'use client'
import React from 'react'
import Button from '@/components/Button'

type Props = {
  onOpenPassword: () => void
  onOpenStock: () => void
}

const QuickActions: React.FC<Props> = ({ onOpenPassword, onOpenStock }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
      <Button type="neutral" label="Alterar Senha" onClick={onOpenPassword} />
      <Button type="neutral" label="Configurar Estoque Bomboniere" onClick={onOpenStock} />
    </div>
  )
}

export default QuickActions