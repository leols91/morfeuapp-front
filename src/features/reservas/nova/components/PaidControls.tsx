"use client";
import * as React from "react";
import { Field, Select } from "@/components/ui/form/Field";
import { BooleanSelect } from "@/components/ui/form/BooleanSelect";
import { PAYMENT_METHODS } from "../schema";

type Props = {
  fullyPaid: boolean;
  paymentMethod?: string;
  onChangePaid: (v: boolean) => void;
  onChangeMethod: (v: string) => void;
  paymentError?: string;
};

export function PaidControls({
  fullyPaid,
  paymentMethod,
  onChangePaid,
  onChangeMethod,
  paymentError,
}: Props) {
  return (
    <div className="grid grid-cols-12 gap-3 items-start">
      <div className="col-span-12 sm:col-span-5">
        <BooleanSelect
          label="Reserva paga"
          value={fullyPaid}
          onChange={(v) => {
            onChangePaid(v);
            if (!v) onChangeMethod("");
          }}
        />
      </div>

      <div className="col-span-12 sm:col-span-7">
        <Field label="Forma de pagamento" error={paymentError}>
          <Select
            disabled={!fullyPaid}
            value={paymentMethod || ""}
            onChange={(e) => onChangeMethod(e.target.value)}
          >
            <option value="">Selecione…</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="col-span-12 text-[11px] opacity-70">
        Se já estiver paga (ex.: Booking/Pix), marque e selecione a forma.
      </div>
    </div>
  );
}