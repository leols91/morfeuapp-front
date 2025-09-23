import api from './api';

// Busca todas as configurações do usuário logado
export const getUserConfigs = async () => {
  const response = await api.get('/users/me/configs');
  return response.data;
};

// Salva (cria ou atualiza) uma configuração do usuário logado
export const upsertUserConfig = async (
  data: { userConfigName: string; userConfigValue: string }
) => {
  const response = await api.post('/users/me/configs', data);
  return response.data;
};
