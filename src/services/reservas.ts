// src/services/reservas.ts
import { api } from "@/lib/api";
import type { ReservaDTO, ReservaStatus } from "@/types/reserva";
import type { ReservaDetailDTO } from "@/types/reserva";
import { formatISO } from "date-fns";


export type ListReservasParams = {
  from?: string;   // YYYY-MM-DD
  to?: string;     // YYYY-MM-DD
  status?: ReservaStatus | "all";
  canal?: string | "all";
  page?: number;
  pageSize?: number;
};

export async function listReservas(params: ListReservasParams): Promise<{
  data: ReservaDTO[];
  total: number;
}> {
  // QUANDO o backend estiver pronto, descomente:
  // const res = await api.get("/reservas", { params });
  // return res.data;

  // MOCK provisório para visual:
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
  return Promise.resolve({ data: fake, total: fake.length });
}

export async function getReservaById(id: string): Promise<ReservaDetailDTO> {
  // QUANDO o backend estiver pronto:
  // const res = await api.get(`/reservas/${id}`);
  // return res.data;

  // MOCK para visual
  return Promise.resolve({
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
      payments: [
        { id: "py1", method: "Pix", amount: 85.5, createdAt: "2025-09-25T18:00:00Z" },
      ],
    },
  });
}

// Ações (moldes)
export async function postCheckIn(id: string) {
  // await api.post(`/reservas/${id}/check-in`);
  return { ok: true };
}
export async function postCheckOut(id: string) {
  // await api.post(`/reservas/${id}/check-out`);
  return { ok: true };
}
export async function cancelReserva(id: string) {
  // await api.post(`/reservas/${id}/cancel`);
  return { ok: true };
}