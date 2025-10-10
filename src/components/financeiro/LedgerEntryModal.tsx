"use client";
import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/form/Field";
import ModalBase from "@/components/ui/ModalBase";
import { createCashLedger, listCashAccounts } from "@/services/financeiro";
import toast from "react-hot-toast";

export function LedgerEntryModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}) {
  const { data: accounts } = useQuery({
    queryKey: ["cash-accounts"],
    queryFn: listCashAccounts,
  });

  const [accountId, setAccountId] = React.useState("");
  const [entryType, setEntryType] = React.useState<"credit" | "debit">("credit");
  const [amount, setAmount] = React.useState("");
  const [reference, setReference] = React.useState("");

  const salvar = useMutation({
    mutationFn: async () => {
      if (!accountId) throw new Error("Selecione a conta.");
      const n = Number(amount.replace(",", "."));
      if (!(n > 0)) throw new Error("Informe um valor válido.");
      await createCashLedger({ accountId, entryType, amount: n, reference: reference || null });
    },
    onSuccess: () => {
      toast.success("Lançamento criado!");
      onCreated?.();
      onClose();
      setAmount("");
      setReference("");
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? e?.message ?? "Falha ao lançar."),
  });

  if (!open) return null;
  return (
    <ModalBase open={open} onClose={onClose}>
      <ModalBase.Card maxWidth="max-w-md">
        <ModalBase.Header>
          <h3 className="text-lg font-semibold">Novo lançamento</h3>
        </ModalBase.Header>
        <ModalBase.Body>
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12">
              <Field label="Conta">
                <Select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                  <option value="">Selecione…</option>
                  {accounts?.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="col-span-6">
              <Field label="Tipo">
                <Select value={entryType} onChange={(e) => setEntryType(e.target.value as any)}>
                  <option value="credit">Crédito (entrada)</option>
                  <option value="debit">Débito (saída)</option>
                </Select>
              </Field>
            </div>
            <div className="col-span-6">
              <Field label="Valor">
                <Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </Field>
            </div>
            <div className="col-span-12">
              <Field label="Referência (opcional)">
                <Input value={reference} onChange={(e) => setReference(e.target.value)} />
              </Field>
            </div>
          </div>
        </ModalBase.Body>
        <ModalBase.Footer className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => salvar.mutate()} disabled={salvar.isPending}>
            {salvar.isPending ? "Salvando…" : "Lançar"}
          </Button>
        </ModalBase.Footer>
      </ModalBase.Card>
    </ModalBase>
  );
}