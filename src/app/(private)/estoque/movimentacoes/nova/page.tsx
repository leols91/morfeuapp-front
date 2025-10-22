// src/app/estoque/movimentacoes/nova/page.tsx
"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/form/Field";
import { listMovementTypes, listProdutos, createStockMovement } from "@/services/estoque";

const schema = z.object({
  produtoId: z.string().min(1, "Selecione o produto"),
  // somente entrada/saída
  typeCode: z.enum(["in", "out"], { required_error: "Selecione o tipo" }),
  quantity: z.coerce.number().positive("Qtd deve ser > 0"),
  unitCost: z
    .coerce
    .number()
    .optional()
    .or(z.nan())
    .transform((v) => (Number.isNaN(v) ? undefined : v)),
  note: z.string().optional().or(z.literal("")),
});
type FormInput = z.input<typeof schema>;
type FormOutput = z.infer<typeof schema>;

export default function NovaMovimentacaoPage() {
  const router = useRouter();

  const typesQ = useQuery({ queryKey: ["movementTypes"], queryFn: listMovementTypes });
  const produtosQ = useQuery({
    queryKey: ["produtos_for_mov"],
    queryFn: () => listProdutos({}),
    refetchOnWindowFocus: false,
  });

  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: { produtoId: "", typeCode: "" as unknown as "in" | "out", quantity: 1, unitCost: undefined, note: "" },
  });

  const criar = useMutation({
    mutationFn: async (raw: FormInput) => {
      const v: FormOutput = schema.parse(raw);
      return await createStockMovement({
        produtoId: v.produtoId,
        typeCode: v.typeCode,
        quantity: v.quantity,
        unitCost: v.unitCost ?? null,
        note: v.note || null,
      });
    },
    onSuccess: () => {
      toast.success("Movimentação registrada!");
      router.replace("/estoque/movimentacoes");
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Falha ao registrar."),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Nova movimentação</h1>
      </div>

      <form onSubmit={form.handleSubmit((v) => criar.mutate(v))} className="space-y-4">
        <div className="surface-2">
          <div className="grid grid-cols-12 gap-4">
            {/* Produto */}
            <div className="col-span-12 md:col-span-6">
              <Field label="Produto" error={form.formState.errors.produtoId?.message}>
                <Select
                  {...form.register("produtoId")}
                  disabled={produtosQ.isLoading || produtosQ.isError}
                >
                  <option value="">
                    {produtosQ.isLoading ? "Carregando…" : "Selecione…"}
                  </option>
                  {produtosQ.data?.data?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.sku ? `• ${p.sku}` : ""}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            {/* Tipo (apenas Entrada/Saída) */}
            <div className="col-span-12 md:col-span-6">
              <Field label="Tipo" error={form.formState.errors.typeCode?.message}>
                <Select
                  {...form.register("typeCode")}
                  disabled={typesQ.isLoading || typesQ.isError}
                >
                  <option value="">
                    {typesQ.isLoading ? "Carregando…" : "Selecione…"}
                  </option>
                  {(typesQ.data ?? [])
                    .filter((t) => t.code === "in" || t.code === "out")
                    .map((t) => (
                      <option key={t.code} value={t.code}>
                        {t.description}
                      </option>
                    ))}
                </Select>
              </Field>
            </div>

            {/* Quantidade */}
            <div className="col-span-6 md:col-span-4">
              <Field label="Quantidade" error={form.formState.errors.quantity?.message}>
                <Input type="number" step="0.001" {...form.register("quantity")} />
              </Field>
            </div>

            {/* Custo unitário (opcional) */}
            <div className="col-span-6 md:col-span-4">
              <Field label="Custo unitário (opcional)">
                <Input type="number" step="0.01" {...form.register("unitCost")} />
              </Field>
            </div>

            {/* Observações */}
            <div className="col-span-12 md:col-span-4">
              <Field label="Observações (opcional)">
                <Textarea rows={2} {...form.register("note")} />
              </Field>
            </div>
          </div>
        </div>

        <div className="surface-2">
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={criar.isPending}>
              {criar.isPending ? "Salvando…" : "Registrar"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}