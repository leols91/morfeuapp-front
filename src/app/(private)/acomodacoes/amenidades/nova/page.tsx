"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/form/Field";
import { createAmenity } from "@/services/acomodacoes";
import { getActivePousadaId } from "@/lib/tenants";
import toast from "react-hot-toast";

const schema = z.object({
  name: z.string().min(1, "Informe o nome"),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.infer<typeof schema>;

export default function NovaAmenidadePage() {
  const router = useRouter();
  const [pousadaId, setPousadaId] = React.useState<string | null>(null);
  React.useEffect(() => setPousadaId(getActivePousadaId()), []);

  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  const criar = useMutation({
    mutationFn: async (raw: FormInput) => {
      const v: FormOutput = schema.parse(raw);
      if (!pousadaId) throw new Error("Selecione uma pousada.");
      return createAmenity(pousadaId, v.name);
    },
    onSuccess: () => {
      toast.success("Comodidade criada!");
      router.replace("/acomodacoes/amenidades");
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message ?? "Falha ao criar.");
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Nova comodidade</h1>
      </div>

      <div className="surface-2 max-w-lg">
        <form
          onSubmit={form.handleSubmit((v) => criar.mutate(v))}
          className="grid grid-cols-12 gap-4"
        >
          <div className="col-span-12">
            <Field label="Nome" error={form.formState.errors.name?.message}>
              <Input placeholder="Ex.: Ar-condicionado" {...form.register("name")} />
            </Field>
          </div>

          <div className="col-span-12 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={criar.isPending || !pousadaId}>
              {criar.isPending ? "Salvando…" : "Criar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}