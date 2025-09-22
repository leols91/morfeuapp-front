// layouts/DefaultLayout.tsx
'use client'

import { ReactNode, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'

interface DefaultLayoutProps {
  children: ReactNode
}

const DefaultLayout = ({ children }: DefaultLayoutProps) => {
  // ✅ Remove o useThemeColor diretamente daqui
  // O Sidebar ou outros componentes internos devem chamar

  return (
    <Sidebar>
      <main className="bg-gray-100 dark:bg-[#202020] min-h-screen">{children}</main>
    </Sidebar>
  )
}

export default DefaultLayout