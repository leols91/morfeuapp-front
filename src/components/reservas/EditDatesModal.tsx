// src/components/reservas/EditDatesModal.tsx
"use client";
import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import ModalBase from "@/components/ui/ModalBase";
import { Field, Input } from "@/components/ui/form/Field";

const schema = z.object({
  checkOut: z
    .string()
    .min(10, "Informe a nova data")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (AAAA-MM-DD)"),
});
type FormData = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (checkOut: string) => Promise<void>;
  currentCheckOut: string; // ISO
  minDate?: string;        // YYYY-MM-DD
};

export function EditDatesModal({ open, onClose, onConfirm, currentCheckOut, minDate }: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { checkOut: currentCheckOut.slice(0, 10) },
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset({ checkOut: currentCheckOut.slice(0, 10) });
  }, [open, currentCheckOut, form]);

  const [saving, setSaving] = React.useState(false);
  const [error, setError]   = React.useState<string | null>(null);

  async function submit(v: FormData) {
    setError(null);
    setSaving(true);
    try {
      await onConfirm(v.checkOut);
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Falha ao atualizar data.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalBase open={open} onClose={onClose}>
      <ModalBase.Card maxWidth="max-w-md">
        <ModalBase.Header>
          <h3 className="text-lg font-semibold">Prorrogar saída</h3>
          <p className="text-sm opacity-70">Altere a data de check-out.</p>
        </ModalBase.Header>

        <ModalBase.Body>
          <form id="form-edit-dates" onSubmit={form.handleSubmit(submit)} className="space-y-4">
            <Field label="Novo check-out" error={form.formState.errors.checkOut?.message}>
              <Input type="date" min={minDate} {...form.register("checkOut")} />
            </Field>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </form>
        </ModalBase.Body>

        <ModalBase.Footer className="flex justify-end gap-2">
          <Button variant="ghost" type="button" onClick={onClose}>Cancelar</Button>
          <Button form="form-edit-dates" type="submit" disabled={saving}>
            {saving ? "Salvando…" : "Salvar"}
          </Button>
        </ModalBase.Footer>
      </ModalBase.Card>
    </ModalBase>
  );
}