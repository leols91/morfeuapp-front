import type { AcomodacaoOption } from "@/types/reserva";
import { toBR } from "@/lib/format";

// datas
export function parseISODateOnly(s?: string) {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function diffNights(inStr?: string, outStr?: string) {
  const a = parseISODateOnly(inStr);
  const b = parseISODateOnly(outStr);
  if (!a || !b) return 0;
  const MS = 24 * 60 * 60 * 1000;
  const diff = Math.round((b.getTime() - a.getTime()) / MS);
  return Math.max(0, diff);
}

export function nextDayISO(s?: string) {
  if (!s || s.length < 10) return undefined;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, m - 1, d + 1);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export function safeToBR(s?: string) {
  return s && s.length >= 10 ? toBR(s) : "--";
}

// acomodação / valores
export function findAcomodacaoByAlvo(list: AcomodacaoOption[] | undefined, alvo?: string) {
  if (!list || !alvo) return undefined;
  const [, id] = (alvo || "").split(":");
  return list.find((a) => a.id === id);
}

export function labelAcomodacao(list?: AcomodacaoOption[], alvo?: string) {
  const found = findAcomodacaoByAlvo(list, alvo);
  return found?.label ?? "—";
}

export function getNightlyRate(opt?: AcomodacaoOption | undefined) {
  if (!opt) return null;
  const any = opt as any;
  return any.price ?? any.dailyRate ?? any.diaria ?? any.valorDiaria ?? null;
}

export function formatBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}