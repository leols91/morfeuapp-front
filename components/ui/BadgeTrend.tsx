'use client'
import React from 'react'
import clsx from 'clsx'

type BadgeTrendProps = {
  percent: number // ex: -6 ou 12
  positiveIsGood?: boolean // se quiser inverter lógica em outros contextos
  className?: string
}

const BadgeTrend: React.FC<BadgeTrendProps> = ({ percent, positiveIsGood = true, className }) => {
  const isPositive = percent >= 0
  const good = positiveIsGood ? isPositive : !isPositive
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-lg px-3 py-1 text-sm font-semibold',
        good
          ? 'bg-green-200 text-green-700 dark:bg-green-900/40 dark:text-green-300'
          : 'bg-red-200 text-red-700 dark:bg-red-900/40 dark:text-red-300',
        className
      )}
      aria-label={`Variação de ${percent}%`}
      title={`Variação de ${percent}%`}
    >
      {percent > 0 ? '+' : ''}
      {Math.round(percent)}%
    </span>
  )
}

export default BadgeTrend