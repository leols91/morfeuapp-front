// hooks/useUserProfile.ts
'use client'
import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'

const API = process.env.NEXT_PUBLIC_API_URL as string

export const useUserProfile = () => {
  const [userName, setUserName] = useState<string>('Usuário')
  const [userLogin, setUserLogin] = useState<string>('')

  // carrega do cache apenas no cliente
  useEffect(() => {
    if (typeof window === 'undefined') return
    const cachedName = localStorage.getItem('userFullName')
    const cachedLogin = localStorage.getItem('userLogin')
    if (cachedName) setUserName(cachedName)
    if (cachedLogin) setUserLogin(cachedLogin)
  }, [])

  const refreshProfile = useCallback(async (userId: string) => {
    try {
      const r = await axios.get(`${API}/useremployee/${userId}`)
      const fullname = r.data?.employeefullname || 'Usuário'
      const login = r.data?.login_user || ''
      setUserName(fullname)
      setUserLogin(login)

      // grava no cache só no cliente
      if (typeof window !== 'undefined') {
        localStorage.setItem('userFullName', fullname)
        localStorage.setItem('userLogin', login)
      }
    } catch {
      // silencioso
    }
  }, [])

  return { userName, userLogin, refreshProfile }
}