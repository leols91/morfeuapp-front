"use client";
import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import ModalBase from "@/components/ui/ModalBase";
import { Button } from "@/components/ui/Button";
import { Field, Select, Input } from "@/components/ui/form/Field";
import { listCashAccounts, transferCash } from "@/services/financeiro";
import toast from "react-hot-toast";

export function TransferModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}) {
  const { data: accounts } = useQuery({ queryKey: ["cash-accounts"], queryFn: listCashAccounts });

  const [fromId, setFromId] = React.useState<string>("");
  const [toId, setToId] = React.useState<string>("");
  const [amount, setAmount] = React.useState<string>("");
  const [reference, setReference] = React.useState<string>("Transferência entre contas");

  const salvar = useMutation({
    mutationFn: async () => {
      if (!fromId || !toId || fromId === toId) throw new Error("Selecione contas diferentes.");
      const n = Number((amount || "").replace(",", "."));
      if (!(n > 0)) throw new Error("Informe um valor válido.");
      await transferCash({ fromAccountId: fromId, toAccountId: toId, amount: n, reference: reference || null });
    },
    onSuccess: () => {
      toast.success("Transferência registrada!");
      onCreated?.();
      onClose();
      setAmount("");
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? e?.message ?? "Falha ao transferir."),
  });

  if (!open) return null;
  return (
    <ModalBase open={open} onClose={onClose}>
      <ModalBase.Card maxWidth="max-w-md">
        <ModalBase.Header>
          <h3 className="text-lg font-semibold">Transferir entre contas</h3>
        </ModalBase.Header>
        <ModalBase.Body>
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 md:col-span-6">
              <Field label="Origem">
                <Select value={fromId} onChange={(e) => setFromId(e.target.value)}>
                  <option value="">Selecione…</option>
                  {accounts?.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="col-span-12 md:col-span-6">
              <Field label="Destino">
                <Select value={toId} onChange={(e) => setToId(e.target.value)}>
                  <option value="">Selecione…</option>
                  {accounts?.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="col-span-12 md:col-span-6">
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
            {salvar.isPending ? "Salvando…" : "Transferir"}
          </Button>
        </ModalBase.Footer>
      </ModalBase.Card>
    </ModalBase>
  );
}