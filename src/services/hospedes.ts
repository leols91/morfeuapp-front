// src/services/hospedes.ts
import { api } from "@/lib/api";
import { getActivePousadaId } from "@/lib/tenants";

// ===== Tipos =====
export type HospedeDTO = {
  id: string;
  fullName: string;
  documentId?: string | null;
  documentType?: string | null;
  email?: string | null;
  phone?: string | null;
  birthDate?: string | null;  // ISO
  address?: any | null;       // JSON no schema
  notes?: string | null;
  blacklisted: boolean;
  createdAt?: string;
};

export type CreateHospedePayload = Omit<HospedeDTO, "id" | "createdAt"> & {
  birthDate?: string | null; // ISO
};
export type UpdateHospedePayload = Partial<CreateHospedePayload>;

/**
 * GET /pousadas/:pousadaId/hospedes?q=...
 */
export async function listHospedes(params?: { q?: string }): Promise<HospedeDTO[]> {
  const pousadaId = getActivePousadaId();
  if (!pousadaId) throw new Error("Pousada ativa não definida.");

  const qs = new URLSearchParams();
  if (params?.q && params.q.trim()) {
    qs.set("q", params.q.trim());
    qs.set("search", params.q.trim());
  }

  const { data } = await api.get(`/pousadas/${pousadaId}/hospedes?${qs.toString()}`);
  const rows: HospedeDTO[] = data?.data ?? data ?? [];

  // --- Fallback de filtro local (busca flexível e acento-insensível) ---
  if (params?.q && params.q.trim()) {
    const normalize = (str: string) =>
      str
        .normalize("NFD") // separa acentos
        .replace(/[\u0300-\u036f]/g, "") // remove acentos
        .replace(/[^\w\s]/g, "") // remove pontuação
        .toLowerCase()
        .trim();

    const s = normalize(params.q);

    return rows.filter((h) => {
      const fullName = normalize(h.fullName ?? "");
      const email = normalize(h.email ?? "");
      const phone = normalize(h.phone ?? "");
      const doc = normalize(h.documentId ?? "");
      return (
        fullName.includes(s) ||
        email.includes(s) ||
        phone.includes(s) ||
        doc.includes(s)
      );
    });
  }

  return rows;
}

/**
 * GET /hospedes/:hospedeId
 */
export async function getHospedeById(id: string): Promise<HospedeDTO> {
  const { data } = await api.get(`/hospedes/${id}`);
  return data?.data ?? data;
}

/**
 * POST /pousadas/:pousadaId/hospedes
 */
export async function createHospede(payload: CreateHospedePayload): Promise<{ id: string }> {
  const pousadaId = getActivePousadaId();
  if (!pousadaId) throw new Error("Pousada ativa não definida.");
  const { data } = await api.post(`/pousadas/${pousadaId}/hospedes`, payload);
  const id = data?.data?.id ?? data?.id;
  return { id };
}

/**
 * PATCH /hospedes/:hospedeId
 */
export async function updateHospede(id: string, payload: UpdateHospedePayload): Promise<{ id: string }> {
  const { data } = await api.patch(`/hospedes/${id}`, payload);
  const rid = data?.data?.id ?? data?.id ?? id;
  return { id: rid };
}

/**
 * DELETE /hospedes/:hospedeId
 */
export async function deleteHospede(id: string): Promise<{ id: string }> {
  const { data } = await api.delete(`/hospedes/${id}`);
  const rid = data?.data?.id ?? data?.id ?? id;
  return { id: rid };
}