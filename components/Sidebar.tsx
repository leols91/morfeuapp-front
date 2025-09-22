'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { HiOutlineHome, HiOutlineUserGroup, HiOutlineCurrencyDollar, HiOutlineShoppingCart, HiOutlineDocumentReport, HiOutlineClipboardList } from 'react-icons/hi'
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2'

import { FiSettings, FiLogOut } from 'react-icons/fi'
import { handleLogout } from '@/utils/auth'
import { useThemeColor } from '@/hooks/useThemeColor'
import clsx from 'clsx'

type ThemeKey = 'purple' | 'blue' | 'green' | 'orange' | 'red'

const themeClasses: Record<ThemeKey, {
  bg: string; text: string; hoverText: string; iconBg: string; iconText: string
}> = {
  purple: { bg: 'bg-reabilis-purple', text: 'text-black dark:text-white', hoverText: 'group-hover:text-reabilis-purple', iconBg: 'bg-reabilis-purple-100', iconText: 'text-reabilis-purple-800' },
  blue:   { bg: 'bg-reabilis-blue',   text: 'text-black dark:text-white', hoverText: 'group-hover:text-reabilis-blue',   iconBg: 'bg-reabilis-blue-100',   iconText: 'text-reabilis-blue-800' },
  green:  { bg: 'bg-reabilis-green',  text: 'text-black dark:text-white', hoverText: 'group-hover:text-reabilis-green',  iconBg: 'bg-reabilis-green-100',  iconText: 'text-reabilis-green-800' },
  orange: { bg: 'bg-reabilis-orange', text: 'text-black dark:text-white', hoverText: 'group-hover:text-reabilis-orange', iconBg: 'bg-reabilis-orange-100', iconText: 'text-reabilis-orange-800' },
  red:    { bg: 'bg-reabilis-red',    text: 'text-black dark:text-white', hoverText: 'group-hover:text-reabilis-red',    iconBg: 'bg-reabilis-red-100',    iconText: 'text-reabilis-red-800' },
}

const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const { themeColor } = useThemeColor()
  const currentTheme = themeClasses[themeColor as ThemeKey] || themeClasses.purple
  const router = useRouter()

  return (
    <div className="flex">
      {/* FIXO + LARGURA DEFINIDA + Z-INDEX */}
      <div className="fixed top-0 left-0 h-screen w-16 md:w-52 z-40 p-4 bg-white dark:bg-reabilis-gray flex flex-col justify-between">
        <div className="flex flex-col items-center md:items-start">
          <Link className="w-full flex justify-center md:justify-start" href="/">
            <div className={`${currentTheme.bg} text-white p-3 rounded-lg inline-block`}>
              <HiOutlineHome size={20} />
            </div>
          </Link>

          <span className="border-b-[1px] border-gray-200 dark:border-gray-700 w-full p-2"></span>

          <SidebarItem href="/" icon={<HiOutlineHome size={20} />} label="Início" themeColor={themeColor} />
          <SidebarItem href="/patients" icon={<HiOutlineUserGroup size={20} />} label="Acolhidos" themeColor={themeColor} />
          <SidebarItem href="/nursing" icon={<HiOutlineBuildingOffice2 size={20} />} label="Enfermagem" themeColor={themeColor} />
          <SidebarItem href="/finance" icon={<HiOutlineCurrencyDollar size={20} />} label="Financeiro" themeColor={themeColor} />
          <SidebarItem href="/bomboniere" icon={<HiOutlineShoppingCart size={20} />} label="Bomboniere" themeColor={themeColor} />
          <SidebarItem href="/reports" icon={<HiOutlineDocumentReport size={20} />} label="Relatórios" themeColor={themeColor} />
          <SidebarItem href="/register" icon={<HiOutlineClipboardList size={20} />} label="Cadastros" themeColor={themeColor} />
          <SidebarItem href="/config" icon={<FiSettings size={20} />} label="Configurações" themeColor={themeColor} />

          <button
            onClick={() => handleLogout(router)}
            className="flex items-center text-black dark:text-white hover:underline transition transform hover:scale-105 duration-300 mt-4"
          >
            <div className="bg-gray-100 dark:bg-[#202020] p-3 rounded-lg inline-block">
              <FiLogOut size={20} />
            </div>
            <span className="pl-3 hidden md:flex">Sair</span>
          </button>
        </div>
      </div>

      {/* MARGEM ESQUERDA CASADA COM A LARGURA DO SIDEBAR */}
      <main className="ml-16 md:ml-52 w-full bg-white dark:bg-reabilis-gray min-h-screen">
        {children}
      </main>
    </div>
  )
}

const SidebarItem = ({
  href,
  icon,
  label,
  themeColor,
}: {
  href: string
  icon: React.ReactNode
  label: string
  themeColor: string
}) => {
  const theme = themeClasses[themeColor as ThemeKey] || themeClasses.purple

  return (
    <Link
      href={href}
      className={clsx(
        'group flex items-center w-full transition-transform transform hover:scale-105 duration-300',
        theme.text
      )}
    >
      {/* Centraliza ícone no mobile, label só no md+ */}
      <div className="bg-gray-100 dark:bg-[#202020] my-3 p-2.5 rounded-lg inline-flex mx-auto md:mx-0">
        <div className={clsx('text-black dark:text-white transition-colors duration-300', theme.hoverText)}>
          {icon}
        </div>
      </div>
      <span className={clsx('pl-3 hidden md:flex text-black dark:text-white transition-colors duration-300', theme.hoverText)}>
        {label}
      </span>
    </Link>
  )
}

export default Sidebar