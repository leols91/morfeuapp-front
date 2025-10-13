"use client";
import * as React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/form/Field";
import { getPousadaConfigObject, upsertPousadaConfigs, KEYS } from "@/services/settings";
import toast from "react-hot-toast";

export function IntegrationsTab() {
  const { data, refetch } = useQuery({
    queryKey: ["settings", "pousada", "integrations"],
    queryFn: getPousadaConfigObject,
  });

  const [host, setHost] = React.useState("");
  const [port, setPort] = React.useState("");
  const [user, setUser] = React.useState("");
  const [pass, setPass] = React.useState("");

  React.useEffect(() => {
    if (!data) return;
    setHost(data[KEYS.smtp_host] ?? "");
    setPort(data[KEYS.smtp_port] ?? "");
    setUser(data[KEYS.smtp_user] ?? "");
    setPass(data[KEYS.smtp_pass] ?? "");
  }, [data]);

  const salvar = useMutation({
    mutationFn: async () =>
      upsertPousadaConfigs({
        [KEYS.smtp_host]: host,
        [KEYS.smtp_port]: port,
        [KEYS.smtp_user]: user,
        [KEYS.smtp_pass]: pass,
      }),
    onSuccess: () => { toast.success("Integrações salvas!"); refetch(); },
    onError: () => toast.error("Falha ao salvar."),
  });

  return (
    <form className="grid grid-cols-12 gap-3" onSubmit={(e) => { e.preventDefault(); salvar.mutate(); }}>
      <div className="col-span-12 md:col-span-6">
        <Field label="SMTP Host">
          <Input value={host} onChange={(e) => setHost(e.target.value)} />
        </Field>
      </div>
      <div className="col-span-6 md:col-span-3">
        <Field label="SMTP Porta">
          <Input inputMode="numeric" value={port} onChange={(e) => setPort(e.target.value)} />
        </Field>
      </div>
      <div className="col-span-6 md:col-span-3">
        <Field label="SMTP Usuário">
          <Input value={user} onChange={(e) => setUser(e.target.value)} />
        </Field>
      </div>
      <div className="col-span-12 md:col-span-6">
        <Field label="SMTP Senha">
          <Input type="password" value={pass} onChange={(e) => setPass(e.target.value)} />
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