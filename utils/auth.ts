'use client'

import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'

export function handleLogout(router: ReturnType<typeof useRouter>) {
  Cookies.remove('token')
  localStorage.clear()
  router.push('/login')
}