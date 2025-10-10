"use client";
import * as React from "react";
import ModalBase from "@/components/ui/ModalBase";
import { Button } from "@/components/ui/Button";
import { fmtMoney, fmtDate } from "./utils";
import { type APInvoiceDTO } from "@/services/financeiro";

export function APInvoiceDetailsModal({
  open, onClose, invoice,
}: {
  open: boolean;
  onClose: () => void;
  invoice: APInvoiceDTO | null;
}) {
  if (!open || !invoice) return null;
  return (
    <ModalBase open={open} onClose={onClose}>
      <ModalBase.Card maxWidth="max-w-3xl">
        <ModalBase.Header>
          <h3 className="text-lg font-semibold">Conta a pagar</h3>
          <p className="text-xs opacity-70 mt-0.5">
            #{invoice.id.slice(0,8)} • Fornecedor: {invoice.supplier.legalName} • Venc.: {fmtDate(invoice.dueDate)}
          </p>
        </ModalBase.Header>
        <ModalBase.Body>
          <div className="space-y-4">
            <div className="text-sm"><span className="opacity-70">Descrição:</span> {invoice.description}</div>

            <div className="overflow-hidden rounded-2xl border-subtle border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-white/5">
                  <tr className="text-left">
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide opacity-70">Item</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide opacity-70">Qtde</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide opacity-70">Custo</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide opacity-70">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                  {invoice.items?.map((it) => (
                    <tr key={it.id}>
                      <td className="px-3 py-2">{it.description}</td>
                      <td className="px-3 py-2 text-right">{Number(it.quantity) % 1 === 0 ? it.quantity.toFixed(0) : it.quantity.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right">{fmtMoney(it.unitCost)}</td>
                      <td className="px-3 py-2 text-right">{fmtMoney(it.total)}</td>
                    </tr>
                  )) ?? null}
                  {(!invoice.items || invoice.items.length === 0) && (
                    <tr><td className="px-3 py-4 text-center opacity-70" colSpan={4}>Sem itens</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {invoice.payments && invoice.payments.length > 0 ? (
              <div className="overflow-hidden rounded-2xl border-subtle border">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-white/5">
                    <tr className="text-left">
                      <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide opacity-70">Pagamento</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide opacity-70">Valor</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide opacity-70">Conta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                    {invoice.payments.map((p) => (
                      <tr key={p.id}>
                        <td className="px-3 py-2">{fmtDate(p.paidAt)}</td>
                        <td className="px-3 py-2 text-right">{fmtMoney(p.amount)}</td>
                        <td className="px-3 py-2 text-right">{p.account.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            <div className="text-right">
              <div className="text-xs opacity-70">Total</div>
              <div className="text-xl font-semibold">{fmtMoney(invoice.amount)}</div>
            </div>
          </div>
        </ModalBase.Body>
        <ModalBase.Footer className="flex justify-end">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </ModalBase.Footer>
      </ModalBase.Card>
    </ModalBase>
  );
}