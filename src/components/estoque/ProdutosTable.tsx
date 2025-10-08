// src/components/estoque/ProdutosTable.tsx
"use client";
import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/components/ui/cn";
import type { ProdutoDTO } from "@/services/estoque";
import { Edit } from "lucide-react";

export function ProdutosTable({ data }: { data: ProdutoDTO[] }) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <div className="overflow-hidden rounded-2xl border-subtle border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/5">
              <tr className="text-left">
                <Th>Nome</Th>
                <Th>SKU</Th>
                <Th>Un.</Th>
                <Th>Preço venda</Th>
                <Th>Controle</Th>
                <Th>Categoria</Th>
                <Th className="text-right">Estoque</Th>
                <Th className="text-right">Ações</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
              {data.map((p) => (
                <tr key={p.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                  <Td className="font-medium">{p.name}</Td>
                  <Td className="truncate max-w-[180px]">{p.sku || "—"}</Td>
                  <Td className="whitespace-nowrap">{p.unit}</Td>
                  <Td className="tabular-nums">{money(p.salePrice)}</Td>
                  <Td>{p.stockControl ? "Sim" : "Não"}</Td>
                  <Td className="truncate max-w-[180px]">{p.category?.name ?? "—"}</Td>
                  <Td className="text-right tabular-nums">{p.stockControl ? (p.currentStock ?? 0) : "—"}</Td>
                  <Td className="text-right">
                    <Link
                      href={`/estoque/produtos/${p.id}/editar` as Route}
                      className="inline-flex p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
                      title="Editar"
                      aria-label="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                  </Td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <Td colSpan={8} className="text-center py-8 opacity-70">
                    Nenhum produto encontrado
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {data.map((p) => (
          <div key={p.id} className="surface-2">
            <div className="flex items-center justify-between gap-2">
              <div className="font-medium">{p.name}</div>
              <Link
                href={`/estoque/produtos/${p.id}/editar` as Route}
                className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
                title="Editar"
              >
                <Edit className="w-4 h-4" />
              </Link>
            </div>
            <div className="mt-1 text-sm opacity-80">
              {p.sku || "—"} • {p.unit} • {p.category?.name ?? "—"}
            </div>
            <div className="mt-1 text-sm">
              Preço: <span className="font-semibold">{money(p.salePrice)}</span>
              {p.stockControl ? (
                <span className="ml-2 opacity-80">• Estoque: {p.currentStock ?? 0}</span>
              ) : null}
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <div className="surface-2 text-center py-8 opacity-70">Nenhum produto encontrado</div>
        )}
      </div>
    </>
  );
}

function Th(props: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      {...props}
      className={cn("px-4 py-3 text-xs font-semibold uppercase tracking-wide opacity-70", props.className)}
    />
  );
}
function Td(props: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td {...props} className={cn("px-4 py-3 align-middle", props.className)} />;
}
function money(v?: number | null) {
  const n = typeof v === "number" ? v : 0;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}