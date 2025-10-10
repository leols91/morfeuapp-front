"use client";
import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import ModalBase from "@/components/ui/ModalBase";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/form/Field";
import { fmtMoney } from "@/components/financeiro/utils";
import { type CashAccountDTO, type ARInvoiceDTO, receiveARInvoice } from "@/services/financeiro";
import toast from "react-hot-toast";

export function ARReceiveModal({
  open,
  invoice,
  accounts,
  onClose,
  onConfirmed,
}: {
  open: boolean;
  invoice: ARInvoiceDTO | null;
  accounts: CashAccountDTO[];
  onClose: () => void;
  onConfirmed?: () => void;
}) {
  if (!open || !invoice) return null;

  const receivedSoFar = (invoice.receipts ?? []).reduce((a, r) => a + r.amount, 0);
  const remaining = Math.max(0, invoice.amount - receivedSoFar);

  const [accountId, setAccountId] = React.useState<string>(accounts[0]?.id ?? "");
  const [receivedAt, setReceivedAt] = React.useState<string>(() => new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = React.useState<number>(remaining);
  const [reference, setReference] = React.useState<string>("");

  React.useEffect(() => {
    // Se mudar a fatura, reseta os padrões
    setAccountId(accounts[0]?.id ?? "");
    setReceivedAt(new Date().toISOString().slice(0, 10));
    setAmount(Math.max(0, (invoice.amount ?? 0) - (invoice.receipts ?? []).reduce((a, r) => a + r.amount, 0)));
    setReference("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice?.id]);

  const salvar = useMutation({
    mutationFn: async () => {
      if (!accountId) throw new Error("Selecione a conta.");
      if (!amount || amount <= 0) throw new Error("Informe um valor válido.");
      await receiveARInvoice({
        invoiceId: invoice.id,
        accountId,
        amount,
        receivedAt: new Date(receivedAt).toISOString(),
      });
    },
    onSuccess: () => {
      toast.success("Recebimento registrado!");
      onClose();
      onConfirmed?.();
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? e?.message ?? "Falha ao registrar recebimento."),
  });

  return (
    <ModalBase open={open} onClose={onClose}>
      <ModalBase.Card maxWidth="max-w-xl">
        <ModalBase.Header>
          <h3 className="text-lg font-semibold">Receber</h3>
          <p className="text-xs opacity-70 mt-0.5">
            {invoice.customer.name} • {invoice.description}
          </p>
        </ModalBase.Header>
        <ModalBase.Body>
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 md:col-span-6">
              <Field label="Conta de recebimento">
                <Select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="col-span-12 md:col-span-6">
              <Field label="Data do recebimento">
                <Input type="date" value={receivedAt} onChange={(e) => setReceivedAt(e.target.value)} />
              </Field>
            </div>

            <div className="col-span-12 md:col-span-6">
              <Field label="Valor">
                <Input
                  inputMode="decimal"
                  value={String(amount)}
                  onChange={(e) => setAmount(Number(e.target.value.replace(",", ".")) || 0)}
                />
              </Field>
              <div className="text-[11px] opacity-70 mt-1">
                Pendente: <b>{fmtMoney(remaining)}</b>{receivedSoFar > 0 ? <> • Já recebido: <b>{fmtMoney(receivedSoFar)}</b></> : null}
              </div>
            </div>

            <div className="col-span-12 md:col-span-6">
              <Field label="Referência (opcional)">
                <Input
                  placeholder="Ex.: NF 123, PIX #abcd..."
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </Field>
            </div>
          </div>
        </ModalBase.Body>
        <ModalBase.Footer className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => salvar.mutate()} disabled={salvar.isPending}>
            {salvar.isPending ? "Salvando…" : "Confirmar recebimento"}
          </Button>
        </ModalBase.Footer>
      </ModalBase.Card>
    </ModalBase>
  );
}