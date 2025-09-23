import axios from 'axios'

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/configsis`

export const getConfigs = async () => {
  const res = await axios.get(API_URL)
  return res.data
}

export const createConfig = async (data: any) => {
  const res = await axios.post(API_URL, data)
  return res.data
}

export const updateConfig = async (id: string, data: any) => {
  const res = await axios.put(`${API_URL}/${id}`, data)
  return res.data
}
