'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from '@/components/Header'; // Supondo que o Header exista
import Modal from '@/components/Modal'; // Supondo que o Modal exista

// Importando os services corretos do MorfeuApp
import { getPousadaConfigs, upsertPousadaConfig } from '@/services/pousadaConfigService';
import { getUserConfigs, upsertUserConfig } from '@/services/userConfigService';
import { getMe, updateUserPassword } from '@/services/usersService';

// Supondo que estes componentes de UI existam
import QuickActions from '@/components/settings/QuickActions';
import ThemeColorSection from '@/components/settings/ThemeColorSection';
import ThemeModeSection from '@/components/settings/ThemeModeSection';
import ChangePasswordModal from '@/components/settings/ChangePasswordModal';
import { ThemeColor } from '@/types/theme'; // Supondo que o tipo exista

// ID de exemplo para desenvolvimento. Futuramente, virá de um contexto global.
const POUSADA_ID_EXEMPLO = '2258ce8b-d84c-4e5f-aa98-07fbbd045bdb'; 

export default function ConfigPage() {
  // Estado para UI
  const [selectedColor, setSelectedColor] = useState<ThemeColor>('purple');
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>('dark');
  const [openPwdModal, setOpenPwdModal] = useState(false);

  // Estado para dados do usuário
  const [userName, setUserName] = useState('');
  const [userLogin, setUserLogin] = useState('');

  const loadInitialConfigs = useCallback(async () => {
    try {
      const pousadaConfigs = await getPousadaConfigs(POUSADA_ID_EXEMPLO);
      const themeColorConfig = pousadaConfigs.find((c: any) => c.configName === 'theme_color');
      if (themeColorConfig) {
        setSelectedColor(themeColorConfig.configValue as ThemeColor);
      }

      const userConfigs = await getUserConfigs();
      const themeModeConfig = userConfigs.find((uc: any) => uc.userConfigName === 'theme_mode');
      if (themeModeConfig) {
        setSelectedTheme(themeModeConfig.userConfigValue as 'light' | 'dark');
      }

      const profile = await getMe();
      setUserName(profile.user.name);
      setUserLogin(profile.user.username);
    } catch {
      toast.error('Erro ao carregar configurações.');
    }
  }, []);

  useEffect(() => {
    loadInitialConfigs();
  }, [loadInitialConfigs]);

  const handleSaveColor = async () => {
    try {
      await upsertPousadaConfig(POUSADA_ID_EXEMPLO, {
        configName: 'theme_color',
        configValue: selectedColor,
      });
      // A lógica para aplicar a cor globalmente seria feita através de um Context API
      toast.success('Cor do tema salva com sucesso!');
    } catch {
      toast.error('Erro ao salvar a cor do tema.');
    }
  };

  const handleSaveTheme = async () => {
    try {
      await upsertUserConfig({
        userConfigName: 'theme_mode',
        userConfigValue: selectedTheme,
      });
      // A lógica para aplicar o tema (via next-themes ou Context) viria aqui
      toast.success('Tema salvo com sucesso!');
    } catch {
      toast.error('Erro ao salvar o tema.');
    }
  };

  const handlePasswordChange = async (oldPassword: string, newPassword: string) => {
    try {
      await updateUserPassword({ oldPassword, newPassword });
      toast.success('Senha alterada com sucesso!');
      setOpenPwdModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao alterar a senha.');
    }
  };

  return (
    <>
      <ToastContainer theme={selectedTheme} />
      <Header titlePage="Configurações" />

      <main className="p-4">
        <div className="w-full max-w-screen-md mx-auto">
          <div className="bg-card text-card-foreground p-6 rounded-lg border border-border">
            <QuickActions onOpenPassword={() => setOpenPwdModal(true)} />
            <ThemeColorSection
              selectedColor={selectedColor}
              onSelectColor={setSelectedColor}
              onSave={handleSaveColor}
            />
            <ThemeModeSection
              selectedTheme={selectedTheme}
              onSelectTheme={setSelectedTheme}
              onSave={handleSaveTheme}
            />
          </div>
        </div>
      </main>

      <Modal isOpen={openPwdModal} onClose={() => setOpenPwdModal(false)}>
        <ChangePasswordModal
          userName={userName}
          userLogin={userLogin}
          onCancel={() => setOpenPwdModal(false)}
          onConfirm={(oldPassword, newPassword) => handlePasswordChange(oldPassword, newPassword)}
        />
      </Modal>
    </>
  );
}