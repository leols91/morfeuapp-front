export type AcomodacaoStatus = "available" | "occupied" | "maintenance";
export type AcomodacaoType = "room" | "bed";

export type AcomodacaoDTO = {
  id: string;
  code: string;                 // código/número
  name: string;                 // nome amigável (pode vir vazio)
  roomTypeName?: string | null; // ← NOVO: rótulo do tipo (RoomType.name)
  type: AcomodacaoType;
  status: AcomodacaoStatus;
  capacity?: number | null;
  basePrice?: number | null;
  description?: string | null;
  amenities?: string[] | null;
  externalCode?: string | null;
};

export type ListAcomodacoesParams = {
  q?: string;
  status?: "all" | AcomodacaoStatus;
  tipo?: "all" | AcomodacaoType;
  capMin?: number;
  capMax?: number;
  priceMin?: number;
  priceMax?: number;
};

export type CreateQuartoPayload = {
  roomTypeId: string;
  code: string;
  floor?: string | null;
  description?: string | null;

  // novo: persistir o "Nome (opcional)"
  displayName?: string | null;

  // overrides (opcionais)
  baseOccupancy?: number | null;
  maxOccupancy?: number | null;

  roomStatusCode?: string;
  housekeepingStatusCode?: string;
};

export type UpdateQuartoPayload = {
  roomTypeId: string;
  code: string;
  floor?: string | null;
  description?: string | null;

  // também permitir editar o nome amigável
  displayName?: string | null;

  roomStatusCode: string;
  housekeepingStatusCode: string;

  baseOccupancy?: number | null;
  maxOccupancy?: number | null;
};