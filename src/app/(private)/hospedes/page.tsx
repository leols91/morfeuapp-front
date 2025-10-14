"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { Route } from "next";

import { listHospedes, type HospedeDTO } from "@/services/hospedes";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/form/Field";
import { HospedesTable } from "@/components/hospedes/HospedesTable";
import { ViewHospedeModal } from "@/components/hospedes/ViewHospedeModal";

type StatusFilter = "all" | "ok" | "blacklisted";
type Filters = { q: string; status: StatusFilter };

const statusOptions = [
  { value: "all", label: "Todos" },
  { value: "ok", label: "Sem restrição" },
  { value: "blacklisted", label: "Blacklist" },
] as const;

export default function HospedesPage() {
  const router = useRouter();

  // -------- filtros (controlado + aplicado) --------
  const initialFilters: Filters = { q: "", status: "all" };
  const [filters, setFilters] = React.useState<Filters>(initialFilters);
  const [applied, setApplied] = React.useState<Filters>(initialFilters);

  function set<K extends keyof Filters>(k: K, v: Filters[K]) {
    setFilters((prev) => ({ ...prev, [k]: v }));
  }
  const apply = React.useCallback(() => {
    setApplied(filters);
  }, [filters]);

  const reset = () => {
    setFilters(initialFilters);
    setApplied(initialFilters);
  };

  // -------- busca (só 'q' vai ao backend) --------
  const q = useQuery({
    queryKey: ["hospedes", applied.q],
    queryFn: () => listHospedes({ q: applied.q || undefined }),
    refetchOnWindowFocus: false,
  });

  // -------- filtro de status (client-side) --------
  const filtered: HospedeDTO[] = React.useMemo(() => {
    const base = q.data ?? [];
    if (applied.status === "all") return base;
    if (applied.status === "ok") return base.filter((h) => !h.blacklisted);
    return base.filter((h) => h.blacklisted);
  }, [q.data, applied.status]);

  // -------- paginação (client-side) --------
  const [page, setPage] = React.useState(1);
  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  // reseta página quando filtros aplicados mudarem
  React.useEffect(() => {
    setPage(1);
  }, [applied.q, applied.status]);

  // -------- submit com Enter nos inputs --------
  const onEnterSubmit: React.KeyboardEventHandler<HTMLInputElement | HTMLSelectElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      apply();
    }
  };

  // -------- ver detalhes --------
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
                value={filters.q}
                onChange={(e) => set("q", e.target.value)}
                onKeyDown={onEnterSubmit}
              />
            </Field>
          </div>

          <div className="lg:col-span-3">
            <Field label="Status">
              <Select
                value={filters.status}
                onChange={(e) => set("status", e.target.value as StatusFilter)}
                onKeyDown={onEnterSubmit}
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

      {/* Tabela + paginação */}
      <div className="surface">
        {q.isLoading ? (
          <div className="p-6 text-sm opacity-70">Carregando…</div>
        ) : (
          <>
            <HospedesTable data={pageItems} onView={(h) => setViewItem(h)} />

            {/* paginação */}
            {filtered.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3">
                <div className="text-xs opacity-70">
                  Página {page} de {totalPages} — {filtered.length} registro(s)
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(1)}
                    disabled={page <= 1}
                  >
                    « Primeiro
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    Próxima
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage(totalPages)}
                    disabled={page >= totalPages}
                  >
                    Última »
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal: ver detalhes */}
      <ViewHospedeModal open={!!viewItem} onClose={() => setViewItem(null)} hospede={viewItem} />
    </div>
  );
}