'use client'

import React, { useCallback, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import { useThemeColor } from '@/hooks/useThemeColor'

type AcceptPreset = 'image' | 'avatar'
type Theme = 'purple' | 'blue' | 'green' | 'orange' | 'red'

interface ImageUploadProps {
  label: string
  file?: File | null
  imagePreview?: string | null
  onChange: (file: File | null) => void
  maxSizeMB?: number
  accept?: string
  variant?: 'circle' | 'square'
  preset?: AcceptPreset
  disabled?: boolean
  className?: string
}

const themeBorder: Record<Theme, string> = {
  purple: 'border-reabilis-purple',
  blue: 'border-reabilis-blue',
  green: 'border-reabilis-green',
  orange: 'border-reabilis-orange',
  red: 'border-reabilis-red',
}

const themeButton: Record<Theme, string> = {
  purple: 'bg-reabilis-purple hover:bg-reabilis-purple/90',
  blue: 'bg-reabilis-blue hover:bg-reabilis-blue/90',
  green: 'bg-reabilis-green hover:bg-reabilis-green/90',
  orange: 'bg-reabilis-orange hover:bg-reabilis-orange/90',
  red: 'bg-reabilis-red hover:bg-reabilis-red/90',
}

const readableTheme = (t: string): Theme =>
  (['purple','blue','green','orange','red'].includes(t) ? (t as Theme) : 'purple')

const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  file,
  imagePreview,
  onChange,
  maxSizeMB = 5,
  accept,
  variant = 'circle',
  preset = 'image',
  disabled = false,
  className,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const { themeColor } = useThemeColor()
  const theme = readableTheme(themeColor)

  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const preview = imagePreview ?? localPreview

  const resolvedAccept = useMemo(() => {
    if (accept) return accept
    if (preset === 'avatar' || preset === 'image') return 'image/*'
    return 'image/*'
  }, [accept, preset])

  const resolvedVariant = useMemo(() => {
    if (preset === 'avatar') return 'circle'
    return variant
  }, [preset, variant])

  const roundedClass = resolvedVariant === 'circle' ? 'rounded-full' : 'rounded-lg'

  const loadPreview = (f: File | null) => {
    if (!f) {
      setLocalPreview(null)
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => setLocalPreview(reader.result as string)
    reader.readAsDataURL(f)
  }

  const validate = (f: File): string | null => {
    if (!f.type.startsWith('image/')) return 'Selecione um arquivo de imagem.'
    const maxBytes = maxSizeMB * 1024 * 1024
    if (f.size > maxBytes) return `Tamanho máximo ${maxSizeMB}MB.`
    return null
  }

  const applyFile = (f: File | null) => {
    setError(null)
    if (f) {
      const err = validate(f)
      if (err) {
        setError(err)
        return
      }
      onChange(f)
      if (imagePreview === undefined) loadPreview(f)
    } else {
      onChange(null)
      if (imagePreview === undefined) setLocalPreview(null)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    applyFile(f)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    if (disabled) return
    const f = e.dataTransfer.files?.[0]
    applyFile(f ?? null)
  }, [disabled])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) setDragOver(true)
  }
  const handleDragLeave = () => setDragOver(false)

  return (
    <div className={clsx('w-full', className)}>
      <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
        {label}
      </label>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={clsx(
          'w-full h-48 flex flex-col items-center justify-center gap-4 rounded-lg border-2 transition duration-300',
          'bg-white text-gray-900 dark:bg-[#2b2b2b] dark:text-white',
          dragOver ? clsx(themeBorder[theme], 'border-2') : 'border-gray-300 dark:border-[#3a3a3a]'
        )}
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className={clsx('h-24 w-24 object-cover border border-gray-400 cursor-zoom-in', roundedClass)}
            onClick={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full text-gray-400 dark:text-gray-500 text-sm text-center px-4">
            Arraste uma imagem aqui ou use o botão abaixo
          </div>
        )}

        {/* Botões: mostrar SOMENTE um por vez */}
        {!preview ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            className={clsx(
              'px-4 py-2 rounded-lg text-white text-sm font-medium transition focus:outline-none focus:ring-2 mb-6',
              themeButton[theme],
              disabled && 'opacity-60 cursor-not-allowed'
            )}
          >
            Selecionar imagem
          </button>
        ) : (
          <button
            type="button"
            onClick={() => applyFile(null)}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-200 hover:bg-gray-300 dark:bg-[#3a3a3a] dark:hover:bg-[#4a4a4a]"
          >
            Remover
          </button>
        )}

        {error && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>}

        <input
          ref={inputRef}
          id="upload-image"
          type="file"
          accept={resolvedAccept}
          className="hidden"
          onChange={handleInputChange}
          disabled={disabled}
        />
      </div>

      {/* Modal de preview */}
      {isModalOpen && preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative bg-white dark:bg-[#202020] rounded-xl shadow-xl max-w-[90vw] max-h-[90vh] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-xl"
              onClick={() => setIsModalOpen(false)}
              aria-label="Fechar"
              type="button"
            >
              ✕
            </button>
            <img
              src={preview}
              alt="Preview grande"
              className={clsx('max-w-[80vw] max-h-[75vh] object-contain mx-auto', roundedClass)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageUpload