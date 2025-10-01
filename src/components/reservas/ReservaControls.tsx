// src/components/reservas/ReservaControls.tsx
"use client";

import { Button } from "@/components/ui/Button";
import type { ReservaStatus } from "@/types/reserva";

type Props = {
  status: ReservaStatus;
  onOpenCheckIn: () => void;
  onOpenCheckOut: () => void;
  onOpenCancel: () => void;

  onOpenEditDates: () => void;
  onOpenChangeAcom: () => void;
  onOpenAddCharge: () => void;
  onOpenAddPayment: () => void;
};

export function ReservaControls({
  status,
  onOpenCheckIn,
  onOpenCheckOut,
  onOpenCancel,
  onOpenEditDates,
  onOpenChangeAcom,
  onOpenAddCharge,
  onOpenAddPayment,
}: Props) {
  return (
    <div className="surface-2">
      <div className="flex flex-wrap items-center gap-2">
        {/* === Ações contextuais === */}
        {status === "confirmed" && (
          <Button onClick={onOpenCheckIn}>Fazer check-in</Button>
        )}

        {status === "checked_in" && (
          <Button onClick={onOpenCheckOut}>Fazer check-out</Button>
        )}

        {/* separador */}
        <div className="hidden md:block h-6 mx-1 border-l border-black/10 dark:border-white/10" />

        {/* === Ferramentas (outline com contraste correto no light e dark) === */}
        <Button
          variant="outline"
          className="
            border-black/15 text-slate-800 hover:border-purple-400/70 hover:text-purple-700
            dark:border-white/20 dark:text-white/90 dark:hover:text-white
          "
          onClick={onOpenEditDates}
        >
          Prorrogar saída
        </Button>

        <Button
          variant="outline"
          className="
            border-black/15 text-slate-800 hover:border-purple-400/70 hover:text-purple-700
            dark:border-white/20 dark:text-white/90 dark:hover:text-white
          "
          onClick={onOpenChangeAcom}
        >
          Trocar acomodação
        </Button>

        <Button onClick={onOpenAddCharge}>Lançar produto/serviço</Button>

        <Button variant="default" onClick={onOpenAddPayment}>
          Lançar pagamento
        </Button>

        {/* empurra o cancelar à direita em md+ */}
        <div className="hidden md:flex flex-1" />

        {/* === Cancelar (danger) === */}
        {status !== "canceled" && status !== "checked_out" && (
          <Button
            variant="outline"
            onClick={onOpenCancel}
            className="
              md:ml-auto
              border-red-500/50 text-red-600 hover:border-red-400 hover:text-red-500
              focus-visible:ring-red-500/30
              dark:border-red-400/60 dark:text-red-300 dark:hover:border-red-300 dark:hover:text-red-200
            "
          >
            Cancelar reserva
          </Button>
        )}
      </div>
    </div>
  );
}