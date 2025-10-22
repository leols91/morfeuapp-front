// src/components/movimentacoes/utils.tsx

/** =========================
 * Números / Dinheiro
 * ========================= */
export function toNumberSafe(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    const n = Number(v.trim().replace(",", ".")); // aceita "12,34"
    return Number.isFinite(n) ? n : null;
  }
  // Prisma Decimal (ou afins) normalmente têm .toString()
  try {
    // @ts-ignore
    const s = typeof v.toString === "function" ? String(v.toString()) : String(v);
    const n = Number(s.trim().replace(",", "."));
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function fmtNumber(v?: number | string | null) {
  const n = toNumberSafe(v);
  if (n == null) return "—";
  // até 3 casas, sem zeros à direita desnecessários
  const s = Number.isInteger(n)
    ? n.toFixed(0)
    : n.toFixed(3).replace(/0+$/g, "").replace(/\.$/, "");
  return s.replace(".", ",");
}

export function fmtMoney(v?: number | string | null, prefix = "R$") {
  const n = toNumberSafe(v);
  if (n == null) return "—";
  const s = n.toFixed(2).replace(".", ",");
  return `${prefix} ${s}`;
}

/** =========================
 * Datas / Horas
 * ========================= */
function toDateSafe(v?: string | number | Date | null): Date | null {
  if (v == null) return null;
  const d = v instanceof Date ? v : new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

export function fmtDate(v?: string | number | Date | null) {
  const d = toDateSafe(v);
  if (!d) return "—";
  // Ex.: 23/10/2025
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function fmtDateTime(v?: string | number | Date | null) {
  const d = toDateSafe(v);
  if (!d) return "—";
  // Ex.: 23/10/2025 14:37
  const date = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
  const time = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
  return `${date} ${time}`;
}