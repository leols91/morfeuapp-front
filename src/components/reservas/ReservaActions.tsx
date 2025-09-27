// src/components/reservas/ReservaActions.tsx
"use client";
import { Button } from "@/components/ui/Button";
import type { ReservaStatus } from "@/types/reserva";

type Props = {
  status: ReservaStatus;
  onOpenCheckIn: () => void;
  onOpenCheckOut: () => void;
  onOpenCancel: () => void;
};

export function ReservaActions({ status, onOpenCheckIn, onOpenCheckOut, onOpenCancel }: Props) {
  return (
    <div className="surface-2">
      <div className="flex flex-wrap items-center gap-2">
        {status === "confirmed" && (
          <Button onClick={onOpenCheckIn}>Fazer check-in</Button>
        )}
        {status === "checked_in" && (
          <Button onClick={onOpenCheckOut}>Fazer check-out</Button>
        )}
        {status !== "canceled" && status !== "checked_out" && (
          <Button variant="outline" onClick={onOpenCancel}>Cancelar reserva</Button>
        )}
      </div>
    </div>
  );
}