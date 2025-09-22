import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_URL

export const getBirthdaysCurrentMonth = async () => {
  const res = await axios.get(`${API_BASE}/patientsbirthdaysmonth`)
  return res.data
}

// NOVO: traz todos os aniversários (não só do mês atual)
export const getBirthdays = async () => {
  const res = await axios.get(`${API_BASE}/patientsbirthdays`)
  return res.data
}