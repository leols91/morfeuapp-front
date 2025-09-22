import axios from 'axios'

const API = process.env.NEXT_PUBLIC_API_URL

const BASE = `${API}/contracts`
const SUM_NEW = `${API}/sumnewcontracts`
const SUM_END = `${API}/sumendcontracts`

export const listContracts = async (orderBy = 'desc') => {
  const { data } = await axios.get(`${BASE}?orderBy=${orderBy}`)
  return data
}

export const listActiveContracts = async () => {
  const { data } = await axios.get(`${API}/contractsactive`)
  return data
}

export const getNewContractsMonth = async () => {
  const { data } = await axios.get(SUM_NEW)
  return data
}

export const getEndContractsMonth = async () => {
  const { data } = await axios.get(SUM_END)
  return data
}