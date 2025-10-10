"use client";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Field, Select } from "@/components/ui/form/Field";
import { listARInvoices, type ARInvoiceDTO, listCashAccounts, type CashAccountDTO } from "@/services/financeiro";
import { Th, Td, fmtMoney, fmtDate } from "@/components/financeiro/utils";
import { ARInvoiceFormModal } from "@/components/financeiro/ARInvoiceFormModal";
import { ARInvoiceDetailsModal } from "@/components/financeiro/ARInvoiceDetailsModal";
import { ARReceiveModal } from "@/components/financeiro/ARReceiveModal";

type StatusFilter = "all" | "open" | "received" | "canceled";

export default function ARPage() {
  const [status, setStatus] = React.useState<StatusFilter>("all");

  const { data, refetch, isFetching } = useQuery<ARInvoiceDTO[]>({
    queryKey: ["ar-invoices", status],
    queryFn: () => listARInvoices({ status }),
  });

  // contas (para o modal de receber)
  const { data: accounts = [] } = useQuery<CashAccountDTO[]>({
    queryKey: ["cash-accounts"],
    queryFn: () => listCashAccounts(),
  });

  const [openCreate, setOpenCreate] = React.useState(false);
  const [openDetails, setOpenDetails] = React.useState(false);
  const [current, setCurrent] = React.useState<ARInvoiceDTO | null>(null);

  // modal receber
  const [receiving, setReceiving] = React.useState<ARInvoiceDTO | null>(null);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Contas a receber</h1>
        <Button onClick={() => setOpenCreate(true)}>Nova conta a receber</Button>
      </div>

      <div className="surface-2">
        <form
          className="grid grid-cols-12 gap-3 items-end"
          onSubmit={(e) => {
            e.preventDefault();
            refetch();
          }}
        >
          <div className="col-span-12 md:col-span-6">
            <Field label="Status">
              <Select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)}>
                <option value="all">Todos</option>
                <option value="open">Em aberto</option>
                <option value="received">Recebidas</option>
                <option value="canceled">Canceladas</option>
              </Select>
            </Field>
          </div>
          <div className="col-span-12 md:col-span-6 flex justify-end">
            <Button type="submit" disabled={isFetching}>
              {isFetching ? "Filtrando…" : "Aplicar"}
            </Button>
          </div>
        </form>
      </div>

      <div className="surface">
        <div className="overflow-hidden rounded-2xl border-subtle border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/5">
              <tr className="text-left">
                <Th>Vencimento</Th>
                <Th>Cliente</Th>
                <Th>Descrição</Th>
                <Th>Status</Th>
                <Th className="text-right">Valor</Th>
                <Th className="text-right">Ações</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
              {(data ?? []).map((inv) => {
                const isOpen = inv.status === "open";
                return (
                  <tr key={inv.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <Td>{fmtDate(inv.dueDate)}</Td>
                    <Td className="truncate max-w-[220px]">{inv.customer.name}</Td>
                    <Td className="truncate max-w-[280px]">{inv.description}</Td>
                    <Td
                      className={
                        isOpen
                          ? "text-orange-600 dark:text-orange-300"
                          : inv.status === "received"
                          ? "text-emerald-600 dark:text-emerald-300"
                          : "text-rose-600 dark:text-rose-300"
                      }
                    >
                      {isOpen ? "Em aberto" : inv.status === "received" ? "Recebida" : "Cancelada"}
                    </Td>
                    <Td className="text-right tabular-nums">{fmtMoney(inv.amount)}</Td>
                    <Td className="text-right space-x-2">
                      {isOpen ? (
                        <Button size="sm" variant="outline" onClick={() => setReceiving(inv)}>
                          Receber
                        </Button>
                      ) : null}
                      <button
                        type="button"
                        className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
                        onClick={() => {
                          setCurrent(inv);
                          setOpenDetails(true);
                        }}
                      >
                        Detalhes
                      </button>
                    </Td>
                  </tr>
                );
              })}
              {(data ?? []).length === 0 && (
                <tr>
                  <Td colSpan={6} className="text-center py-8 opacity-70">
                    Nenhuma conta
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {openCreate && (
        <ARInvoiceFormModal open={openCreate} onClose={() => setOpenCreate(false)} onCreated={() => refetch()} />
      )}

      {openDetails && (
        <ARInvoiceDetailsModal open={openDetails} onClose={() => setOpenDetails(false)} invoice={current} />
      )}

      {receiving && (
        <ARReceiveModal
          open={!!receiving}
          invoice={receiving}
          accounts={accounts}
          onClose={() => setReceiving(null)}
          onConfirmed={() => refetch()}
        />
      )}
    </div>
  );
}