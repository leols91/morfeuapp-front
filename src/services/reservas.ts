// src/services/reservas.ts  (adicione/atualize)
import { api } from "@/lib/api";
import type {
  ReservaDTO,
  ReservaDetailDTO,
  ReservaStatus,
  CreateReservaInput,
  HospedeDTO,
  AcomodacaoOption,
  SalesChannelDTO,
  CreateHospedeInput,
  CheckInPayload,
  CheckOutPayload,
  CancelReservaPayload,
} from "@/types/reserva";
import { formatISO } from "date-fns";

export type { HospedeDTO } from "@/types/reserva";

/** Lista reservas (já criado antes) */
export type ListReservasParams = {
  from?: string;
  to?: string;
  status?: ReservaStatus | "all";
  canal?: string | "all";
  page?: number;
  pageSize?: number;
};

export async function listReservas(params: ListReservasParams): Promise<{ data: ReservaDTO[]; total: number; }> {
  // const res = await api.get("/reservas", { params });
  // return res.data;
  const fake: ReservaDTO[] = [
    { id: "rsv_001", hospedeNome: "Ana Paula", inicio: "2025-09-25", fim: "2025-09-28", acomodacao: "Quarto 101", status: "confirmed", canal: "Direta", saldo: 0 },
    { id: "rsv_002", hospedeNome: "Carlos Eduardo", inicio: "2025-09-24", fim: "2025-09-26", acomodacao: "Beliche A — Cama 2", status: "checked_in", canal: "Booking", saldo: 120.5 },
    { id: "rsv_003", hospedeNome: "Julia Fernandes", inicio: "2025-09-30", fim: "2025-10-02", acomodacao: "Quarto 202", status: "pending", canal: "Airbnb", saldo: 0 },
  ];
  return { data: fake, total: fake.length };
}

/** Detalhe (já criado antes) */
export async function getReservaById(id: string): Promise<ReservaDetailDTO> {
  // const res = await api.get(`/reservas/${id}`);
  // return res.data;
  return {
    id, codigo: "RSV-2025-0001", hospedeNome: "Ana Paula",
    inicio: "2025-09-25", fim: "2025-09-28", acomodacao: "Quarto 101",
    status: "confirmed", canal: "Direta", saldo: 120.5,
    criadoEm: "2025-09-20T10:30:00Z", atualizadoEm: formatISO(new Date()),
    contatoHospede: { telefone: "(21) 99999-8888", email: "ana@email.com", doc: "CPF 123.456.789-00" },
    folio: {
      saldo: 120.5,
      entries: [
        { id: "fe1", type: "room_charge", description: "Diária 25/09", amount: 200, createdAt: "2025-09-25T03:00:00Z" },
        { id: "fe2", type: "product", description: "Água 500ml", amount: 6, createdAt: "2025-09-25T16:00:00Z" },
      ],
      payments: [{ id: "py1", method: "Pix", amount: 85.5, createdAt: "2025-09-25T18:00:00Z" }],
    },
  };
}

/** Busca de hóspedes (q = nome/documento/email) */
export async function searchHospedes(q: string): Promise<HospedeDTO[]> {
  if (!q || q.length < 2) return [];
  // const res = await api.get("/hospedes", { params: { q, limit: 10 } });
  // return res.data.items;
  return [
    { id: "h1", nome: "Ana Paula", documento: "123.456.789-00", email: "ana@email.com" },
    { id: "h2", nome: "Carlos Eduardo" },
    { id: "h3", nome: "Julia Fernandes" },
  ].filter(h => h.nome.toLowerCase().includes(q.toLowerCase()));
}

/** Lista de acomodações (quartos e camas) */
export async function listAcomodacoes(): Promise<AcomodacaoOption[]> {
  // const res = await api.get("/acomodacoes/options"); // ideal: endpoint que retorna quartos + camas
  // return res.data;
  return [
    { id: "room_101", label: "Quarto 101", kind: "room" },
    { id: "room_202", label: "Quarto 202", kind: "room" },
    { id: "bed_A2", label: "Beliche A — Cama 2", kind: "bed" },
  ];
}

/** Lista de canais de venda */
export async function listSalesChannels(): Promise<SalesChannelDTO[]> {
  // const res = await api.get("/sales-channels");
  // return res.data.items;
  return [
    { id: "direct", name: "Direta" },
    { id: "booking", name: "Booking" },
    { id: "airbnb", name: "Airbnb" },
  ];
}

/** Criação da reserva */
export async function createReserva(input: CreateReservaInput): Promise<{ id: string }> {
  // Ajusta payload pro backend (roomId XOU bedId)
  const payload = {
    hospedeId: input.hospedeId,
    inicio: input.checkIn,
    fim: input.checkOut,
    canalId: input.canalId ?? null,
    roomId: input.roomId ?? null,
    bedId: input.bedId ?? null,
    observacoes: input.observacoes ?? null,
  };
  // const res = await api.post("/reservas", payload);
  // return res.data;

  // Mock: retorna id sintético
  return { id: "rsv_" + Math.random().toString(36).slice(2, 8) };
}

export async function createHospede(input: CreateHospedeInput): Promise<HospedeDTO> {
  // const res = await api.post("/hospedes", input);
  // return res.data;

  // MOCK
  return {
    id: "h_" + Math.random().toString(36).slice(2, 8),
    nome: input.nome,
    documento: input.documento,
    email: input.email,
    telefone: input.telefone,
  };
}

// Check-in / Check-out / Cancelar com payload
export async function postCheckIn(id: string, body?: CheckInPayload) {
  // await api.post(`/reservas/${id}/check-in`, body);
  return { ok: true };
}
export async function postCheckOut(id: string, body?: CheckOutPayload) {
  // await api.post(`/reservas/${id}/check-out`, body);
  return { ok: true };
}
export async function cancelReserva(id: string, body: CancelReservaPayload) {
  // await api.post(`/reservas/${id}/cancel`, body);
  return { ok: true };
}