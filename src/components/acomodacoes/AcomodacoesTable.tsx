"use client";
import * as React from "react";
import type { AcomodacaoDTO } from "@/types/acomodacao";
import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/components/ui/cn";
import { Eye, Edit } from "lucide-react";
import ModalBase from "@/components/ui/ModalBase";
import { Button } from "@/components/ui/Button";

export function AcomodacoesTable({
  data,
  onView,
}: {
  data: AcomodacaoDTO[];
  onView: (item: AcomodacaoDTO) => void;
}) {
  const [amenitiesModal, setAmenitiesModal] = React.useState<{ open: boolean; item: AcomodacaoDTO | null; }>({ open: false, item: null });
  const openAmenitiesModal = (item: AcomodacaoDTO) => setAmenitiesModal({ open: true, item });
  const closeAmenitiesModal = () => setAmenitiesModal({ open: false, item: null });

  const AMENITIES_PREVIEW = 4;

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <div className="overflow-hidden rounded-2xl border-subtle border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/5">
              <tr className="text-left">
                <Th>Codigo</Th>
                <Th>Nome</Th>
                <Th>Cap.</Th>
                <Th>Tipo</Th>
                <Th>Status</Th>
                <Th>Amenidade</Th>
                <Th className="text-right">Ações</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
              {data.map((r) => {
                const am = r.amenities ?? [];
                const preview = am.slice(0, AMENITIES_PREVIEW);
                const rest = am.length - preview.length;

                return (
                  <tr key={r.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <Td className="font-medium">{r.code}</Td>
                    <Td className="truncate max-w-[220px]">{r.name}</Td>
                    <Td className="tabular-nums">{r.capacity ?? "—"}</Td>
                    <Td>{typeLabel(r.type)}</Td>
                    <Td><Badge status={r.status} /></Td>
                    <Td className="max-w-[360px]">
                      {am.length === 0 ? (
                        <span className="opacity-70">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {preview.map((a, i) => (
                            <span
                              key={`${a}-${i}`}
                              className="inline-flex items-center rounded-full border border-gray-200 dark:border-white/10 px-2.5 py-1 text-xs"
                            >
                              {a}
                            </span>
                          ))}
                          {rest > 0 && (
                            <button
                              type="button"
                              onClick={() => openAmenitiesModal(r)}
                              className="text-xs underline opacity-80 hover:opacity-100"
                              title="Ver todas as amenidades"
                            >
                              +{rest} ver mais
                            </button>
                          )}
                        </div>
                      )}
                    </Td>
                    <Td className="text-right">
                      <div className="flex items-center justify-end gap-2">
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
                    </Td>
                  </tr>
                );
              })}
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
        {data.map((r) => {
          const am = r.amenities ?? [];
          const preview = am.slice(0, AMENITIES_PREVIEW);
          const rest = am.length - preview.length;

          return (
            <div key={r.id} className="surface-2">
              <div className="flex items-center justify-between gap-3">
                <div className="font-medium">{r.code}</div>
                <Badge status={r.status} />
              </div>

              <div className="mt-0.5 text-sm">{r.name}</div>

              <div className="mt-1 text-sm opacity-80">
                {typeLabel(r.type)} • Cap.: {r.capacity ?? "—"}
              </div>

              <div className="mt-2 text-sm">
                {am.length === 0 ? (
                  <span className="opacity-70">Amenidades: —</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {preview.map((a, i) => (
                      <span
                        key={`${a}-${i}`}
                        className="inline-flex items-center rounded-full border border-gray-200 dark:border-white/10 px-2 py-0.5 text-[11px]"
                      >
                        {a}
                      </span>
                    ))}
                    {rest > 0 && (
                      <button
                        type="button"
                        onClick={() => openAmenitiesModal(r)}
                        className="text-[12px] underline opacity-80 hover:opacity-100"
                      >
                        +{rest} ver mais
                      </button>
                    )}
                  </div>
                )}
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
          );
        })}
        {data.length === 0 && (
          <div className="surface-2 text-center py-8 opacity-70">
            Nenhum item encontrado
          </div>
        )}
      </div>

      {/* Modal Amenidades */}
      {amenitiesModal.open && amenitiesModal.item && (
        <ModalBase open={amenitiesModal.open} onClose={closeAmenitiesModal}>
          <div className="w-[min(92vw,560px)] rounded-2xl bg-white dark:bg-[#0F172A] border border-gray-200/70 dark:border-white/10 shadow-soft">
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-200/70 dark:border-white/10">
              <h3 className="text-sm font-semibold">
                Amenidades — {amenitiesModal.item.code} • {amenitiesModal.item.name}
              </h3>
              <button
                type="button"
                onClick={closeAmenitiesModal}
                className="rounded-lg px-2 py-1 text-sm hover:bg-black/5 dark:hover:bg-white/10"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              {!(amenitiesModal.item.amenities?.length ?? 0) ? (
                <div className="text-sm opacity-70">
                  Nenhuma amenidade cadastrada para esta acomodação.
                </div>
              ) : (
                <div className="max-h-[50vh] overflow-auto pr-1">
                  <div className="flex flex-wrap gap-2">
                    {amenitiesModal.item.amenities!.map((a, i) => (
                      <span
                        key={`${a}-${i}`}
                        className="inline-flex items-center rounded-full border border-gray-200 dark:border-white/10 px-3 py-1 text-sm"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-4 flex justify-end">
                <Button type="button" onClick={closeAmenitiesModal}>
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </ModalBase>
      )}
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

function typeLabel(t: AcomodacaoDTO["type"]) {
  if (t === "room") return "Quarto privado";
  if (t === "bed") return "Cama/Dormitório";
  return t;
}

function Badge({ status }: { status: AcomodacaoDTO["status"] }) {
  const map: Record<AcomodacaoDTO["status"], string> = {
    available: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    occupied: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
    maintenance: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold shadow-[0_1px_0_0_rgba(0,0,0,0.03)]",
        map[status] ?? "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30"
      )}
    >
      {status === "available" ? "Disponível" : status === "occupied" ? "Ocupado" : status === "maintenance" ? "Manutenção" : status}
    </span>
  );
}