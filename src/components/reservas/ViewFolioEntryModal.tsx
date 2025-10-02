// src/components/reservas/ViewFolioEntryModal.tsx
"use client";
import * as React from "react";
import ModalBase from "@/components/ui/ModalBase";
import type { FolioEntry } from "@/types/reserva";
import { Button } from "@/components/ui/Button";

type Props = { open: boolean; onClose: () => void; entry: FolioEntry | null; };

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
  const totalFinal = entry.amount;
  const unitFinal  = qty ? totalFinal / qty : totalFinal;

  const explicitBaseUnit =
    (entry as any)?.baseUnitPrice ?? (entry as any)?.unitPriceBeforeDiscount ?? (entry as any)?.meta?.baseUnitPrice ?? null;
  const explicitUnitDiscount =
    (entry as any)?.discount ?? (entry as any)?.unitDiscount ?? (entry as any)?.discountPerUnit ?? (entry as any)?.meta?.discountPerUnit ?? null;

  let unitDiscount: number | null = null;
  let baseUnit: number | null = null;
  if (typeof explicitUnitDiscount === "number") {
    unitDiscount = Math.max(0, explicitUnitDiscount);
    baseUnit = typeof explicitBaseUnit === "number" ? explicitBaseUnit : unitFinal + unitDiscount;
  } else if (typeof explicitBaseUnit === "number") {
    baseUnit = explicitBaseUnit;
    unitDiscount = Math.max(0, baseUnit - unitFinal);
  } else {
    baseUnit = null;
    unitDiscount = null;
  }

  const money = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  function tipoLabel(t: FolioEntry["type"]) { if (t==="room_charge") return "Diária"; if (t==="product") return "Produto"; return "Serviço"; }

  return (
    <ModalBase open={open} onClose={onClose}>
      <ModalBase.Card maxWidth="max-w-xl">
        <div className="px-5 py-4 border-b border-subtle">
          <h3 className="text-lg font-semibold">Detalhes do lançamento</h3>
          <p className="text-xs opacity-70 mt-1">ID: {entry.id}</p>
        </div>

        <div className="px-5 py-5 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <Item label="Data">{when}</Item>
            <Item label="Tipo">{tipoLabel(entry.type)}</Item>
            <Item label="Descrição" className="col-span-2">
              {entry.description || "—"}
            </Item>
          </div>

          <div>
            <div className="grid grid-cols-5 px-3 py-2 text-[11px] font-semibold opacity-70 bg-black/5 dark:bg-white/5 rounded-t-xl">
              <div className="text-right">QTD.</div>
              <div className="text-right">PREÇO BASE (UN.)</div>
              <div className="text-right">DESCONTO (UN.)</div>
              <div className="text-right">PREÇO FINAL (UN.)</div>
              <div className="text-right">TOTAL</div>
            </div>
            <div className="grid grid-cols-5 px-3 py-3 rounded-b-xl border border-t-0 border-subtle tabular-nums">
              <div className="text-right">{qty}</div>
              <div className="text-right">{baseUnit != null ? money(baseUnit) : "—"}</div>
              <div className="text-right">{unitDiscount != null ? money(unitDiscount) : "—"}</div>
              <div className="text-right">{money(unitFinal)}</div>
              <div className="text-right font-medium">{money(totalFinal)}</div>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-subtle flex justify-end">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </div>
      </ModalBase.Card>
    </ModalBase>
  );
}

function Item({ label, children, align, mono, className }: { label: string; children: React.ReactNode; align?: "left" | "right"; mono?: boolean; className?: string; }) {
  return (
    <div className={className}>
      <div className="text-xs opacity-70">{label}</div>
      <div className={["mt-1", align === "right" ? "text-right" : "text-left", mono ? "tabular-nums" : ""].join(" ")}>
        {children}
      </div>
    </div>
  );
}