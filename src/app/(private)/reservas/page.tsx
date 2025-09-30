"use client";
import { useQuery } from "@tanstack/react-query";
import { listReservas, type ListReservasParams } from "@/services/reservas";
import { useState, useCallback } from "react";
import { ReservasTable } from "@/components/reservas/ReservasTable";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import type { Route } from "next";

const statuses = [
  { value: "all",         label: "Todos" },
  { value: "pending",     label: "Pendente" },
  { value: "confirmed",   label: "Confirmada" },
  { value: "checked_in",  label: "Check-in" },
  { value: "checked_out", label: "Check-out" },
  { value: "canceled",    label: "Cancelada" },
] as const;

const canais = [
  { value: "all",     label: "Todos" },
  { value: "Direta",  label: "Direta" },
  { value: "Booking", label: "Booking" },
  { value: "Airbnb",  label: "Airbnb" },
] as const;

export default function ReservasPage() {
  const initialFilters: ListReservasParams = { status: "all", canal: "all" };
  const [filters, setFilters] = useState<ListReservasParams>(initialFilters);

  const handleChange = useCallback(
    <K extends keyof ListReservasParams>(k: K, v: ListReservasParams[K]) => {
      setFilters((f) => ({ ...f, [k]: v }));
    },
    []
  );

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["reservas", filters],
    queryFn: () => listReservas(filters),
  });

  const reset = () => {
    setFilters(initialFilters);
    queueMicrotask(() => refetch());
  };

  return (
    <div className="space-y-4">
      {/* Header + Actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Reservas</h1>
        <Link href={"/reservas/nova" as Route}>
          <Button>Nova reserva</Button>
        </Link>
      </div>

      {/* Filtros */}
      <div className="surface-2">
        <div className="flex flex-wrap items-start gap-3">
          <div className="w-full md:w-auto">
            <label className="text-xs opacity-70 block">Período — Início</label>
            <input
              type="date"
              className="mt-1 h-9 w-full md:w-44 rounded-2xl border-subtle bg-transparent px-3"
              value={filters.from ?? ""}
              onChange={(e) => handleChange("from", e.target.value || undefined)}
            />
          </div>

          <div className="w-full md:w-auto">
            <label className="text-xs opacity-70 block">Período — Fim</label>
            <input
              type="date"
              className="mt-1 h-9 w-full md:w-44 rounded-2xl border-subtle bg-transparent px-3"
              value={filters.to ?? ""}
              onChange={(e) => handleChange("to", e.target.value || undefined)}
            />
          </div>

          <div className="w-full md:w-40">
            <label className="text-xs opacity-70 block">Status</label>
            <select
              className="mt-1 h-9 w-full rounded-2xl border-subtle bg-transparent px-3"
              value={filters.status ?? "all"}
              onChange={(e) => handleChange("status", e.target.value as ListReservasParams["status"])}
            >
              {statuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-40">
            <label className="text-xs opacity-70 block">Canal</label>
            <select
              className="mt-1 h-9 w-full rounded-2xl border-subtle bg-transparent px-3"
              value={filters.canal ?? "all"}
              onChange={(e) => handleChange("canal", e.target.value as ListReservasParams["canal"])}
            >
              {canais.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Ações */}
          <div className="ml-auto flex items-end mt-2 gap-2 w-full md:w-auto">
            <Button variant="ghost" onClick={reset}>
              Limpar
            </Button>
            <Button onClick={() => refetch()} disabled={isLoading || isFetching}>
              {isLoading || isFetching ? "Filtrando..." : "Aplicar"}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="surface">
        {isLoading ? (
          <div className="p-6 text-sm opacity-70">Carregando…</div>
        ) : (
          <ReservasTable data={data?.data ?? []} />
        )}
        {!isLoading && (data?.data?.length ?? 0) === 0 && (
          <div className="p-6 text-sm opacity-70">Nenhuma reserva encontrada para os filtros informados.</div>
        )}
      </div>
    </div>
  );
}