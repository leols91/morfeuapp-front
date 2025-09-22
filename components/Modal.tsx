'use client'

import React from 'react'
import clsx from 'clsx'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null

  return (
    <div
      className={clsx(
        'fixed inset-0 flex items-center justify-center z-50',
        'bg-black/30 dark:bg-black/40 backdrop-blur-sm' // efeito fosco e suave
      )}
      onClick={onClose}
    >
      <div
        className={clsx(
          'relative bg-white dark:bg-[#202020] p-4 rounded-lg max-w-full max-h-full overflow-auto',
          'shadow-lg'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  )
}

export default Modal