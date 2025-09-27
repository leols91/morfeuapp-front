// src/components/reservas/StatusBadge.tsx
import { cn } from "@/components/ui/cn";
import type { ReservaStatus } from "@/types/reserva";

const map: Record<ReservaStatus, string> = {
  pending:    "bg-yellow-500/15 text-yellow-300 border-yellow-500/20",
  confirmed:  "bg-blue-500/15 text-blue-300 border-blue-500/20",
  checked_in: "bg-green-500/15 text-green-300 border-green-500/20",
  checked_out:"bg-gray-500/15 text-gray-300 border-gray-500/20",
  canceled:   "bg-red-500/15 text-red-300 border-red-500/20",
};

export function StatusBadge({ status }: { status: ReservaStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs",
        "text-gray-700 bg-gray-100 border-gray-200",
        "dark:text-white",
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