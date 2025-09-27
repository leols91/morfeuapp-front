// src/components/reservas/ReservaActions.tsx
"use client";
import { Button } from "@/components/ui/Button";
import type { ReservaStatus } from "@/types/reserva";

type Props = {
  id: string;
  status: ReservaStatus;
  onCheckIn: () => Promise<void>;
  onCheckOut: () => Promise<void>;
  onCancel: () => Promise<void>;
};

export function ReservaActions({ status, onCheckIn, onCheckOut, onCancel }: Props) {
  return (
    <div className="surface-2">
      <div className="flex flex-wrap items-center gap-2">
        {status === "confirmed" && (
          <Button onClick={onCheckIn}>Fazer check-in</Button>
        )}
        {status === "checked_in" && (
          <Button onClick={onCheckOut}>Fazer check-out</Button>
        )}
        {status !== "canceled" && status !== "checked_out" && (
          <Button variant="outline" onClick={onCancel}>Cancelar reserva</Button>
        )}
      </div>
    </div>
  );
}