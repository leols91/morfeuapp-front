// src/components/reservas/AddChargeModal.tsx
"use client";
import * as React from "react";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ModalBase from "@/components/ui/ModalBase";
import { Button } from "@/components/ui/Button";
import type { ProductOption } from "@/types/reserva";
import { Field, Select, Input, Textarea } from "@/components/ui/form/Field";

type ServiceOption = { id: string; name: string; price: number };
type Kind = "product" | "service";

type ProductPayload = {
  kind: "product";
  productId: string;
  qty: number;
  unitPrice: number; // já com desconto
  description?: string;
};
type ServicePayload = {
  kind: "service";
  serviceId: string;
  qty: number;
  unitPrice: number; // já com desconto
  description?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: ProductPayload | ServicePayload) => Promise<void>;
  products: ProductOption[];
  services: ServiceOption[];
};

const common = {
  qty: z.number().int().min(1, "Quantidade mínima: 1"),
  unitPrice: z.union([z.number(), z.nan()]),
  discount: z.union([z.number(), z.nan()]).optional(),
  description: z.string().optional(),
};
const schema = z
  .discriminatedUnion("kind", [
    z.object({ kind: z.literal("product"), productId: z.string().min(1, "Selecione um produto"), ...common }),
    z.object({ kind: z.literal("service"), serviceId: z.string().min(1, "Selecione um serviço"), ...common }),
  ])
  .superRefine((v, ctx) => {
    const price = Number.isNaN((v as any).unitPrice) ? 0 : Number((v as any).unitPrice);
    const disc  = Number.isNaN((v as any).discount)  ? 0 : Number((v as any).discount);
    if (disc < 0) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["discount"], message: "Desconto não pode ser negativo" });
    if (disc > price) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["discount"], message: "Desconto não pode exceder o preço unitário" });
  });
type FormData = z.input<typeof schema>;

export function AddChargeModal({ open, onClose, onConfirm, products, services }: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { kind: "product", productId: "", serviceId: "", qty: 1, unitPrice: Number.NaN, discount: Number.NaN, description: "" } as any,
  });

  const { control } = form;
  const kind      = useWatch({ control, name: "kind" }) as Kind;
  const productId = useWatch({ control, name: "productId" }) as string | undefined;
  const serviceId = useWatch({ control, name: "serviceId" }) as string | undefined;
  const unitPrice = useWatch({ control, name: "unitPrice" }) as number;
  const qty       = useWatch({ control, name: "qty" }) as number;
  const discount  = useWatch({ control, name: "discount" }) as number | undefined;

  const [saving, setSaving] = React.useState(false);
  const [error,  setError]  = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    form.reset({ kind: "product", productId: "", serviceId: "", qty: 1, unitPrice: Number.NaN, discount: Number.NaN, description: "" } as any);
    setError(null);
  }, [open, form]);

  React.useEffect(() => {
    if (kind === "product" && productId) {
      const p = products.find((x) => x.id === productId);
      if (p) form.setValue("unitPrice", p.price, { shouldDirty: true, shouldValidate: true });
    }
    if (kind === "service" && serviceId) {
      const s = services.find((x) => x.id === serviceId);
      if (s) form.setValue("unitPrice", s.price, { shouldDirty: true, shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, productId, serviceId]);

  if (!open) return null;

  const base  = Number.isNaN(unitPrice as any) ? 0 : Number(unitPrice);
  const disc  = Number.isNaN(discount as any) ? 0 : Number(discount);
  const effPU = Math.max(0, base - disc);
  const total = effPU * (qty || 0);

  async function submit(v: FormData) {
    setError(null);
    setSaving(true);
    try {
      const basePrice   = Number.isNaN(v.unitPrice as any) ? 0 : Number(v.unitPrice);
      const perUnitDisc = Number.isNaN(v.discount as any)  ? 0 : Number(v.discount);
      const finalUnit   = Math.max(0, basePrice - perUnitDisc);

      if (v.kind === "product") {
        await onConfirm({ kind: "product", productId: v.productId!, qty: Number(v.qty), unitPrice: finalUnit, description: v.description || undefined });
      } else {
        await onConfirm({ kind: "service", serviceId: v.serviceId!, qty: Number(v.qty), unitPrice: finalUnit, description: v.description || undefined });
      }
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? "Falha ao lançar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalBase open={open} onClose={onClose}>
      <ModalBase.Card maxWidth="max-w-xl">
        <ModalBase.Header>
          <h3 className="text-lg font-semibold">Lançar produto/serviço</h3>
        </ModalBase.Header>

        <ModalBase.Body>
          <form id="form-add-charge" onSubmit={form.handleSubmit(submit)} className="space-y-4">
            {/* Toggle */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  form.setValue("kind", "product", { shouldDirty: true, shouldValidate: true });
                  form.setValue("serviceId", "", { shouldDirty: true, shouldValidate: true });
                  form.setValue("unitPrice", Number.NaN, { shouldDirty: true, shouldValidate: true });
                  form.setValue("discount", Number.NaN, { shouldDirty: true, shouldValidate: true });
                }}
                className={`rounded-xl border px-3 py-1 text-sm ${kind === "product" ? "border-foreground/30" : "border-subtle"}`}
              >
                Produto
              </button>
              <button
                type="button"
                onClick={() => {
                  form.setValue("kind", "service", { shouldDirty: true, shouldValidate: true });
                  form.setValue("productId", "", { shouldDirty: true, shouldValidate: true });
                  form.setValue("unitPrice", Number.NaN, { shouldDirty: true, shouldValidate: true });
                  form.setValue("discount", Number.NaN, { shouldDirty: true, shouldValidate: true });
                }}
                className={`rounded-xl border px-3 py-1 text-sm ${kind === "service" ? "border-foreground/30" : "border-subtle"}`}
              >
                Serviço
              </button>
            </div>

            {/* Seletor */}
            {kind === "product" ? (
              <Field label="Produto" error={(form.formState.errors as any)?.productId?.message}>
                <Select
                  value={productId || ""}
                  onChange={(e) => form.setValue("productId", e.target.value, { shouldDirty: true, shouldValidate: true })}
                >
                  <option value="">Selecione…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} — R$ {p.price.toFixed(2)}</option>
                  ))}
                </Select>
              </Field>
            ) : (
              <Field label="Serviço" error={(form.formState.errors as any)?.serviceId?.message}>
                <Select
                  value={serviceId || ""}
                  onChange={(e) => form.setValue("serviceId", e.target.value, { shouldDirty: true, shouldValidate: true })}
                >
                  <option value="">Selecione…</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} — R$ {s.price.toFixed(2)}</option>
                  ))}
                </Select>
              </Field>
            )}

            {/* Qtd/Preço/Desconto */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="Qtd." error={form.formState.errors.qty?.message}>
                <Input
                  type="number"
                  min={1}
                  value={qty ?? 1}
                  onChange={(e) => form.setValue("qty", Number(e.target.value), { shouldDirty: true, shouldValidate: true })}
                />
              </Field>

              <Field label="Preço unitário (R$)" error={form.formState.errors.unitPrice?.message}>
                <Input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  value={Number.isNaN(unitPrice as any) ? "" : unitPrice}
                  readOnly
                  className="cursor-not-allowed opacity-80"
                />
              </Field>

              <Field label="Desconto por unidade (R$)" error={form.formState.errors.discount?.message}>
                <Input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  value={Number.isNaN(discount as any) ? "" : discount}
                  onChange={(e) =>
                    form.setValue("discount", e.target.value === "" ? Number.NaN : Number(e.target.value), {
                      shouldDirty: true, shouldValidate: true,
                    })
                  }
                />
                <div className="text-[11px] opacity-70 mt-1">Aplicado por unidade. Não pode exceder o preço.</div>
              </Field>
            </div>

            {/* Total */}
            <div className="rounded-xl border-subtle border px-3 py-2 text-sm flex justify-between">
              <span className="opacity-70">Total</span>
              <strong>{total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
            </div>

            {/* Descrição */}
            <Field label="Descrição (opcional)">
              <Textarea rows={2} placeholder="Observações do lançamento…" {...form.register("description")} />
            </Field>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </form>
        </ModalBase.Body>

        <ModalBase.Footer className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button form="form-add-charge" type="submit" disabled={saving}>
            {saving ? "Lançando…" : "Lançar"}
          </Button>
        </ModalBase.Footer>
      </ModalBase.Card>
    </ModalBase>
  );
}