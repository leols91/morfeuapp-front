"use client";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/form/Field";
import { ProdutoDTO, searchProdutos } from "@/services/estoque";
import { money } from "./utils";

export function ProductQuickAdd({
  query,
  setQuery,
  options,
  setOptions,
  openCreate,
  onPick,
  rightTotal,
}: {
  query: string;
  setQuery: (v: string) => void;
  options: ProdutoDTO[];
  setOptions: (arr: ProdutoDTO[]) => void;
  openCreate: () => void;
  onPick: (p: ProdutoDTO) => void;
  rightTotal: React.ReactNode; // total da compra (lado direito)
}) {
  // busca simples
  React.useEffect(() => {
    let active = true;
    (async () => {
      const r = await searchProdutos(query);
      if (!active) return;
      setOptions(r);
    })();
    return () => { active = false; };
  }, [query]); // eslint-disable-line

  return (
    <div className="surface">
      <div className="flex items-end justify-between gap-3">
        <Field label="Adicionar produto">
          <div className="flex gap-2">
            <Input
              className="flex-1 min-w-[420px] md:min-w-[640px]"
              placeholder="Pesquisar produto por nome ou SKU…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button type="button" variant="outline" onClick={openCreate}>
              Novo produto
            </Button>
          </div>

          {query.trim() && options.length > 0 && (
            <div className="mt-2 rounded-xl border-subtle border bg-white dark:bg-[#0F172A] shadow-soft max-h-72 overflow-auto">
              {options.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5"
                  onClick={() => {
                    setQuery("");
                    onPick(p);
                  }}
                >
                  <div className="font-medium">{p.name}</div>
                  <div className="text-[11px] opacity-70">
                    {p.sku ? `${p.sku} • ` : ""}
                    {p.unit}
                    {typeof p.costPrice === "number" ? ` • custo: ${money(p.costPrice)}` : ""}
                  </div>
                </button>
              ))}
            </div>
          )}
        </Field>

        {rightTotal}
      </div>
    </div>
  );
}