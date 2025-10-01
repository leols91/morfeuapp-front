// src/components/reservas/CancelReservaModal.tsx
"use client";
import * as React from "react";
import { createPortal } from "react-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import type { CancelReservaPayload } from "@/types/reserva";
import { Field, Input, Select, Textarea } from "@/components/ui/form/Field";

const schema = z.object({
  reason: z.enum(["guest_request", "no_show", "overbooking", "other"], {
    required_error: "Selecione um motivo",
  }),
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
    defaultValues: { reason: "guest_request", penalty: undefined, notes: "" },
  });

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // fecha com ESC
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // portal só no client
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!open || !mounted) return null;

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

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const node = (
    <div
      className="fixed inset-0 z-[100000]" // bem alto
      role="dialog"
      aria-modal="true"
      onClick={onClose} // clicar fora fecha
    >
      {/* backdrop com blur */}
      <div
        className="
          absolute inset-0
          bg-black/55
          backdrop-blur-[2px]
          supports-[backdrop-filter]:bg-black/35
        "
      />
      {/* container */}
      <div className="absolute inset-0 overflow-y-auto grid place-items-center p-4">
        <div
          onClick={stop}
          className="w-full max-w-xl rounded-2xl border-subtle border bg-white dark:bg-[#0F172A] shadow-soft"
        >
          {/* header */}
          <div className="px-4 py-3 md:px-6 md:py-4 border-b border-subtle">
            <h3 className="text-lg font-semibold">Cancelar reserva</h3>
            <p className="text-sm opacity-70 mt-1">
              {hospede} · {acomodacao} · {periodo}
            </p>
          </div>

          {/* body */}
          <div className="px-4 py-4 md:px-6 md:py-6">
            <form id="form-cancel" onSubmit={form.handleSubmit(submit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Motivo" error={form.formState.errors.reason?.message}>
                  <Select {...form.register("reason")}>
                    <option value="guest_request">Solicitação do hóspede</option>
                    <option value="no_show">No-show</option>
                    <option value="overbooking">Overbooking</option>
                    <option value="other">Outro</option>
                  </Select>
                </Field>

                <Field
                  label="Taxa/penalidade (R$) — opcional"
                  error={form.formState.errors.penalty?.message as string | undefined}
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
          </div>

          {/* footer */}
          <div className="px-4 py-3 md:px-6 md:py-4 border-t border-subtle flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Voltar
            </Button>
            <Button form="form-cancel" type="submit" disabled={saving}>
              {saving ? "Cancelando…" : "Confirmar cancelamento"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}