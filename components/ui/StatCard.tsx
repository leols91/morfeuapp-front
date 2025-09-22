// components/ui/StatCard.tsx
'use client'
import React from 'react'
import clsx from 'clsx'
import { getDashboardCardBorderClass } from '@/utils/getDashboardCardBorderClass'

type StatCardProps = {
  title: string
  value: React.ReactNode
  subtitle?: string
  right?: React.ReactNode
  className?: string
  loading?: boolean
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  right,
  className,
  loading,
}) => {
  return (
    <div
      className={clsx(
        'bg-white dark:bg-reabilis-gray border rounded-lg w-full',
        getDashboardCardBorderClass(),
        'flex items-center justify-between gap-3',
        'p-3 sm:p-4',
        'min-h-[104px]'
        ,className
      )}
      aria-busy={loading || undefined}
    >
      <div className="flex flex-col min-w-0">
        <p className="text-[11px] sm:text-xs font-medium text-gray-600 dark:text-gray-300">{title}</p>

        <p className="text-2xl sm:text-3xl font-semibold leading-tight mt-1">
          {loading ? '–' : value}
        </p>

        <p
          className={clsx(
            'text-[11px] sm:text-xs mt-1 truncate',
            subtitle ? 'text-gray-500 dark:text-gray-400' : 'invisible'
          )}
        >
          {subtitle || 'placeholder'}
        </p>
      </div>

      {right && <div className="ml-2 sm:ml-4 shrink-0">{right}</div>}
    </div>
  )
}
export default StatCard