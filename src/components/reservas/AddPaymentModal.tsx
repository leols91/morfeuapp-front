// src/components/reservas/AddPaymentModal.tsx
"use client";
import * as React from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";

export type NewPaymentPayload = {
  method: string;
  amount: number;
  note?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: NewPaymentPayload) => Promise<void>;
  methods?: string[];
};

const DEFAULT_METHODS = ["Pix", "Dinheiro", "Cartão", "Booking", "Airbnb", "Transferência"];

/* === estilos utilitários (inputs) === */
const wrap =
  "group mt-1 rounded-xl border bg-transparent " +
  "border-gray-300 dark:border-gray-600 " +
  "transition-all duration-200 ease-out " +
  "hover:border-purple-400/80 " +
  "focus-within:border-purple-500 focus-within:shadow-[0_0_0_3px_rgba(168,85,247,0.22)]";

const inputBase =
  "h-10 w-full rounded-xl bg-transparent px-3 outline-none border-0 ring-0 text-[15px]";

const selectBase =
  "h-10 w-full rounded-xl bg-transparent px-3 pr-9 outline-none border-0 ring-0 appearance-none text-[15px]";

const helpText = "text-[11px] opacity-70 mt-1";

export function AddPaymentModal({ open, onClose, onConfirm, methods = DEFAULT_METHODS }: Props) {
  const [method, setMethod] = React.useState(methods[0] ?? "Pix");
  const [amount, setAmount] = React.useState<number | "">("");
  const [note, setNote] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // monta portal apenas no client
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;
    setMethod(methods[0] ?? "Pix");
    setAmount("");
    setNote("");
    setError(null);
  }, [open, methods]);

  if (!open || !mounted) return null;

  async function submit() {
    try {
      setError(null);
      setSaving(true);
      if (amount === "" || Number(amount) <= 0) throw new Error("Informe um valor maior que zero.");
      await onConfirm({ method, amount: Number(amount), note: note || undefined });
      onClose();
    } catch (e: any) {
      setError(e?.message ?? "Falha ao lançar pagamento.");
    } finally {
      setSaving(false);
    }
  }

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const node = (
    <div
      className="fixed inset-0 z-[1000] overflow-y-auto pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      {/* fundo com blur (com fallback) cobrindo 100% da viewport */}
      <div className="absolute inset-0 bg-black/50 supports-[backdrop-filter]:bg-black/30 supports-[backdrop-filter]:backdrop-blur-[2px]" />

      {/* container central do modal */}
      <div className="absolute inset-0 grid place-items-center p-4">
        <div
          onClick={stop}
          className="
            w-full max-w-md rounded-3xl
            border border-black/10 dark:border-white/10
            bg-white dark:bg-[#0F172A]
            shadow-xl shadow-black/20
            transition-colors duration-200 ease-out
            focus-within:border-purple-400/40
          "
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-black/10 dark:border-white/10 rounded-t-3xl">
            <h3 className="text-lg font-semibold">Lançar pagamento</h3>
            <p className="text-xs opacity-70 mt-1">
              O folio continua em aberto até o check-out.
            </p>
          </div>

          {/* Body */}
          <div className="px-5 py-5 space-y-4">
            {/* Forma de pagamento */}
            <div>
              <label className="text-xs opacity-70 block">Forma de pagamento</label>
              <div className={`relative ${wrap}`}>
                <select
                  className={selectBase}
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                >
                  {methods.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <div
                  className="
                    pointer-events-none absolute right-3 top-1/2 -translate-y-1/2
                    text-base opacity-60 select-none
                    transition-all duration-200 ease-out
                    group-focus-within:opacity-90 group-hover:opacity-80
                    group-focus-within:rotate-180
                  "
                >
                  ▾
                </div>
              </div>
              <div className={helpText}>Escolha como o hóspede pagou.</div>
            </div>

            {/* Valor */}
            <div>
              <label className="text-xs opacity-70 block">Valor</label>
              <div className={`relative ${wrap}`}>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm opacity-70 select-none">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  className={`${inputBase} pl-9`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="0,00"
                />
              </div>
              <div className={helpText}>Use ponto para centavos (ex.: 85.50).</div>
            </div>

            {/* Observação */}
            <div>
              <label className="text-xs opacity-70 block">Observação (opcional)</label>
              <div className={wrap}>
                <input
                  className={inputBase}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="ex.: pagamento parcial na entrada"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 border border-red-500/30 bg-red-500/5 rounded-lg p-2">
                {error}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-black/10 dark:border-white/10 rounded-b-3xl flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={submit} disabled={saving}>
              {saving ? "Lançando…" : "Lançar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}