// services/userConfigService.ts
import api from './api'

export const getUserConfigs = async (userId: string) => {
  const response = await api.get(`/userconfigid/${userId}`)
  return response.data
}

export const createUserConfig = async (payload: any) => {
  const response = await api.post('/userconfig', payload)
  return response.data
}

export const updateUserConfig = async (id: string, payload: any) => {
  const response = await api.put(`/userconfig/${id}`, payload)
  return response.data
}

export const updateOrCreateUserConfig = async (userId: string, payload: any) => {
  const response = await api.post('/userconfig/updateorcreate', {
    ...payload,
    id_user: userId,
  })
  return response.data
}