"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/form/Field";
import { createProductCategory } from "@/services/estoque";
import EstoqueMenu from "@/components/estoque/EstoqueMenu";

const schema = z.object({
  name: z.string().min(1, "Informe o nome da categoria"),
});
type FormInput = z.input<typeof schema>;
type FormOutput = z.infer<typeof schema>;

export default function NovaCategoriaPage() {
  const router = useRouter();
  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  const criar = useMutation({
    mutationFn: async (raw: FormInput) => {
      const v: FormOutput = schema.parse(raw);
      return await createProductCategory(v.name);
    },
    onSuccess: () => {
      toast.success("Categoria criada!");
      router.replace("/estoque/categorias");
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Falha ao criar categoria."),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Nova categoria</h1>
      </div>

      <EstoqueMenu />

      <form onSubmit={form.handleSubmit((v) => criar.mutate(v))} className="space-y-4">
        <div className="surface-2">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-6">
              <Field label="Nome" error={form.formState.errors.name?.message}>
                <Input {...form.register("name")} placeholder="Ex.: Bebidas" />
              </Field>
            </div>
          </div>
        </div>

        <div className="surface-2">
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={criar.isPending}>
              {criar.isPending ? "Salvando…" : "Criar categoria"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}