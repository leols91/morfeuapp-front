import type { FolioEntry } from "@/types/reserva";

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR");
}

export function toBR(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function formatDateHM(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

export function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function mapTipo(t: FolioEntry["type"]) {
  if (t === "room_charge") return "Diária";
  if (t === "product") return "Produto";
  return "Serviço";
}

export function getQty(e: FolioEntry): number {
  return (e as any)?.qty ?? 1;
}