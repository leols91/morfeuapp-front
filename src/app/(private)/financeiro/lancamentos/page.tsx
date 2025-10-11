"use client";
import * as React from "react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/form/Field";
import { listCashAccounts, listCashLedger, deleteCashLedger } from "@/services/financeiro";
import { Th, Td, fmtMoney, fmtDateTime } from "@/components/financeiro/utils";
import { LedgerEntryModal } from "@/components/financeiro/LedgerEntryModal";
import { TransferModal } from "@/components/financeiro/TransferModal";
import { Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

type EntryTypeFilter = "all" | "credit" | "debit";

export default function LancamentosPage() {
  // contas
  const { data: accounts } = useQuery({ queryKey: ["cash-accounts"], queryFn: listCashAccounts });
  const [accountId, setAccountId] = useState<string>("");

  // filtros
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [entryType, setEntryType] = useState<EntryTypeFilter>("all");
  const [q, setQ] = useState<string>("");

  // fetch base
  const { data: ledgerRaw, refetch, isFetching } = useQuery({
    queryKey: ["cash-ledger", accountId || "all"],
    queryFn: () => listCashLedger({ accountId: accountId || undefined }),
  });

  // ordenação, filtro e saldo acumulado
  const filtered = useMemo(() => {
    const list = [...(ledgerRaw ?? [])];

    // ordena por data DESC para exibição
    list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

    return list.filter((l) => {
      if (entryType !== "all" && l.entryType !== entryType) return false;
      if (dateFrom && new Date(l.createdAt) < new Date(dateFrom)) return false;
      if (dateTo && new Date(l.createdAt) > new Date(dateTo + "T23:59:59")) return false;
      if (q && !(l.reference ?? "").toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [ledgerRaw, entryType, dateFrom, dateTo, q]);

  // saldo acumulado (aparece quando 1 conta selecionada)
  const withRunningBalance = useMemo(() => {
    if (!accountId) return filtered;

    const acc = accounts?.find((a) => a.id === accountId);
    const opening = acc?.openingBalance ?? 0;

    // precisamos calcular em ordem ASC e depois voltar para a ordem atual (DESC)
    const asc = [...filtered].sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
    let bal = opening;
    const ascWith = asc.map((l) => {
      bal += l.entryType === "credit" ? l.amount : -l.amount;
      return { ...l, _running: bal };
    });
    // reverte para DESC
    const descWith = ascWith.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return descWith;
  }, [filtered, accounts, accountId]);

  // paginação (client)
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(withRunningBalance.length / pageSize));
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return withRunningBalance.slice(start, start + pageSize);
  }, [withRunningBalance, page]);

  React.useEffect(() => {
    setPage(1); // reset ao trocar filtros
  }, [accountId, dateFrom, dateTo, entryType, q]);

  // modais
  const [openCreate, setOpenCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingEntry = useMemo(
    () => (editingId ? (ledgerRaw ?? []).find((l) => l.id === editingId) ?? null : null),
    [editingId, ledgerRaw]
  );
  const [openTransfer, setOpenTransfer] = useState(false);

  // excluir
  async function handleDelete(id: string) {
    try {
      await deleteCashLedger(id);
      toast.success("Lançamento excluído!");
      refetch();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Falha ao excluir.");
    }
  }

  // exportar CSV (aplica filtros vigentes)
  function exportCSV() {
    const rows = [
      ["Data", "Conta", "Tipo", "Referência", "Valor", accountId ? "Saldo após" : ""].filter(Boolean),
      ...withRunningBalance.map((l) => [
        fmtDateTime(l.createdAt),
        l.account?.name ?? l.accountId,
        l.entryType === "credit" ? "Crédito" : "Débito",
        l.reference ?? "",
        String(l.amount).replace(".", ","),
        accountId ? String((l as any)._running ?? "").replace(".", ",") : undefined,
      ].filter((x) => x !== undefined) as string[]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${(c ?? "").replaceAll('"', '""')}"`).join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lancamentos.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Lançamentos de caixa</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setOpenTransfer(true)}>Transferir</Button>
          <Button onClick={() => setOpenCreate(true)}>Novo lançamento</Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="surface-2">
        <form
          className="grid grid-cols-12 gap-3 items-end"
          onSubmit={(e) => { e.preventDefault(); refetch(); }}
        >
          <div className="col-span-12 md:col-span-3">
            <Field label="Conta">
              <Select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                <option value="">Todas</option>
                {accounts?.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </Select>
            </Field>
          </div>
          <div className="col-span-6 md:col-span-2">
            <Field label="De">
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </Field>
          </div>
          <div className="col-span-6 md:col-span-2">
            <Field label="Até">
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </Field>
          </div>
          <div className="col-span-6 md:col-span-2">
            <Field label="Tipo">
              <Select value={entryType} onChange={(e) => setEntryType(e.target.value as EntryTypeFilter)}>
                <option value="all">Todos</option>
                <option value="credit">Crédito</option>
                <option value="debit">Débito</option>
              </Select>
            </Field>
          </div>
          <div className="col-span-6 md:col-span-2">
            <Field label="Buscar ref.">
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="texto da referência…" />
            </Field>
          </div>
          <div className="col-span-12 md:col-span-1 flex gap-2 justify-end">
            <Button type="submit" disabled={isFetching}>{isFetching ? "Filtrando…" : "Aplicar"}</Button>
          </div>
          <div className="col-span-12 md:col-span-12 flex justify-end">
            <Button variant="outline" onClick={exportCSV}>Exportar CSV</Button>
          </div>
        </form>
      </div>

      {/* Tabela */}
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
                {accountId ? <Th className="text-right">Saldo</Th> : null}
                <Th className="text-right">Ações</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
              {pageItems.map((l) => (
                <tr key={l.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                  <Td>{fmtDateTime(l.createdAt)}</Td>
                  <Td>{l.account?.name ?? l.accountId}</Td>
                  <Td className={l.entryType === "credit" ? "text-emerald-600 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"}>
                    {l.entryType === "credit" ? "Crédito" : "Débito"}
                  </Td>
                  <Td className="truncate max-w-[360px]">{l.reference ?? "—"}</Td>
                  <Td className="text-right tabular-nums">{fmtMoney(l.amount)}</Td>
                  {accountId ? (
                    <Td className="text-right tabular-nums">{fmtMoney((l as any)._running ?? 0)}</Td>
                  ) : null}
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
                        title="Editar lançamento"
                        aria-label="Editar lançamento"
                        onClick={() => setEditingId(l.id)}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
                        title="Excluir lançamento"
                        aria-label="Excluir lançamento"
                        onClick={() => handleDelete(l.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
              {pageItems.length === 0 && (
                <tr><Td colSpan={accountId ? 7 : 6} className="text-center py-8 opacity-70">Nenhum lançamento</Td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* paginação */}
        <div className="flex items-center justify-between mt-3">
          <div className="text-xs opacity-70">
            Página {page} de {totalPages} — {withRunningBalance.length} registro(s)
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
              Anterior
            </Button>
            <Button variant="outline" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
              Próxima
            </Button>
          </div>
        </div>
      </div>

      {/* Modais */}
      {(openCreate || editingEntry) && (
        <LedgerEntryModal
          open={openCreate || !!editingEntry}
          entry={editingEntry ?? undefined}
          onClose={() => { setOpenCreate(false); setEditingId(null); }}
          onCreated={() => refetch()}
        />
      )}

      {openTransfer && (
        <TransferModal
          open={openTransfer}
          onClose={() => setOpenTransfer(false)}
          onCreated={() => { refetch(); setOpenTransfer(false); }}
        />
      )}
    </div>
  );
}