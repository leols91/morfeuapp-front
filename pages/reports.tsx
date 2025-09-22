'use client'

import React, { useState } from 'react'
import Header from '@/components/Header'
import Button from '@/components/Button'
import {
  Input,
  Select,
  Textarea,
  FormGroup,
  Option,
  Checkbox,
  Switch,
  ImageUpload,
} from '@/components/ui'

const Register = () => {
  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [born, setBorn] = useState('')
  const [description, setDescription] = useState('')
  const [selectValue, setSelectValue] = useState<Option | null>(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [newsletter, setNewsletter] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const user = {
      name,
      surname,
      address,
      phone,
      born,
      unidade: selectValue?.value || '',
      description,
      acceptedTerms,
      newsletter,
      fileName: file?.name || '',
    }
    console.log(user)
  }

  const options: Option[] = [
    { value: '', label: '' },
    { value: 'masculina', label: 'Masculina' },
    { value: 'feminina', label: 'Feminina' },
    { value: 'maua', label: 'Mauá' },
  ]

  return (
    <>
      <Header titlePage="Formulário" />

      <div className="p-2 mt-4">
        <div className="card max-w-screen-lg">
          <form className="max-w-screen-lg" onSubmit={handleSubmit}>
            {/* 1 col no mobile; 2 cols no md+; no lg mantém a coluna da direita com ~220px */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_220px] gap-6">
              
              {/* FOTO: fica ACIMA no mobile, à direita no desktop */}
              <div className="order-1 md:order-2">
                <ImageUpload
                  label="Foto de perfil"
                  onChange={(newFile) => setFile(newFile)}
                />
              </div>

              {/* FORM: fica ABAIXO no mobile, à esquerda no desktop */}
              <div className="order-2 md:order-1">
                <FormGroup columns={2}>
                  <Input label="Nome" value={name} type="text" onChange={(e) => setName(e.target.value)} />
                  <Input label="Sobrenome" value={surname} type="text" onChange={(e) => setSurname(e.target.value)} />
                  <Input label="Endereço" value={address} type="text" onChange={(e) => setAddress(e.target.value)} />
                  <Input label="Senha" value={phone} type="password" onChange={(e) => setPhone(e.target.value)} />
                  <Input label="Nascimento" value={born} type="date" onChange={(e) => setBorn(e.target.value)} />
                  <Select label="Unidade" value={selectValue} onChange={setSelectValue} options={options} />
                </FormGroup>

                <FormGroup columns={1} className="mt-6">
                  <Textarea label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />
                </FormGroup>

                <FormGroup columns={2} className="mt-6">
                  <Checkbox label="Aceito os termos de uso" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} />
                  <Switch
                    label="Receber novidades por e-mail"
                    checked={newsletter}
                    onChange={(checked) => setNewsletter(checked)}
                  />
                </FormGroup>
              </div>
            </div>

            <div className="mt-6">
              <Button label="Salvar" />
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default Register