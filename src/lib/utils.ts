import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina classes do Tailwind de forma inteligente, evitando conflitos.
 * Essencial para criar componentes reutilizáveis e condicionais.
 * @param inputs - Classes a serem combinadas.
 * @returns Uma string com as classes finais.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}