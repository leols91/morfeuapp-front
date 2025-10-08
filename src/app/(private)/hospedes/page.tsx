"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { listHospedes, type ListHospedesParams, type HospedeDTO } from "@/services/hospedes";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/form/Field";
import { HospedesTable } from "@/components/hospedes/HospedesTable";
import { ViewHospedeModal } from "@/components/hospedes/ViewHospedeModal";
import type { Route } from "next";

const statusOptions = [
  { value: "all", label: "Todos" },
  { value: "ok", label: "Sem restrição" },
  { value: "blacklisted", label: "Blacklist" },
] as const;

export default function HospedesPage() {
  const router = useRouter();

  const initialFilters: ListHospedesParams = { q: "", status: "all" };
  const [filters, setFilters] = React.useState<ListHospedesParams>(initialFilters);
  const [applied, setApplied] = React.useState<ListHospedesParams>(initialFilters);

  const q = useQuery({
    queryKey: ["hospedes", applied],
    queryFn: () => listHospedes(applied),
    refetchOnWindowFocus: false,
  });

  function set<K extends keyof ListHospedesParams>(k: K, v: ListHospedesParams[K]) {
    setFilters((prev) => ({ ...prev, [k]: v }));
  }
  const apply = () => setApplied(filters);
  const reset = () => { setFilters(initialFilters); setApplied(initialFilters); };

  const [viewItem, setViewItem] = React.useState<HospedeDTO | null>(null);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Hóspedes</h1>
        <Button onClick={() => router.push("/hospedes/novo" as Route)}>Novo hóspede</Button>
      </div>

      {/* Filtros */}
      <div className="surface-2">
        <form
          className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end"
          onSubmit={(e) => { e.preventDefault(); apply(); }}
        >
          <div className="lg:col-span-6">
            <Field label="Busca">
              <Input
                placeholder="Nome, e-mail, telefone, documento…"
                value={filters.q || ""}
                onChange={(e) => set("q", e.target.value || "")}
              />
            </Field>
          </div>

          <div className="lg:col-span-3">
            <Field label="Status">
              <Select
                value={filters.status ?? "all"}
                onChange={(e) => set("status", e.target.value as ListHospedesParams["status"])}
              >
                {statusOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="lg:col-span-3 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={reset}>Limpar</Button>
            <Button type="submit" disabled={q.isLoading || q.isFetching}>
              {q.isLoading || q.isFetching ? "Filtrando…" : "Aplicar"}
            </Button>
          </div>
        </form>
      </div>

      {/* Tabela */}
      <div className="surface">
        {q.isLoading ? (
          <div className="p-6 text-sm opacity-70">Carregando…</div>
        ) : (
          <HospedesTable
            data={q.data?.data ?? []}
            onView={(h) => setViewItem(h)}
          />
        )}
        {!q.isLoading && (q.data?.data?.length ?? 0) === 0 && (
          <div className="p-6 text-sm opacity-70">Nenhum hóspede encontrado para os filtros informados.</div>
        )}
      </div>

      {/* Modal: ver detalhes */}
      <ViewHospedeModal open={!!viewItem} onClose={() => setViewItem(null)} hospede={viewItem} />
    </div>
  );
}