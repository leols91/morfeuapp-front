// src/components/reservas/EditFolioEntryModal.tsx
"use client";
import * as React from "react";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import type { FolioEntry } from "@/types/reserva";
import { Field, Input } from "@/components/ui/form/Field";

/** Utils */
const money = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function tipoLabel(t: FolioEntry["type"]) {
  if (t === "room_charge") return "Diária";
  if (t === "product") return "Produto";
  return "Serviço";
}

/** Schema */
const common = {
  description: z.string().optional(),
  discount: z.union([z.number(), z.nan()]).optional(),
  baseUnitPrice: z.union([z.number(), z.nan()]),
};

const schemaPS = z.object({
  kind: z.literal("ps"),
  qty: z.number().int().min(1, "Quantidade mínima: 1"),
  ...common,
});

const schemaRoom = z.object({
  kind: z.literal("room"),
  qty: z.number().int().min(1).optional(),
  ...common,
});

const schema = z
  .discriminatedUnion("kind", [schemaPS, schemaRoom])
  .superRefine((v, ctx) => {
    const base = Number.isNaN((v as any).baseUnitPrice) ? 0 : Number((v as any).baseUnitPrice);
    const disc = Number.isNaN((v as any).discount) ? 0 : Number((v as any).discount);
    if (disc < 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["discount"], message: "Desconto não pode ser negativo" });
    }
    if (disc > base) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["discount"], message: "Desconto não pode exceder o preço base" });
    }
  });

type FormData = z.input<typeof schema>;

type Props = {
  open: boolean;
  onClose: () => void;
  entry: FolioEntry | null;
  onConfirm: (payload: { id: string; description?: string; amount?: number }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
};

export function EditFolioEntryModal({
  open,
  onClose,
  entry,
  onConfirm,
  onDelete,
}: Props) {
  /** ================= guard clause + alias ================= */
  if (!open || !entry) return null;
  const ent: FolioEntry = entry;

  /** ======= Deriva dados do lançamento ======= */
  const qtyFromEntry = (ent as any)?.qty;
  const explicitBaseUnit =
    (ent as any)?.baseUnitPrice ??
    (ent as any)?.unitPriceBeforeDiscount ??
    (ent as any)?.meta?.baseUnitPrice ??
    null;
  const explicitUnitDiscount =
    (ent as any)?.discount ??
    (ent as any)?.unitDiscount ??
    (ent as any)?.discountPerUnit ??
    (ent as any)?.meta?.discountPerUnit ??
    null;

  // Nome do item (apenas p/ produto/serviço)
  const itemName =
    (ent as any)?.productName ??
    (ent as any)?.serviceName ??
    (ent as any)?.itemName ??
    (ent as any)?.name ??
    (ent as any)?.meta?.productName ??
    (ent as any)?.meta?.serviceName ??
    (ent as any)?.meta?.name ??
    "";

  const initialQty = typeof qtyFromEntry === "number" && qtyFromEntry > 0 ? qtyFromEntry : 1;
  const totalFinal = typeof ent.amount === "number" ? ent.amount : 0;
  const unitFinal = initialQty ? totalFinal / initialQty : totalFinal;

  const baseUnit = typeof explicitBaseUnit === "number" ? explicitBaseUnit : unitFinal;
  const initDisc =
    typeof explicitUnitDiscount === "number"
      ? Math.max(0, explicitUnitDiscount)
      : Math.max(0, baseUnit - unitFinal);

  const isRoom = ent.type === "room_charge";
  const kind: FormData["kind"] = isRoom ? "room" : "ps";

  /** ======= RHF ======= */
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { kind, description: ent.description ?? "", qty: initialQty, baseUnitPrice: baseUnit, discount: initDisc } as any,
    values: { kind, description: ent.description ?? "", qty: initialQty, baseUnitPrice: baseUnit, discount: initDisc } as any,
  });

  const { control } = form;
  const watchQty  = useWatch({ control, name: "qty" }) as number | undefined;
  const watchBase = useWatch({ control, name: "baseUnitPrice" }) as number;
  const watchDisc = useWatch({ control, name: "discount" }) as number | undefined;

  const qty    = Math.max(1, (watchQty ?? initialQty));
  const base   = Number.isNaN(watchBase as any) ? 0 : Number(watchBase);
  const disc   = Number.isNaN(watchDisc as any) ? 0 : Number(watchDisc);
  const unitEff = Math.max(0, base - disc);
  const newTotal = qty * unitEff;

  const [saving, setSaving]   = React.useState(false);
  const [error, setError]     = React.useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleting, setDeleting]       = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setError(null);
      setConfirmOpen(false);
      setDeleting(false);
    }
  }, [open, ent.id]);

  /** ======= Submit ======= */
  async function submit(v: FormData) {
    setError(null);
    setSaving(true);
    try {
      const baseV = Number.isNaN((v as any).baseUnitPrice) ? 0 : Number((v as any).baseUnitPrice);
      const discV = Number.isNaN((v as any).discount) ? 0 : Number((v as any).discount);
      const qtyV  = isRoom ? initialQty : Math.max(1, Number((v as any).qty ?? initialQty));
      const total = Math.max(0, baseV - discV) * qtyV;

      await onConfirm({
        id: ent.id,
        description: v.description || undefined,
        amount: total,
      });
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Falha ao atualizar lançamento.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!onDelete) return;
    setError(null);
    setDeleting(true);
    try {
      await onDelete(ent.id);
      setConfirmOpen(false);
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Falha ao excluir lançamento.");
    } finally {
      setDeleting(false);
    }
  }

  /** ======= UI ======= */
  return (
    <>
      {/* backdrop */}
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />

      {/* modal principal */}
      <div className="fixed inset-0 z-50 grid place-items-center p-4">
        <div className="w-full max-w-xl rounded-2xl border-subtle border bg-white dark:bg-[#0F172A] shadow-soft">
          {/* header */}
          <div className="px-4 py-3 md:px-6 md:py-4 border-b border-subtle">
            <h3 className="text-lg font-semibold">Editar lançamento</h3>
            <p className="text-xs opacity-70 mt-0.5">
              ID: {ent.id} · {tipoLabel(ent.type)}
            </p>
          </div>

          {/* body */}
          <div className="px-4 py-4 md:px-6 md:py-6">
            <form id="form-edit-folio" onSubmit={form.handleSubmit(submit)} className="space-y-4">
              {/* Nome do item (apenas produto/serviço) */}
              {!isRoom && (
                <Field label="Produto/serviço">
                  <Input value={itemName || "—"} readOnly className="cursor-not-allowed opacity-80" />
                </Field>
              )}

              {/* Descrição (sempre) */}
              <Field label="Descrição">
                <Input
                  {...form.register("description")}
                  placeholder="Descrição do lançamento"
                />
              </Field>

              {/* Quantidade / Preço base / Desconto */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Field label="Qtd.">
                  <Input
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(e) =>
                      isRoom
                        ? undefined
                        : form.setValue("qty", Number(e.target.value), {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                    }
                    readOnly={isRoom}
                    className={isRoom ? "cursor-not-allowed opacity-80" : ""}
                  />
                </Field>

                <Field label="Preço base (un.)">
                  <Input
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    value={Number.isNaN(base as any) ? "" : base}
                    readOnly
                    className="cursor-not-allowed opacity-80"
                  />
                </Field>

                <Field
                  label="Desconto por unidade (R$)"
                  error={(form.formState.errors as any)?.discount?.message}
                >
                  <Input
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    value={Number.isNaN(disc as any) ? "" : disc}
                    onChange={(e) =>
                      form.setValue(
                        "discount",
                        e.target.value === "" ? Number.NaN : Number(e.target.value),
                        { shouldDirty: true, shouldValidate: true }
                      )
                    }
                  />
                  <div className="text-[11px] opacity-70 mt-1">
                    Aplicado por unidade. Não pode exceder o preço base.
                  </div>
                </Field>
              </div>

              {/* Totais */}
              <div className="rounded-xl border-subtle border px-3 py-2 text-sm grid grid-cols-2 gap-2">
                <div className="opacity-70">Preço final (un.)</div>
                <div className="text-right font-medium">{money(unitEff)}</div>
                <div className="opacity-70">Total</div>
                <div className="text-right font-semibold">{money(newTotal)}</div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
            </form>
          </div>

          {/* footer */}
          <div className="px-4 py-3 md:px-6 md:py-4 border-t border-subtle flex items-center justify-between gap-2">
            {onDelete ? (
              <Button
                type="button"
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={() => setConfirmOpen(true)}
                disabled={saving || deleting}
              >
                Excluir
              </Button>
            ) : (
              <div />
            )}

            <div className="ml-auto flex items-center gap-2">
              <Button type="button" variant="ghost" onClick={onClose} disabled={saving || deleting}>
                Cancelar
              </Button>
              <Button form="form-edit-folio" type="submit" disabled={saving || deleting}>
                {saving ? "Salvando…" : "Salvar"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* modal de confirmação de exclusão */}
      {confirmOpen && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/50" onClick={() => setConfirmOpen(false)} />
          <div className="fixed inset-0 z-[60] grid place-items-center p-4">
            <div className="w-full max-w-sm rounded-2xl border border-subtle bg-white dark:bg-[#0F172A] shadow-soft">
              <div className="px-5 py-4 border-b border-subtle">
                <h4 className="text-base font-semibold">Excluir lançamento</h4>
              </div>
              <div className="px-5 py-5 space-y-2 text-sm">
                <p className="opacity-80">
                  Tem certeza que deseja excluir este lançamento? Essa ação não pode ser desfeita.
                </p>
                <div className="mt-2 rounded-xl border border-subtle px-3 py-2">
                  <div className="text-xs opacity-70">Descrição</div>
                  <div className="mt-0.5">{ent.description || "—"}</div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div className="text-xs opacity-70">Valor</div>
                    <div className="text-right font-medium">{money(totalFinal)}</div>
                  </div>
                </div>
              </div>
              <div className="px-5 py-4 border-t border-subtle flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setConfirmOpen(false)} disabled={deleting}>
                  Cancelar
                </Button>
                <Button
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={confirmDelete}
                  disabled={deleting}
                >
                  {deleting ? "Excluindo…" : "Excluir"}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}