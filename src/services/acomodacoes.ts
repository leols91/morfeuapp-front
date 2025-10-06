import type { ListAcomodacoesParams, AcomodacaoDTO } from "@/types/acomodacao";

/** Exemplo de serviço com filtros via querystring.
 *  Troque por seu client/endpoint real.
 */
export async function listAcomodacoes(params: ListAcomodacoesParams): Promise<{ data: AcomodacaoDTO[] }> {
  // Monte sua querystring real aqui:
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.status && params.status !== "all") qs.set("status", params.status);
  if (params.tipo && params.tipo !== "all") qs.set("type", params.tipo);
  if (params.capMin != null) qs.set("capMin", String(params.capMin));
  if (params.capMax != null) qs.set("capMax", String(params.capMax));
  if (params.priceMin != null) qs.set("priceMin", String(params.priceMin));
  if (params.priceMax != null) qs.set("priceMax", String(params.priceMax));

  // TODO: substituir endpoint
  const res = await fetch(`/api/acomodacoes?${qs.toString()}`, { cache: "no-store" });
  if (!res.ok) {
    // fallback mock (até o backend estar ligado)
    return {
      data: [
        {
          id: "room_101",
          name: "Quarto 101",
          type: "room",
          status: "available",
          capacity: 2,
          basePrice: 260,
          amenities: ["Ar-condicionado", "Wi-Fi", "Banheiro privativo"],
          externalCode: "INT-101",
          description: "Quarto standard no 1º andar",
        },
        {
          id: "room_203",
          name: "Quarto 203",
          type: "room",
          status: "occupied",
          capacity: 3,
          basePrice: 320,
          amenities: ["Varanda", "Wi-Fi"],
          description: "Vista parcial da cidade",
        },
        {
          id: "bed_a1",
          name: "Beliche A1",
          type: "bed",
          status: "maintenance",
          capacity: 1,
          basePrice: 80,
          amenities: ["Tomada individual", "Cortina"],
          description: "Cama em dormitório misto",
        },
      ],
    };
  }
  const json = await res.json();
  return { data: json?.data ?? [] };
}