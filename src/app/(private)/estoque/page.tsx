// src/app/estoque/page.tsx
"use client";
import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/form/Field";
import {
  listProdutos,
  listProductCategories,
  type ListProdutosParams,
  type ProdutoDTO,
} from "@/services/estoque";
import { ProdutosTable } from "@/components/estoque/ProdutosTable";
import EstoqueMenu from "@/components/estoque/EstoqueMenu";

export default function EstoquePage() {
  const initial: ListProdutosParams = { q: "", categoryId: "all", stockControl: "all" };
  const [filters, setFilters] = React.useState<ListProdutosParams>(initial);
  const [applied, setApplied] = React.useState<ListProdutosParams>(initial);

  const { data, isLoading, isFetching } = useQuery<{ data: ProdutoDTO[] }>({
    queryKey: ["produtos", applied],
    queryFn: () => listProdutos(applied),
    refetchOnWindowFocus: false,
  });

  const catQ = useQuery({
    queryKey: ["productCategories"],
    queryFn: listProductCategories,
    refetchOnWindowFocus: false,
  });

  function set<K extends keyof ListProdutosParams>(k: K, v: ListProdutosParams[K]) {
    setFilters((p) => ({ ...p, [k]: v }));
  }

  const apply = () => setApplied(filters);
  const reset = () => { setFilters(initial); setApplied(initial); };

  const items = data?.data ?? [];
  const resumo = React.useMemo(() => {
    const total = items.length;
    const controlados = items.filter((i) => i.stockControl).length;
    const semControle = total - controlados;
    return { total, controlados, semControle };
  }, [items]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold">Produtos / Estoque</h1>
          <EstoqueMenu />
        </div>
        <div className="flex gap-2">
          <Link href={"/estoque/compras/nova" as Route}>
            <Button>Nova compra</Button>
          </Link>
          <Link href={"/estoque/movimentacoes" as Route}>
            <Button variant="outline">Movimentações</Button>
          </Link>
          <Link href={"/estoque/produtos/novo" as Route}>
            <Button>Novo produto</Button>
          </Link>
        </div>
      </div>


      

      {/* Mini dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <CardStat title="Produtos" value={resumo.total} />
        <CardStat title="Com controle de estoque" value={resumo.controlados} />
        <CardStat title="Sem controle de estoque" value={resumo.semControle} />
      </div>

      {/* Filtros */}
      <div className="surface-2">
        <form
          className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end"
          onSubmit={(e) => { e.preventDefault(); apply(); }}
        >
          <div className="lg:col-span-4">
            <Field label="Busca">
              <Input
                placeholder="Nome, SKU…"
                value={filters.q || ""}
                onChange={(e) => set("q", e.target.value || "")}
              />
            </Field>
          </div>
          <div className="lg:col-span-4">
            <Field label="Categoria">
              <Select
                value={filters.categoryId ?? "all"}
                onChange={(e) => set("categoryId", e.target.value as any)}
                disabled={catQ.isLoading || catQ.isError}
              >
                <option value="all">Todas</option>
                {catQ.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </Field>
          </div>
          <div className="lg:col-span-2">
            <Field label="Controle de estoque">
              <Select
                value={filters.stockControl ?? "all"}
                onChange={(e) => set("stockControl", e.target.value as any)}
              >
                <option value="all">Todos</option>
                <option value="controlled">Apenas controlados</option>
                <option value="not_controlled">Sem controle</option>
              </Select>
            </Field>
          </div>
          <div className="lg:col-span-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={reset}>Limpar</Button>
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
          <ProdutosTable data={items} />
        )}
        {!isLoading && items.length === 0 && (
          <div className="p-6 text-sm opacity-70">Nenhum produto encontrado.</div>
        )}
      </div>
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