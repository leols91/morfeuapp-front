"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/form/Field";
import { getActivePousadaId } from "@/lib/tenants";
import { createAmenity } from "@/services/acomodacoes";

export default function NovaAmenidadePage() {
  const router = useRouter();
  const pousadaId = getActivePousadaId();
  const [name, setName] = React.useState("");

  const criar = useMutation({
    mutationFn: async () => {
      if (!pousadaId) throw new Error("Nenhuma pousada ativa.");
      if (!name.trim()) throw new Error("Informe o nome.");
      await createAmenity(pousadaId, name.trim());
    },
    onSuccess: () => {
      toast.success("Comodidade criada!");
      router.replace("/acomodacoes/amenidades");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? err?.message ?? "Falha ao criar comodidade.");
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Nova comodidade</h1>
      </div>

      <div className="surface-2">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-6">
            <Field label="Nome">
              <Input
                placeholder="Ex.: Banheiro privativo"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
          </div>
        </div>
      </div>

      <div className="surface-2">
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button onClick={() => criar.mutate()} disabled={criar.isPending || !pousadaId}>
            {criar.isPending ? "Salvando…" : "Criar"}
          </Button>
        </div>
      </div>
    </div>
  );
}