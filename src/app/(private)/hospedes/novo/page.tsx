"use client";
import { HospedeForm, HospedeFormOutput } from "@/components/hospedes/HospedeForm";
import { digitsOnly } from "@/lib/validation/br";
import { createHospede } from "@/services/hospedes";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function NovoHospedePage() {
  const router = useRouter();
  const criar = useMutation({
    mutationFn: async (data: HospedeFormOutput) => {
      return await createHospede({
        fullName: data.fullName.trim(),
        email: data.email || null,
        phone: data.phone ? digitsOnly(data.phone) : null,
        documentType: data.documentType || null,
        documentId: data.documentId ? digitsOnly(data.documentId) : null,
        birthDate: data.birthDate || null,
        notes: data.notes || null,
        blacklisted: data.status === "blacklisted",
        address: data.address,
      });
    },
    onSuccess: () => {
      toast.success("Hóspede criado com sucesso!");
      router.replace("/hospedes");
    },
    onError: () => toast.error("Falha ao criar hóspede."),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Novo hóspede</h1>
      <HospedeForm isSubmitting={criar.isPending} onSubmit={(v) => criar.mutate(v)} onCancel={() => router.back()} />
    </div>
  );
}