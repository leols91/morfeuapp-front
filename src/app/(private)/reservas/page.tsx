"use client";
import { useQuery } from "@tanstack/react-query";
import { listReservas, type ListReservasParams } from "@/services/reservas";
import { useState, useCallback } from "react";
import { ReservasTable } from "@/components/reservas/ReservasTable";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import type { Route } from "next";

// 🔧 kit de form padronizado
import { Field, Input, Select } from "@/components/ui/form/Field";

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

  function submit(e: React.FormEvent) {
    e.preventDefault();
    refetch();
  }

  return (
    <div className="space-y-4">
      {/* Header + Actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Reservas</h1>
        <Link href={"/reservas/nova" as Route}>
          <Button>Nova reserva</Button>
        </Link>
      </div>

      {/* Filtros – agora com Field/Input/Select */}
      <div className="surface-2">
        <form onSubmit={submit} className="grid grid-cols-1 gap-3 md:grid-cols-[repeat(4,auto)_1fr] items-end">
          <Field label="Período — Início" className="w-full md:w-44">
            <Input
              type="date"
              value={filters.from ?? ""}
              onChange={(e) => handleChange("from", e.target.value || undefined)}
            />
          </Field>

          <Field label="Período — Fim" className="w-full md:w-44">
            <Input
              type="date"
              value={filters.to ?? ""}
              onChange={(e) => handleChange("to", e.target.value || undefined)}
            />
          </Field>

          <Field label="Status" className="w-full md:w-44">
            <Select
              value={filters.status ?? "all"}
              onChange={(e) => handleChange("status", e.target.value as ListReservasParams["status"])}
            >
              {statuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Canal" className="w-full md:w-44">
            <Select
              value={filters.canal ?? "all"}
              onChange={(e) => handleChange("canal", e.target.value as ListReservasParams["canal"])}
            >
              {canais.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </Field>

          {/* Ações */}
          <div className="ml-auto flex items-end gap-2">
            <Button type="button" variant="ghost" onClick={reset}>
              Limpar
            </Button>
            <Button type="submit" disabled={isLoading || isFetching}>
              {isLoading || isFetching ? "Filtrando…" : "Aplicar"}
            </Button>
          </div>
        </form>
      </div>

      {/* Tabela */}
      <div className="surface">
        {isLoading ? (
          <div className="p-6 text-sm opacity-70">Carregando…</div>
        ) : (
          <ReservasTable data={data?.data ?? []} />
        )}
        {!isLoading && (data?.data?.length ?? 0) === 0 && (
          <div className="p-6 text-sm opacity-70">
            Nenhuma reserva encontrada para os filtros informados.
          </div>
        )}
      </div>
    </div>
  );
}