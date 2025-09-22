'use client'
import React, { useMemo } from 'react'
import StatCard from '@/components/ui/StatCard'
import BadgeTrend from '@/components/ui/BadgeTrend'

type Props = {
  totalAcolhidos: number
  novosMes: number
  altasMes: number
  receitaDeltaPercent: number
  loading?: boolean
}

const TopCards: React.FC<Props> = ({
  totalAcolhidos,
  novosMes,
  altasMes,
  receitaDeltaPercent,
  loading = false,
}) => {
  // Configuração declarativa: fácil de reaproveitar e reordenar
  const cards = useMemo(
    () => [
      { key: 'total',   title: 'Acolhidos - Total', value: totalAcolhidos },
      { key: 'novos',   title: 'Novos no mês',      value: novosMes },
      { key: 'altas',   title: 'Altas no mês',      value: altasMes },
      {
        key: 'receita',
        title: 'Receita no mês',
        // Mantém o layout atual (sem número grande, só subtítulo + badge)
        value: <span className="text-xs text-gray-500 dark:text-gray-400">&nbsp;</span>,
        subtitle: 'Comparado ao mês anterior',
        right: <BadgeTrend percent={receitaDeltaPercent} />,
      },
    ],
    [totalAcolhidos, novosMes, altasMes, receitaDeltaPercent]
  )

  return (
    <div className="grid xl:grid-cols-8 gap-4 p-2 sm:p-4">
      {cards.map((c) => (
        <div key={c.key} className="lg:col-span-2 col-span-1">
          <StatCard
            title={c.title}
            value={c.value as React.ReactNode}
            subtitle={'subtitle' in c ? (c as any).subtitle : undefined}
            right={'right' in c ? (c as any).right : undefined}
            loading={loading}
          />
        </div>
      ))}
    </div>
  )
}

export default TopCards