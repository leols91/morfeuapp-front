import { api } from "@/lib/api";

/* =========================
 * Tipos
 * ========================= */
export type HospedeDTO = {
  id: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  documentType?: string | null;
  documentId?: string | null;
  birthDate?: string | null;      // ISO (yyyy-mm-dd) ou null
  address?: Record<string, any> | null; // ✅ adicionado
  notes?: string | null;
  blacklisted: boolean;
};

export type ListHospedesParams = {
  q?: string;
  status?: "all" | "ok" | "blacklisted";
};

/* =========================
 * Listar
 * ========================= */
export async function listHospedes(
  params: ListHospedesParams = {}
): Promise<{ data: HospedeDTO[] }> {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.status && params.status !== "all") qs.set("status", params.status);

  try {
    const { data } = await api.get(`/hospedes?${qs.toString()}`);
    return { data: data?.data ?? data ?? [] };
  } catch {
    // fallback mock p/ desenvolvimento
    return {
      data: [
        {
          id: "1",
          fullName: "Ana Souza",
          email: "ana@ex.com",
          phone: "11 98888-0001",
          documentType: "cpf",
          documentId: "123.456.789-00",
          birthDate: "1990-05-12",
          address: {
            street: "Av. Paulista",
            number: "1000",
            city: "São Paulo",
            state: "SP",
            country: "Brasil",
            zip: "01310-100",
          },
          notes: null,
          blacklisted: false,
        },
        {
          id: "2",
          fullName: "Bruno Lima",
          email: "bruno@ex.com",
          phone: "21 97777-2222",
          documentType: null,
          documentId: null,
          birthDate: null,
          address: null,
          notes: "Cliente com restrição",
          blacklisted: true,
        },
      ],
    };
  }
}

/* =========================
 * Obter 1
 * ========================= */
export async function getHospede(id: string): Promise<HospedeDTO> {
  try {
    const { data } = await api.get(`/hospedes/${id}`);
    return data?.data ?? data;
  } catch {
    // fallback simples
    return {
      id,
      fullName: "Hóspede Exemplo",
      email: "exemplo@ex.com",
      phone: "11 90000-0000",
      documentType: "cpf",
      documentId: "111.222.333-44",
      birthDate: "1988-01-20",
      address: {
        street: "Rua Exemplo",
        number: "123",
        city: "São Paulo",
        state: "SP",
        country: "Brasil",
        zip: "00000-000",
      },
      notes: null,
      blacklisted: false,
    };
  }
}

/* =========================
 * Criar / Atualizar
 * ========================= */
export type UpsertHospedePayload = {
  fullName: string;
  email?: string | null;
  phone?: string | null;
  documentType?: string | null;
  documentId?: string | null;
  birthDate?: string | null;              // ISO string
  address?: Record<string, any> | null;   // ✅ adicionado
  notes?: string | null;
  blacklisted?: boolean;
};

export async function createHospede(payload: UpsertHospedePayload): Promise<{ id: string }> {
  const { data } = await api.post("/hospedes", payload);
  return data?.data ?? data;
}

export async function updateHospede(id: string, payload: UpsertHospedePayload): Promise<{ id: string }> {
  const { data } = await api.put(`/hospedes/${id}`, payload);
  return data?.data ?? data;
}