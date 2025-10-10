"use client";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { listCashAccounts } from "@/services/financeiro";
import { Th, Td, fmtMoney, fmtDateTime } from "@/components/financeiro/utils";
import { AccountFormModal } from "@/components/financeiro/AccountFormModal";

export default function ContasPage() {
  const { data, refetch, isFetching } = useQuery({
    queryKey: ["cash-accounts"],
    queryFn: listCashAccounts,
  });

  const [openCreate, setOpenCreate] = React.useState(false);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Contas (caixa/banco)</h1>
        <Button onClick={() => setOpenCreate(true)}>Nova conta</Button>
      </div>

      <div className="surface">
        <div className="overflow-hidden rounded-2xl border-subtle border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/5">
              <tr className="text-left">
                <Th>Nome</Th>
                <Th>Tipo</Th>
                <Th className="text-right">Saldo inicial</Th>
                <Th>Criação</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
              {(data ?? []).map((a) => (
                <tr key={a.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                  <Td className="font-medium">{a.name}</Td>
                  <Td className="uppercase">{a.typeCode}</Td>
                  <Td className="text-right tabular-nums">{fmtMoney(a.openingBalance)}</Td>
                  <Td>{a.createdAt ? fmtDateTime(a.createdAt) : "—"}</Td>
                </tr>
              ))}
              {(data ?? []).length === 0 && (
                <tr><Td colSpan={4} className="text-center py-8 opacity-70">Nenhuma conta</Td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {openCreate && (
        <AccountFormModal
          open={openCreate}
          onClose={() => setOpenCreate(false)}
          onCreated={() => refetch()}
        />
      )}
    </div>
  );
}