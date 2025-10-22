"use client";
import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { Edit } from "lucide-react";
import { cn } from "@/components/ui/cn";
import type { SupplierDTO } from "@/services/estoque";

export function SuppliersTable({ data }: { data: SupplierDTO[] }) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <div className="overflow-hidden rounded-2xl border-subtle border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/5">
              <tr className="text-left">
                <Th>Nome/Razão social</Th>
                <Th>Documento</Th>
                <Th>E-mail</Th>
                <Th>Telefone</Th>
                <Th className="text-right">Ações</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
              {data.map((s) => (
                <tr key={s.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                  <Td className="font-medium">{s.legalName}</Td>
                  <Td className="truncate max-w-[160px]">{s.documentId ?? "—"}</Td>
                  <Td className="truncate max-w-[220px]">{s.email ?? "—"}</Td>
                  <Td className="truncate max-w-[140px]">{s.phone ?? "—"}</Td>
                  <Td className="text-right">
                    <Link
                      href={`/estoque/fornecedores/${s.id}/editar` as Route}
                      className="inline-flex p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg.white/10"
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
                  <Td colSpan={5} className="text-center py-8 opacity-70">
                    Nenhum fornecedor encontrado
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {data.map((s) => (
          <div key={s.id} className="surface-2">
            <div className="flex items-center justify-between gap-2">
              <div className="font-medium">{s.legalName}</div>
              <Link
                href={`/estoque/fornecedores/${s.id}/editar` as Route}
                className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg.white/10"
                title="Editar"
              >
                <Edit className="w-4 h-4" />
              </Link>
            </div>
            <div className="mt-1 text-sm opacity-80">
              {(s.documentId ?? "—") + " • " + (s.phone ?? "—")}
            </div>
            <div className="mt-1 text-sm">{s.email ?? "—"}</div>
          </div>
        ))}
        {data.length === 0 && (
          <div className="surface-2 text-center py-8 opacity-70">
            Nenhum fornecedor encontrado
          </div>
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