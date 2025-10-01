// src/components/reservas/CheckInOutModal.tsx
"use client";
import * as React from "react";
import { createPortal } from "react-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import type { CheckInPayload, CheckOutPayload } from "@/types/reserva";
import { Field, Input, Textarea } from "@/components/ui/form/Field";

type Mode = "checkin" | "checkout";

const schemaCheckIn  = z.object({ arrivalTime: z.string().optional(), notes: z.string().optional() });
const schemaCheckOut = z.object({ notes: z.string().optional() });
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
  const form = useForm<CommonForm>({ resolver, defaultValues: { arrivalTime: "", notes: "" } });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Esc pra fechar
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Garante portal apenas no client
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!open || !mounted) return null;

  async function submit(values: CommonForm) {
    setError(null);
    setSaving(true);
    try {
      if (mode === "checkin") {
        await onConfirm({ arrivalTime: values.arrivalTime || undefined, notes: values.notes || undefined });
      } else {
        await onConfirm({ notes: values.notes || undefined });
      }
      onClose();
      form.reset({ arrivalTime: "", notes: "" });
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Falha na operação.");
    } finally {
      setSaving(false);
    }
  }

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const node = (
    <div
      className="fixed inset-0 z-[100000]" // z MUITO alto para superar qualquer header
      role="dialog"
      aria-modal="true"
      onClick={onClose} // clicar fora fecha
    >
      {/* Backdrop com blur real; fallback para navegadores sem suporte */}
      <div
        className="
          absolute inset-0
          bg-black/55
          backdrop-blur-[2px]
          supports-[backdrop-filter]:bg-black/35
        "
      />
      {/* Container */}
      <div className="absolute inset-0 overflow-y-auto grid place-items-center p-4">
        <div
          onClick={stop}
          className="w-full max-w-xl rounded-2xl border-subtle border bg-white dark:bg-[#0F172A] shadow-soft"
        >
          {/* header */}
          <div className="px-4 py-3 md:px-6 md:py-4 border-b border-subtle">
            <h3 className="text-lg font-semibold">
              {mode === "checkin" ? "Fazer check-in" : "Fazer check-out"}
            </h3>
            <p className="text-sm opacity-70 mt-1">
              {hospede} · {acomodacao} · {periodo}
            </p>
          </div>

          {/* body */}
          <div className="px-4 py-4 md:px-6 md:py-6">
            <form id="form-ci-co" onSubmit={form.handleSubmit(submit)} className="space-y-4">
              {mode === "checkin" && (
                <Field label="Horário de chegada (opcional)" className="w-full">
                  <Input type="time" {...form.register("arrivalTime")} />
                </Field>
              )}

              <Field label="Observações (opcional)" className="w-full">
                <Textarea
                  rows={3}
                  placeholder={mode === "checkin" ? "Informações relevantes para o check-in" : "Informações do check-out"}
                  {...form.register("notes")}
                />
              </Field>

              {error && <p className="text-sm text-red-500">{error}</p>}
            </form>
          </div>

          {/* footer */}
          <div className="px-4 py-3 md:px-6 md:py-4 border-t border-subtle flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button form="form-ci-co" type="submit" disabled={saving}>
              {saving ? "Confirmando…" : "Confirmar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // ✅ Renderiza fora da árvore (evita qualquer stacking context do layout)
  return createPortal(node, document.body);
}