// src/services/reservas.ts
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
  UpdateReservaDatesPayload,
  ChangeAcomodacaoPayload,
  FolioEntryUpdatePayload,
  ProductOption, // ⬅️ usa o tipo do arquivo de tipos (não redeclarar aqui)
} from "@/types/reserva";
import { formatISO } from "date-fns";

export type { HospedeDTO } from "@/types/reserva";

/** Opcional: tipo local para serviços adicionais (pode ir para @/types/reserva depois) */
export type ServiceOption = { id: string; name: string; price: number };

/** Lista reservas */
export type ListReservasParams = {
  from?: string;
  to?: string;
  status?: ReservaStatus | "all";
  canal?: string | "all";
  page?: number;
  pageSize?: number;
};

export async function listReservas(params: ListReservasParams): Promise<{ data: ReservaDTO[]; total: number }> {
  // const res = await api.get("/reservas", { params });
  // return res.data;
  const fake: ReservaDTO[] = [
    {
      id: "rsv_001",
      hospedeNome: "Ana Paula",
      inicio: "2025-09-25",
      fim: "2025-09-28",
      acomodacao: "Quarto 101",
      status: "confirmed",
      canal: "Direta",
      saldo: 0,
    },
    {
      id: "rsv_002",
      hospedeNome: "Carlos Eduardo",
      inicio: "2025-09-24",
      fim: "2025-09-26",
      acomodacao: "Beliche A — Cama 2",
      status: "checked_in",
      canal: "Booking",
      saldo: 120.5,
    },
    {
      id: "rsv_003",
      hospedeNome: "Julia Fernandes",
      inicio: "2025-09-30",
      fim: "2025-10-02",
      acomodacao: "Quarto 202",
      status: "pending",
      canal: "Airbnb",
      saldo: 0,
    },
  ];
  return { data: fake, total: fake.length };
}

/** Detalhe */
export async function getReservaById(id: string): Promise<ReservaDetailDTO> {
  // const res = await api.get(`/reservas/${id}`);
  // return res.data;
  return {
    id,
    codigo: "RSV-2025-0001",
    hospedeNome: "Ana Paula",
    inicio: "2025-09-25",
    fim: "2025-09-28",
    acomodacao: "Quarto 101",
    status: "confirmed",
    canal: "Direta",
    saldo: 120.5,
    criadoEm: "2025-09-20T10:30:00Z",
    atualizadoEm: formatISO(new Date()),
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
  ].filter((h) => h.nome.toLowerCase().includes(q.toLowerCase()));
}

/** Lista de acomodações (quartos e camas) */
export async function listAcomodacoes(): Promise<AcomodacaoOption[]> {
  // const res = await api.get("/acomodacoes/options");
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

  return { id: "rsv_" + Math.random().toString(36).slice(2, 8) };
}

/** Criar hóspede (modal) */
export async function createHospede(input: CreateHospedeInput): Promise<HospedeDTO> {
  // const res = await api.post("/hospedes", input);
  // return res.data;
  return {
    id: "h_" + Math.random().toString(36).slice(2, 8),
    nome: input.nome,
    documento: input.documento,
    email: input.email,
    telefone: input.telefone,
  };
}

/** Check-in / Check-out / Cancelar com payload */
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

/** Atualizar datas (apenas check-out neste momento) */
export async function updateReservaDates(id: string, body: UpdateReservaDatesPayload) {
  // await api.patch(`/reservas/${id}/dates`, body);
  return { ok: true };
}

/** Trocar acomodação */
export async function changeAcomodacao(id: string, body: ChangeAcomodacaoPayload) {
  // await api.post(`/reservas/${id}/change-acomodacao`, body);
  return { ok: true };
}

/** Folio: criar lançamento (produto OU serviço) */
export async function addCharge(
  reservaId: string,
  payload:
    | { kind: "product"; productId: string; qty: number; unitPrice: number; description?: string }
    | { kind: "service"; serviceId: string; qty: number; unitPrice: number; description?: string }
) {
  // await api.post(`/reservas/${reservaId}/charges`, payload);
  return { ok: true, entryId: "fe_" + Math.random().toString(36).slice(2, 8) };
}

/** Folio: editar lançamento */
export async function updateFolioEntry(id: string, payload: FolioEntryUpdatePayload) {
  // await api.patch(`/reservas/${id}/folio/entries/${payload.id}`, payload);
  return { ok: true };
}

/** Folio: excluir lançamento */
export async function deleteFolioEntry(reservaId: string, entryId: string) {
  // await api.delete(`/reservas/${reservaId}/folio/entries/${entryId}`);
  return { ok: true };
}

/** Catálogo (produtos e serviços) */
export async function listProducts(): Promise<ProductOption[]> {
  // const res = await api.get("/products");
  // return res.data.items;
  return [
    { id: "p_agua", name: "Água 500ml", price: 6 },
    { id: "p_cerveja", name: "Cerveja", price: 12 },
    { id: "p_cafe", name: "Café da manhã", price: 35 },
  ];
}

export async function listServices(): Promise<ServiceOption[]> {
  // const res = await api.get("/services");
  // return res.data.items;
  return [
    { id: "lavanderia", name: "Lavanderia", price: 25 },
    { id: "cobertor_extra", name: "Cobertor extra", price: 10 },
    { id: "toalha_extra", name: "Toalha extra", price: 8 },
  ];
}