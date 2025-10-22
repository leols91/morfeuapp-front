"use client";
import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/form/Field";
import {
  listProductCategories,
  updateProductCategory,
  deleteProductCategory,
  type ProductCategoryDTO,
} from "@/services/estoque";
import EstoqueMenu from "@/components/estoque/EstoqueMenu";

const schema = z.object({
  name: z.string().min(1, "Informe o nome da categoria"),
});
type FormInput = z.input<typeof schema>;
type FormOutput = z.infer<typeof schema>;

export default function EditarCategoriaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const q = useQuery<ProductCategoryDTO[]>({
    queryKey: ["productCategories"],
    queryFn: listProductCategories,
  });

  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  // carrega categoria via list + find
  React.useEffect(() => {
    if (!q.data) return;
    const found = q.data.find((c) => c.id === id);
    if (found) {
      form.reset({ name: found.name });
    }
  }, [q.data, id, form]);

  const salvar = useMutation({
    mutationFn: async (raw: FormInput) => {
      const v: FormOutput = schema.parse(raw);
      return await updateProductCategory(id, v.name);
    },
    onSuccess: () => {
      toast.success("Categoria atualizada!");
      router.replace("/estoque/categorias");
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? "Falha ao salvar categoria."),
  });

  const excluir = useMutation({
    mutationFn: async () => {
      await deleteProductCategory(id);
    },
    onSuccess: () => {
      toast.success("Categoria excluída.");
      router.replace("/estoque/categorias");
    },
    onError: (e: any) =>
      toast.error(
        e?.response?.data?.message ??
          "Falha ao excluir. Verifique se existem produtos vinculados."
      ),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Editar categoria</h1>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (confirm("Tem certeza que deseja excluir esta categoria?")) {
              excluir.mutate();
            }
          }}
          disabled={excluir.isPending}
        >
          Excluir
        </Button>
      </div>

      <EstoqueMenu />

      {q.isLoading ? (
        <div className="surface-2 p-6 text-sm opacity-70">Carregando…</div>
      ) : (
        <form onSubmit={form.handleSubmit((v) => salvar.mutate(v))} className="space-y-4">
          <div className="surface-2">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <Field label="Nome" error={form.formState.errors.name?.message}>
                  <Input {...form.register("name")} />
                </Field>
              </div>
            </div>
          </div>

          <div className="surface-2">
            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={salvar.isPending}>
                {salvar.isPending ? "Salvando…" : "Salvar alterações"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}