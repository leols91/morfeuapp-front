// src/components/reservas/CancelReservaModal.tsx
"use client";
import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import ModalBase from "@/components/ui/ModalBase";

// kit de form padronizado
import { Field, Input, Select, Textarea } from "@/components/ui/form/Field";
import type { CancelReservaPayload } from "@/types/reserva";

const schema = z.object({
  reason: z.enum(["guest_request", "no_show", "overbooking", "other"], {
    required_error: "Selecione um motivo",
  }),
  // RHF envia string → usamos setValueAs para converter; aceitamos "" como NaN
  penalty: z.union([z.number(), z.nan()]).optional(),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: CancelReservaPayload) => Promise<void>;
  hospede: string;
  periodo: string;
  acomodacao: string;
};

export function CancelReservaModal({
  open,
  onClose,
  onConfirm,
  hospede,
  periodo,
  acomodacao,
}: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { reason: "guest_request", penalty: Number.NaN, notes: "" },
  });

  // reseta o formulário sempre que o modal abrir
  React.useEffect(() => {
    if (!open) return;
    form.reset({ reason: "guest_request", penalty: Number.NaN, notes: "" });
  }, [open, form]);

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit(v: FormData) {
    setError(null);
    setSaving(true);
    try {
      const payload: CancelReservaPayload = {
        reason: v.reason,
        penalty: Number.isNaN(v.penalty as any)
          ? null
          : typeof v.penalty === "number"
          ? v.penalty
          : Number(v.penalty),
        notes: v.notes || null,
      };
      await onConfirm(payload);
      onClose();
      form.reset();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Falha ao cancelar a reserva.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalBase open={open} onClose={onClose}>
      <ModalBase.Card maxWidth="max-w-xl">
        {/* Header */}
        <ModalBase.Header>
          <h3 className="text-lg font-semibold">Cancelar reserva</h3>
          <p className="text-sm opacity-70 mt-1">
            {hospede} · {acomodacao} · {periodo}
          </p>
        </ModalBase.Header>

        {/* Body */}
        <ModalBase.Body>
          <form id="form-cancel" onSubmit={form.handleSubmit(submit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field
                label="Motivo"
                error={form.formState.errors.reason?.message}
                className="w-full"
              >
                <Select
                  value={form.watch("reason")}
                  onChange={(e) =>
                    form.setValue("reason", e.target.value as FormData["reason"], {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                >
                  <option value="guest_request">Solicitação do hóspede</option>
                  <option value="no_show">No-show</option>
                  <option value="overbooking">Overbooking</option>
                  <option value="other">Outro</option>
                </Select>
              </Field>

              <Field
                label="Taxa/penalidade (R$) — opcional"
                error={form.formState.errors.penalty?.message as string | undefined}
                className="w-full"
              >
                <Input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  {...form.register("penalty", {
                    setValueAs: (v) => (v === "" ? Number.NaN : Number(v)),
                  })}
                />
              </Field>
            </div>

            <Field label="Observações">
              <Textarea
                rows={3}
                placeholder="Detalhe o motivo, política aplicada, etc."
                {...form.register("notes")}
              />
            </Field>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </form>
        </ModalBase.Body>

        {/* Footer */}
        <ModalBase.Footer className="flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Voltar
          </Button>
          <Button form="form-cancel" type="submit" disabled={saving}>
            {saving ? "Cancelando…" : "Confirmar cancelamento"}
          </Button>
        </ModalBase.Footer>
      </ModalBase.Card>
    </ModalBase>
  );
}