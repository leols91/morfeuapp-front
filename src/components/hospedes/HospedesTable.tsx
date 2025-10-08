// src/components/hospedes/HospedesTable.tsx
"use client";
import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { Eye, Edit } from "lucide-react";
import type { HospedeDTO } from "@/services/hospedes";
import { cn } from "@/components/ui/cn";

type Props = {
  data: HospedeDTO[];
  onView: (h: HospedeDTO) => void;
};

export function HospedesTable({ data, onView }: Props) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <div className="overflow-hidden rounded-2xl border-subtle border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/5">
              <tr className="text-left">
                <Th>Nome</Th>
                <Th>Email</Th>
                <Th>Telefone</Th>
                <Th>Documento</Th>
                <Th className="text-right">Ações</Th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
              {data.map((h) => (
                <tr key={h.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                  <Td>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{h.fullName}</span>
                      {h.blacklisted ? (
                        <span className="rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300 px-2 py-0.5 text-[11px]">
                          Blacklist
                        </span>
                      ) : null}
                    </div>
                  </Td>
                  <Td className="truncate max-w-[260px]">{h.email ?? "—"}</Td>
                  <Td className="whitespace-nowrap">{h.phone ?? "—"}</Td>
                  <Td className="whitespace-nowrap">{h.documentId ?? "—"}</Td>

                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Ver */}
                      <button
                        onClick={() => onView(h)}
                        className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
                        title="Ver detalhes"
                        aria-label="Ver detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {/* Editar */}
                      <Link
                        href={`/hospedes/${h.id}/editar` as Route}
                        className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
                        title="Editar hóspede"
                        aria-label="Editar hóspede"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </div>
                  </Td>
                </tr>
              ))}

              {data.length === 0 && (
                <tr>
                  <Td colSpan={5} className="text-center py-8 opacity-70">
                    Nenhum hóspede encontrado
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {data.map((h) => (
          <div key={h.id} className="surface-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="font-medium">{h.fullName}</div>
                {h.blacklisted ? (
                  <span className="rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300 px-2 py-0.5 text-[11px]">
                    Blacklist
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onView(h)}
                  className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
                  title="Ver detalhes"
                  aria-label="Ver detalhes"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <Link
                  href={`/hospedes/${h.id}/editar` as Route}
                  className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
                  title="Editar hóspede"
                  aria-label="Editar hóspede"
                >
                  <Edit className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="mt-1 text-sm opacity-80 truncate">
              {h.email ?? "—"} • {h.phone ?? "—"}
            </div>
            <div className="mt-1 text-sm opacity-80">
              Documento: {h.documentId ?? "—"}
            </div>
          </div>
        ))}

        {data.length === 0 && (
          <div className="surface-2 text-center py-8 opacity-70">
            Nenhum hóspede encontrado
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