"use client";
import { Button } from "@/components/ui/Button";

export type ReservaToolbarProps = {
  onOpenEditDates: () => void;
  onOpenChangeAcom: () => void;
  onOpenAddCharge: () => void;
  onOpenAddPayment: () => void;
};

export function ReservaToolbar({
  onOpenEditDates,
  onOpenChangeAcom,
  onOpenAddCharge,
  onOpenAddPayment,
}: ReservaToolbarProps) {
  return (
    <div className="surface-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={onOpenEditDates}>Prorrogar saída</Button>
        <Button variant="outline" onClick={onOpenChangeAcom}>Trocar acomodação</Button>
        <Button onClick={onOpenAddCharge}>Lançar produto/serviço</Button>
        <Button variant="default" onClick={onOpenAddPayment}>Lançar pagamento</Button>
      </div>
    </div>
  );
}