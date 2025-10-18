// services/acomodacoes.ts
import { api } from "@/lib/api";
import { getActivePousadaId } from "@/lib/tenants";
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
  amenities?: { amenity: AmenityDTO }[];
};

export type StatusDTO = { code: string; description: string };

export type CreateQuartoPayload = {
  roomTypeId: string;
  code: string;
  floor?: string | null;
  description?: string | null;

  // novo: persistir o "Nome (opcional)"
  name?: string | null;

  // overrides (opcionais)
  baseOccupancy?: number | null;
  maxOccupancy?: number | null;

  roomStatusCode?: string;
  housekeepingStatusCode?: string;
};

export type QuartoDTO = {
  id: string;
  pousadaId: string;
  roomTypeId: string;
  code: string;
  /** Nome amigável do quarto (novo no backend) */
  name?: string | null;
  floor: string | null;
  description: string | null;

  baseOccupancy: number | null;
  maxOccupancy: number | null;

  roomStatusCode: string;
  housekeepingStatusCode: string;
  createdAt?: string;
  updatedAt?: string;

  roomType?: Pick<
    RoomTypeDTO,
    "id" | "name" | "occupancyMode" | "baseOccupancy" | "maxOccupancy"
  > & {
    amenities?: { amenity: AmenityDTO }[];
  };

  // overrides específicos do quarto (se incluídos)
  amenities?: { amenity: AmenityDTO }[];
};

export type UpdateQuartoPayload = {
  roomTypeId: string;
  code: string;
  /** Permite atualizar o nome amigável */
  name?: string | null;
  floor?: string | null;
  description?: string | null;

  roomStatusCode: string;
  housekeepingStatusCode: string;

  // overrides (opcionais)
  baseOccupancy?: number | null;
  maxOccupancy?: number | null;
};

/* ============== QUARTOS ============== */

export async function listQuartos(pousadaId: string): Promise<QuartoDTO[]> {
  const { data } = await api.get(`/pousadas/${pousadaId}/quartos`);
  return data?.data ?? data ?? [];
}

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
    name: payload.name ?? null, // ← novo

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

export async function getQuarto(id: string, include?: string): Promise<QuartoDTO> {
  const { data } = await api.get(`/quartos/${id}`, {
    params: include ? { include } : undefined,
  });
  return data?.data ?? data;
}

export async function updateQuarto(
  id: string,
  payload: UpdateQuartoPayload
): Promise<{ id: string }> {
  const body = {
    roomTypeId: payload.roomTypeId,
    code: payload.code,
    floor: payload.floor ?? null,
    description: payload.description ?? null,
    name: payload.name ?? null, // ← novo

    baseOccupancy: payload.baseOccupancy ?? null,
    maxOccupancy: payload.maxOccupancy ?? null,

    roomStatusCode: payload.roomStatusCode,
    housekeepingStatusCode: payload.housekeepingStatusCode,
  };
  const { data } = await api.patch(`/quartos/${id}`, body);
  return data?.data ?? data;
}

/* ============== ROOM TYPES ============== */

export async function listRoomTypes(pousadaId?: string): Promise<RoomTypeDTO[]> {
  try {
    if (pousadaId) {
      const { data } = await api.get(`/pousadas/${pousadaId}/room-types?include=amenities`);
      return data?.data ?? data ?? [];
    }
  } catch {}
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

// vincular amenity ↔ quarto (override específico)
export async function addAmenityToRoom(quartoId: string, amenityId: string) {
  const { data } = await api.post(`/quartos/${quartoId}/amenities`, { amenityId });
  return data?.data ?? data;
}
export async function removeAmenityFromRoom(quartoId: string, amenityId: string) {
  const { data } = await api.delete(`/quartos/${quartoId}/amenities/${amenityId}`);
  return data?.data ?? data;
}

/* ============== STATUSES ============== */

export async function listRoomStatuses(): Promise<StatusDTO[]> {
  try {
    const { data } = await api.get("/room-statuses");
    return data?.data ?? data ?? [];
  } catch {
    return [
      { code: "available", description: "Disponível" },
      { code: "occupied", description: "Ocupado" },
      { code: "maintenance", description: "Em manutenção" },
    ];
  }
}

export async function listHousekeepingStatuses(): Promise<StatusDTO[]> {
  try {
    const { data } = await api.get("/housekeeping-statuses");
    return data?.data ?? data ?? [];
  } catch {
    return [
      { code: "clean", description: "Limpo" },
      { code: "dirty", description: "Sujo" },
      { code: "inspected", description: "Inspecionado" },
      { code: "ooo", description: "Fora de operação" },
    ];
  }
}

/* ============== LISTAGEM (ACOMODAÇÕES) ============== */

export async function listAcomodacoes(
  params: ListAcomodacoesParams
): Promise<{ data: AcomodacaoDTO[] }> {
  const pousadaId = getActivePousadaId();
  if (!pousadaId) return { data: [] };

  const include = "roomType,roomType.amenities,amenities";

  let list: QuartoDTO[] = [];
  try {
    const { data } = await api.get(`/pousadas/${pousadaId}/quartos`, { params: { include } });
    list = data?.data ?? data ?? [];
  } catch {
    const { data } = await api.get(`/pousadas/${pousadaId}/quartos`);
    list = data?.data ?? data ?? [];
  }

  // Se a listagem não trouxe as amenities/roomType, enriquecemos por item.
  const needsEnrichment = list.some(
    (q) =>
      !q.roomType || // sem roomType inteiro
      (!q.roomType?.amenities?.length && !q.amenities?.length) // nada de amenities
  );

  if (needsEnrichment && list.length) {
    const enriched = await Promise.all(
      list.map(async (q) => {
        try {
          const full = await getQuarto(q.id, include);
          return { ...q, ...full };
        } catch {
          return q; // se falhar, mantemos original
        }
      })
    );
    list = enriched;
  }

  const mapped: AcomodacaoDTO[] = list.map((q) => {
    // capacidade efetiva (override > padrão do tipo)
    const capacity =
      (q.baseOccupancy ?? undefined) ??
      (q.roomType?.baseOccupancy ?? undefined) ??
      null;

    // tipo (room/bed) a partir do occupancyMode do RoomType
    const type = (q.roomType?.occupancyMode === "shared" ? "bed" : "room") as AcomodacaoDTO["type"];

    // amenidades: herdadas do tipo + específicas do quarto
    const amType =
      (q.roomType?.amenities ?? []).map((x) => x?.amenity?.name).filter(Boolean) as string[];
    const amRoom =
      (q.amenities ?? []).map((x) => x?.amenity?.name).filter(Boolean) as string[];
    const amenities = Array.from(new Set([...amType, ...amRoom]));

    return {
      id: q.id,
      code: q.code,
      name: q.name ?? "",                 // nome amigável do backend
      roomTypeName: q.roomType?.name ?? null,
      type,
      capacity,
      status: (q.roomStatusCode as AcomodacaoDTO["status"]) ?? "available",
      amenities,                           // ← agora garantido
      description: q.description ?? null,
    };
  });

  // (Opcional) filtros client-side
  const filtered = mapped.filter((it) => {
    if (params?.status && params.status !== "all" && it.status !== params.status) return false;
    if (params?.tipo && params.tipo !== "all" && it.type !== params.tipo) return false;
    if (params?.q) {
      const q = params.q.toLowerCase();
      const hay = [
        it.code ?? "",
        it.name ?? "",
        it.roomTypeName ?? "",
        ...(it.amenities ?? []),
      ].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (params?.capMin != null && (it.capacity ?? 0) < params.capMin) return false;
    if (params?.capMax != null && (it.capacity ?? 0) > params.capMax) return false;
    return true;
  });

  return { data: filtered };
}

/* utilitários extras */
export async function getRoomType(roomTypeId: string): Promise<RoomTypeDTO> {
  const { data } = await api.get(`/room-types/${roomTypeId}`);
  return data?.data ?? data;
}
export async function deleteRoomType(roomTypeId: string): Promise<void> {
  await api.delete(`/room-types/${roomTypeId}`);
}
export async function updateAmenity(amenityId: string, name: string) {
  const { data } = await api.patch(`/amenities/${amenityId}`, { name });
  return data?.data ?? data;
}

// Obter uma amenidade por ID (com fallback)
export async function getAmenity(
  pousadaId: string,
  amenityId: string
): Promise<AmenityDTO | null> {
  // 1) tenta via endpoint direto (caso exista no backend)
  try {
    const { data } = await api.get(`/amenities/${amenityId}`);
    const amenity = data?.data ?? data;
    if (amenity && amenity.id) return amenity as AmenityDTO;
  } catch {
    // ignora e cai no fallback
  }

  // 2) fallback: lista todas da pousada e filtra
  try {
    const list = await listAmenities(pousadaId);
    return list.find((a) => a.id === amenityId) ?? null;
  } catch {
    return null;
  }
}