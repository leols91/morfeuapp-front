// src/components/reservas/ChangeAcomodacaoModal.tsx
"use client";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import type { AcomodacaoOption } from "@/types/reserva";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: { roomId?: string | null; bedId?: string | null; notes?: string | null }) => Promise<void>;
  options: AcomodacaoOption[];
  currentLabel?: string;
};

export function ChangeAcomodacaoModal({ open, onClose, onConfirm, options, currentLabel }: Props) {
  const [value, setValue] = React.useState<string>("");
  const [notes, setNotes] = React.useState<string>("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setValue("");
    setNotes("");
  }, [open]);

  if (!open) return null;

  async function submit() {
    if (!value) { setError("Selecione uma acomodação."); return; }
    setError(null);
    setSaving(true);
    try {
      const [kind, id] = value.split(":");
      await onConfirm({
        roomId: kind === "room" ? id : null,
        bedId: kind === "bed" ? id : null,
        notes: notes || null,
      });
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Falha ao trocar acomodação.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      <div className="fixed inset-0 z-50 grid place-items-center p-4">
        <div className="w-full max-w-xl rounded-2xl border-subtle border bg-white dark:bg-[#0F172A] shadow-soft">
          <div className="px-4 py-3 md:px-6 md:py-4 border-b border-subtle">
            <h3 className="text-lg font-semibold">Trocar acomodação</h3>
            {currentLabel && <p className="text-sm opacity-70">Atual: {currentLabel}</p>}
          </div>
          <div className="px-4 py-4 md:px-6 md:py-6 space-y-3">
            <div>
              <label className="text-xs opacity-70 block">Nova acomodação</label>
              <select
                className="mt-1 h-9 w-full rounded-2xl border-subtle bg-transparent px-3"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              >
                <option value="">Selecione…</option>
                {options.map((o) => (
                  <option key={o.id} value={`${o.kind}:${o.id}`}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs opacity-70 block">Observações (opcional)</label>
              <textarea
                rows={3}
                className="mt-1 w-full rounded-2xl border-subtle bg-transparent px-3 py-2"
                placeholder="Motivo da troca, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <div className="px-4 py-3 md:px-6 md:py-4 border-t border-subtle flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button onClick={submit} disabled={saving}>{saving ? "Trocando…" : "Confirmar"}</Button>
          </div>
        </div>
      </div>
    </>
  );
}