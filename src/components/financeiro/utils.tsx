import { cn } from "@/components/ui/cn";

export function Th(props: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      {...props}
      className={cn("px-4 py-3 text-xs font-semibold uppercase tracking-wide opacity-70", props.className)}
    />
  );
}

export function Td(props: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td {...props} className={cn("px-4 py-3 align-middle", props.className)} />;
}

export function fmtMoney(v?: number | null) {
  if (v == null) return "—";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR");
}

export function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR");
}

export function fmtNumber(v?: number | null) {
  if (v == null) return "—";
  const s = v % 1 === 0 ? v.toFixed(0) : v.toFixed(2);
  return s.replace(".", ",");
}

export function addDays(d: Date, days: number) {
  const c = new Date(d);
  c.setDate(c.getDate() + days);
  return c;
}

export function money(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export type Id = string;

export type CashAccount = { id: Id; name: string; balance: number };
export type APItem = {
  id: Id;
  description: string;
  category?: string;
  amount: number;
  dueDate: string;
  status: "open" | "paid";
  supplier?: string;
};