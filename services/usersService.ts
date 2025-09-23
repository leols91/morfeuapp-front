import api from './api';

interface UpdatePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

// Busca os dados do usuário logado (perfil)
export const getMe = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

// Atualiza a senha do usuário logado
export const updateUserPassword = async (payload: UpdatePasswordPayload) => {
  const response = await api.patch('/users/me/password', payload);
  return response.data;
};

