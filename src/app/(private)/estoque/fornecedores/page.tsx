"use client";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { Route } from "next";

import { listSuppliers, type SupplierDTO } from "@/services/estoque";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/form/Field";
import { SuppliersTable } from "@/components/suppliers/SuppliersTable";
import EstoqueMenu from "@/components/estoque/EstoqueMenu";

export default function FornecedoresPage() {
  const [q, setQ] = React.useState("");
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => listSuppliers(),
    refetchOnWindowFocus: false,
  });

  const filtered: SupplierDTO[] = React.useMemo(() => {
    const base = data ?? [];
    const s = q.trim().toLowerCase();
    if (!s) return base;
    return base.filter((x) =>
      [x.legalName, x.documentId ?? "", x.email ?? "", x.phone ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(s)
    );
  }, [data, q]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold">Fornecedores</h1>
          <EstoqueMenu />
        </div>
        <Link href={"/estoque/fornecedores/novo" as Route}>
          <Button>Novo fornecedor</Button>
        </Link>
      </div>

      {/* Filtro simples */}
      <div className="surface-2">
        <form
          className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="lg:col-span-9">
            <Field label="Busca">
              <Input
                placeholder="Nome, documento, e-mail, telefone…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </Field>
          </div>
          <div className="lg:col-span-3 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setQ("")}
              disabled={!q}
            >
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
          <SuppliersTable data={filtered} />
        )}
        {!isLoading && filtered.length === 0 && (
          <div className="p-6 text-sm opacity-70">Nenhum fornecedor encontrado.</div>
        )}
      </div>
    </div>
  );
}