'use client'

import React from 'react'
import clsx from 'clsx'

interface FormGroupProps {
  children: React.ReactNode
  columns?: 1 | 2
  className?: string
}

const FormGroup: React.FC<FormGroupProps> = ({ children, columns = 2, className }) => {
  return (
    <div
      className={clsx(
        'grid gap-6',
        columns === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2',
        className
      )}
    >
      {children}
    </div>
  )
}

export default FormGroup