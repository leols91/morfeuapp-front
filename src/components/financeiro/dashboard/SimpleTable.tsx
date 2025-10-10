"use client";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import { money, fmtDate, type APItem } from "@/components/financeiro/utils";

export function SimpleTable({
  items,
  onPay,
}: {
  items: APItem[];
  onPay: (i: APItem) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-gray-50/50 dark:bg-white/5">
          <tr className="text-left">
            {/* Removido: <Th>Descrição</Th> */}
            <Th>Fornecedor</Th>
            <Th className="text-right">Valor</Th>
            <Th>Vencimento</Th>
            <Th className="text-right">Ações</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100/60 dark:divide-white/10">
          {items.map((i) => (
            <tr key={i.id} className="hover:bg-black/5 dark:hover:bg-white/5">
              {/* Removido TD da descrição */}
              <Td className="truncate max-w-[220px]">{i.supplier ?? "—"}</Td>
              <Td className="text-right tabular-nums">{money(i.amount)}</Td>
              <Td className="whitespace-nowrap">{fmtDate(i.dueDate)}</Td>
              <Td className="text-right">
                <Button size="sm" variant="outline" onClick={() => onPay(i)}>
                  Pagar
                </Button>
              </Td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <Td colSpan={4} className="text-center py-8 opacity-70">
                Nenhum registro
              </Td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

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