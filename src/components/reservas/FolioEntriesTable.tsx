"use client";
import * as React from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
import type { FolioEntry } from "@/types/reserva";
import { formatCurrency, formatDateHM, getQty, mapTipo } from "@/lib/format";

type Props = {
  entries: FolioEntry[];
  onView: (entry: FolioEntry) => void;
  onEdit: (entry: FolioEntry) => void;
  onDelete: (id: string) => void;
};

export function FolioEntriesTable({ entries, onView, onEdit, onDelete }: Props) {
  return (
    <div className="surface-2">
      <h3 className="font-semibold mb-2">Lançamentos</h3>

      <div className="rounded-2xl border border-subtle overflow-hidden">
        {/* Cabeçalho */}
        <div className="grid grid-cols-12 px-3 py-2 text-xs font-semibold opacity-70 bg-black/5 dark:bg-white/5">
          <div className="col-span-6 md:col-span-3">DATA</div>
          <div className="col-span-6 md:col-span-2">TIPO</div>
          <div className="hidden md:block md:col-span-3">DESCRIÇÃO</div>
          <div className="hidden md:block md:col-span-1 text-right">QTD.</div>
          <div className="col-span-6 md:col-span-2 text-right mr-4">VALOR</div>
          <div className="col-span-6 md:col-span-1 text-right">AÇÕES</div>
        </div>

        {/* Linhas */}
        <div className="divide-y divide-subtle/30">
          {entries.map((e) => {
            const qty = getQty(e);
            const total = e.amount;
            return (
              <div
                key={e.id}
                className="grid grid-cols-12 items-center px-3 py-3 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              >
                <div className="col-span-6 md:col-span-3 whitespace-nowrap">
                  {formatDateHM(e.createdAt)}
                </div>
                <div className="col-span-6 md:col-span-2">{mapTipo(e.type)}</div>
                <div className="hidden md:block md:col-span-3 pr-2">
                  <div className="truncate max-w-[28ch]">{e.description}</div>
                </div>
                <div className="hidden md:block md:col-span-1 text-right tabular-nums">
                  {qty}
                </div>
                <div className="col-span-6 md:col-span-2 text-right font-medium whitespace-nowrap tabular-nums pr-4">
                  {formatCurrency(total)}
                </div>
                <div className="col-span-6 md:col-span-1 flex justify-end gap-2 shrink-0">
                  <IconBtn title="Ver detalhes" onClick={() => onView(e)}>
                    <Eye className="h-4 w-4" />
                  </IconBtn>
                  <IconBtn title="Editar lançamento" onClick={() => onEdit(e)}>
                    <Edit className="h-4 w-4" />
                  </IconBtn>
                </div>
              </div>
            );
          })}
          {entries.length === 0 && (
            <div className="px-4 py-6 text-center text-sm opacity-70">
              Nenhum lançamento encontrado
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IconBtn({
  title,
  children,
  onClick,
}: {
  title: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
      title={title}
      aria-label={title}
      onClick={onClick}
    >
      {children}
    </button>
  );
}