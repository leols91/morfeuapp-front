"use client";
import * as React from "react";
import { Input } from "@/components/ui/form/Field";
import { ItemRow } from "./types";
import { money } from "./utils";

function Th(props: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      {...props}
      className={
        "px-4 py-3 text-xs font-semibold uppercase tracking-wide opacity-70 " +
        (props.className ?? "")
      }
    />
  );
}
function Td(props: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td {...props} className={"px-4 py-3 align-middle " + (props.className ?? "")} />;
}

export function ItemsTable({
  items,
  toNum,
  setRowNumber,
  removeRow,
}: {
  items: ItemRow[];
  toNum: (s: string) => number;
  setRowNumber: (rowId: string, k: "quantity" | "unitCost", v: number) => void;
  removeRow: (rowId: string) => void;
}) {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border-subtle border">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-white/5">
          <tr className="text-left">
            <Th>Produto</Th>
            <Th>Unid.</Th>
            <Th className="text-right">Qtde</Th>
            <Th className="text-right">Custo unit.</Th>
            <Th className="text-right">Total</Th>
            <Th className="text-right">Ações</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-white/10">
          {items.map((it) => {
            const lineTotal = (it.quantity || 0) * (it.unitCost || 0);
            return (
              <tr key={it.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                <Td className="font-medium">{it.produto.name}</Td>
                <Td className="whitespace-nowrap">{it.unit}</Td>

                <Td className="text-right">
                  <Input
                    inputMode="decimal"
                    className="text-right tabular-nums"
                    value={String(it.quantity)}
                    onChange={(e) => setRowNumber(it.id, "quantity", Math.max(0, toNum(e.target.value)))}
                  />
                </Td>

                <Td className="text-right">
                  <Input
                    inputMode="decimal"
                    className="text-right tabular-nums"
                    value={String(it.unitCost)}
                    onChange={(e) => setRowNumber(it.id, "unitCost", Math.max(0, toNum(e.target.value)))}
                  />
                </Td>

                <Td className="text-right tabular-nums">{money(lineTotal)}</Td>

                <Td className="text-right">
                  <button
                    type="button"
                    className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg白/10"
                    onClick={() => removeRow(it.id)}
                    title="Remover"
                  >
                    Remover
                  </button>
                </Td>
              </tr>
            );
          })}
          {items.length === 0 && (
            <tr>
              <Td colSpan={6} className="text-center py-8 opacity-70">
                Nenhum item adicionado ainda
              </Td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}