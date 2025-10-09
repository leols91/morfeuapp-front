"use client";
import * as React from "react";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import ModalBase from "@/components/ui/ModalBase";
import { Field, Input } from "@/components/ui/form/Field";
import { ProdutoDTO, createProduto, type CreateProdutoPayload } from "@/services/estoque";
import { toNum } from "./utils";

const produtoSchema = z.object({
  name: z.string().min(1, "Informe o nome"),
  sku: z.string().optional().or(z.literal("")),
  unit: z.string().min(1, "Informe a unidade"),
  salePrice: z.coerce.number().min(0),
  costPrice: z.coerce.number().optional().or(z.nan()).transform((v) => (Number.isNaN(v) ? undefined : v)),
  stockControl: z.enum(["yes", "no"]).default("yes"),
  categoryId: z.string().min(1, "Selecione a categoria"),
});
type ProdutoForm = z.infer<typeof produtoSchema>;

export function CreateProdutoModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (p: ProdutoDTO) => void;
}) {
  const [form, setForm] = React.useState<ProdutoForm>({
    name: "",
    sku: "",
    unit: "UN",
    salePrice: 0,
    costPrice: undefined,
    stockControl: "yes",
    categoryId: "",
  });

  const salvar = useMutation({
    mutationFn: async () => {
      const v = produtoSchema.parse(form);
      const payload: CreateProdutoPayload = {
        name: v.name,
        sku: v.sku || null,
        unit: v.unit,
        salePrice: v.salePrice,
        costPrice: v.costPrice ?? null,
        stockControl: v.stockControl === "yes",
        categoryId: v.categoryId,
      };
      const { id } = await createProduto(payload);
      const novo: ProdutoDTO = {
        id,
        name: payload.name,
        sku: payload.sku ?? undefined,
        unit: payload.unit,
        salePrice: payload.salePrice,
        costPrice: payload.costPrice ?? undefined,
        stockControl: payload.stockControl,
        categoryId: payload.categoryId,
      };
      return novo;
    },
    onSuccess: (p) => {
      toast.success("Produto criado!");
      onCreated(p);
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
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 md:col-span-6">
              <Field label="Nome">
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </Field>
            </div>
            <div className="col-span-6 md:col-span-3">
              <Field label="SKU">
                <Input value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} />
              </Field>
            </div>
            <div className="col-span-6 md:col-span-3">
              <Field label="Unidade">
                <Input value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} />
              </Field>
            </div>
            <div className="col-span-6 md:col-span-3">
              <Field label="Preço venda">
                <Input
                  type="number"
                  step="0.01"
                  value={form.salePrice}
                  onChange={(e) => setForm((f) => ({ ...f, salePrice: toNum(e.target.value) }))}
                />
              </Field>
            </div>
            <div className="col-span-6 md:col-span-3">
              <Field label="Preço custo (opc.)">
                <Input
                  type="number"
                  step="0.01"
                  value={String(form.costPrice ?? "")}
                  onChange={(e) => setForm((f) => ({ ...f, costPrice: toNum(e.target.value) }))}
                />
              </Field>
            </div>
            <div className="col-span-6 md:col-span-3">
              <Field label="Controle de estoque">
                <select
                  className="form-select"
                  value={form.stockControl}
                  onChange={(e) => setForm((f) => ({ ...f, stockControl: e.target.value as "yes" | "no" }))}
                >
                  <option value="yes">Sim</option>
                  <option value="no">Não</option>
                </select>
              </Field>
            </div>
            <div className="col-span-6 md:col-span-3">
              <Field label="Categoria (id)">
                <Input
                  placeholder="cat_outros (placeholder simples)"
                  value={form.categoryId}
                  onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                />
              </Field>
            </div>
          </div>
        </ModalBase.Body>
        <ModalBase.Footer className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => salvar.mutate()} disabled={salvar.isPending}>
            {salvar.isPending ? "Salvando…" : "Criar"}
          </Button>
        </ModalBase.Footer>
      </ModalBase.Card>
    </ModalBase>
  );
}