'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

import Header from '@/components/Header'
import Button from '@/components/Button'
import Modal from '@/components/Modal'

import { getConfigs, createConfig, updateConfig } from '@/services/configService'
import { getUserConfigs, updateOrCreateUserConfig } from '@/services/userConfigService'

import { useThemeColor } from '@/hooks/useThemeColor'
import { useUserTheme } from '@/contexts/UserThemeContext'
import { ThemeColor } from '@/types/theme'
import { useUserProfile } from '@/hooks/useUserProfile'

import QuickActions from '@/components/settings/QuickActions'
import ThemeColorSection from '@/components/settings/ThemeColorSection'
import ThemeModeSection from '@/components/settings/ThemeModeSection'
import ChangePasswordModal from '@/components/settings/ChangePasswordModal'
import StockTypeModal from '@/components/settings/StockTypeModal'

const API = process.env.NEXT_PUBLIC_API_URL as string

const ConfigPage = () => {
  // ---- estado: tema e cor
  const [selectedColor, setSelectedColor] = useState<ThemeColor>('purple')
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | null>(null)
  const [configId, setConfigId] = useState<string | null>(null)

  // ---- estado: stock
  const [stockConfigId, setStockConfigId] = useState<string | null>(null)
  const [stockType, setStockType] = useState<'unificado' | 'separado'>('unificado')

  // ---- modais
  const [openPwd, setOpenPwd] = useState(false)
  const [openStock, setOpenStock] = useState(false)

  // ---- profile (nome/login) com cache
  const { userName, userLogin, refreshProfile } = useUserProfile()

  const { setThemeColor } = useThemeColor()
  const { setUserTheme } = useUserTheme()

  // ------- carregamento inicial -------
  useEffect(() => {
    const load = async () => {
      try {
        // 1) configurações gerais
        const allConfigs = await getConfigs()

        // cor do tema
        const themeColorConfig = allConfigs.find((c: any) => c.config_name === 'theme_color')
        if (themeColorConfig && isValidThemeColor(themeColorConfig.config_value)) {
          setSelectedColor(themeColorConfig.config_value)
          setConfigId(themeColorConfig.id)
        }

        // type_stock para modal
        const stock = allConfigs.find((c: any) => c.config_name === 'type_stock')
        if (stock) {
          setStockConfigId(stock.id)
          const v = String(stock.config_value || 'unificado').toLowerCase()
          setStockType(v === 'separado' ? 'separado' : 'unificado')
        }

        // 2) configs do usuário (tema claro/escuro)
        const userId = localStorage.getItem('userId')
        if (userId) {
          const userConfigs = await getUserConfigs(userId)
          const themeModeConfig = userConfigs.find((uc: any) => uc.userconfig_name === 'theme_mode')
          const themeVal = themeModeConfig?.userconfig_value
          if (themeVal === 'light' || themeVal === 'dark') {
            setSelectedTheme(themeVal)
          } else {
            setSelectedTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light')
          }

          // 3) dados do usuário p/ modais e header (e atualiza cache)
          await refreshProfile(userId)
        } else {
          // fallback: DOM
          setSelectedTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light')
        }
      } catch {
        toast.error('Erro ao carregar configurações')
        setSelectedTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light')
      }
    }
    load()
  }, [refreshProfile])

  // ------- ações: salvar cor -------
  const handleSaveColor = async () => {
    try {
      const payload = {
        config_name: 'theme_color',
        config_value: selectedColor,
        edited_at: new Date().toISOString(),
        edited_by: null,
      }
      if (configId) {
        await updateConfig(configId, payload)
      } else {
        const created = await createConfig(payload)
        setConfigId(created.id)
      }
      setThemeColor(selectedColor)
      toast.success('Cor alterada com sucesso!')
    } catch {
      toast.error('Erro ao salvar a cor')
    }
  }

  // ------- ações: salvar tema (light/dark) -------
  const handleSaveThemeMode = async () => {
    const userId = localStorage.getItem('userId')
    if (!userId || !selectedTheme) return

    try {
      await updateOrCreateUserConfig(userId, {
        id_user: userId,
        userconfig_name: 'theme_mode',
        userconfig_value: selectedTheme,
        edited_at: new Date().toISOString(),
        edited_by: null,
      })
      setUserTheme(selectedTheme)
      toast.success('Tema alterado com sucesso!')
    } catch {
      toast.error('Erro ao salvar o tema')
    }
  }

  // ------- submit modal: senha -------
  const handleSubmitPassword = async (oldPwd: string, newPwd: string, repPwd: string) => {
    try {
      const userId = localStorage.getItem('userId')
      if (!userId) return
      if (newPwd !== repPwd) {
        toast.error('As senhas não conferem')
        return
      }
      await axios.put(`${API}/updatepassuser/${userId}`, {
        old_password: oldPwd,
        new_password: newPwd,
        confirm_new_password: repPwd,
      })
      toast.success('Senha alterada com sucesso!')
      setOpenPwd(false)
    } catch {
      toast.error('Erro ao alterar a senha')
    }
  }

  // ------- submit modal: estoque -------
  const handleSubmitStock = async (value: 'unificado' | 'separado') => {
    try {
      if (!stockConfigId) {
        toast.error('Configuração não encontrada')
        return
      }
      await axios.put(`${API}/configsis/typestock/${stockConfigId}`, {
        id: stockConfigId,
        config_name: 'type_stock',
        config_value: value,
      })
      localStorage.setItem('configstock', value)
      setStockType(value)
      toast.success('Tipo de estoque atualizado!')
      setOpenStock(false)
    } catch {
      toast.error('Erro ao atualizar o tipo de estoque')
    }
  }

  return (
    <>
      <Header titlePage="Configurações" />

      <div className="page-container">
        <div className="w-full max-w-screen-md">
          <div className="card">
            <QuickActions onOpenPassword={() => setOpenPwd(true)} onOpenStock={() => setOpenStock(true)} />

            <ThemeColorSection
              selectedColor={selectedColor}
              onSelectColor={setSelectedColor}
              onSave={handleSaveColor}
            />

            <ThemeModeSection
              selectedTheme={selectedTheme}
              onSelectTheme={setSelectedTheme}
              onSave={handleSaveThemeMode}
            />
          </div>
        </div>
      </div>

      {/* Modais */}
      <Modal isOpen={openPwd} onClose={() => setOpenPwd(false)}>
        <ChangePasswordModal
          userName={userName}
          userLogin={userLogin}
          onCancel={() => setOpenPwd(false)}
          onConfirm={handleSubmitPassword}
        />
      </Modal>

      <Modal isOpen={openStock} onClose={() => setOpenStock(false)}>
        <StockTypeModal
          value={stockType}
          onCancel={() => setOpenStock(false)}
          onConfirm={handleSubmitStock}
        />
      </Modal>
    </>
  )
}

// util
function isValidThemeColor(value: string): value is ThemeColor {
  return ['purple', 'blue', 'orange', 'green', 'red'].includes(value)
}

export default ConfigPage