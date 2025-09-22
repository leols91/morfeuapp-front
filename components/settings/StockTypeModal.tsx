'use client'
import React, { useState } from 'react'
import Button from '@/components/Button'

type StockType = 'unificado' | 'separado'

type Props = {
  value: StockType
  onCancel: () => void
  onConfirm: (value: StockType) => void
}

const StockTypeModal: React.FC<Props> = ({ value, onCancel, onConfirm }) => {
  const [selected, setSelected] = useState<StockType>(value)

  return (
    <div className="w-[90vw] max-w-xl">
      <h3 className="text-xl font-bold mb-2">Tipo de estoque da bomboniere</h3>
      <hr className="my-3 border-gray-200 dark:border-[#333]" />
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        <strong>Atenção!</strong> Ao alterar o tipo de estoque da bomboniere, todas as informações atuais
        do estoque serão perdidas. Será necessário refazer a contagem manual e inserir no sistema.
      </p>
      <hr className="my-3 border-gray-200 dark:border-[#333]" />

      <label className="block text-sm font-medium mb-1">Tipo de Estoque:</label>
      <select
        className="w-full px-4 py-3 border-2 rounded-lg bg-white dark:bg-[#2b2b2b] dark:text-white border-gray-300 dark:border-[#3a3a3a] focus:outline-none"
        value={selected}
        onChange={(e) => setSelected(e.target.value as StockType)}
      >
        <option value="unificado">Unificado</option>
        <option value="separado">Separado por unidade</option>
      </select>

      <div className="flex justify-end gap-3 mt-6">
        <Button type="neutral" label="Fechar" onClick={onCancel} />
        <Button label="Confirmar" onClick={() => onConfirm(selected)} />
      </div>
    </div>
  )
}

export default StockTypeModal