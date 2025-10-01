// src/components/reservas/ChangeAcomodacaoModal.tsx
"use client";
import * as React from "react";
import { createPortal } from "react-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import type { AcomodacaoOption } from "@/types/reserva";
import { Field, Select, Textarea } from "@/components/ui/form/Field";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: { roomId?: string | null; bedId?: string | null; notes?: string | null }) => Promise<void>;
  options: AcomodacaoOption[];
  currentLabel?: string;
};

const schema = z.object({
  alvo: z.string().min(1, "Selecione uma acomodação"),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export function ChangeAcomodacaoModal({
  open,
  onClose,
  onConfirm,
  options,
  currentLabel,
}: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { alvo: "", notes: "" },
  });

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // reset ao abrir
  React.useEffect(() => {
    if (open) form.reset({ alvo: "", notes: "" });
  }, [open, form]);

  // ESC fecha
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // portal apenas no client
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!open || !mounted) return null;

  async function submit(v: FormData) {
    setError(null);
    setSaving(true);
    try {
      const [kind, id] = v.alvo.split(":");
      await onConfirm({
        roomId: kind === "room" ? id : null,
        bedId: kind === "bed" ? id : null,
        notes: v.notes || null,
      });
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Falha ao trocar acomodação.");
    } finally {
      setSaving(false);
    }
  }

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const node = (
    <div
      className="fixed inset-0 z-[100000]"
      role="dialog"
      aria-modal="true"
      onClick={onClose}  // clique fora fecha
    >
      {/* backdrop com blur (com fallback) cobrindo 100% */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] supports-[backdrop-filter]:bg-black/35" />

      {/* container do modal */}
      <div className="absolute inset-0 overflow-y-auto grid place-items-center p-4">
        <div
          onClick={stop}
          className="w-full max-w-xl rounded-2xl border-subtle border bg-white dark:bg-[#0F172A] shadow-soft"
        >
          {/* header */}
          <div className="px-4 py-3 md:px-6 md:py-4 border-b border-subtle">
            <h3 className="text-lg font-semibold">Trocar acomodação</h3>
            {currentLabel && (
              <p className="text-sm opacity-70">Atual: {currentLabel}</p>
            )}
          </div>

          {/* body */}
          <div className="px-4 py-4 md:px-6 md:py-6">
            <form id="form-change-acom" onSubmit={form.handleSubmit(submit)} className="space-y-4">
              <Field
                label="Nova acomodação"
                error={form.formState.errors.alvo?.message}
              >
                <Select {...form.register("alvo")}>
                  <option value="">Selecione…</option>
                  {options.map((o) => (
                    <option key={o.id} value={`${o.kind}:${o.id}`}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Observações (opcional)">
                <Textarea
                  rows={3}
                  placeholder="Motivo da troca, etc."
                  {...form.register("notes")}
                />
              </Field>

              {error && <p className="text-sm text-red-500">{error}</p>}
            </form>
          </div>

          {/* footer */}
          <div className="px-4 py-3 md:px-6 md:py-4 border-t border-subtle flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button form="form-change-acom" type="submit" disabled={saving}>
              {saving ? "Trocando…" : "Confirmar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}