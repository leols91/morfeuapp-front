"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/form/Field";
import { listAmenities, updateAmenity, deleteAmenity, type AmenityDTO } from "@/services/acomodacoes";
import { getActivePousadaId } from "@/lib/tenants";
import toast from "react-hot-toast";

const schema = z.object({
  name: z.string().min(1, "Informe o nome"),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.infer<typeof schema>;

export default function EditAmenidadePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id as string;

  const [pousadaId, setPousadaId] = React.useState<string | null>(null);
  React.useEffect(() => setPousadaId(getActivePousadaId()), []);

  const amenitiesQ = useQuery<AmenityDTO[]>({
    queryKey: ["amenities", pousadaId],
    queryFn: () => listAmenities(pousadaId ?? ""),
    enabled: !!pousadaId,
    refetchOnWindowFocus: false,
  });

  const current = (amenitiesQ.data ?? []).find((a) => a.id === id);

  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  React.useEffect(() => {
    if (current) form.reset({ name: current.name });
  }, [current, form]);

  const save = useMutation({
    mutationFn: async (raw: FormInput) => {
      const v: FormOutput = schema.parse(raw);
      return updateAmenity(id, v.name);
    },
    onSuccess: () => {
      toast.success("Alterações salvas!");
      router.replace("/acomodacoes/amenidades");
    },
    onError: () => toast.error("Falha ao salvar."),
  });

  const del = useMutation({
    mutationFn: () => deleteAmenity(id),
    onSuccess: () => {
      toast.success("Comodidade excluída.");
      router.replace("/acomodacoes/amenidades");
    },
    onError: () => toast.error("Falha ao excluir."),
  });

  if (!current && amenitiesQ.isLoading) {
    return <div className="surface-2 p-6 text-sm opacity-70">Carregando…</div>;
  }
  if (!current) {
    return <div className="surface-2 p-6 text-sm text-red-500">Comodidade não encontrada.</div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Editar comodidade</h1>
      </div>

      <div className="surface-2 max-w-lg">
        <form
          onSubmit={form.handleSubmit((v) => save.mutate(v))}
          className="grid grid-cols-12 gap-4"
        >
          <div className="col-span-12">
            <Field label="Nome" error={form.formState.errors.name?.message}>
              <Input placeholder="Ex.: Ar-condicionado" {...form.register("name")} />
            </Field>
          </div>

          <div className="col-span-12 flex justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => del.mutate()}>
                Excluir
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? "Salvando…" : "Salvar"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}