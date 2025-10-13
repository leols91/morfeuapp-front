"use client";
import * as React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/form/Field";
import { getPousadaConfigObject, upsertPousadaConfigs, KEYS } from "@/services/settings";
import toast from "react-hot-toast";

export function ReservationPoliciesTab() {
  const { data, refetch } = useQuery({
    queryKey: ["settings", "pousada", "reservation-policies"],
    queryFn: getPousadaConfigObject,
  });

  const [cancelFreeDays, setCancelFreeDays] = React.useState("7");
  const [noShowPenalty, setNoShowPenalty] = React.useState("100");
  const [refundPolicy, setRefundPolicy] = React.useState("partial");

  React.useEffect(() => {
    if (!data) return;
    setCancelFreeDays(data[KEYS.cancel_free_days] ?? "7");
    setNoShowPenalty(data[KEYS.no_show_penalty_percent] ?? "100");
    setRefundPolicy(data[KEYS.refund_policy] ?? "partial");
  }, [data]);

  const salvar = useMutation({
    mutationFn: async () =>
      upsertPousadaConfigs({
        [KEYS.cancel_free_days]: cancelFreeDays,
        [KEYS.no_show_penalty_percent]: noShowPenalty,
        [KEYS.refund_policy]: refundPolicy,
      }),
    onSuccess: () => { toast.success("Políticas salvas!"); refetch(); },
    onError: () => toast.error("Falha ao salvar."),
  });

  return (
    <form className="grid grid-cols-12 gap-3" onSubmit={(e) => { e.preventDefault(); salvar.mutate(); }}>
      <div className="col-span-12 md:col-span-4">
        <Field label="Cancelamento grátis até (dias antes)">
          <Input inputMode="numeric" value={cancelFreeDays} onChange={(e) => setCancelFreeDays(e.target.value)} />
        </Field>
      </div>
      <div className="col-span-12 md:col-span-4">
        <Field label="Multa por no-show (%)">
          <Input inputMode="decimal" value={noShowPenalty} onChange={(e) => setNoShowPenalty(e.target.value)} />
        </Field>
      </div>
      <div className="col-span-12 md:col-span-4">
        <Field label="Política de reembolso">
          <Select value={refundPolicy} onChange={(e) => setRefundPolicy(e.target.value)}>
            <option value="total">Total</option>
            <option value="partial">Parcial</option>
            <option value="none">Sem reembolso</option>
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