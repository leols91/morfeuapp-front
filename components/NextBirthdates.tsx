// components/NextBirthdates.tsx
'use client'
import React, { useEffect, useState } from 'react'
import { FaBirthdayCake } from 'react-icons/fa'
import { getBirthdaysCurrentMonth } from '@/services/patientsService'
import getDashboardSurfaceClasses from '@/utils/getDashboardSurfaceClasses'

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
  const t = new Date()
  return d.getDate() === t.getDate() && d.getMonth() === t.getMonth()
}

const genderDotClass = (g?: string) =>
  g?.toLowerCase().startsWith('fem')
    ? 'bg-reabilis-purple'
    : g?.toLowerCase().startsWith('mas')
    ? 'bg-reabilis-blue'
    : 'bg-gray-400 dark:bg-gray-500'

const NextBirthdates: React.FC = () => {
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

  const surface = getDashboardSurfaceClasses()

  return (
    <div className={`w-full relative h-[38vh] sm:h-[50vh] lg:h-[60vh] m-auto p-3 sm:p-4 overflow-hidden ${surface}`}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
          Aniversariantes do mês
        </h2>

        {/* Esconde legenda em telas bem pequenas */}
        <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
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
        <ul aria-busy="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="animate-pulse bg-gray-50 dark:bg-[#2b2b2b] rounded-lg my-3 p-2 h-14" />
          ))}
        </ul>
      )}

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {!loading && !error && (
        <ul className="overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
          {items.map((item) => {
            const today = isToday(item.birth_date)
            return (
              <li
                key={item.id}
                className="
                  bg-gray-50 dark:bg-[#2b2b2b] hover:bg-gray-100 dark:hover:bg-[#353535]
                  rounded-lg my-2 p-3 sm:p-2
                  flex items-center justify-between gap-3
                  cursor-pointer transition-colors
                "
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    <div className="rounded-lg p-3 bg-purple-100 dark:bg-purple-900/30">
                      <FaBirthdayCake className="text-purple-800 dark:text-purple-300" />
                    </div>
                    <span
                      className={`absolute -right-1 -bottom-1 h-3 w-3 rounded-full border ${genderDotClass(
                        item.unitgender
                      )} border-white dark:border-reabilis-gray`}
                      aria-hidden
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-gray-800 dark:text-gray-100 font-bold leading-tight truncate">
                      {item.patientfullname}
                    </p>
                    <p className="text-gray-400 dark:text-gray-400 text-xs sm:text-sm truncate">
                      {item.unitname}
                    </p>
                  </div>
                </div>

                {/* No mobile fica em linha; no desktop poderia voltar a absolute se quiser */}
                <div className="flex items-center gap-2 shrink-0">
                  {today && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      Hoje 🎉
                    </span>
                  )}
                  <p className="text-sm text-gray-700 dark:text-gray-200">
                    {formatDayMonth(item.birth_date)}
                  </p>
                </div>
              </li>
            )
          })}

          {items.length === 0 && (
            <li className="text-sm text-gray-500 dark:text-gray-400">
              Nenhum aniversariante encontrado.
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
export default NextBirthdates