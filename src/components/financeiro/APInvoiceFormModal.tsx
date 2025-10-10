"use client";
import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import ModalBase from "@/components/ui/ModalBase";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/form/Field";
import { createAPInvoice, listCashAccounts, type CreateAPInvoicePayload } from "@/services/financeiro";
import { searchSuppliers, type SupplierDTO } from "@/services/estoque";

export function APInvoiceFormModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: (id: string) => void;
}) {
  // supplier quick search (reuso do padrão das compras)
  const [supplierValue, setSupplierValue] = React.useState<SupplierDTO | null>(null);
  const [supplierQuery, setSupplierQuery] = React.useState("");
  const [supplierOpts, setSupplierOpts] = React.useState<SupplierDTO[]>([]);

  React.useEffect(() => {
    let active = true;
    (async () => {
      const r = await searchSuppliers(supplierQuery);
      if (!active) return;
      setSupplierOpts(r);
    })();
    return () => { active = false; };
  }, [supplierQuery]);

  const [description, setDescription] = React.useState("");
  const [dueDate, setDueDate] = React.useState<string>(() => new Date().toISOString().slice(0,10));
  const [items, setItems] = React.useState<Array<{ description: string; quantity: string; unitCost: string }>>([
    { description: "", quantity: "", unitCost: "" },
  ]);

  const addRow = () => setItems((p) => [...p, { description: "", quantity: "", unitCost: "" }]);
  const rmRow = (idx: number) => setItems((p) => p.filter((_, i) => i !== idx));

  const salvar = useMutation({
    mutationFn: async () => {
      if (!supplierValue) throw new Error("Selecione o fornecedor.");
      if (!description.trim()) throw new Error("Informe a descrição.");
      const parsedItems = items
        .map((r) => ({
          description: r.description.trim(),
          quantity: Number((r.quantity || "").replace(",", ".")),
          unitCost: Number((r.unitCost || "").replace(",", ".")),
          apCategoryId: "cat_default", // placeholder — ajustaremos depois
        }))
        .filter((r) => r.description && r.quantity > 0 && r.unitCost >= 0);
      if (parsedItems.length === 0) throw new Error("Adicione ao menos 1 item válido.");
      const payload: CreateAPInvoicePayload = {
        supplierId: supplierValue.id,
        description: description.trim(),
        dueDate: new Date(dueDate).toISOString(),
        items: parsedItems,
      };
      const { id } = await createAPInvoice(payload);
      return id;
    },
    onSuccess: (id) => {
      toast.success("Conta a pagar criada!");
      onCreated?.(id);
      onClose();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? e?.message ?? "Falha ao criar conta a pagar."),
  });

  if (!open) return null;
  return (
    <ModalBase open={open} onClose={onClose}>
      <ModalBase.Card maxWidth="max-w-3xl">
        <ModalBase.Header>
          <h3 className="text-lg font-semibold">Nova conta a pagar</h3>
        </ModalBase.Header>
        <ModalBase.Body>
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12">
              <Field label="Fornecedor">
                <div className="flex gap-2">
                  <Input
                    className="flex-1"
                    placeholder="Buscar fornecedor…"
                    value={supplierValue ? supplierValue.legalName : supplierQuery}
                    onChange={(e) => { setSupplierValue(null); setSupplierQuery(e.target.value); }}
                  />
                </div>
                {!supplierValue && supplierQuery.trim() && supplierOpts.length > 0 && (
                  <div className="mt-2 rounded-xl border-subtle border bg-white dark:bg-[#0F172A] shadow-soft max-h-60 overflow-auto">
                    {supplierOpts.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5"
                        onClick={() => { setSupplierValue(s); setSupplierQuery(""); }}
                      >
                        <div className="font-medium">{s.legalName}</div>
                        <div className="text-[11px] opacity-70">{[s.documentId, s.phone].filter(Boolean).join(" • ")}</div>
                      </button>
                    ))}
                  </div>
                )}
              </Field>
            </div>

            <div className="col-span-8">
              <Field label="Descrição">
                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
              </Field>
            </div>
            <div className="col-span-4">
              <Field label="Vencimento">
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </Field>
            </div>

            <div className="col-span-12">
              <div className="overflow-hidden rounded-2xl border-subtle border">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-white/5">
                    <tr className="text-left">
                      <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide opacity-70">Item</th>
                      <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide opacity-70 text-right">Qtde</th>
                      <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide opacity-70 text-right">Custo</th>
                      <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide opacity-70 text-right">Total</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                    {items.map((r, idx) => {
                      const qty = Number((r.quantity || "").replace(",", "."));
                      const unit = Number((r.unitCost || "").replace(",", "."));
                      const total = (qty || 0) * (unit || 0);
                      return (
                        <tr key={idx}>
                          <td className="px-3 py-2">
                            <Input value={r.description} onChange={(e) => {
                              const v = e.target.value;
                              setItems((p) => p.map((x, i) => i === idx ? { ...x, description: v } : x));
                            }} />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <Input inputMode="decimal" className="text-right" value={r.quantity}
                              onChange={(e) => setItems((p) => p.map((x, i) => i === idx ? { ...x, quantity: e.target.value } : x))} />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <Input inputMode="decimal" className="text-right" value={r.unitCost}
                              onChange={(e) => setItems((p) => p.map((x, i) => i === idx ? { ...x, unitCost: e.target.value } : x))} />
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums">{total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                          <td className="px-3 py-2 text-right">
                            <button type="button" className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10" onClick={() => rmRow(idx)}>
                              Remover
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td colSpan={5} className="px-3 py-2 text-right">
                        <Button variant="outline" onClick={addRow}>Adicionar item</Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </ModalBase.Body>
        <ModalBase.Footer className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => salvar.mutate()} disabled={salvar.isPending}>
            {salvar.isPending ? "Salvando…" : "Criar conta a pagar"}
          </Button>
        </ModalBase.Footer>
      </ModalBase.Card>
    </ModalBase>
  );
}