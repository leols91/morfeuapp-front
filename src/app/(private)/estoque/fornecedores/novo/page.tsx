"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { createSupplier } from "@/services/estoque";
import { SupplierForm, type SupplierFormOutput } from "@/components/suppliers/SupplierForm";

export default function NovoFornecedorPage() {
  const router = useRouter();
  const criar = useMutation({
    mutationFn: async (data: SupplierFormOutput) => {
      return await createSupplier({
        legalName: data.legalName.trim(),
        documentId: data.documentId || null,
        email: data.email || null,
        phone: data.phone || null,
      });
    },
    onSuccess: () => {
      toast.success("Fornecedor criado com sucesso!");
      router.replace("/estoque/fornecedores");
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message ?? "Falha ao criar fornecedor.");
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Novo fornecedor</h1>
      <SupplierForm
        isSubmitting={criar.isPending}
        onSubmit={(v) => criar.mutate(v)}
        onCancel={() => router.back()}
      />
    </div>
  );
}