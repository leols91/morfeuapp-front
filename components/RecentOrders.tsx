'use client'

import React, { useEffect, useState } from 'react'
import { FaBirthdayCake } from 'react-icons/fa'
import { getBirthdaysCurrentMonth } from '@/services/patientsService'

type BirthdayItem = {
  id: string
  patientfullname: string
  birth_date: string
  unitname?: string
  unitgender?: 'Masculino' | 'Feminino' | string
}

const formatDayMonth = (date?: string | number | Date | null) => {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}`
}

const isToday = (dateStr?: string) => {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const today = new Date()
  return d.getDate() === today.getDate() && d.getMonth() === today.getMonth()
}

const genderDotClass = (g?: string) =>
  g?.toLowerCase().startsWith('fem')
    ? 'bg-reabilis-purple'
    : g?.toLowerCase().startsWith('mas')
    ? 'bg-reabilis-blue'
    : 'bg-gray-400'

const RecentOrders: React.FC = () => {
  const [items, setItems] = useState<BirthdayItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await getBirthdaysCurrentMonth()
        setItems(Array.isArray(data) ? data.slice(0, 10) : [])
        setError(null)
      } catch {
        setError('Não foi possível carregar os aniversariantes.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="w-full col-span-1 relative lg:h-[70vh] h-[50vh] m-auto p-4 border rounded-lg bg-white overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-lg font-semibold">Aniversariantes do mês</h1>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-reabilis-blue" />
            Masculino
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-reabilis-purple" />
            Feminino
          </span>
        </div>
      </div>

      {loading && (
        <ul>
          {Array.from({ length: 5 }).map((_, i) => (
            <li
              key={i}
              className="animate-pulse bg-gray-50 rounded-lg my-3 p-2 h-14"
            />
          ))}
        </ul>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <ul>
          {items.map((item) => {
            const today = isToday(item.birth_date)
            return (
              <li
                key={item.id}
                className="bg-gray-50 hover:bg-gray-100 rounded-lg my-3 p-2 flex items-center cursor-pointer relative"
              >
                <div className="relative">
                  <div className="bg-purple-100 rounded-lg p-3">
                    <FaBirthdayCake className="text-purple-800" />
                  </div>
                  {/* indicador de gênero */}
                  <span
                    className={`absolute -right-1 -bottom-1 h-3 w-3 rounded-full border border-white ${genderDotClass(
                      item.unitgender
                    )}`}
                    aria-hidden
                  />
                </div>

                <div className="pl-4 pr-20">
                  <p className="text-gray-800 font-bold leading-tight">
                    {item.patientfullname}
                  </p>
                  <p className="text-gray-400 text-sm">{item.unitname}</p>
                </div>

                <div className="absolute right-6 flex items-center gap-2">
                  {today && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Hoje 🎉
                    </span>
                  )}
                  <p className="text-sm text-gray-700">{formatDayMonth(item.birth_date)}</p>
                </div>
              </li>
            )
          })}

          {items.length === 0 && (
            <li className="text-sm text-gray-500">Nenhum aniversariante encontrado.</li>
          )}
        </ul>
      )}
    </div>
  )
}

export default RecentOrders