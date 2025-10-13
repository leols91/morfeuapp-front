"use client";
import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { GeneralTab } from "@/components/settings/tabs/GeneralTab";
import { HouseRulesTab } from "@/components/settings/tabs/HouseRulesTab";
import { SalesChannelsTab } from "@/components/settings/tabs/SalesChannelsTab";
import { FinancialTab } from "@/components/settings/tabs/FinancialTab";
import { ReservationPoliciesTab } from "@/components/settings/tabs/ReservationPoliciesTab";
import { MessagingTab } from "@/components/settings/tabs/MessagingTab";
import { IntegrationsTab } from "@/components/settings/tabs/IntegrationsTab";


export default function ConfiguracoesPage() {
  const [tab, setTab] = React.useState("geral");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Configurações</h1>
      </div>

      <div className="surface">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex flex-wrap gap-2">
            <TabsTrigger value="geral">Dados da pousada</TabsTrigger>
            <TabsTrigger value="regras">Horários & Crianças</TabsTrigger>
            <TabsTrigger value="canais">Canais de venda</TabsTrigger>
            <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
            <TabsTrigger value="politicas">Políticas de reserva</TabsTrigger>
            <TabsTrigger value="mensagens">Mensagens</TabsTrigger>
            <TabsTrigger value="integracoes">Integrações</TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent value="geral"><GeneralTab /></TabsContent>
            <TabsContent value="regras"><HouseRulesTab /></TabsContent>
            <TabsContent value="canais"><SalesChannelsTab /></TabsContent>
            <TabsContent value="financeiro"><FinancialTab /></TabsContent>
            <TabsContent value="politicas"><ReservationPoliciesTab /></TabsContent>
            <TabsContent value="mensagens"><MessagingTab /></TabsContent>
            <TabsContent value="integracoes"><IntegrationsTab /></TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}