// src/components/reservas/ReservaControls.tsx
"use client";

import { Button } from "@/components/ui/Button";
import type { ReservaStatus } from "@/types/reserva";

type Props = {
  // ações contextuais (dependem do status)
  status: ReservaStatus;
  onOpenCheckIn: () => void;
  onOpenCheckOut: () => void;
  onOpenCancel: () => void;

  // ferramentas (sempre visíveis)
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
        {/* === Ações contextuais (esquerda) === */}
        {status === "confirmed" && (
          <Button onClick={onOpenCheckIn}>Fazer check-in</Button>
        )}

        {status === "checked_in" && (
          <Button onClick={onOpenCheckOut}>Fazer check-out</Button>
        )}

        {status !== "canceled" && status !== "checked_out" && (
          <Button variant="outline" onClick={onOpenCancel}>
            Cancelar reserva
          </Button>
        )}

        {/* separador sutil em telas médias+ */}
        <div className="hidden md:inline-block h-6 mx-2 border-l border-black/10 dark:border-white/10" />

        {/* === Ferramentas (direita, mas mantém wrap) === */}
        <Button variant="outline" onClick={onOpenEditDates}>
          Prorrogar saída
        </Button>

        <Button variant="outline" onClick={onOpenChangeAcom}>
          Trocar acomodação
        </Button>

        <Button onClick={onOpenAddCharge}>
          Lançar produto/serviço
        </Button>

        <Button variant="default" onClick={onOpenAddPayment}>
          Lançar pagamento
        </Button>
      </div>
    </div>
  );
}