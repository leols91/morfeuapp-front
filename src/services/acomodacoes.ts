import { api } from "@/lib/api";
import type { ListAcomodacoesParams, AcomodacaoDTO } from "@/types/acomodacao";

/* ============== TIPOS ============== */
export type AmenityDTO = { id: string; name: string };

export type RoomTypeDTO = {
  id: string;
  name: string;
  description?: string | null;
  occupancyMode: "private" | "shared" | string;
  baseOccupancy: number;
  maxOccupancy: number;
  amenities?: { amenity: AmenityDTO }[]; // vem do backend já expandido
};

export type StatusDTO   = { code: string; description: string };

export type CreateQuartoPayload = {
  roomTypeId: string;
  code: string;
  floor?: string | null;
  description?: string | null;

  // overrides (opcionais)
  baseOccupancy?: number | null;
  maxOccupancy?: number | null;

  // status (backend tem defaults)
  roomStatusCode?: string;
  housekeepingStatusCode?: string;
};

export type QuartoDTO = {
  id: string;
  pousadaId: string;
  roomTypeId: string;
  code: string;
  floor: string | null;
  description: string | null;

  // overrides (opcionais)
  baseOccupancy: number | null;
  maxOccupancy: number | null;

  roomStatusCode: string;
  housekeepingStatusCode: string;
  createdAt?: string;
  updatedAt?: string;

  // expandido no include
  roomType?: Pick<RoomTypeDTO, "id"|"name"|"occupancyMode"|"baseOccupancy"|"maxOccupancy">;
};

export type UpdateQuartoPayload = {
  roomTypeId: string;
  code: string;
  floor?: string | null;
  description?: string | null;
  roomStatusCode: string;
  housekeepingStatusCode: string;

  // overrides (opcionais)
  baseOccupancy?: number | null;
  maxOccupancy?: number | null;
};

/* ============== QUARTOS ============== */

// Lista quartos de uma pousada
export async function listQuartos(pousadaId: string): Promise<QuartoDTO[]> {
  const { data } = await api.get(`/pousadas/${pousadaId}/quartos`);
  return data?.data ?? data ?? [];
}

// Criar Quarto
export async function createQuarto(
  pousadaId: string,
  payload: CreateQuartoPayload
): Promise<{ id: string }> {
  if (!pousadaId) throw new Error("ID da pousada não informado.");

  const body = {
    roomTypeId: payload.roomTypeId,
    code: payload.code,
    floor: payload.floor ?? null,
    description: payload.description ?? null,
    baseOccupancy: payload.baseOccupancy ?? null,
    maxOccupancy: payload.maxOccupancy ?? null,
    roomStatusCode: payload.roomStatusCode ?? "available",
    housekeepingStatusCode: payload.housekeepingStatusCode ?? "clean",
  };

  const { data } = await api.post(`/pousadas/${pousadaId}/quartos`, body);
  if (data?.id) return { id: data.id };
  if (data?.data?.id) return { id: data.data.id };
  throw new Error("Resposta inesperada do servidor ao criar quarto.");
}

// Obter Quarto por id
export async function getQuarto(id: string): Promise<QuartoDTO> {
  const { data } = await api.get(`/quartos/${id}`);
  return data?.data ?? data;
}

// Atualizar Quarto
export async function updateQuarto(id: string, payload: UpdateQuartoPayload): Promise<{ id: string }> {
  const body = {
    roomTypeId: payload.roomTypeId,
    code: payload.code,
    floor: payload.floor ?? null,
    description: payload.description ?? null,
    baseOccupancy: payload.baseOccupancy ?? null,
    maxOccupancy: payload.maxOccupancy ?? null,
    roomStatusCode: payload.roomStatusCode,
    housekeepingStatusCode: payload.housekeepingStatusCode,
  };
  const { data } = await api.patch(`/quartos/${id}`, body);
  return data?.data ?? data;
}

/* ============== ROOM TYPES ============== */

// Tipos de quarto (escopado por pousada), com amenities
export async function listRoomTypes(pousadaId?: string): Promise<RoomTypeDTO[]> {
  try {
    if (pousadaId) {
      const { data } = await api.get(`/pousadas/${pousadaId}/room-types?include=amenities`);
      return data?.data ?? data ?? [];
    }
  } catch {}
  // fallback global
  const { data } = await api.get(`/room-types?include=amenities`);
  return data?.data ?? data ?? [];
}

export async function createRoomType(
  pousadaId: string,
  body: {
    name: string;
    description?: string | null;
    occupancyMode: "private" | "shared" | string;
    baseOccupancy: number;
    maxOccupancy: number;
  }
): Promise<{ id: string }> {
  const { data } = await api.post(`/pousadas/${pousadaId}/room-types`, body);
  return data?.data ?? data;
}

export async function updateRoomType(
  roomTypeId: string,
  body: Partial<{
    name: string;
    description?: string | null;
    occupancyMode: "private" | "shared" | string;
    baseOccupancy: number;
    maxOccupancy: number;
  }>
) {
  const { data } = await api.patch(`/room-types/${roomTypeId}`, body);
  return data?.data ?? data;
}

/* ============== AMENITIES ============== */

export async function listAmenities(pousadaId: string): Promise<AmenityDTO[]> {
  const { data } = await api.get(`/pousadas/${pousadaId}/amenities`);
  return data?.data ?? data ?? [];
}

export async function createAmenity(pousadaId: string, name: string) {
  const { data } = await api.post(`/pousadas/${pousadaId}/amenities`, { name });
  return data?.data ?? data;
}

export async function deleteAmenity(amenityId: string) {
  const { data } = await api.delete(`/amenities/${amenityId}`);
  return data?.data ?? data;
}

// vincular amenity ↔ roomType
export async function addAmenityToRoomType(roomTypeId: string, amenityId: string) {
  const { data } = await api.post(`/room-types/${roomTypeId}/amenities`, { amenityId });
  return data?.data ?? data;
}

/* ============== STATUSES ============== */

export async function listRoomStatuses(): Promise<StatusDTO[]> {
  try {
    const { data } = await api.get("/room-statuses");
    return data?.data ?? data ?? [];
  } catch {
    // fallback estático (mantém a tela funcionando)
    return [
      { code: "available",   description: "Disponível" },
      { code: "occupied",    description: "Ocupado" },
      { code: "maintenance", description: "Em manutenção" },
    ];
  }
}

export async function listHousekeepingStatuses(): Promise<StatusDTO[]> {
  try {
    const { data } = await api.get("/housekeeping-statuses");
    return data?.data ?? data ?? [];
  } catch {
    // fallback estático
    return [
      { code: "clean",     description: "Limpo" },
      { code: "dirty",     description: "Sujo" },
      { code: "inspected", description: "Inspecionado" },
      { code: "ooo",       description: "Fora de operação" },
    ];
  }
}

/* ============== LISTAGEM (ACOMODAÇÕES) ============== */

// Retorna a lista para a página /acomodacoes com suporte a filtros.
// A API pode responder como { data: [...] } ou diretamente [...], tratamos os dois casos.
export async function listAcomodacoes(
  params: ListAcomodacoesParams
): Promise<{ data: AcomodacaoDTO[] }> {
  // Monta os query params ignorando valores "all" e undefined
  const qp: Record<string, any> = {};
  if (params?.q) qp.q = params.q;
  if (params?.status && params.status !== "all") qp.status = params.status;
  if (params?.tipo && params.tipo !== "all") qp.tipo = params.tipo;
  if (params?.capMin != null) qp.capMin = params.capMin;
  if (params?.capMax != null) qp.capMax = params.capMax;
  if (params?.priceMin != null) qp.priceMin = params.priceMin;
  if (params?.priceMax != null) qp.priceMax = params.priceMax;

  try {
    const { data } = await api.get("/acomodacoes", { params: qp });
    if (Array.isArray(data)) return { data };
    if (data?.data && Array.isArray(data.data)) return { data: data.data };
    return { data: [] };
  } catch {
    // fallback seguro: vazio (mantém a tela funcionando)
    return { data: [] };
  }
}

// Obter um RoomType por id
export async function getRoomType(roomTypeId: string): Promise<RoomTypeDTO> {
  const { data } = await api.get(`/room-types/${roomTypeId}`);
  return data?.data ?? data;
}

// Remover RoomType (opcional, só se quiser botão de excluir)
export async function deleteRoomType(roomTypeId: string): Promise<void> {
  await api.delete(`/room-types/${roomTypeId}`);
}

export async function updateAmenity(amenityId: string, name: string) {
  const { data } = await api.patch(`/amenities/${amenityId}`, { name });
  return data?.data ?? data;
}