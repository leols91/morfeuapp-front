// src/components/reservas/CheckInOutModal.tsx
"use client";
import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import type { CheckInPayload, CheckOutPayload } from "@/types/reserva";

type Mode = "checkin" | "checkout";

const schemaCheckIn = z.object({
  arrivalTime: z.string().optional(), // "HH:mm"
  notes: z.string().optional(),
});
const schemaCheckOut = z.object({
  notes: z.string().optional(),
});

// 🔧 Shape comum para ambos os modos
type CommonForm = {
  arrivalTime?: string;
  notes?: string;
};

type Props = {
  open: boolean;
  mode: Mode;
  onClose: () => void;
  onConfirm: (payload: CheckInPayload | CheckOutPayload) => Promise<void>;
  // contexto para header
  hospede: string;
  periodo: string; // "25/09/2025 — 28/09/2025"
  acomodacao: string;
};

export function CheckInOutModal({ open, mode, onClose, onConfirm, hospede, periodo, acomodacao }: Props) {
  const resolver = zodResolver(mode === "checkin" ? schemaCheckIn : schemaCheckOut);

  // ✅ Use um tipo comum que contempla ambos os campos
  const form = useForm<CommonForm>({
    resolver,
    defaultValues: { arrivalTime: "", notes: "" },
  });

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!open) return null;

  async function submit(values: CommonForm) {
    setError(null);
    setSaving(true);
    try {
      // Mapeia para o payload correto conforme o modo
      if (mode === "checkin") {
        const payload: CheckInPayload = {
          arrivalTime: values.arrivalTime || undefined,
          notes: values.notes || undefined,
        };
        await onConfirm(payload);
      } else {
        const payload: CheckOutPayload = {
          notes: values.notes || undefined,
        };
        await onConfirm(payload);
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
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      <div className="fixed inset-0 z-50 grid place-items-center p-4">
        <div className="w-full max-w-xl rounded-2xl border-subtle border bg-white dark:bg-[#0F172A] shadow-soft">
          {/* header */}
          <div className="px-4 py-3 md:px-6 md:py-4 border-b border-subtle">
            <h3 className="text-lg font-semibold">
              {mode === "checkin" ? "Fazer check-in" : "Fazer check-out"}
            </h3>
            <p className="text-sm opacity-70">
              {hospede} · {acomodacao} · {periodo}
            </p>
          </div>

          {/* body */}
          <div className="px-4 py-4 md:px-6 md:py-6">
            <form id="form-ci-co" onSubmit={form.handleSubmit(submit)} className="space-y-4">
              {mode === "checkin" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs opacity-70 block">Horário de chegada (opcional)</label>
                    <input
                      type="time"
                      className="mt-1 h-9 w-full rounded-2xl border-subtle bg-transparent px-3"
                      {...form.register("arrivalTime")}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs opacity-70 block">Observações (opcional)</label>
                <textarea
                  rows={3}
                  className="mt-1 w-full rounded-2xl border-subtle bg-transparent px-3 py-2"
                  placeholder={mode === "checkin" ? "Informações relevantes para o check-in" : "Informações do check-out"}
                  {...form.register("notes")}
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
            </form>
          </div>

          {/* footer */}
          <div className="px-4 py-3 md:px-6 md:py-4 border-t border-subtle flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button form="form-ci-co" type="submit" disabled={saving}>
              {saving ? "Confirmando…" : "Confirmar"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}