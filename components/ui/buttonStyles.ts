// components/ui/buttonStyles.ts
import { tv } from 'tailwind-variants'

export const button = tv({
  base:
    // mesma altura/spacing para todos + transição e estados de disabled
    'w-full md:w-auto mt-4 px-14 py-3 rounded-lg text-white transition ' +
    'duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed',

  variants: {
    intent: {
      default: '',
      // novo: cinza neutro (não depende do tema)
      neutral:
        'bg-gray-200 hover:bg-gray-300 text-black ' +
        'dark:bg-[#3a3a3a] dark:hover:bg-[#4a4a4a] dark:text-white',
      danger: 'bg-reabilis-red hover:bg-reabilis-red-hover',
      alert: 'bg-reabilis-orange hover:bg-reabilis-orange-hover text-black',
      success: 'bg-reabilis-green hover:bg-reabilis-green-hover',
    },
    themeColor: {
      purple: 'bg-reabilis-purple hover:bg-reabilis-purple-hover',
      blue: 'bg-reabilis-blue hover:bg-reabilis-blue-hover',
      green: 'bg-reabilis-green hover:bg-reabilis-green-hover',
      orange: 'bg-reabilis-orange hover:bg-reabilis-orange-hover',
      red: 'bg-reabilis-red hover:bg-reabilis-red-hover',
    },
  },

  compoundVariants: [
    { intent: 'default', themeColor: 'purple', class: 'bg-reabilis-purple hover:bg-reabilis-purple-hover' },
    { intent: 'default', themeColor: 'blue',   class: 'bg-reabilis-blue hover:bg-reabilis-blue-hover' },
    { intent: 'default', themeColor: 'green',  class: 'bg-reabilis-green hover:bg-reabilis-green-hover' },
    { intent: 'default', themeColor: 'orange', class: 'bg-reabilis-orange hover:bg-reabilis-orange-hover' },
    { intent: 'default', themeColor: 'red',    class: 'bg-reabilis-red hover:bg-reabilis-red-hover' },
  ],

  defaultVariants: { intent: 'default' },
})