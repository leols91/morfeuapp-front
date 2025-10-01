// src/components/reservas/StatusBadge.tsx
import { cn } from "@/components/ui/cn";
import type { ReservaStatus } from "@/types/reserva";

const map: Record<ReservaStatus, string> = {
  pending:
    "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
  confirmed:
    "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
  checked_in:
    "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/30",
  checked_out:
    "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30",
  canceled:
    "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
};

export function StatusBadge({ status }: { status: ReservaStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold",
        "shadow-[0_1px_0_0_rgba(0,0,0,0.03)]",
        map[status]
      )}
    >
      {label(status)}
    </span>
  );
}

function label(s: ReservaStatus) {
  switch (s) {
    case "pending": return "Pendente";
    case "confirmed": return "Confirmada";
    case "checked_in": return "Check-in";
    case "checked_out": return "Check-out";
    case "canceled": return "Cancelada";
  }
}