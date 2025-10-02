// src/components/reservas/AddPaymentModal.tsx
"use client";
import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ModalBase from "@/components/ui/ModalBase";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/form/Field";

export type NewPaymentPayload = { method: string; amount: number; note?: string; };
type Props = { open: boolean; onClose: () => void; onConfirm: (payload: NewPaymentPayload) => Promise<void>; methods?: string[]; };

const DEFAULT_METHODS = ["Pix", "Dinheiro", "Cartão", "Booking", "Airbnb", "Transferência"] as const;

const schema = z.object({
  method: z.string().min(1, "Escolha a forma de pagamento"),
  amount: z.union([z.number(), z.nan()]).refine((v) => !Number.isNaN(v as any) && Number(v) > 0, "Informe um valor maior que zero"),
  note: z.string().optional(),
});
type FormData = z.input<typeof schema>;

export function AddPaymentModal({ open, onClose, onConfirm, methods = [...DEFAULT_METHODS] }: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { method: methods[0] ?? "Pix", amount: Number.NaN, note: "" },
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset({ method: methods[0] ?? "Pix", amount: Number.NaN, note: "" });
  }, [open, methods, form]);

  const [saving, setSaving] = React.useState(false);
  const [error,  setError]  = React.useState<string | null>(null);

  async function submit(v: FormData) {
    setError(null); setSaving(true);
    try {
      await onConfirm({ method: v.method, amount: Number(v.amount), note: v.note || undefined });
      onClose();
      form.reset();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Falha ao lançar pagamento.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalBase open={open} onClose={onClose}>
      <ModalBase.Card maxWidth="max-w-md">
        <ModalBase.Header>
          <h3 className="text-lg font-semibold">Lançar pagamento</h3>
          <p className="text-xs opacity-70 mt-1">O folio permanece em aberto até o check-out.</p>
        </ModalBase.Header>

        <ModalBase.Body>
          <form id="form-add-payment" onSubmit={form.handleSubmit(submit)} className="space-y-4">
            <Field label="Forma de pagamento" error={form.formState.errors.method?.message}>
              <Select
                value={form.watch("method")}
                onChange={(e) => form.setValue("method", e.target.value, { shouldDirty: true, shouldValidate: true })}
              >
                {methods.map((m) => (<option key={m} value={m}>{m}</option>))}
              </Select>
            </Field>

            <Field label="Valor" error={form.formState.errors.amount?.message}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm opacity-70 select-none">R$</span>
                <Input
                  type="number" step="0.01" inputMode="decimal" className="pl-9"
                  {...form.register("amount", { setValueAs: (v) => (v === "" ? Number.NaN : Number(v)) })}
                />
              </div>
              <div className="text-[11px] opacity-70 mt-1">Use ponto para centavos (ex.: 85.50).</div>
            </Field>

            <Field label="Observação (opcional)">
              <Textarea rows={3} placeholder="ex.: pagamento parcial na entrada" {...form.register("note")} />
            </Field>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </form>
        </ModalBase.Body>

        <ModalBase.Footer className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button form="form-add-payment" type="submit" disabled={saving}>
            {saving ? "Lançando…" : "Lançar"}
          </Button>
        </ModalBase.Footer>
      </ModalBase.Card>
    </ModalBase>
  );
}