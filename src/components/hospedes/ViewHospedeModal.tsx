"use client";
import * as React from "react";
import ModalBase from "@/components/ui/ModalBase";
import { Button } from "@/components/ui/Button";
import type { HospedeDTO } from "@/services/hospedes";
import { MapPin, Mail, Phone, IdCard, CalendarDays } from "lucide-react";

export function ViewHospedeModal({
  open,
  onClose,
  hospede,
}: {
  open: boolean;
  onClose: () => void;
  hospede: (HospedeDTO & {
    address?: {
      street?: string;
      number?: string;
      complement?: string;
      neighborhood?: string;
      city?: string;
      state?: string;
      zip?: string;
      country?: string;
    } | null;
  }) | null;
}) {
  if (!open || !hospede) return null;

  const address = hospede.address;
  const addrLine1 = [address?.street, address?.number].filter(Boolean).join(", ");
  const addrLine2 = [address?.neighborhood, address?.city, address?.state]
    .filter(Boolean)
    .join(" • ");
  const zipCountry = [address?.zip, address?.country].filter(Boolean).join(" • ");

  return (
    // 👇 garante fechar ao clicar fora (backdrop)
    <ModalBase open={open} onClose={onClose}>
      <ModalBase.Card maxWidth="max-w-6xl">
        <ModalBase.Header>
          <h3 className="text-lg font-semibold">{hospede.fullName}</h3>
          {hospede.blacklisted ? (
            <span className="mt-2 inline-flex items-center rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-xs text-rose-700 dark:text-rose-300">
              Blacklist
            </span>
          ) : (
            <span className="mt-2 inline-flex items-center rounded-full border border-subtle/60 bg-black/5 px-2.5 py-0.5 text-xs opacity-80 dark:bg-white/5">
              Sem restrição
            </span>
          )}
          <p className="mt-1 text-[11px] opacity-60">ID: {hospede.id}</p>
        </ModalBase.Header>

        <ModalBase.Body>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <Info icon={<Mail className="h-4 w-4" />} label="E-mail">
              {hospede.email || "—"}
            </Info>
            <Info icon={<Phone className="h-4 w-4" />} label="Telefone">
              {hospede.phone || "—"}
            </Info>
            <Info icon={<IdCard className="h-4 w-4" />} label="Documento">
              {hospede.documentId || "—"}
            </Info>
            <Info icon={<CalendarDays className="h-4 w-4" />} label="Nascimento">
              {hospede.birthDate || "—"}
            </Info>

            <div className="md:col-span-2">
              <div className="mb-1 flex items-center gap-2 text-xs opacity-70">
                <MapPin className="h-3.5 w-3.5" />
                <span>Endereço</span>
              </div>
              {address ? (
                <div className="space-y-0.5">
                  <div>{addrLine1 || "—"}</div>
                  <div className="opacity-80">{addrLine2}</div>
                  <div className="opacity-80">{zipCountry}</div>
                  {address?.complement ? (
                    <div className="opacity-80">Compl.: {address.complement}</div>
                  ) : null}
                </div>
              ) : (
                <div>—</div>
              )}
            </div>

            <div className="md:col-span-2">
              <div className="text-xs opacity-70">Observações</div>
              <div className="mt-1 leading-relaxed">{hospede.notes || "—"}</div>
            </div>
          </div>
        </ModalBase.Body>

        <ModalBase.Footer className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </ModalBase.Footer>
      </ModalBase.Card>
    </ModalBase>
  );
}

function Info({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-2 text-xs opacity-70">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}