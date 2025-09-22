'use client'
import React from 'react'
import Modal from '@/components/Modal'
import Button from '@/components/Button'
import formatDate from '@/utils/formatDate' // use seu helper; senão formate inline

type Message = {
  id: string
  type?: string
  title?: string
  message: string
  created_at: string
  view_status?: string
}

interface Props {
  open: boolean
  data: Message | null
  onConfirm: (m: Message) => void
  onClose: () => void
}

const InfoMessageModalDashboard: React.FC<Props> = ({ open, data, onConfirm, onClose }) => {
  if (!data) return null
  return (
    <Modal isOpen={open} onClose={onClose}>
      <div className="min-w-[320px] max-w-[560px]">
        <h2 className="text-lg font-semibold mb-2">
          {data.type ? `${data.type} - ${data.title}` : (data.title || 'Informação')}
        </h2>
        <hr className="my-2" />
        <p className="text-sm text-gray-500 mb-3">{formatDate ? formatDate(data.created_at) : new Date(data.created_at).toLocaleDateString()}</p>
        <div className="whitespace-pre-wrap mb-6">{data.message}</div>
        <div className="flex justify-end gap-2">
          <Button label="Entendi" onClick={() => onConfirm(data)} />
        </div>
      </div>
    </Modal>
  )
}

export default InfoMessageModalDashboard