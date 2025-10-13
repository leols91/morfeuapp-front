"use client";
import * as React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/form/Field";
import { getPousadaConfigObject, upsertPousadaConfigs, KEYS } from "@/services/settings";
import toast from "react-hot-toast";

export function HouseRulesTab() {
  const { data, refetch } = useQuery({
    queryKey: ["settings", "pousada", "house-rules"],
    queryFn: getPousadaConfigObject,
  });

  const [checkin, setCheckin] = React.useState("14:00");
  const [checkout, setCheckout] = React.useState("12:00");
  const [age, setAge] = React.useState("5");
  const [allowShared, setAllowShared] = React.useState("true");

  React.useEffect(() => {
    if (!data) return;
    setCheckin(data[KEYS.checkin_time] ?? "14:00");
    setCheckout(data[KEYS.checkout_time] ?? "12:00");
    setAge(data[KEYS.child_free_until_age] ?? "5");
    setAllowShared(data[KEYS.allow_child_in_shared] ?? "true");
  }, [data]);

  const salvar = useMutation({
    mutationFn: async () =>
      upsertPousadaConfigs({
        [KEYS.checkin_time]: checkin,
        [KEYS.checkout_time]: checkout,
        [KEYS.child_free_until_age]: age,
        [KEYS.allow_child_in_shared]: allowShared,
      }),
    onSuccess: () => { toast.success("Regras salvas!"); refetch(); },
    onError: () => toast.error("Falha ao salvar."),
  });

  return (
    <form className="grid grid-cols-12 gap-3" onSubmit={(e) => { e.preventDefault(); salvar.mutate(); }}>
      <div className="col-span-6 md:col-span-3">
        <Field label="Check-in (hh:mm)">
          <Input type="time" value={checkin} onChange={(e) => setCheckin(e.target.value)} />
        </Field>
      </div>
      <div className="col-span-6 md:col-span-3">
        <Field label="Check-out (hh:mm)">
          <Input type="time" value={checkout} onChange={(e) => setCheckout(e.target.value)} />
        </Field>
      </div>
      <div className="col-span-6 md:col-span-3">
        <Field label="Criança não paga até (idade)">
          <Input inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} />
        </Field>
      </div>
      <div className="col-span-6 md:col-span-3">
        <Field label="Crianças em quarto compartilhado">
          <Select value={allowShared} onChange={(e) => setAllowShared(e.target.value)}>
            <option value="true">Permitir</option>
            <option value="false">Não permitir</option>
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