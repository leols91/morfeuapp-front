"use client";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth";
import { getActivePousadaId, setActivePousadaId } from "@/lib/tenants";

export function TenantSwitcher() {
  const { user } = useAuth();
  const [active, setActive] = React.useState<string | null>(getActivePousadaId());

  React.useEffect(() => {
    const id = getActivePousadaId();
    if (id) setActive(id);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setActive(e.target.value);
    setActivePousadaId(e.target.value);
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }

  const options = user?.pousadas ?? [];

  return (
    <div className="flex items-center gap-3">
      <select value={active ?? ""} onChange={handleChange} className="h-10 rounded-xl border px-3">
        <option value="" disabled>Selecione a pousada</option>
        {options.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <Button size="sm" variant="outline" onClick={() => alert('Em breve: criar/gerenciar pousadas')}>Gerenciar</Button>
    </div>
  );
}
