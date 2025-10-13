import { api } from "@/lib/api";

/* =========================
 * DTOs
 * ========================= */
export type PousadaConfigDTO = {
  id: string;
  configName: string;
  configValue: string;
  createdAt?: string;
  updatedAt?: string;
};

export type UserConfigDTO = {
  id: string;
  userConfigName: string;
  userConfigValue: string;
  createdAt?: string;
  updatedAt?: string;
};

/* =========================
 * Pousada Configs
 * ========================= */
export async function listPousadaConfigs(): Promise<PousadaConfigDTO[]> {
  try {
    const { data } = await api.get("/pousada-configs");
    return data?.data ?? data ?? [];
  } catch {
    // mock
    const now = new Date().toISOString();
    return [
      { id: "pc1", configName: "theme_color", configValue: "indigo", createdAt: now },
      { id: "pc2", configName: "monthly_proration_mode", configValue: "actual_days", createdAt: now },
    ];
  }
}

export async function createPousadaConfig(payload: {
  configName: string;
  configValue: string;
}): Promise<{ id: string }> {
  try {
    const { data } = await api.post("/pousada-configs", payload);
    return data?.data ?? data ?? { id: "pc_new_mock" };
  } catch {
    return { id: `pc_${Math.random().toString(36).slice(2, 8)}` };
  }
}

export async function updatePousadaConfig(
  id: string,
  payload: { configName: string; configValue: string }
): Promise<{ id: string }> {
  try {
    const { data } = await api.put(`/pousada-configs/${id}`, payload);
    return data?.data ?? data ?? { id };
  } catch {
    return { id };
  }
}

export async function deletePousadaConfig(id: string): Promise<{ id: string }> {
  try {
    const { data } = await api.delete(`/pousada-configs/${id}`);
    return data?.data ?? data ?? { id };
  } catch {
    return { id };
  }
}

/* =========================
 * User Configs
 * ========================= */
export async function listUserConfigs(): Promise<UserConfigDTO[]> {
  try {
    const { data } = await api.get("/user-configs");
    return data?.data ?? data ?? [];
  } catch {
    // mock
    const now = new Date().toISOString();
    return [
      { id: "uc1", userConfigName: "theme_mode", userConfigValue: "dark", createdAt: now },
      { id: "uc2", userConfigName: "rows_per_page", userConfigValue: "20", createdAt: now },
    ];
  }
}

export async function createUserConfig(payload: {
  userConfigName: string;
  userConfigValue: string;
}): Promise<{ id: string }> {
  try {
    const { data } = await api.post("/user-configs", payload);
    return data?.data ?? data ?? { id: "uc_new_mock" };
  } catch {
    return { id: `uc_${Math.random().toString(36).slice(2, 8)}` };
  }
}

export async function updateUserConfig(
  id: string,
  payload: { userConfigName: string; userConfigValue: string }
): Promise<{ id: string }> {
  try {
    const { data } = await api.put(`/user-configs/${id}`, payload);
    return data?.data ?? data ?? { id };
  } catch {
    return { id };
  }
}

export async function deleteUserConfig(id: string): Promise<{ id: string }> {
  try {
    const { data } = await api.delete(`/user-configs/${id}`);
    return data?.data ?? data ?? { id };
  } catch {
    return { id };
  }
}