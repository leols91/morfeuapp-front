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