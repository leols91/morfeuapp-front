// pages/index.tsx
'use client'

import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useThemeColor } from '@/hooks/useThemeColor'

import Header from '@/components/Header'
import TopCards from '@/components/TopCards'
import BarChart from '@/components/BarChart'
import NextBirthdates from '@/components/NextBirthdates'
import InfoMessageModalDashboard from '@/components/dashboard/InfoMessageModalDashboard'
import { getActiveContractsByMonth } from '@/services/dashboardService'

import {
  listActiveContracts,
  getNewContractsMonth,
  getEndContractsMonth,
} from '@/services/contractsService'
import {
  getMonthPaidTotal,
  getMonthPaidTotalBy,
} from '@/services/paymentsService'
import {
  listUnreadByUser,
  updateUserNoticeMessage,
} from '@/services/noticeMessagesService'

// ⛔️ REMOVA: computeAcolhidosPorMes e o import de listContracts

// Tipagem do endpoint /contracts/active-by-month
type ActiveByMonthItem = {
  year: number
  month: number // 1..12
  total: number
  label: string // ex: 'jan', 'fev'...
}

export default function Home() {
  useThemeColor()

  const [cards, setCards] = useState({
    total: 0,
    novos: 0,
    altas: 0,
    receitaDeltaPercent: 0,
  })
  const [chart, setChart] = useState<{ labels: string[]; values: number[] }>({
    labels: [],
    values: [],
  })
  const [msgOpen, setMsgOpen] = useState(false)
  const [msgData, setMsgData] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      // ----- Totais -----
      const [active, novos, altas] = await Promise.all([
        listActiveContracts(),
        getNewContractsMonth(),
        getEndContractsMonth(),
      ])

      // ----- Receita: % vs mês anterior -----
      const now = new Date()
      const currYear = now.getFullYear()
      const currMonth = now.getMonth() + 1

      const prevDate = new Date(currYear, currMonth - 2, 1)
      const prevYear = prevDate.getFullYear()
      const prevMonth = prevDate.getMonth() + 1

      const [paidCurrRaw, paidPrevRaw] = await Promise.all([
        getMonthPaidTotal(),
        getMonthPaidTotalBy(prevYear, prevMonth),
      ])

      const toNum = (v: any) => +((Array.isArray(v) ? v[0]?.total : v?.total) ?? 0)
      const paidCurr = toNum(paidCurrRaw)
      const paidPrev = toNum(paidPrevRaw)

      const receitaDeltaPercent =
        paidPrev > 0 ? ((paidCurr - paidPrev) / paidPrev) * 100 : (paidCurr > 0 ? 100 : 0)

      setCards({
        total: Array.isArray(active) ? active.length : (active?.length ?? 0),
        novos: toNum(novos),
        altas: toNum(altas),
        receitaDeltaPercent,
      })

      // ----- Gráfico (USA O ENDPOINT NOVO) -----
      try {
        const series: ActiveByMonthItem[] = await getActiveContractsByMonth(7)
        // debug opcional
        console.log('ActiveByMonth series:', series)
        setChart({
          labels: (series ?? []).map(s => s.label),
          values: (series ?? []).map(s => s.total),
        })
      } catch (e) {
        console.error('Erro ao carregar ativos por mês', e)
        setChart({ labels: [], values: [] })
      }

      // ----- Mensagem -----
      const userId = localStorage.getItem('user') || localStorage.getItem('userId')
      if (userId) {
        const unread = await listUnreadByUser(userId)
        if (unread) {
          setMsgData(unread)
          setMsgOpen(true)
        }
      }
    }

    load()
  }, [])

  const handleConfirmMsg = async (m: any) => {
    if (m?.id) await updateUserNoticeMessage(m.id, { ...m, view_status: 'Lido' })
    setMsgOpen(false)
  }

  return (
    <>
      <Head>
        <title>Dashboard - Sistema Reabilis</title>
      </Head>

      <Header titlePage="Dashboard" />

      <TopCards
        totalAcolhidos={cards.total}
        novosMes={cards.novos}
        altasMes={cards.altas}
        receitaDeltaPercent={cards.receitaDeltaPercent}
      />

      {/* 🟣 Grid com ordem responsiva e paddings menores no mobile */}
      <div className="p-2 sm:p-4 grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* No mobile, aniversários primeiro (order-1) e gráfico depois (order-2) */}
        <div className="order-2 xl:order-none xl:col-span-2">
          <BarChart labels={chart.labels} values={chart.values} />
        </div>
        <div className="order-1 xl:order-none">
          <NextBirthdates />
        </div>
        
      </div>

      <InfoMessageModalDashboard
        open={msgOpen}
        data={msgData}
        onConfirm={handleConfirmMsg}
        onClose={() => setMsgOpen(false)}
      />
    </>
  )
}