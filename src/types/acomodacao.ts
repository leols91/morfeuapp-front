export type AcomodacaoStatus = "available" | "occupied" | "maintenance";
export type AcomodacaoType = "room" | "bed";

export type AcomodacaoDTO = {
  id: string;
  name: string;
  type: AcomodacaoType;
  status: AcomodacaoStatus;
  capacity?: number | null;
  basePrice?: number | null;
  description?: string | null;
  amenities?: string[] | null;
  externalCode?: string | null;
  // extras futuros: floor, number, roomGroupId, bedCount, etc.
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