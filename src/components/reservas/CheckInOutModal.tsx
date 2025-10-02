// src/components/reservas/CheckInOutModal.tsx
"use client";
import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import ModalBase from "@/components/ui/ModalBase";
import type { CheckInPayload, CheckOutPayload } from "@/types/reserva";
import { Field, Input, Textarea } from "@/components/ui/form/Field";

type Mode = "checkin" | "checkout";

const schemaCheckIn = z.object({
  arrivalTime: z.string().optional(),
  notes: z.string().optional(),
});
const schemaCheckOut = z.object({
  notes: z.string().optional(),
});

type CommonForm = { arrivalTime?: string; notes?: string };

type Props = {
  open: boolean;
  mode: Mode;
  onClose: () => void;
  onConfirm: (payload: CheckInPayload | CheckOutPayload) => Promise<void>;
  hospede: string;
  periodo: string;
  acomodacao: string;
};

export function CheckInOutModal({
  open,
  mode,
  onClose,
  onConfirm,
  hospede,
  periodo,
  acomodacao,
}: Props) {
  const resolver = zodResolver(mode === "checkin" ? schemaCheckIn : schemaCheckOut);
  const form = useForm<CommonForm>({
    resolver,
    defaultValues: { arrivalTime: "", notes: "" },
  });

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit(values: CommonForm) {
    setError(null);
    setSaving(true);
    try {
      if (mode === "checkin") {
        await onConfirm({
          arrivalTime: values.arrivalTime || undefined,
          notes: values.notes || undefined,
        });
      } else {
        await onConfirm({
          notes: values.notes || undefined,
        });
      }
      onClose();
      form.reset({ arrivalTime: "", notes: "" });
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Falha na operação.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalBase open={open} onClose={onClose}>
      <ModalBase.Card maxWidth="max-w-xl">
        {/* Header */}
        <ModalBase.Header>
          <h3 className="text-lg font-semibold">
            {mode === "checkin" ? "Fazer check-in" : "Fazer check-out"}
          </h3>
          <p className="text-sm opacity-70 mt-1">
            {hospede} · {acomodacao} · {periodo}
          </p>
        </ModalBase.Header>

        {/* Body */}
        <ModalBase.Body>
          <form
            id="form-ci-co"
            onSubmit={form.handleSubmit(submit)}
            className="space-y-4"
          >
            {mode === "checkin" && (
              <Field label="Horário de chegada (opcional)" className="w-full">
                <Input type="time" {...form.register("arrivalTime")} />
              </Field>
            )}

            <Field label="Observações (opcional)" className="w-full">
              <Textarea
                rows={3}
                placeholder={
                  mode === "checkin"
                    ? "Informações relevantes para o check-in"
                    : "Informações do check-out"
                }
                {...form.register("notes")}
              />
            </Field>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </form>
        </ModalBase.Body>

        {/* Footer */}
        <ModalBase.Footer className="flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button form="form-ci-co" type="submit" disabled={saving}>
            {saving ? "Confirmando…" : "Confirmar"}
          </Button>
        </ModalBase.Footer>
      </ModalBase.Card>
    </ModalBase>
  );
}