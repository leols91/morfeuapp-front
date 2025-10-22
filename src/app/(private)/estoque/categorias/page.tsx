"use client";
import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import {
  listProductCategories,
  deleteProductCategory,
  type ProductCategoryDTO,
} from "@/services/estoque";
import EstoqueMenu from "@/components/estoque/EstoqueMenu";

export default function CategoriasPage() {
  const q = useQuery<ProductCategoryDTO[]>({
    queryKey: ["productCategories"],
    queryFn: listProductCategories,
    refetchOnWindowFocus: false,
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      await deleteProductCategory(id);
    },
    onSuccess: () => {
      toast.success("Categoria excluída.");
      q.refetch();
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? "Falha ao excluir categoria."),
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Categorias de produtos</h1>
        <div className="flex gap-2">
          <Link href={"/estoque/categorias/nova" as Route}>
            <Button>Nova categoria</Button>
          </Link>
        </div>
      </div>

      <EstoqueMenu />

      {/* Tabela */}
      <div className="surface mt-3">
        <div className="overflow-hidden rounded-2xl border-subtle border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/5">
              <tr className="text-left">
                <Th>Nome</Th>
                <Th className="text-right">Ações</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
              {(q.data ?? []).map((c) => (
                <tr key={c.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                  <Td className="font-medium">{c.name}</Td>
                  <Td className="text-right">
                    <Link
                      href={`/estoque/categorias/${c.id}/editar` as Route}
                      className="inline-flex mr-2 p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
                    >
                      Editar
                    </Link>
                    <button
                      className="inline-flex p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-rose-600"
                      onClick={() => {
                        if (confirm(`Excluir a categoria "${c.name}"?`)) {
                          del.mutate(c.id);
                        }
                      }}
                      disabled={del.isPending}
                    >
                      Excluir
                    </button>
                  </Td>
                </tr>
              ))}
              {(q.data?.length ?? 0) === 0 && !q.isLoading && (
                <tr>
                  <Td colSpan={2} className="text-center py-8 opacity-70">
                    Nenhuma categoria cadastrada
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
          {q.isLoading && (
            <div className="p-6 text-sm opacity-70">Carregando categorias…</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* helpers locais */
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