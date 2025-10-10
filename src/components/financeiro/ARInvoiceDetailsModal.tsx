"use client";
import * as React from "react";
import ModalBase from "@/components/ui/ModalBase";
import { Button } from "@/components/ui/Button";
import { fmtMoney, fmtDate } from "@/components/financeiro/utils";
import { type ARInvoiceDTO } from "@/services/financeiro";

export function ARInvoiceDetailsModal({
  open,
  onClose,
  invoice,
}: {
  open: boolean;
  onClose: () => void;
  invoice: ARInvoiceDTO | null;
}) {
  if (!open || !invoice) return null;

  return (
    <ModalBase open={open} onClose={onClose}>
      <ModalBase.Card maxWidth="max-w-3xl">
        <ModalBase.Header>
          <h3 className="text-lg font-semibold">Conta a receber</h3>
          <p className="text-xs opacity-70 mt-0.5">
            #{invoice.id.slice(0, 8)} • Cliente: {invoice.customer.name} • Venc.: {fmtDate(invoice.dueDate)}
          </p>
        </ModalBase.Header>
        <ModalBase.Body>
          <div className="space-y-4">
            <div className="text-sm">
              <span className="opacity-70">Descrição:</span> {invoice.description}
            </div>

            <div className="overflow-hidden rounded-2xl border-subtle border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-white/5">
                  <tr className="text-left">
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide opacity-70">Item</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide opacity-70">
                      Qtde
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide opacity-70">
                      Preço
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide opacity-70">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                  {invoice.items?.map((it) => (
                    <tr key={it.id}>
                      <td className="px-3 py-2">{it.description}</td>
                      <td className="px-3 py-2 text-right">
                        {Number(it.quantity) % 1 === 0 ? it.quantity.toFixed(0) : it.quantity.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-right">{fmtMoney(it.unitPrice)}</td>
                      <td className="px-3 py-2 text-right">{fmtMoney(it.total)}</td>
                    </tr>
                  )) ?? null}
                  {(!invoice.items || invoice.items.length === 0) && (
                    <tr>
                      <td className="px-3 py-4 text-center opacity-70" colSpan={4}>
                        Sem itens
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {invoice.receipts && invoice.receipts.length > 0 ? (
              <div className="overflow-hidden rounded-2xl border-subtle border">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-white/5">
                  <tr className="text-left">
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide opacity-70">Recebimento</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide opacity-70">
                      Valor
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide opacity-70">
                      Conta
                    </th>
                  </tr>
                </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                    {invoice.receipts.map((r) => (
                      <tr key={r.id}>
                        <td className="px-3 py-2">{fmtDate(r.receivedAt)}</td>
                        <td className="px-3 py-2 text-right">{fmtMoney(r.amount)}</td>
                        <td className="px-3 py-2 text-right">{r.account.name}</td>
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
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </ModalBase.Footer>
      </ModalBase.Card>
    </ModalBase>
  );
}