"use client";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import ModalBase from "@/components/ui/ModalBase";
import { money, fmtNumber, fmtDateTime, Th, Td } from "./utils";

export type PurchaseItem = {
  produto: { id: string; name: string; unit: string; sku?: string | null };
  quantity: number;
  unitCost: number;
};

export type PurchaseDetails = {
  id: string;
  supplierName?: string | null;
  note?: string | null;
  createdAt: string;
  items: PurchaseItem[];
};

export default function PurchaseDetailsModal({
  open,
  onClose,
  data,
}: {
  open: boolean;
  onClose: () => void;
  data: PurchaseDetails | null;
}) {
  if (!open || !data) return null;
  return (
    <ModalBase open={open} onClose={onClose}>
      <ModalBase.Card maxWidth="max-w-3xl">
        <ModalBase.Header>
          <h3 className="text-lg font-semibold">Detalhes da compra</h3>
          <p className="text-xs opacity-70 mt-0.5">
            ID: {data.id} • {fmtDateTime(data.createdAt)}
          </p>
          {data.supplierName && (
            <p className="text-xs opacity-70 mt-0.5">Fornecedor: {data.supplierName}</p>
          )}
        </ModalBase.Header>

        <ModalBase.Body>
          <div className="grid grid-cols-1 gap-4">
            {data.note && (
              <div>
                <div className="text-xs opacity-70">Observação</div>
                <div className="mt-1">{data.note}</div>
              </div>
            )}

            <div className="overflow-hidden rounded-2xl border-subtle border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-white/5">
                  <tr className="text-left">
                    <Th>Produto</Th>
                    <Th>Unid.</Th>
                    <Th className="text-right">Qtde</Th>
                    <Th className="text-right">Custo unit.</Th>
                    <Th className="text-right">Total</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                  {data.items.map((it, idx) => (
                    <tr key={idx}>
                      <Td>{it.produto.name}</Td>
                      <Td>{it.produto.unit}</Td>
                      <Td className="text-right">{fmtNumber(it.quantity)}</Td>
                      <Td className="text-right">{money(it.unitCost)}</Td>
                      <Td className="text-right">{money(it.quantity * it.unitCost)}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-right mt-4">
              <div className="text-xs opacity-70">Total da compra</div>
              <div className="mt-1 text-xl font-semibold tabular-nums">
                {money(data.items.reduce((a, i) => a + i.quantity * i.unitCost, 0))}
              </div>
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