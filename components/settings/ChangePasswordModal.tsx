'use client'
import React, { useState, useMemo } from 'react'
import Input from '@/components/ui/input'
import Button from '@/components/Button'

type Props = {
  userName: string
  userLogin: string
  onCancel: () => void
  onConfirm: (oldPwd: string, newPwd: string, repPwd: string) => void
}

const ChangePasswordModal: React.FC<Props> = ({ userName, userLogin, onCancel, onConfirm }) => {
  const [oldPwd, setOldPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [repPwd, setRepPwd] = useState('')

  const canSubmit = useMemo(
    () => Boolean(oldPwd && newPwd && repPwd && newPwd === repPwd),
    [oldPwd, newPwd, repPwd]
  )

  return (
    <div className="w-[90vw] max-w-xl">
      <h3 className="text-xl font-bold mb-1">{userName || 'Usuário'}</h3>
      <p className="text-sm text-gray-500 mb-4">Usuário: {userLogin || '—'}</p>
      <hr className="my-3 border-gray-200 dark:border-[#333]" />

      <div className="space-y-4">
        <Input label="Senha atual *" type="password" value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} />
        <Input label="Nova senha *" type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
        <Input label="Repetir nova senha *" type="password" value={repPwd} onChange={(e) => setRepPwd(e.target.value)} />
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button type="neutral" label="Fechar" onClick={onCancel} />
        <Button label="Confirmar" onClick={() => canSubmit && onConfirm(oldPwd, newPwd, repPwd)} disabled={!canSubmit} />
      </div>
    </div>
  )
}

export default ChangePasswordModal