// src/components/reservas/ViewFolioEntryModal.tsx
"use client";
import * as React from "react";
import type { FolioEntry } from "@/types/reserva";
import { Button } from "@/components/ui/Button";

type Props = {
  open: boolean;
  onClose: () => void;
  entry: FolioEntry | null;
};

export function ViewFolioEntryModal({ open, onClose, entry }: Props) {
  if (!open || !entry) return null;

  const d = new Date(entry.createdAt);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const when = `${dd}/${mm}/${yyyy} ${hh}:${min}`;

  const qty = (entry as any)?.qty ?? 1;
  const total = entry.amount;
  const unit = qty ? total / qty : total;

  function tipoLabel(t: FolioEntry["type"]) {
    if (t === "room_charge") return "Diária";
    if (t === "product") return "Produto";
    return "Serviço";
  }

  const money = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      <div className="fixed inset-0 z-50 grid place-items-center p-4">
        <div className="w-full max-w-xl rounded-2xl border border-subtle bg-white dark:bg-[#0F172A] shadow-soft">
          <div className="px-5 py-4 border-b border-subtle">
            <h3 className="text-lg font-semibold">Detalhes do lançamento</h3>
            <p className="text-xs opacity-70 mt-1">ID: {entry.id}</p>
          </div>

          <div className="px-5 py-5 space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <Item label="Data">{when}</Item>
              <Item label="Tipo">{tipoLabel(entry.type)}</Item>
              <Item label="Descrição" className="col-span-2">
                {entry.description}
              </Item>
            </div>

            {/* Linha de totais bem alinhada */}
            <div>
              <div className="grid grid-cols-3 px-3 py-2 text-xs font-semibold opacity-70 bg-black/5 dark:bg-white/5 rounded-t-xl">
                <div className="text-right">QTD.</div>
                <div className="text-right">VALOR UNITÁRIO</div>
                <div className="text-right">VALOR TOTAL</div>
              </div>
              <div className="grid grid-cols-3 px-3 py-3 rounded-b-xl border border-t-0 border-subtle tabular-nums">
                <div className="text-right">{qty}</div>
                <div className="text-right">{money(unit)}</div>
                <div className="text-right font-medium">{money(total)}</div>
              </div>
            </div>
          </div>

          <div className="px-5 py-4 border-t border-subtle flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function Item({
  label,
  children,
  align,
  mono,
  className,
}: {
  label: string;
  children: React.ReactNode;
  align?: "left" | "right";
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-xs opacity-70">{label}</div>
      <div
        className={[
          "mt-1",
          align === "right" ? "text-right" : "text-left",
          mono ? "tabular-nums" : "",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}