"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/form/Field";
import { createRoomType } from "@/services/acomodacoes";
import { getActivePousadaId } from "@/lib/tenants";
import toast from "react-hot-toast";

const schema = z.object({
  name: z.string().min(1, "Informe o nome"),
  description: z.string().optional(),
  occupancyMode: z.enum(["private", "shared"], { errorMap: () => ({ message: "Selecione o modo" }) }),
  baseOccupancy: z.coerce.number().int().min(1, "Mínimo 1"),
  maxOccupancy: z.coerce.number().int().min(1, "Mínimo 1"),
}).refine(v => v.maxOccupancy >= v.baseOccupancy, {
  message: "Máxima deve ser ≥ Base",
  path: ["maxOccupancy"],
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.infer<typeof schema>;

export default function NewRoomTypePage() {
  const router = useRouter();
  const [pousadaId, setPousadaId] = React.useState<string | null>(null);
  React.useEffect(() => setPousadaId(getActivePousadaId()), []);

  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      occupancyMode: "private",
      baseOccupancy: 2,
      maxOccupancy: 2,
    },
  });

  const criar = useMutation({
    mutationFn: async (raw: FormInput) => {
      if (!pousadaId) throw new Error("Nenhuma pousada ativa.");
      const v: FormOutput = schema.parse(raw);
      return await createRoomType(pousadaId, v);
    },
    onSuccess: () => {
      toast.success("Tipo criado com sucesso!");
      router.replace("/acomodacoes/tipos");
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message ?? "Falha ao criar tipo.");
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Novo tipo de quarto</h1>
      </div>

      {!pousadaId ? (
        <div className="surface-2 p-4 text-sm opacity-80">Selecione uma pousada para continuar.</div>
      ) : (
        <form onSubmit={form.handleSubmit((v) => criar.mutate(v))} className="space-y-4">
          <div className="surface-2">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-5">
                <Field label="Nome" error={form.formState.errors.name?.message}>
                  <Input placeholder="Ex.: Suíte Casal Luxo" {...form.register("name")} />
                </Field>
              </div>
              <div className="col-span-12 md:col-span-3">
                <Field label="Modo" error={form.formState.errors.occupancyMode?.message}>
                  <Select {...form.register("occupancyMode")}>
                    <option value="private">Privado (por quarto)</option>
                    <option value="shared">Compartilhado (por cama)</option>
                  </Select>
                </Field>
              </div>
              <div className="col-span-6 md:col-span-2">
                <Field label="Capacidade base" error={form.formState.errors.baseOccupancy?.message}>
                  <Input type="number" min={1} {...form.register("baseOccupancy", { valueAsNumber: true })} />
                </Field>
              </div>
              <div className="col-span-6 md:col-span-2">
                <Field label="Capacidade máxima" error={form.formState.errors.maxOccupancy?.message}>
                  <Input type="number" min={1} {...form.register("maxOccupancy", { valueAsNumber: true })} />
                </Field>
              </div>
              <div className="col-span-12">
                <Field label="Descrição (opcional)">
                  <Textarea rows={3} placeholder="Detalhes do tipo de quarto" {...form.register("description")} />
                </Field>
              </div>
            </div>
          </div>

          <div className="surface-2">
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={criar.isPending || !pousadaId}>
                {criar.isPending ? "Salvando…" : "Criar tipo"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}