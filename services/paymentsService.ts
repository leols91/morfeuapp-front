import axios from 'axios'

const API = process.env.NEXT_PUBLIC_API_URL

// Totais de mensalidades do mês por status (Aberto, Vencido, Pago etc.)
export const getMonthValueByStatus = async (type: string) => {
  const { data } = await axios.get(`${API}/contractpaymentsmonthly/${type}`)
  return data
}

// Total pago de mensalidades (considera pay_date do mês corrente)
export const getMonthPaidTotal = async () => {
  const { data } = await axios.get(`${API}/contractpaymentsmonthlypay`)
  return data
}

// Total de todas as mensalidades previstas no mês
export const getTotalMonthValue = async () => {
  const { data } = await axios.get(`${API}/contractpaymentssum`)
  return data
}

// Total por unidade no mês (se necessário)
export const getUnitMonthValue = async (unit: string) => {
  const { data } = await axios.get(`${API}/contractpaymentsunit/${unit}`)
  return data
}

// Total de taxas no mês (todas as taxas ativas)
export const getTaxMonthTotal = async () => {
  const { data } = await axios.get(`${API}/contractpaymentstax`)
  return data
}

// Totais de NOVOS/ALTAS do mês (mesmo que no contractsService – opcional duplicar aqui)
export const getNewContractsMonth = async () => {
  const { data } = await axios.get(`${API}/sumnewcontracts`)
  return data
}

export const getEndContractsMonth = async () => {
  const { data } = await axios.get(`${API}/sumendcontracts`)
  return data
}

// Totais de TAXAS por status no mês (ex.: Aberto, Pago, Vencido…)
export const getTaxMonthByStatus = async (type: string) => {
  const { data } = await axios.get(`${API}/contracttaxtype/${type}`)
  return data
}

// Total de TAXAS pagas no mês
export const getTaxMonthPaidTotal = async () => {
  const { data } = await axios.get(`${API}/contracttaxtypepay`)
  return data
}

// ✅ novo: total pago por ano/mês
export const getMonthPaidTotalBy = async (year: number, month: number) => {
  const { data } = await axios.get(`${API}/contractpaymentsmonthlypay`, {
    params: { year, month }, // espera ?year=2025&month=3
  })
  return data
}