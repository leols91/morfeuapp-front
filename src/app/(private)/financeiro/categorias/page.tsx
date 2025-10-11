"use client";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/form/Field";
import { Th, Td, fmtDate } from "@/components/financeiro/utils";
import { Edit, Trash2 } from "lucide-react";
import {
  listFinanceCategories,
  createFinanceCategory,
  updateFinanceCategory,
  deleteFinanceCategory,
  type FinanceCategoryDTO,
} from "@/services/financeiro";
import { FinanceCategoryFormModal } from "@/components/financeiro/FinanceCategoryFormModal";
import { ConfirmModal } from "@/components/financeiro/ConfirmModal";

type KindFilter = "all" | "expense" | "revenue";

export default function FinanceCategoriesUnifiedPage() {
  const [q, setQ] = React.useState("");
  const [kind, setKind] = React.useState<KindFilter>("all");

  const { data, refetch, isFetching } = useQuery<FinanceCategoryDTO[]>({
    queryKey: ["fin-categories"],
    queryFn: () => listFinanceCategories(),
  });

  const rows = React.useMemo(() => {
    let base = data ?? [];
    if (kind !== "all") base = base.filter((c) => c.kind === kind);
    if (q.trim()) {
      const s = q.toLowerCase();
      base = base.filter(
        (c) =>
          c.name.toLowerCase().includes(s) ||
          (c.description ?? "").toLowerCase().includes(s)
      );
    }
    return base;
  }, [data, q, kind]);

  // modais
  const [openCreate, setOpenCreate] = React.useState(false);
  const [editItem, setEditItem] = React.useState<FinanceCategoryDTO | null>(null);
  const [removeItem, setRemoveItem] = React.useState<FinanceCategoryDTO | null>(null);

  async function handleDelete(it: FinanceCategoryDTO) {
    await deleteFinanceCategory(it.id, it.kind);
    setRemoveItem(null);
    refetch();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Categorias (Receitas e Despesas)</h1>
        <Button onClick={() => setOpenCreate(true)}>Nova categoria</Button>
      </div>

      <div className="surface-2">
        <form
          className="grid grid-cols-12 gap-3 items-end"
          onSubmit={(e) => {
            e.preventDefault();
            refetch();
          }}
        >
          <div className="col-span-12 md:col-span-5">
            <Field label="Buscar">
              <Input
                placeholder="Pesquisar por nome ou descrição…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </Field>
          </div>

          <div className="col-span-12 md:col-span-3">
            <Field label="Tipo">
              <Select value={kind} onChange={(e) => setKind(e.target.value as KindFilter)}>
                <option value="all">Todos</option>
                <option value="expense">Despesa</option>
                <option value="revenue">Receita</option>
              </Select>
            </Field>
          </div>

          <div className="col-span-12 md:col-span-4 flex justify-end">
            <Button type="submit" disabled={isFetching}>
              {isFetching ? "Atualizando…" : "Atualizar"}
            </Button>
          </div>
        </form>
      </div>

      <div className="surface">
        <div className="overflow-hidden rounded-2xl border-subtle border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/5">
              <tr className="text-left">
                <Th>Nome</Th>
                <Th>Tipo</Th>
                <Th>Descrição</Th>
                <Th>Criada em</Th>
                <Th className="text-right">Ações</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
              {rows.map((c) => (
                <tr key={c.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                  <Td className="font-medium">{c.name}</Td>
                  <Td className={c.kind === "expense" ? "text-rose-600 dark:text-rose-300" : "text-emerald-600 dark:text-emerald-300"}>
                    {c.kind === "expense" ? "Despesa" : "Receita"}
                  </Td>
                  <Td className="truncate max-w-[520px]">{c.description ?? "—"}</Td>
                  <Td className="whitespace-nowrap">{c.createdAt ? fmtDate(c.createdAt) : "—"}</Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
                        title="Editar categoria"
                        aria-label="Editar categoria"
                        onClick={() => setEditItem(c)}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
                        title="Remover categoria"
                        aria-label="Remover categoria"
                        onClick={() => setRemoveItem(c)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <Td colSpan={5} className="text-center py-8 opacity-70">
                    Nenhuma categoria
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {openCreate && (
        <FinanceCategoryFormModal
          open
          onClose={() => setOpenCreate(false)}
          onSaved={() => {
            setOpenCreate(false);
            refetch();
          }}
        />
      )}

      {editItem && (
        <FinanceCategoryFormModal
          open
          category={editItem}
          onClose={() => setEditItem(null)}
          onSaved={() => {
            setEditItem(null);
            refetch();
          }}
        />
      )}

      {removeItem && (
        <ConfirmModal
          open
          title="Remover categoria"
          description={`Tem certeza que deseja remover “${removeItem.name}”? Essa ação não pode ser desfeita.`}
          confirmText="Remover"
          danger
          onCancel={() => setRemoveItem(null)}
          onConfirm={() => handleDelete(removeItem)}
        />
      )}
    </div>
  );
}