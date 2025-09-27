// src/components/reservas/EditDatesModal.tsx
"use client";
import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  checkOut: z.string().min(10, "Informe a nova data").regex(/^\d{4}-\d{2}-\d{2}$/),
});
type FormData = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (checkOut: string) => Promise<void>;
  currentCheckOut: string; // ISO
  minDate?: string;        // ISO YYYY-MM-DD (opcional)
};

export function EditDatesModal({ open, onClose, onConfirm, currentCheckOut, minDate }: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { checkOut: currentCheckOut.slice(0, 10) },
    values: { checkOut: currentCheckOut.slice(0, 10) },
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!open) return null;

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
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      <div className="fixed inset-0 z-50 grid place-items-center p-4">
        <div className="w-full max-w-md rounded-2xl border-subtle border bg-white dark:bg-[#0F172A] shadow-soft">
          <div className="px-4 py-3 md:px-6 md:py-4 border-b border-subtle">
            <h3 className="text-lg font-semibold">Prorrogar saída</h3>
            <p className="text-sm opacity-70">Altere a data de check-out.</p>
          </div>
          <div className="px-4 py-4 md:px-6 md:py-6">
            <form id="form-edit-dates" onSubmit={form.handleSubmit(submit)} className="space-y-3">
              <div>
                <label className="text-xs opacity-70 block">Novo check-out</label>
                <input
                  type="date"
                  min={minDate}
                  className="mt-1 h-9 w-full rounded-2xl border-subtle bg-transparent px-3"
                  {...form.register("checkOut")}
                />
                {form.formState.errors.checkOut && (
                  <p className="text-xs text-red-500 mt-1">{form.formState.errors.checkOut.message}</p>
                )}
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </form>
          </div>
          <div className="px-4 py-3 md:px-6 md:py-4 border-t border-subtle flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={onClose}>Cancelar</Button>
            <Button form="form-edit-dates" type="submit" disabled={saving}>
              {saving ? "Salvando…" : "Salvar"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}