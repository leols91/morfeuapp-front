"use client";
import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import ModalBase from "@/components/ui/ModalBase";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/form/Field";
import { createARInvoice, type CreateARInvoicePayload } from "@/services/financeiro";

export function ARInvoiceFormModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: (id: string) => void;
}) {
  // Cliente simples (texto) — podemos evoluir depois para buscar hóspedes/contatos
  const [customerName, setCustomerName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [dueDate, setDueDate] = React.useState<string>(() => new Date().toISOString().slice(0, 10));
  const [items, setItems] = React.useState<Array<{ description: string; quantity: string; unitPrice: string }>>([
    { description: "", quantity: "", unitPrice: "" },
  ]);

  const addRow = () => setItems((p) => [...p, { description: "", quantity: "", unitPrice: "" }]);
  const rmRow = (idx: number) => setItems((p) => p.filter((_, i) => i !== idx));

  const salvar = useMutation({
    mutationFn: async () => {
      if (!customerName.trim()) throw new Error("Informe o cliente/devedor.");
      if (!description.trim()) throw new Error("Informe a descrição.");
      const parsedItems = items
        .map((r) => ({
          description: r.description.trim(),
          quantity: Number((r.quantity || "").replace(",", ".")),
          unitPrice: Number((r.unitPrice || "").replace(",", ".")),
        }))
        .filter((r) => r.description && r.quantity > 0 && r.unitPrice >= 0);

      if (parsedItems.length === 0) throw new Error("Adicione ao menos 1 item válido.");

      const payload: CreateARInvoicePayload = {
        customer: { name: customerName.trim() }, // simples (sem id) por ora
        description: description.trim(),
        dueDate: new Date(dueDate).toISOString(),
        items: parsedItems,
      };
      const { id } = await createARInvoice(payload);
      return id;
    },
    onSuccess: (id) => {
      toast.success("Conta a receber criada!");
      onCreated?.(id);
      onClose();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? e?.message ?? "Falha ao criar conta a receber."),
  });

  if (!open) return null;

  return (
    <ModalBase open={open} onClose={onClose}>
      <ModalBase.Card maxWidth="max-w-3xl">
        <ModalBase.Header>
          <h3 className="text-lg font-semibold">Nova conta a receber</h3>
        </ModalBase.Header>
        <ModalBase.Body>
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 md:col-span-6">
              <Field label="Cliente (devedor)">
                <Input placeholder="Nome do cliente" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              </Field>
            </div>
            <div className="col-span-12 md:col-span-6">
              <Field label="Vencimento">
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </Field>
            </div>

            <div className="col-span-12">
              <Field label="Descrição">
                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
              </Field>
            </div>

            <div className="col-span-12">
              <div className="overflow-hidden rounded-2xl border-subtle border">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-white/5">
                    <tr className="text-left">
                      <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide opacity-70">Item</th>
                      <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide opacity-70 text-right">Qtde</th>
                      <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide opacity-70 text-right">Preço</th>
                      <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide opacity-70 text-right">Total</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                    {items.map((r, idx) => {
                      const qty = Number((r.quantity || "").replace(",", "."));
                      const unit = Number((r.unitPrice || "").replace(",", "."));
                      const total = (qty || 0) * (unit || 0);
                      return (
                        <tr key={idx}>
                          <td className="px-3 py-2">
                            <Input
                              value={r.description}
                              onChange={(e) => {
                                const v = e.target.value;
                                setItems((p) => p.map((x, i) => (i === idx ? { ...x, description: v } : x)));
                              }}
                            />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <Input
                              inputMode="decimal"
                              className="text-right"
                              value={r.quantity}
                              onChange={(e) =>
                                setItems((p) => p.map((x, i) => (i === idx ? { ...x, quantity: e.target.value } : x)))
                              }
                            />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <Input
                              inputMode="decimal"
                              className="text-right"
                              value={r.unitPrice}
                              onChange={(e) =>
                                setItems((p) => p.map((x, i) => (i === idx ? { ...x, unitPrice: e.target.value } : x)))
                              }
                            />
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums">
                            {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <button
                              type="button"
                              className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
                              onClick={() => rmRow(idx)}
                            >
                              Remover
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td colSpan={5} className="px-3 py-2 text-right">
                        <Button variant="outline" onClick={addRow}>
                          Adicionar item
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </ModalBase.Body>
        <ModalBase.Footer className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => salvar.mutate()} disabled={salvar.isPending}>
            {salvar.isPending ? "Salvando…" : "Criar conta a receber"}
          </Button>
        </ModalBase.Footer>
      </ModalBase.Card>
    </ModalBase>
  );
}