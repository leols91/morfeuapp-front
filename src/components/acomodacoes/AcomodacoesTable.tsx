"use client";
import * as React from "react";
import type { AcomodacaoDTO } from "@/types/acomodacao";
import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/components/ui/cn";
import { Eye, Edit } from "lucide-react";

export function AcomodacoesTable({
  data,
  onView,
}: {
  data: AcomodacaoDTO[];
  onView: (item: AcomodacaoDTO) => void;
}) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <div className="overflow-hidden rounded-2xl border-subtle border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/5">
              <tr className="text-left">
                <Th>Nome</Th>
                <Th>Tipo</Th>
                <Th>Cap.</Th>
                <Th>Preço</Th>
                <Th>Status</Th>
                <Th>Amenidades</Th>
                <Th className="text-right">Ações</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
              {data.map((r) => (
                <tr key={r.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                  <Td className="font-medium">{r.name}</Td>
                  <Td>{typeLabel(r.type)}</Td>
                  <Td className="tabular-nums">{r.capacity ?? "—"}</Td>
                  <Td className="tabular-nums">{money(r.basePrice)}</Td>
                  <Td>
                    <Badge status={r.status} />
                  </Td>
                  <Td className="truncate max-w-[280px]">
                    {r.amenities?.length ? r.amenities.join(", ") : "—"}
                  </Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Ver */}
                      <button
                        onClick={() => onView(r)}
                        className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
                        title="Ver detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {/* Editar */}
                      <Link
                        href={`/acomodacoes/${r.id}/editar` as Route}
                        className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </div>
                  </Td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <Td colSpan={7} className="text-center py-8 opacity-70">
                    Nenhum item encontrado
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {data.map((r) => (
          <div key={r.id} className="surface-2">
            <div className="flex items-center justify-between gap-3">
              <div className="font-medium">{r.name}</div>
              <Badge status={r.status} />
            </div>
            <div className="mt-1 text-sm opacity-80">
              {typeLabel(r.type)} • Cap.: {r.capacity ?? "—"}
            </div>
            <div className="mt-1 text-sm">
              Preço: <span className="font-semibold">{money(r.basePrice)}</span>
            </div>
            <div className="mt-1 text-sm opacity-80 truncate">
              {r.amenities?.length ? r.amenities.join(", ") : "—"}
            </div>

            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                onClick={() => onView(r)}
                className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
                title="Ver detalhes"
              >
                <Eye className="w-4 h-4" />
              </button>
              <Link
                href={`/acomodacoes/${r.id}/editar` as Route}
                className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
                title="Editar"
              >
                <Edit className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <div className="surface-2 text-center py-8 opacity-70">
            Nenhum item encontrado
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
  return (
    <td
      {...props}
      className={cn("px-4 py-3 align-middle", props.className)}
    />
  );
}

function money(v?: number | null) {
  const n = typeof v === "number" ? v : 0;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function typeLabel(t: AcomodacaoDTO["type"]) {
  if (t === "room") return "Quarto privado";
  if (t === "bed") return "Cama/Dormitório";
  return t;
}
function Badge({ status }: { status: AcomodacaoDTO["status"] }) {
  const map: Record<AcomodacaoDTO["status"], string> = {
    available:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    occupied:
      "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
    maintenance:
      "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold shadow-[0_1px_0_0_rgba(0,0,0,0.03)]",
        map[status] ??
          "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30"
      )}
    >
      {status === "available"
        ? "Disponível"
        : status === "occupied"
        ? "Ocupado"
        : status === "maintenance"
        ? "Manutenção"
        : status}
    </span>
  );
}