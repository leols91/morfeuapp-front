// src/components/estoque/UpsertProdutoQuickModal.tsx
"use client";
import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import ModalBase from "@/components/ui/ModalBase";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/form/Field";
import { createProduto, listProductCategories } from "@/services/estoque";

const schema = z.object({
  name: z.string().min(1, "Informe o nome"),
  categoryId: z.string().min(1, "Selecione a categoria"),
  unit: z.string().min(1, "Informe a unidade"),
  salePrice: z.coerce.number().min(0),
  costPrice: z.coerce.number().optional().or(z.nan()).transform(v => (Number.isNaN(v) ? undefined : v)),
  stockControl: z.enum(["yes", "no"]).default("yes"),
  sku: z.string().optional().or(z.literal("")),
});
type FormInput = z.input<typeof schema>;
type FormOutput = z.infer<typeof schema>;

export function UpsertProdutoQuickModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: (newProduct: { id: string; name: string }) => void;
}) {
  const catQ = useQuery({
    queryKey: ["productCategories"],
    queryFn: listProductCategories,
    refetchOnWindowFocus: false,
  });

  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      categoryId: "",
      unit: "UN",
      salePrice: 0,
      costPrice: undefined,
      stockControl: "yes",
      sku: "",
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
    onSuccess: (res) => {
      toast.success("Produto criado!");
      onSuccess({ id: res.id, name: form.getValues("name") });
      form.reset();
      onClose();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Falha ao criar produto."),
  });

  if (!open) return null;

  return (
    <ModalBase open={open} onClose={onClose}>
      <ModalBase.Card maxWidth="max-w-2xl">
        <ModalBase.Header>
          <h3 className="text-lg font-semibold">Novo produto</h3>
        </ModalBase.Header>

        <ModalBase.Body>
          <form
            onSubmit={form.handleSubmit((v) => criar.mutate(v))}
            className="grid grid-cols-12 gap-4"
          >
            <div className="col-span-12 md:col-span-7">
              <Field label="Nome" error={form.formState.errors.name?.message}>
                <Input {...form.register("name")} />
              </Field>
            </div>
            <div className="col-span-6 md:col-span-5">
              <Field label="Categoria" error={form.formState.errors.categoryId?.message}>
                <Select {...form.register("categoryId")} disabled={catQ.isLoading || catQ.isError}>
                  <option value="">{catQ.isLoading ? "Carregando…" : "Selecione…"}</option>
                  {catQ.data?.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="col-span-6 md:col-span-3">
              <Field label="Unidade" error={form.formState.errors.unit?.message}>
                <Input {...form.register("unit")} placeholder="UN, CX, KG…" />
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
            <div className="col-span-6 md:col-span-3">
              <Field label="SKU (opcional)">
                <Input {...form.register("sku")} />
              </Field>
            </div>

            <div className="col-span-12 flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
              <Button type="submit" disabled={criar.isPending}>
                {criar.isPending ? "Salvando…" : "Criar produto"}
              </Button>
            </div>
          </form>
        </ModalBase.Body>
      </ModalBase.Card>
    </ModalBase>
  );
}