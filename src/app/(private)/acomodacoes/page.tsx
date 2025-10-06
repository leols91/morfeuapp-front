"use client";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { listAcomodacoes } from "@/services/acomodacoes";
import type { ListAcomodacoesParams, AcomodacaoDTO } from "@/types/acomodacao";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/form/Field";
import Link from "next/link";
import type { Route } from "next";
import { AcomodacoesTable } from "@/components/acomodacoes/AcomodacoesTable";
import { ViewAcomodacaoModal } from "@/components/acomodacoes/ViewAcomodacaoModal";

const statusOptions = [
  { value: "all", label: "Todos" },
  { value: "available", label: "Disponível" },
  { value: "occupied", label: "Ocupado" },
  { value: "maintenance", label: "Manutenção" },
] as const;

const tipoOptions = [
  { value: "all", label: "Todos" },
  { value: "room", label: "Quarto privado" },
  { value: "bed", label: "Cama em dormitório" },
] as const;

export default function AcomodacoesPage() {
  const initialFilters: ListAcomodacoesParams = {
    q: "",
    status: "all",
    tipo: "all",
    capMin: undefined,
    capMax: undefined,
    priceMin: undefined,
    priceMax: undefined,
  };

  // Estado de edição (inputs)
  const [filters, setFilters] = React.useState<ListAcomodacoesParams>(initialFilters);
  // Estado aplicado (alimenta a query)
  const [appliedFilters, setAppliedFilters] = React.useState<ListAcomodacoesParams>(initialFilters);

  const { data, isLoading, isFetching } = useQuery<{ data: AcomodacaoDTO[] }>({
    queryKey: ["acomodacoes", appliedFilters],
    queryFn: () => listAcomodacoes(appliedFilters),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 30_000,
  });

  // dashboard simples
  const resumo = React.useMemo(() => {
    const items: AcomodacaoDTO[] = data?.data ?? [];
    const total = items.length;
    const available = items.filter((x) => x.status === "available").length;
    const occupied = items.filter((x) => x.status === "occupied").length;
    const maintenance = items.filter((x) => x.status === "maintenance").length;
    const capTotal = items.reduce((acc: number, x: AcomodacaoDTO) => acc + (x.capacity ?? 0), 0);
    return { total, available, occupied, maintenance, capTotal };
  }, [data?.data]);

  function set<K extends keyof ListAcomodacoesParams>(k: K, v: ListAcomodacoesParams[K]) {
    setFilters((prev) => ({ ...prev, [k]: v }));
  }

  const apply = () => {
    setAppliedFilters(filters); // dispara fetch pela mudança da queryKey
  };

  const reset = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters); // refaz com tudo limpo
  };

  // modal de visualização
  const [viewItem, setViewItem] = React.useState<AcomodacaoDTO | null>(null);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Acomodações</h1>
        <Link href={"/acomodacoes/nova" as Route}>
          <Button>Novo quarto</Button>
        </Link>
      </div>

      {/* Mini dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <CardStat title="Total" value={resumo.total} />
        <CardStat title="Disponíveis" value={resumo.available} />
        <CardStat title="Ocupados" value={resumo.occupied} />
        <CardStat title="Manutenção" value={resumo.maintenance} />
        <CardStat title="Capacidade total" value={resumo.capTotal} />
      </div>

      {/* Filtros */}
      <div className="surface-2">
        <form
          className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end"
          onSubmit={(e) => {
            e.preventDefault();
            apply();
          }}
        >
          <div className="lg:col-span-3">
            <Field label="Busca">
              <Input
                placeholder="Nome, número, amenities…"
                value={filters.q || ""}
                onChange={(e) => set("q", e.target.value || "")}
              />
            </Field>
          </div>

          <div className="lg:col-span-2">
            <Field label="Status">
              <Select
                value={filters.status ?? "all"}
                onChange={(e) =>
                  set("status", e.target.value as ListAcomodacoesParams["status"])
                }
              >
                {statusOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="lg:col-span-3">
            <Field label="Tipo">
              <Select
                value={filters.tipo ?? "all"}
                onChange={(e) =>
                  set("tipo", e.target.value as ListAcomodacoesParams["tipo"])
                }
              >
                {tipoOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          {/* Botões alinhados à direita */}
          <div className="lg:col-span-4 flex justify-end gap-2 mt-1">
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
          <AcomodacoesTable
            data={data?.data ?? []}
            onView={(item) => setViewItem(item)}
          />
        )}
        {!isLoading && (data?.data?.length ?? 0) === 0 && (
          <div className="p-6 text-sm opacity-70">
            Nenhuma acomodação encontrada para os filtros informados.
          </div>
        )}
      </div>

      {/* Modal: Ver acomodação */}
      <ViewAcomodacaoModal
        open={!!viewItem}
        onClose={() => setViewItem(null)}
        item={viewItem}
      />
    </div>
  );
}

function CardStat({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl border-subtle border bg-white dark:bg-[#0F172A] p-4 shadow-soft">
      <div className="text-xs opacity-70">{title}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}