"use client";
import * as React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Field, Select } from "@/components/ui/form/Field";
import { listCashAccounts, listPaymentMethods, type CashAccountDTO, type PaymentMethodDTO } from "@/services/financeiro";
import { getPousadaConfigObject, upsertPousadaConfigs, KEYS } from "@/services/settings";
import toast from "react-hot-toast";

export function FinancialTab() {
  const { data: cfg, refetch } = useQuery({
    queryKey: ["settings", "pousada", "financial"],
    queryFn: getPousadaConfigObject,
  });
  const { data: accounts } = useQuery({ queryKey: ["cash-accounts"], queryFn: listCashAccounts });
  const { data: methods } = useQuery({ queryKey: ["payment-methods"], queryFn: () => listPaymentMethods({}) });

  const [receivableAcc, setReceivableAcc] = React.useState("");
  const [payableAcc, setPayableAcc] = React.useState("");
  const [defaultMethod, setDefaultMethod] = React.useState("");

  React.useEffect(() => {
    if (!cfg) return;
    setReceivableAcc(cfg[KEYS.default_receivable_account] ?? "");
    setPayableAcc(cfg[KEYS.default_payable_account] ?? "");
    setDefaultMethod(cfg[KEYS.default_payment_method] ?? "");
  }, [cfg]);

  const salvar = useMutation({
    mutationFn: async () =>
      upsertPousadaConfigs({
        [KEYS.default_receivable_account]: receivableAcc,
        [KEYS.default_payable_account]: payableAcc,
        [KEYS.default_payment_method]: defaultMethod,
      }),
    onSuccess: () => { toast.success("Preferências salvas!"); refetch(); },
    onError: () => toast.error("Falha ao salvar."),
  });

  return (
    <form className="grid grid-cols-12 gap-3" onSubmit={(e) => { e.preventDefault(); salvar.mutate(); }}>
      <div className="col-span-12 md:col-span-4">
        <Field label="Conta padrão (recebimentos)">
          <Select value={receivableAcc} onChange={(e) => setReceivableAcc(e.target.value)}>
            <option value="">Selecione…</option>
            {(accounts ?? []).map((a: CashAccountDTO) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="col-span-12 md:col-span-4">
        <Field label="Conta padrão (pagamentos)">
          <Select value={payableAcc} onChange={(e) => setPayableAcc(e.target.value)}>
            <option value="">Selecione…</option>
            {(accounts ?? []).map((a: CashAccountDTO) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="col-span-12 md:col-span-4">
        <Field label="Método de pagamento padrão">
          <Select value={defaultMethod} onChange={(e) => setDefaultMethod(e.target.value)}>
            <option value="">Selecione…</option>
            {(methods ?? []).map((m: PaymentMethodDTO) => (
              <option key={m.code} value={m.code}>{m.description}</option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="col-span-12 flex justify-end">
        <Button type="submit" disabled={salvar.isPending}>
          {salvar.isPending ? "Salvando…" : "Salvar"}
        </Button>
      </div>
    </form>
  );
}