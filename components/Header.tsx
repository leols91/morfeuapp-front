// components/Header.tsx
'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'

interface HeaderProps { titlePage: string }

const Header: React.FC<HeaderProps> = ({ titlePage }) => {
  const [employeeName, setEmployeeName] = useState('')

  useEffect(() => {
    // ① pinta rápido com cache (se existir)
    if (typeof window !== 'undefined') {
      const cachedName = localStorage.getItem('userFullName')
      if (cachedName) setEmployeeName(cachedName)
    }

    // ② busca e atualiza cache
    const fetchEmployeeName = async () => {
      const userId = localStorage.getItem('userId')
      if (!userId) return
      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/useremployee/${userId}`)
        const fullname = data?.employeefullname || 'Usuário'
        const login = data?.login_user || ''

        setEmployeeName(fullname)

        // salva no cache para reuso (ConfigPage e outros)
        localStorage.setItem('userFullName', fullname)
        localStorage.setItem('userLogin', login)
      } catch {
        setEmployeeName('Usuário')
      }
    }
    fetchEmployeeName()
  }, [])

  return (
    <div
      className="
        sticky top-0 z-40
        bg-white/80 dark:bg-reabilis-gray/80 backdrop-blur
        text-black dark:text-white
        px-3 sm:px-4 py-2
        flex items-center justify-between
        [padding-top:env(safe-area-inset-top)]
      "
      role="banner"
    >
      <h1 className="text-base sm:text-lg font-semibold truncate">{titlePage}</h1>
      <p className="text-xs sm:text-sm whitespace-nowrap">Olá, {employeeName || 'Usuário'}</p>
    </div>
  )
}
export default Header