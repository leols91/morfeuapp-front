"use client";
import * as React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/form/Field";
import { getPousadaConfigObject, upsertPousadaConfigs, KEYS } from "@/services/settings";
import toast from "react-hot-toast";

export function GeneralTab() {
  const { data, refetch, isFetching } = useQuery({
    queryKey: ["settings", "pousada", "general"],
    queryFn: getPousadaConfigObject,
  });

  const [name, setName] = React.useState("");
  const [tradeName, setTradeName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [address, setAddress] = React.useState("");

  React.useEffect(() => {
    if (!data) return;
    setName(data[KEYS.pousada_name] ?? "");
    setTradeName(data[KEYS.pousada_trade_name] ?? "");
    setPhone(data[KEYS.pousada_phone] ?? "");
    setEmail(data[KEYS.pousada_email] ?? "");
    setAddress(data[KEYS.pousada_address] ?? "");
  }, [data]);

  const salvar = useMutation({
    mutationFn: async () =>
      upsertPousadaConfigs({
        [KEYS.pousada_name]: name,
        [KEYS.pousada_trade_name]: tradeName,
        [KEYS.pousada_phone]: phone,
        [KEYS.pousada_email]: email,
        [KEYS.pousada_address]: address,
      }),
    onSuccess: () => { toast.success("Salvo!"); refetch(); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Falha ao salvar."),
  });

  return (
    <form className="grid grid-cols-12 gap-3" onSubmit={(e) => { e.preventDefault(); salvar.mutate(); }}>
      <div className="col-span-12 md:col-span-6">
        <Field label="Razão social">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
      </div>
      <div className="col-span-12 md:col-span-6">
        <Field label="Nome fantasia">
          <Input value={tradeName} onChange={(e) => setTradeName(e.target.value)} />
        </Field>
      </div>

      <div className="col-span-12 md:col-span-4">
        <Field label="Telefone">
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>
      </div>
      <div className="col-span-12 md:col-span-8">
        <Field label="E-mail">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
      </div>

      <div className="col-span-12">
        <Field label="Endereço">
          <Textarea rows={3} value={address} onChange={(e) => setAddress(e.target.value)} />
        </Field>
      </div>

      <div className="col-span-12 flex justify-end">
        <Button type="submit" disabled={salvar.isPending || isFetching}>
          {salvar.isPending ? "Salvando…" : "Salvar alterações"}
        </Button>
      </div>
    </form>
  );
}