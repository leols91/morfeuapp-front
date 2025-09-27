// src/types/reserva.ts
export type ReservaStatus = "pending" | "confirmed" | "checked_in" | "checked_out" | "canceled";

export type ReservaDTO = {
  id: string;
  hospedeNome: string;
  inicio: string;     // ISO
  fim: string;        // ISO
  acomodacao: string; // "Quarto 101" ou "Beliche A - Cama 2"
  status: ReservaStatus;
  canal?: string;     // "Direta", "Booking", etc.
  saldo?: number;     // saldo do folio (R$)
};

export type FolioEntry = {
  id: string;
  type: "room_charge" | "product" | "adjustment";
  description: string;
  amount: number;     // positivo = débito
  createdAt: string;  // ISO
};

export type PaymentDTO = {
  id: string;
  method: string; // "Pix", "Cartão", "Dinheiro"
  amount: number; // positivo = crédito
  createdAt: string; // ISO
};

export type ReservaDetailDTO = ReservaDTO & {
  codigo?: string;
  criadoEm: string;
  atualizadoEm?: string;
  contatoHospede?: { telefone?: string; email?: string; doc?: string };
  folio: {
    saldo: number;
    entries: FolioEntry[];
    payments: PaymentDTO[];
  };
};

export type CreateReservaInput = {
  hospedeId: string;
  checkIn: string;   // YYYY-MM-DD
  checkOut: string;  // YYYY-MM-DD
  canalId?: string | null;
  roomId?: string | null;
  bedId?: string | null;   // um dos dois: roomId OU bedId
  observacoes?: string | null;
};

export type HospedeDTO = {
  id: string;
  nome: string;
  documento?: string;
  email?: string;
  telefone?: string;
};

export type AcomodacaoOption = {
  id: string;
  label: string;      // "Quarto 101" ou "Beliche A — Cama 2"
  kind: "room" | "bed";
};

export type SalesChannelDTO = {
  id: string;
  name: string;
};

export type CreateHospedeInput = {
  nome: string;
  documento?: string;
  email?: string;
  telefone?: string;
};

export type CheckInPayload = {
  arrivalTime?: string; // "HH:mm"
  notes?: string | null;
};

export type CheckOutPayload = {
  notes?: string | null;
};

export type CancelReservaPayload = {
  reason: "guest_request" | "no_show" | "overbooking" | "other";
  penalty?: number | null; // taxa/penalidade opcional
  notes?: string | null;
};