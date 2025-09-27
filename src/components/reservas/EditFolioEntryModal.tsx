// src/components/reservas/EditFolioEntryModal.tsx
"use client";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import type { FolioEntry } from "@/types/reserva";

type Props = {
  open: boolean;
  onClose: () => void;
  entry: FolioEntry | null;
  onConfirm: (payload: { id: string; description?: string; amount?: number }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
};

export function EditFolioEntryModal({ open, onClose, entry, onConfirm, onDelete }: Props) {
  const [description, setDescription] = React.useState(entry?.description ?? "");
  const [amount, setAmount] = React.useState<number | "">(entry ? entry.amount : "");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // modal de confirmação de exclusão
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    setDescription(entry?.description ?? "");
    setAmount(entry ? entry.amount : "");
    setError(null);
    setConfirmOpen(false);
    setDeleting(false);
  }, [entry, open]);

  if (!open || !entry) return null;
  const ent: FolioEntry = entry;

  async function submit() {
    setError(null);
    setSaving(true);
    try {
      await onConfirm({
        id: ent.id,
        description: description || undefined,
        amount: amount === "" ? undefined : Number(amount),
      });
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Falha ao atualizar lançamento.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!onDelete) return;
    setError(null);
    setDeleting(true);
    try {
      await onDelete(ent.id);
      setConfirmOpen(false);
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Falha ao excluir lançamento.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      {/* Modal principal */}
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      <div className="fixed inset-0 z-50 grid place-items-center p-4">
        <div className="w-full max-w-md rounded-2xl border-subtle border bg-white dark:bg-[#0F172A] shadow-soft">
          <div className="px-4 py-3 md:px-6 md:py-4 border-b border-subtle">
            <h3 className="text-lg font-semibold">Editar lançamento</h3>
            <p className="text-sm opacity-70">ID: {ent.id}</p>
          </div>

          <div className="px-4 py-4 md:px-6 md:py-6 space-y-3">
            <div>
              <label className="text-xs opacity-70 block">Descrição</label>
              <input
                className="mt-1 h-9 w-full rounded-2xl border-subtle bg-transparent px-3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs opacity-70 block">Valor total (R$)</label>
              <input
                type="number"
                step="0.01"
                inputMode="decimal"
                className="mt-1 h-9 w-full rounded-2xl border-subtle bg-transparent px-3"
                value={amount}
                onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <div className="px-4 py-3 md:px-6 md:py-4 border-t border-subtle flex items-center justify-between gap-2">
            {onDelete && (
              <Button
                type="button"
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={() => setConfirmOpen(true)}
                disabled={saving || deleting}
              >
                Excluir
              </Button>
            )}
            <div className="ml-auto flex items-center gap-2">
              <Button type="button" variant="ghost" onClick={onClose} disabled={saving || deleting}>
                Cancelar
              </Button>
              <Button onClick={submit} disabled={saving || deleting}>
                {saving ? "Salvando…" : "Salvar"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmação de exclusão */}
      {confirmOpen && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/50" onClick={() => setConfirmOpen(false)} />
          <div className="fixed inset-0 z-[60] grid place-items-center p-4">
            <div className="w-full max-w-sm rounded-2xl border border-subtle bg-white dark:bg-[#0F172A] shadow-soft">
              <div className="px-5 py-4 border-b border-subtle">
                <h4 className="text-base font-semibold">Excluir lançamento</h4>
              </div>
              <div className="px-5 py-5 space-y-2 text-sm">
                <p className="opacity-80">
                  Tem certeza que deseja excluir este lançamento? Essa ação não pode ser desfeita.
                </p>
                <div className="mt-2 rounded-xl border border-subtle px-3 py-2">
                  <div className="text-xs opacity-70">Descrição</div>
                  <div className="mt-0.5">{ent.description || "—"}</div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div className="text-xs opacity-70">Valor</div>
                    <div className="text-right font-medium">
                      {ent.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-5 py-4 border-t border-subtle flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setConfirmOpen(false)} disabled={deleting}>
                  Cancelar
                </Button>
                <Button
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={confirmDelete}
                  disabled={deleting}
                >
                  {deleting ? "Excluindo…" : "Excluir"}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}