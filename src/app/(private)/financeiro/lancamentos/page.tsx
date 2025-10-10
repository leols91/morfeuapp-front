"use client";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Field, Select } from "@/components/ui/form/Field";
import { listCashAccounts, listCashLedger } from "@/services/financeiro";
import { Th, Td, fmtMoney, fmtDateTime } from "@/components/financeiro/utils";
import { LedgerEntryModal } from "@/components/financeiro/LedgerEntryModal";

export default function LancamentosPage() {
  const { data: accounts } = useQuery({ queryKey: ["cash-accounts"], queryFn: listCashAccounts });
  const [accountId, setAccountId] = React.useState<string>("");

  const { data: ledger, refetch, isFetching } = useQuery({
    queryKey: ["cash-ledger", accountId || "all"],
    queryFn: () => listCashLedger({ accountId: accountId || undefined }),
  });

  const [openModal, setOpenModal] = React.useState(false);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Lançamentos de caixa</h1>
        <Button onClick={() => setOpenModal(true)}>Novo lançamento</Button>
      </div>

      <div className="surface-2">
        <form className="grid grid-cols-12 gap-3 items-end" onSubmit={(e) => { e.preventDefault(); refetch(); }}>
          <div className="col-span-12 md:col-span-6">
            <Field label="Conta">
              <Select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                <option value="">Todas</option>
                {accounts?.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </Select>
            </Field>
          </div>
          <div className="col-span-12 md:col-span-6 flex justify-end">
            <Button type="submit" disabled={isFetching}>{isFetching ? "Filtrando…" : "Aplicar"}</Button>
          </div>
        </form>
      </div>

      <div className="surface">
        <div className="overflow-hidden rounded-2xl border-subtle border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/5">
              <tr className="text-left">
                <Th>Data</Th>
                <Th>Conta</Th>
                <Th>Tipo</Th>
                <Th>Referência</Th>
                <Th className="text-right">Valor</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
              {(ledger ?? []).map((l) => (
                <tr key={l.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                  <Td>{fmtDateTime(l.createdAt)}</Td>
                  <Td>{l.account?.name ?? l.accountId}</Td>
                  <Td className={l.entryType === "credit" ? "text-emerald-600 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"}>
                    {l.entryType === "credit" ? "Crédito" : "Débito"}
                  </Td>
                  <Td className="truncate max-w-[360px]">{l.reference ?? "—"}</Td>
                  <Td className="text-right tabular-nums">{fmtMoney(l.amount)}</Td>
                </tr>
              ))}
              {(ledger ?? []).length === 0 && (
                <tr><Td colSpan={5} className="text-center py-8 opacity-70">Nenhum lançamento</Td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {openModal && (
        <LedgerEntryModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          onCreated={() => refetch()}
        />
      )}
    </div>
  );
}