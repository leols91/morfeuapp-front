// src/services/dashboardService.ts
import axios from 'axios'

const API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') // remove barra no fim

if (!API) {
  // Loga claro no dev, ajuda muito a diagnosticar
  // (vai aparecer uma vez assim que o módulo for importado)
  console.error(
    '[dashboardService] NEXT_PUBLIC_API_URL não definido. ' +
    'Crie .env.local na raiz com NEXT_PUBLIC_API_URL=http://localhost:3001 e reinicie o dev server.'
  )
}

export type ActiveByMonthItem = {
  label: string
  total: number
  year: number
  month: number // 1..12
}

// instancia com baseURL – evita concatenar string
const http = axios.create({
  baseURL: API || '/', // evita crash caso esqueça a env – ainda assim logamos erro acima
})

export const getActiveContractsByMonth = async (monthsBack = 7): Promise<ActiveByMonthItem[]> => {
  const { data } = await http.get('/contracts/active-by-month', { params: { monthsBack } })
  return (Array.isArray(data) ? data : []).map((it: any) => ({
    label: String(it.label ?? ''),
    total: Number(it.total ?? 0),
    year: Number(it.year ?? 0),
    month: Number(it.month ?? 0),
  }))
}