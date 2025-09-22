'use client'

import React from 'react'
import clsx from 'clsx'

interface SelectableButtonProps {
  label: string
  selected: boolean
  onClick: () => void
}

const SelectableButton: React.FC<SelectableButtonProps> = ({ label, selected, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'selectable-button',
        selected ? 'selectable-button-selected' : 'selectable-button-unselected'
      )}
    >
      {label}
    </button>
  )
}

export default SelectableButton