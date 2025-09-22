// utils/theme.ts
export const applyThemeColor = (colorClass: string) => {
  if (typeof window === 'undefined') return // Evita erro no SSR

  const html = document.querySelector('html')
  if (!html) return

  html.classList.remove(
    'reabilis-purple',
    'reabilis-blue',
    'reabilis-green',
    'reabilis-orange',
    'reabilis-red'
  )

  html.classList.add(colorClass)
}