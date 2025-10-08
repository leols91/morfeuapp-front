// src/app/estoque/produtos/novo/page.tsx
"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/form/Field";
import { createProduto, listProductCategories } from "@/services/estoque";

const schema = z.object({
  name: z.string().min(1, "Informe o nome"),
  sku: z.string().optional().or(z.literal("")),
  unit: z.string().min(1, "Informe a unidade (ex.: UN, KG, L)"),
  salePrice: z.coerce.number().min(0, "Preço inválido"),
  costPrice: z.coerce.number().optional().or(z.nan()).transform((v) => (Number.isNaN(v) ? undefined : v)),
  stockControl: z.enum(["yes", "no"]).default("yes"),
  categoryId: z.string().min(1, "Selecione a categoria"),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.infer<typeof schema>;

export default function NovoProdutoPage() {
  const router = useRouter();

  const catQ = useQuery({
    queryKey: ["productCategories"],
    queryFn: listProductCategories,
    refetchOnWindowFocus: false,
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

  const criar = useMutation({
    mutationFn: async (raw: FormInput) => {
      const v: FormOutput = schema.parse(raw);
      return await createProduto({
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
      toast.success("Produto criado com sucesso!");
      router.replace("/estoque");
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Falha ao criar produto."),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Novo produto</h1>
      </div>

      <form onSubmit={form.handleSubmit((v) => criar.mutate(v))} className="space-y-4">
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
                <Input placeholder="UN, KG, L…" {...form.register("unit")} />
              </Field>
            </div>

            <div className="col-span-6 md:col-span-3">
              <Field label="Preço venda" error={form.formState.errors.salePrice?.message}>
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
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </Field>
            </div>
          </div>
        </div>

        <div className="surface-2">
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancelar</Button>
            <Button type="submit" disabled={criar.isPending}>
              {criar.isPending ? "Salvando…" : "Criar produto"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}