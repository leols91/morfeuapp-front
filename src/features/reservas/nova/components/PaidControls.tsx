"use client";
import * as React from "react";
import { Field, Select } from "@/components/ui/form/Field";
import { PAYMENT_METHODS } from "@/features/reservas/nova/schema";

type Props = {
  fullyPaid: boolean;
  paymentMethod?: string; // ← agora pode ser undefined
  paymentError?: string;
  onChangePaid: (v: boolean) => void;
  onChangeMethod: (v: string) => void;
};

export function PaidControls({
  fullyPaid,
  paymentMethod,
  paymentError,
  onChangePaid,
  onChangeMethod,
}: Props) {
  return (
    <div className="grid grid-cols-12 gap-3">
      {/* Reserva paga */}
      <div className="col-span-12 md:col-span-5 lg:col-span-5">
        <Field label="Reserva paga" className="w-full">
          <Select
            value={fullyPaid ? "yes" : "no"}
            onChange={(e) => onChangePaid(e.target.value === "yes")}
          >
            <option value="no">Não</option>
            <option value="yes">Sim</option>
          </Select>
        </Field>
      </div>

      {/* Forma de pagamento */}
      <div className="col-span-12 md:col-span-7 lg:col-span-7">
        <Field label="Forma de pagamento" error={paymentError} className="w-full">
          <Select
            value={paymentMethod ?? ""}        // ← normaliza undefined para ""
            onChange={(e) => onChangeMethod(e.target.value)}
            disabled={!fullyPaid}
          >
            <option value="">Selecione...</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </Select>
          <div className="text-[11px] opacity-70 mt-1">
            Se já estiver paga (ex.: Booking/Pix), marque e selecione a forma.
          </div>
        </Field>
      </div>
    </div>
  );
}