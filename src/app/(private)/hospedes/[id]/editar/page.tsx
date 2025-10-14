"use client";
import { HospedeForm, HospedeFormOutput } from "@/components/hospedes/HospedeForm";
import { digitsOnly, normalizeUF, toDocType } from "@/lib/validation/br";
import { getHospedeById, updateHospede } from "@/services/hospedes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function EditarHospedePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const q = useQuery({
    queryKey: ["hospede", id],
    queryFn: () => getHospedeById(id),
    enabled: !!id,
  });

  const salvar = useMutation({
    mutationFn: async (data: HospedeFormOutput) => {
      return await updateHospede(id, {
        ...data,
        phone: data.phone ? digitsOnly(data.phone) : null,
        documentId: data.documentId ? digitsOnly(data.documentId) : null,
        blacklisted: data.status === "blacklisted",
      });
    },
    onSuccess: () => {
      toast.success("Hóspede atualizado!");
      router.replace("/hospedes");
    },
    onError: () => toast.error("Falha ao salvar."),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Editar hóspede</h1>

      {q.isLoading ? (
        <div className="surface-2 p-6 text-sm opacity-70">Carregando…</div>
      ) : (
        <HospedeForm
          initialData={
            q.data
              ? {
                  // Somente os campos do formulário + normalização de tipos
                  fullName: q.data.fullName ?? "",
                  email: q.data.email ?? undefined,
                  phone: q.data.phone ?? undefined,
                  status: q.data.blacklisted ? "blacklisted" : "ok",
                  documentType: toDocType(q.data.documentType), // "" | "cpf" | "rg" | "passport" | "other"
                  documentId: q.data.documentId ?? undefined,
                  birthDate: q.data.birthDate ?? undefined,
                  notes: q.data.notes ?? undefined,
                  address: {
                    street: q.data.address?.street ?? "",
                    number: q.data.address?.number ?? "",
                    complement: q.data.address?.complement ?? "",
                    district: q.data.address?.district ?? "",
                    city: q.data.address?.city ?? "",
                    state: normalizeUF(q.data.address?.state ?? ""), // "" | UF
                    zip: q.data.address?.zip ?? "",
                    country: q.data.address?.country ?? "",
                  },
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