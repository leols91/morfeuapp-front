"use client";
import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import ModalBase from "@/components/ui/ModalBase";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/form/Field";
import { listCashAccounts, payAPInvoice } from "@/services/financeiro";
import toast from "react-hot-toast";

export function PayAPModal({
  open,
  onClose,
  invoiceId,
  invoiceAmount,
  alreadyPaid = 0,
  onPaid,
}: {
  open: boolean;
  onClose: () => void;
  invoiceId: string | null;
  invoiceAmount?: number;
  alreadyPaid?: number;
  onPaid?: () => void;
}) {
  const { data: accounts } = useQuery({
    queryKey: ["cash-accounts"],
    queryFn: listCashAccounts,
    enabled: open,
  });

  const remaining = Math.max(0, (invoiceAmount ?? 0) - (alreadyPaid ?? 0));
  const [accountId, setAccountId] = React.useState("");
  const [amount, setAmount] = React.useState<string>(() => (remaining ? String(remaining) : ""));
  const [paidAt, setPaidAt] = React.useState<string>(() => new Date().toISOString().slice(0, 10));

  React.useEffect(() => {
    if (open) {
      setAmount(remaining ? String(remaining) : "");
      setPaidAt(new Date().toISOString().slice(0, 10));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, invoiceId]);

  const mutate = useMutation({
    mutationFn: async () => {
      if (!invoiceId) throw new Error("Conta inválida.");
      if (!accountId) throw new Error("Selecione a conta de pagamento.");
      const n = Number((amount || "").replace(",", "."));
      if (!(n > 0)) throw new Error("Informe um valor válido.");
      await payAPInvoice({ invoiceId, accountId, amount: n, paidAt: new Date(paidAt).toISOString() });
    },
    onSuccess: () => {
      toast.success("Pagamento registrado!");
      onPaid?.();
      onClose();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? e?.message ?? "Falha ao pagar conta."),
  });

  if (!open) return null;
  return (
    <ModalBase open={open} onClose={onClose}>
      <ModalBase.Card maxWidth="max-w-md">
        <ModalBase.Header>
          <h3 className="text-lg font-semibold">Pagar conta</h3>
          {invoiceAmount != null ? (
            <p className="text-xs opacity-70 mt-0.5">
              Valor: {(invoiceAmount ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} •
              Pago: {(alreadyPaid ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} •
              Restante: {remaining.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
          ) : null}
        </ModalBase.Header>
        <ModalBase.Body>
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12">
              <Field label="Conta de caixa/banco">
                <Select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                  <option value="">Selecione…</option>
                  {accounts?.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="col-span-6">
              <Field label="Valor">
                <Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </Field>
            </div>
            <div className="col-span-6">
              <Field label="Data do pagamento">
                <Input type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />
              </Field>
            </div>
          </div>
        </ModalBase.Body>
        <ModalBase.Footer className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => mutate.mutate()} disabled={mutate.isPending}>
            {mutate.isPending ? "Salvando…" : "Confirmar pagamento"}
          </Button>
        </ModalBase.Footer>
      </ModalBase.Card>
    </ModalBase>
  );
}