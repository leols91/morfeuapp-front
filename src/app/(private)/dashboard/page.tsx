export default function DashboardPage() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="surface-2">
        <div className="text-sm opacity-70 mb-1">Check-ins de hoje</div>
        <div className="text-3xl font-bold leading-tight">0</div>
      </div>

      <div className="surface-2">
        <div className="text-sm opacity-70 mb-1">Ocupação</div>
        <div className="text-3xl font-bold leading-tight">--%</div>
      </div>

      <div className="surface-2">
        <div className="text-sm opacity-70 mb-1">Saldo em aberto</div>
        <div className="text-3xl font-bold leading-tight">R$ --</div>
      </div>

      <div className="surface md:col-span-3">
        Em breve: últimas reservas, pendências de pagamento, etc.
      </div>
    </div>
  );
}