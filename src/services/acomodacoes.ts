// src/services/acomodacoes.ts
import { api } from "@/lib/api";

/* ===========================================
 *  TIPOS (apenas locais deste service)
 * =========================================== */
export type RoomTypeDTO = { id: string; name: string };
export type StatusDTO   = { code: string; description: string };

export type CreateQuartoPayload = {
  roomTypeId: string;
  code: string;
  floor?: string | null;
  description?: string | null;
  roomStatusCode: string;
  housekeepingStatusCode: string;
};

// DTO básico do Quarto (conforme backend)
export type QuartoDTO = {
  id: string;
  roomTypeId: string;
  code: string;
  floor: string | null;
  description: string | null;
  roomStatusCode: string;
  housekeepingStatusCode: string;
  createdAt?: string;
  updatedAt?: string;
};

export type UpdateQuartoPayload = CreateQuartoPayload;

/* ===========================================
 *  NOVOS ENDPOINTS (backend novo)
 * =========================================== */

// Tipos de quarto
export async function listRoomTypes(): Promise<RoomTypeDTO[]> {
  try {
    const { data } = await api.get("/room-types");
    // espera { data: Array<{ id, name }> } do backend
    return data?.data ?? [];
  } catch {
    // fallback mock para desenvolvimento
    return [
      { id: "rt_std", name: "Quarto Privativo" },
      { id: "rt_shd", name: "Quarto Compartilhado" },
    ];
  }
}

// Status de quarto (ocupação)
export async function listRoomStatuses(): Promise<StatusDTO[]> {
  try {
    const { data } = await api.get("/room-statuses");
    // espera { data: Array<{ code, description }> }
    return data?.data ?? [];
  } catch {
    return [
      { code: "available",   description: "Disponível" },
      { code: "occupied",    description: "Ocupado" },
      { code: "maintenance", description: "Em manutenção" },
    ];
  }
}

// Status de governança/housekeeping
export async function listHousekeepingStatuses(): Promise<StatusDTO[]> {
  try {
    const { data } = await api.get("/housekeeping-statuses");
    return data?.data ?? [];
  } catch {
    return [
      { code: "clean",     description: "Limpo" },
      { code: "dirty",     description: "Sujo" },
      { code: "inspected", description: "Inspecionado" },
      { code: "ooo",       description: "Fora de operação" },
    ];
  }
}

// Criar Quarto
export async function createQuarto(payload: CreateQuartoPayload): Promise<{ id: string }> {
  const { data } = await api.post("/quartos", payload);
  // espere { id, ... } ou { data: { id, ... } }
  return data?.data ?? data;
}

// Obter Quarto por id
export async function getQuarto(id: string): Promise<QuartoDTO> {
  try {
    const { data } = await api.get(`/quartos/${id}`);
    // { data: { ...quarto } } ou direto { ...quarto }
    return data?.data ?? data;
  } catch {
    // fallback mock: útil enquanto o backend não está plugado
    return {
      id,
      roomTypeId: "rt_std",
      code: "101",
      floor: "1",
      description: "Quarto com janela para o jardim.",
      roomStatusCode: "available",
      housekeepingStatusCode: "clean",
    };
  }
}

// Atualizar Quarto
export async function updateQuarto(id: string, payload: UpdateQuartoPayload): Promise<{ id: string }> {
  const { data } = await api.patch(`/quartos/${id}`, payload);
  // responde { data: { id, ... } } ou { id, ... }
  return data?.data ?? data;
}

/* ===========================================
 *  APIs ANTIGAS QUE VOCÊ JÁ USAVA
 *  (mantidas para compatibilidade)
 * =========================================== */

import type { ListAcomodacoesParams, AcomodacaoDTO } from "@/types/acomodacao";

/** Lista acomodações (mock + /api/acomodacoes local até o backend ligar) */
export async function listAcomodacoes(
  params: ListAcomodacoesParams
): Promise<{ data: AcomodacaoDTO[] }> {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.status && params.status !== "all") qs.set("status", params.status);
  if (params.tipo && params.tipo !== "all") qs.set("type", params.tipo);
  if (params.capMin != null) qs.set("capMin", String(params.capMin));
  if (params.capMax != null) qs.set("capMax", String(params.capMax));
  if (params.priceMin != null) qs.set("priceMin", String(params.priceMin));
  if (params.priceMax != null) qs.set("priceMax", String(params.priceMax));

  try {
    const res = await fetch(`/api/acomodacoes?${qs.toString()}`, { cache: "no-store" });
    if (!res.ok) throw new Error("bad status");
    const json = await res.json();
    return { data: json?.data ?? [] };
  } catch {
    // fallback até integrar de vez
    return {
      data: [
        {
          id: "room_101",
          name: "Quarto 101",
          type: "room",
          status: "available",
          capacity: 2,
          basePrice: 260,
          amenities: ["Ar-condicionado", "Wi-Fi", "Banheiro privativo"],
          externalCode: "INT-101",
          description: "Quarto standard no 1º andar",
        },
        {
          id: "room_203",
          name: "Quarto 203",
          type: "room",
          status: "occupied",
          capacity: 3,
          basePrice: 320,
          amenities: ["Varanda", "Wi-Fi"],
          description: "Vista parcial da cidade",
        },
        {
          id: "bed_a1",
          name: "Beliche A1",
          type: "bed",
          status: "maintenance",
          capacity: 1,
          basePrice: 80,
          amenities: ["Tomada individual", "Cortina"],
          description: "Cama em dormitório misto",
        },
      ],
    };
  }
}

/** Cria acomodação (API antiga; mantido se ainda for usado em alguma tela) */
export async function createAcomodacao(payload: {
  kind: "room" | "bed";
  label: string;
  status: "available" | "occupied" | "maintenance";
  capacity: number;
  price: number | null;
  description?: string | null;
  amenities?: string[];
  notes?: string | null;
}) {
  const { data } = await api.post("/acomodacoes", payload);
  return data;
}