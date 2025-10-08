// src/app/estoque/produtos/[id]/editar/page.tsx
"use client";
import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/form/Field";
import {
  getProduto,
  updateProduto,
  listProductCategories,
  deleteProduto, // 👈 novo
} from "@/services/estoque";
import { ConfirmDeleteProdutoModal } from "@/components/estoque/ConfirmDeleteProdutoModal"; // 👈 novo

const schema = z.object({
  name: z.string().min(1, "Informe o nome"),
  sku: z.string().optional().or(z.literal("")),
  unit: z.string().min(1, "Informe a unidade"),
  salePrice: z.coerce.number().min(0),
  costPrice: z
    .coerce
    .number()
    .optional()
    .or(z.nan())
    .transform((v) => (Number.isNaN(v) ? undefined : v)),
  stockControl: z.enum(["yes", "no"]).default("yes"),
  categoryId: z.string().min(1, "Selecione a categoria"),
});
type FormInput = z.input<typeof schema>;
type FormOutput = z.infer<typeof schema>;

export default function EditarProdutoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const q = useQuery({
    queryKey: ["produto", id],
    queryFn: () => getProduto(id),
    enabled: !!id,
  });

  const catQ = useQuery({
    queryKey: ["productCategories"],
    queryFn: listProductCategories,
  });

  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      sku: "",
      unit: "UN",
      salePrice: 0,
      costPrice: undefined,
      stockControl: "yes",
      categoryId: "",
    },
  });

  React.useEffect(() => {
    if (!q.data) return;
    form.reset({
      name: q.data.name,
      sku: q.data.sku ?? "",
      unit: q.data.unit,
      salePrice: q.data.salePrice,
      costPrice: q.data.costPrice ?? undefined,
      stockControl: q.data.stockControl ? "yes" : "no",
      categoryId: q.data.categoryId,
    });
  }, [q.data, form]);

  const salvar = useMutation({
    mutationFn: async (raw: FormInput) => {
      const v: FormOutput = schema.parse(raw);
      return await updateProduto(id, {
        name: v.name,
        sku: v.sku || null,
        unit: v.unit,
        salePrice: v.salePrice,
        costPrice: v.costPrice ?? null,
        stockControl: v.stockControl === "yes",
        categoryId: v.categoryId,
      });
    },
    onSuccess: () => {
      toast.success("Produto atualizado!");
      router.replace("/estoque");
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Falha ao salvar."),
  });

  // ====== Safe delete ======
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const excluir = useMutation({
    mutationFn: async () => {
      await deleteProduto(id);
    },
    onSuccess: () => {
      toast.success("Produto excluído.");
      setConfirmOpen(false);
      router.replace("/estoque");
    },
    onError: (e: any) => {
      const msg =
        e?.response?.status === 409
          ? "Não foi possível excluir: há vínculos (movimentações, faturas, etc.)."
          : e?.response?.data?.message ?? "Falha ao excluir produto.";
      toast.error(msg);
    },
  });
  // =========================

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Editar produto</h1>

        {/* Botão de exclusão no topo */}
        <Button
          type="button"
          variant="outline"
          onClick={() => setConfirmOpen(true)}
          disabled={q.isLoading}
        >
          Excluir
        </Button>
      </div>

      {q.isLoading ? (
        <div className="surface-2 p-6 text-sm opacity-70">Carregando…</div>
      ) : (
        <form onSubmit={form.handleSubmit((v) => salvar.mutate(v))} className="space-y-4">
          <div className="surface-2">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <Field label="Nome" error={form.formState.errors.name?.message}>
                  <Input {...form.register("name")} />
                </Field>
              </div>
              <div className="col-span-12 md:col-span-3">
                <Field label="SKU">
                  <Input {...form.register("sku")} />
                </Field>
              </div>
              <div className="col-span-6 md:col-span-3">
                <Field label="Unidade" error={form.formState.errors.unit?.message}>
                  <Input {...form.register("unit")} />
                </Field>
              </div>

              <div className="col-span-6 md:col-span-3">
                <Field label="Preço venda">
                  <Input type="number" step="0.01" {...form.register("salePrice")} />
                </Field>
              </div>
              <div className="col-span-6 md:col-span-3">
                <Field label="Preço custo (opcional)">
                  <Input type="number" step="0.01" {...form.register("costPrice")} />
                </Field>
              </div>
              <div className="col-span-6 md:col-span-3">
                <Field label="Controle de estoque">
                  <Select {...form.register("stockControl")}>
                    <option value="yes">Sim</option>
                    <option value="no">Não</option>
                  </Select>
                </Field>
              </div>
              <div className="col-span-12 md:col-span-3">
                <Field label="Categoria" error={form.formState.errors.categoryId?.message}>
                  <Select
                    {...form.register("categoryId")}
                    disabled={catQ.isLoading || catQ.isError}
                  >
                    <option value="">{catQ.isLoading ? "Carregando…" : "Selecione…"}</option>
                    {catQ.data?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
            </div>
          </div>

          <div className="surface-2">
            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={salvar.isPending}>
                {salvar.isPending ? "Salvando…" : "Salvar alterações"}
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Modal de confirmação de exclusão */}
      <ConfirmDeleteProdutoModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => excluir.mutate()}
        isLoading={excluir.isPending}
        produtoName={q.data?.name}
      />
    </div>
  );
}