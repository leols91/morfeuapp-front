// src/components/reservas/HospedeSearch.tsx
"use client";
import * as React from "react";
import { searchHospedes } from "@/services/reservas";
import type { HospedeDTO } from "@/types/reserva"; // ✅ importa do types
import { cn } from "@/components/ui/cn";
import { CreateHospedeModal } from "./CreateHospedeModal";

type Props = {
  value: HospedeDTO | null;
  onChange: (h: HospedeDTO | null) => void;
};

export function HospedeSearch({ value, onChange }: Props) {
  const [q, setQ] = React.useState("");
  const [list, setList] = React.useState<HospedeDTO[]>([]);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [openCreate, setOpenCreate] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  React.useEffect(() => {
    const handler = setTimeout(async () => {
      if (q.length < 2) { setList([]); setOpen(false); return; }
      setLoading(true);
      const res = await searchHospedes(q);
      setList(res);
      setLoading(false);
      setOpen(true);
    }, 250);
    return () => clearTimeout(handler);
  }, [q]);

  function handleCreated(h: HospedeDTO) {
    onChange(h);
    setQ("");
  }

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center gap-2">
        <input
          placeholder="Buscar hóspede (nome, documento, e-mail)"
          className="h-9 w-full md:w-[28rem] rounded-2xl border-subtle bg-transparent px-3"
          value={value ? value.nome : q}
          onChange={(e) => { onChange(null); setQ(e.target.value); }}
          onFocus={() => { if (list.length > 0) setOpen(true); }}
        />
        {value && (
          <button
            type="button"
            className="text-sm opacity-70 hover:opacity-100 underline"
            onClick={() => onChange(null)}
          >
            trocar
          </button>
        )}
      </div>

      {/* dropdown */}
      {open && !value && (
        <div className="absolute z-10 mt-2 w-full md:w-[28rem] rounded-2xl border-subtle border bg-white dark:bg-[#0F172A] shadow-soft">
          {loading && <div className="px-3 py-2 text-sm opacity-70">Buscando…</div>}

          {!loading && list.length === 0 && (
            <div className="px-3 py-2 text-sm">
              <div className="opacity-70">Nenhum hóspede encontrado para “{q}”.</div>
              <button
                type="button"
                className="mt-2 inline-flex rounded-xl border-subtle border px-3 py-1 hover:bg-black/5 dark:hover:bg-white/5"
                onClick={() => setOpenCreate(true)}
              >
                Cadastrar hóspede…
              </button>
            </div>
          )}

          {!loading && list.map((h) => (
            <button
              key={h.id}
              type="button"
              className={cn("w-full text-left px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5")}
              onClick={() => { onChange(h); setOpen(false); }}
            >
              <div className="font-medium">{h.nome}</div>
              <div className="opacity-70 text-xs">
                {[h.documento, h.email, h.telefone].filter(Boolean).join(" · ")}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Modal: cadastrar hóspede */}
      <CreateHospedeModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}