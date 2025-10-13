"use client";
import * as React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/form/Field";
import { getPousadaConfigObject, upsertPousadaConfigs, KEYS } from "@/services/settings";
import toast from "react-hot-toast";

export function MessagingTab() {
  const { data, refetch } = useQuery({
    queryKey: ["settings", "pousada", "messaging"],
    queryFn: getPousadaConfigObject,
  });

  const [welcome, setWelcome] = React.useState("");
  const [checkout, setCheckout] = React.useState("");
  const [billing, setBilling] = React.useState("");
  const [whatsapp, setWhatsapp] = React.useState("");

  React.useEffect(() => {
    if (!data) return;
    setWelcome(data[KEYS.message_welcome] ?? "");
    setCheckout(data[KEYS.message_checkout] ?? "");
    setBilling(data[KEYS.message_billing] ?? "");
    setWhatsapp(data[KEYS.whatsapp_link] ?? "");
  }, [data]);

  const salvar = useMutation({
    mutationFn: async () =>
      upsertPousadaConfigs({
        [KEYS.message_welcome]: welcome,
        [KEYS.message_checkout]: checkout,
        [KEYS.message_billing]: billing,
        [KEYS.whatsapp_link]: whatsapp,
      }),
    onSuccess: () => { toast.success("Mensagens salvas!"); refetch(); },
    onError: () => toast.error("Falha ao salvar."),
  });

  return (
    <form className="grid grid-cols-12 gap-3" onSubmit={(e) => { e.preventDefault(); salvar.mutate(); }}>
      <div className="col-span-12 md:col-span-6">
        <Field label="Mensagem de boas-vindas">
          <Textarea rows={4} value={welcome} onChange={(e) => setWelcome(e.target.value)} />
        </Field>
      </div>
      <div className="col-span-12 md:col-span-6">
        <Field label="Mensagem de checkout">
          <Textarea rows={4} value={checkout} onChange={(e) => setCheckout(e.target.value)} />
        </Field>
      </div>
      <div className="col-span-12">
        <Field label="Mensagem de cobrança (inadimplência)">
          <Textarea rows={3} value={billing} onChange={(e) => setBilling(e.target.value)} />
        </Field>
      </div>
      <div className="col-span-12 md:col-span-6">
        <Field label="WhatsApp oficial (link)">
          <Input placeholder="https://wa.me/55..." value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
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