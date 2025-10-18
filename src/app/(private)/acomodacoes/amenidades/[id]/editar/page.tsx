"use client";
import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/form/Field";
import { getActivePousadaId } from "@/lib/tenants";
import { getAmenity, updateAmenity } from "@/services/acomodacoes";

export default function EditarAmenidadePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const pousadaId = getActivePousadaId();

  const amenityQ = useQuery({
    queryKey: ["amenity", pousadaId, id],
    queryFn: async () => {
      if (!pousadaId) return null;
      return await getAmenity(pousadaId, id);
    },
    enabled: !!pousadaId && !!id,
    refetchOnWindowFocus: false,
  });

  const [name, setName] = React.useState("");

  React.useEffect(() => {
    if (amenityQ.data) setName(amenityQ.data.name);
  }, [amenityQ.data]);

  const salvar = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Informe o nome.");
      await updateAmenity(id, name.trim());
    },
    onSuccess: () => {
      toast.success("Comodidade atualizada!");
      router.replace("/acomodacoes/amenidades");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? err?.message ?? "Falha ao atualizar.");
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Editar comodidade</h1>
      </div>

      {amenityQ.isLoading ? (
        <div className="surface-2 p-6 text-sm opacity-70">Carregando…</div>
      ) : !amenityQ.data ? (
        <div className="surface-2 p-6 text-sm text-red-500">
          Comodidade não encontrada.
        </div>
      ) : (
        <>
          <div className="surface-2">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <Field label="Nome">
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </Field>
              </div>
            </div>
          </div>

          <div className="surface-2">
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button onClick={() => salvar.mutate()} disabled={salvar.isPending}>
                {salvar.isPending ? "Salvando…" : "Salvar alterações"}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}