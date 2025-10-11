"use client";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Field, Select } from "@/components/ui/form/Field";
import { Eye } from "lucide-react";
import {
  listAPInvoices,
  listCashAccounts,
  payAPInvoice,
  type APInvoiceDTO,
} from "@/services/financeiro";
import {
  Th,
  Td,
  fmtMoney,
  fmtDate,
  type APItem,
  type CashAccount,
} from "@/components/financeiro/utils";
import { APInvoiceFormModal } from "@/components/financeiro/APInvoiceFormModal";
import { APInvoiceDetailsModal } from "@/components/financeiro/APInvoiceDetailsModal";
import { PayInvoiceModal } from "@/components/financeiro/PayInvoiceModal";

type StatusFilter = "all" | "open" | "paid" | "canceled";

export default function APPage() {
  const [status, setStatus] = React.useState<StatusFilter>("all");

  const {
    data: invoices,
    refetch,
    isFetching,
  } = useQuery<APInvoiceDTO[]>({
    queryKey: ["ap-invoices", status],
    queryFn: () => listAPInvoices({ status }),
  });

  // contas (para o modal de pagar)
  const { data: accountsDto } = useQuery({
    queryKey: ["cash-accounts"],
    queryFn: () => listCashAccounts(),
  });

  const accounts: CashAccount[] =
    (accountsDto ?? []).map((a) => ({
      id: a.id,
      name: a.name,
      balance: a.openingBalance ?? 0,
    })) ?? [];

  const [openCreate, setOpenCreate] = React.useState(false);
  const [openDetails, setOpenDetails] = React.useState(false);
  const [current, setCurrent] = React.useState<APInvoiceDTO | null>(null);

  // pagar
  const [paying, setPaying] = React.useState<APInvoiceDTO | null>(null);
  const [payLoading, setPayLoading] = React.useState(false);

  function mapToAPItem(inv: APInvoiceDTO): APItem {
    return {
      id: inv.id,
      description: inv.description,
      amount: inv.amount,
      dueDate: inv.dueDate,
      status: inv.status === "paid" ? "paid" : "open",
      supplier: inv.supplier?.legalName,
    };
  }

  async function handleConfirmPay(p: {
    apId: string;
    accountId: string;
    paidAt: string;
    amount: number;
    reference?: string;
  }) {
    try {
      setPayLoading(true);
      await payAPInvoice({
        invoiceId: p.apId,
        accountId: p.accountId,
        amount: p.amount,
        paidAt: p.paidAt,
      });
      setPaying(null);
      await refetch();
    } finally {
      setPayLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Contas a pagar</h1>
        <Button onClick={() => setOpenCreate(true)}>Nova conta a pagar</Button>
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
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusFilter)}
              >
                <option value="all">Todos</option>
                <option value="open">Em aberto</option>
                <option value="paid">Pagas</option>
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
                <Th>Fornecedor</Th>
                <Th>Descrição</Th>
                <Th>Status</Th>
                <Th className="text-right">Valor</Th>
                <Th className="text-right">Ações</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
              {(invoices ?? []).map((inv) => (
                <tr
                  key={inv.id}
                  className="hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <Td>{fmtDate(inv.dueDate)}</Td>
                  <Td className="truncate max-w-[220px]">
                    {inv.supplier.legalName}
                  </Td>
                  <Td className="truncate max-w-[280px]">{inv.description}</Td>
                  <Td
                    className={
                      inv.status === "open"
                        ? "text-orange-600 dark:text-orange-300"
                        : inv.status === "paid"
                        ? "text-emerald-600 dark:text-emerald-300"
                        : "text-rose-600 dark:text-rose-300"
                    }
                  >
                    {inv.status === "open"
                      ? "Em aberto"
                      : inv.status === "paid"
                      ? "Paga"
                      : "Cancelada"}
                  </Td>
                  <Td className="text-right tabular-nums">
                    {fmtMoney(inv.amount)}
                  </Td>
                  <Td className="text-right space-x-2">
                    {inv.status === "open" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPaying(inv)}
                      >
                        Pagar
                      </Button>
                    ) : null}

                    <button
                      type="button"
                      className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
                      title="Ver detalhes"
                      aria-label="Ver detalhes"
                      onClick={() => { setCurrent(inv); setOpenDetails(true); }}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </Td>
                </tr>
              ))}
              {(invoices ?? []).length === 0 && (
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
        <APInvoiceFormModal
          open={openCreate}
          onClose={() => setOpenCreate(false)}
          onCreated={() => refetch()}
        />
      )}

      {openDetails && (
        <APInvoiceDetailsModal
          open={openDetails}
          onClose={() => setOpenDetails(false)}
          invoice={current}
        />
      )}

      {paying && accounts.length > 0 && (
        <PayInvoiceModal
          open={!!paying}
          ap={mapToAPItem(paying)}
          accounts={accounts}
          onClose={() => setPaying(null)}
          onConfirm={handleConfirmPay}
        />
      )}
    </div>
  );
}