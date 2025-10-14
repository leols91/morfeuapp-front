"use client";
import * as React from "react";
import { Field, Select } from "@/components/ui/form/Field";
import { getActivePousadaId, setActivePousadaId } from "@/lib/tenants";
import { useQuery } from "@tanstack/react-query";
import { listMyPousadas, type PousadaLite } from "@/services/pousadas";
import toast from "react-hot-toast";

export function TenantSwitcher() {
  const [active, setActive] = React.useState<string | null>(getActivePousadaId());

  // carrega as pousadas do usuário autenticado
  const { data: options = [], isLoading } = useQuery<PousadaLite[]>({
    queryKey: ["my-pousadas"],
    queryFn: listMyPousadas,
    staleTime: 60_000,
  });

  // auto-seleciona caso só tenha uma pousada ou alguma padrão
  React.useEffect(() => {
    if (!options.length || active) return;

    const def = options.find((p) => p.isDefault);
    const chosen = def?.id ?? (options.length === 1 ? options[0].id : null);

    if (chosen) {
      setActive(chosen);
      setActivePousadaId(chosen);
      toast.success(`Pousada ativa: ${options.find(p => p.id === chosen)?.tradeName ?? "Atualizada"}`);
    }
  }, [options, active]);

  // troca de pousada manual
  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    setActive(id);
    setActivePousadaId(id);
    toast.success(`Pousada ativa alterada para: ${options.find(p => p.id === id)?.tradeName ?? "Atualizada"}`);
  }

  return (
    <div className="flex items-center">
      <Field className="m-0">
        <Select
          value={active ?? ""}
          onChange={handleChange}
          disabled={isLoading || options.length === 0}
          selectClassName="h-10 rounded-xl border px-3 min-w-[220px]"
        >
          <option value="" disabled>
            {isLoading ? "Carregando pousadas…" : "Selecione a pousada"}
          </option>
          {options.map((p) => (
            <option key={p.id} value={p.id}>
              {p.tradeName || p.legalName}
              {p.isDefault ? " • (padrão)" : ""}
            </option>
          ))}
        </Select>
      </Field>
    </div>
  );
}