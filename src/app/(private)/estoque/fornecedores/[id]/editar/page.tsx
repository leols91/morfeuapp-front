"use client";
import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { getSupplierById, updateSupplier } from "@/services/estoque";
import { SupplierForm, type SupplierFormOutput } from "@/components/suppliers/SupplierForm";

export default function EditarFornecedorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const q = useQuery({
    queryKey: ["supplier", id],
    queryFn: () => getSupplierById(id),
    enabled: !!id,
  });

  const salvar = useMutation({
    mutationFn: async (data: SupplierFormOutput) => {
      return await updateSupplier(id, {
        legalName: data.legalName.trim(),
        documentId: data.documentId || null,
        email: data.email || null,
        phone: data.phone || null,
      });
    },
    onSuccess: () => {
      toast.success("Fornecedor atualizado!");
      router.replace("/estoque/fornecedores");
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message ?? "Falha ao salvar fornecedor.");
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Editar fornecedor</h1>

      {q.isLoading ? (
        <div className="surface-2 p-6 text-sm opacity-70">Carregando…</div>
      ) : (
        <SupplierForm
          initialData={
            q.data
              ? {
                  legalName: q.data.legalName,
                  documentId: q.data.documentId ?? "",
                  email: q.data.email ?? "",
                  phone: q.data.phone ?? "",
                }
              : undefined
          }
          isSubmitting={salvar.isPending}
          onSubmit={(v) => salvar.mutate(v)}
          onCancel={() => router.back()}
        />
      )}
    </div>
  );
}