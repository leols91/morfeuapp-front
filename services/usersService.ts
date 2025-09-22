import axios from 'axios'
const API = process.env.NEXT_PUBLIC_API_URL

export const updateUserPassword = (id: string, payload: {
  old_password: string
  new_password: string
  confirm_new_password: string
}) => axios.put(`${API}/updatepassuser/${id}`, payload)