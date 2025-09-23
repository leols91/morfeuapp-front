import api from './api';

// Busca todas as configurações de uma pousada
export const getPousadaConfigs = async (pousadaId: string) => {
  const response = await api.get(`/pousadas/${pousadaId}/configs`);
  return response.data;
};

// Salva (cria ou atualiza) uma configuração específica da pousada
export const upsertPousadaConfig = async (
  pousadaId: string,
  data: { configName: string; configValue: string }
) => {
  const response = await api.post(`/pousadas/${pousadaId}/configs`, data);
  return response.data;
};
