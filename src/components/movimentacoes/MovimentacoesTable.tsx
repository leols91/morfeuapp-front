"use client";
import * as React from "react";
import { cn } from "@/components/ui/cn";
import { Button } from "@/components/ui/Button";
import { fmtNumber, fmtDateTime, fmtMoney } from "./utils";
import type { StockMovementDTO } from "@/services/estoque";

type MovementMaybePurchase = StockMovementDTO & {
  purchaseId?: string;
  purchaseSummary?: { supplierName?: string | null };
};

type Props = {
  rows: MovementMaybePurchase[];
  onOpenPurchase: (id: string, row?: MovementMaybePurchase) => void;
};

export default function MovimentacoesTable({ rows, onOpenPurchase }: Props) {
  if (!rows || rows.length === 0)
    return (
      <div className="surface mt-3 p-8 text-center opacity-70 border border-dashed rounded-2xl">
        Nenhuma movimentação encontrada
      </div>
    );

  return (
    <div className="surface mt-3">
      <div className="overflow-hidden rounded-2xl border-subtle border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-white/5">
            <tr className="text-left">
              <Th>Data</Th>
              <Th>Produto / Compra</Th>
              <Th>Tipo</Th>
              <Th className="text-right">Qtd</Th>
              <Th className="text-right">Custo (un)</Th>
              <Th>Obs.</Th>
              <Th className="text-right">Ações</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/10">
            {rows.map((m) => {
              const isPurchase = Boolean(m.purchaseId);

              // Texto principal da coluna: "Compra" quando veio de compra; senão o nome do produto (fallbacks)
              const mainLabel =
                isPurchase
                  ? "Compra"
                  : m.produto?.name && m.produto.name.trim() !== ""
                  ? m.produto.name
                  : m.typeCode === "out"
                  ? "Venda"
                  : "Entrada";

              return (
                <tr key={m.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                  <Td className="whitespace-nowrap">{fmtDateTime(m.createdAt)}</Td>

                  {/* Produto / Compra */}
                  <Td className="truncate max-w-[340px]">
                    <div className="flex flex-col">
                      <span className="font-medium">{mainLabel}</span>
                      {isPurchase && m.purchaseSummary?.supplierName && (
                        <span className="text-[11px] opacity-70">
                          Fornecedor: {m.purchaseSummary.supplierName}
                        </span>
                      )}
                    </div>
                  </Td>

                  {/* Tipo com cor */}
                  <Td
                    className={cn(
                      m.typeCode === "in"
                        ? "text-emerald-600 dark:text-emerald-300"
                        : "text-rose-600 dark:text-rose-300"
                    )}
                  >
                    {m.typeCode === "in" ? "Entrada" : "Saída"}
                  </Td>

                  {/* Quantidade / Custo / Observações */}
                  <Td className="text-right tabular-nums">{fmtNumber(m.quantity)}</Td>
                  <Td className="text-right tabular-nums">{fmtMoney(m.unitCost)}</Td>
                  <Td className="truncate max-w-[300px]">{m.note ?? "—"}</Td>

                  {/* Ações */}
                  <Td className="text-right">
                    {isPurchase ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onOpenPurchase(m.purchaseId!, m)}
                      >
                        Detalhes
                      </Button>
                    ) : (
                      <span className="text-xs opacity-50">—</span>
                    )}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* Helpers locais de célula/thead para manter o estilo consistente */
function Th(props: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      {...props}
      className={cn(
        "px-4 py-3 text-xs font-semibold uppercase tracking-wide opacity-70",
        props.className
      )}
    />
  );
}

function Td(props: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td {...props} className={cn("px-4 py-3 align-middle", props.className)} />;
}