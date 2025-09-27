// src/components/reservas/ReservaToolbar.tsx
"use client";
import * as React from "react";
import { Button } from "@/components/ui/Button";

type Props = {
  onOpenEditDates: () => void;
  onOpenChangeAcom: () => void;
  onOpenAddCharge: () => void;
};

export function ReservaToolbar({ onOpenEditDates, onOpenChangeAcom, onOpenAddCharge }: Props) {
  return (
    <div className="surface-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={onOpenEditDates}>Prorrogar saída</Button>
        <Button variant="outline" onClick={onOpenChangeAcom}>Trocar acomodação</Button>
        <Button onClick={onOpenAddCharge}>Lançar produto/serviço</Button>
      </div>
    </div>
  );
}