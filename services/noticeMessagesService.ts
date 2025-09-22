import axios from 'axios'

const API = process.env.NEXT_PUBLIC_API_URL

// Mensagens não lidas por usuário (para abrir o modal)
export const listUnreadByUser = async (userId: string) => {
  const { data } = await axios.get(`${API}/usernoticemessagesunread/${userId}`)
  return data
}

// Atualizar o registro de “user notice message” para marcar como lido
export const updateUserNoticeMessage = async (id: string, payload: any) => {
  const { data } = await axios.put(`${API}/usernoticemessages/${id}`, payload)
  return data
}