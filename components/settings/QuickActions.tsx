'use client';
import React from 'react';
import Button from '@/components/Button'; // Usando o componente Button importado

type Props = {
  onOpenPassword: () => void;
  // Futuramente, podemos adicionar uma rota para a página de edição da pousada
  // onConfigurePousada: () => void; 
};

const QuickActions: React.FC<Props> = ({ onOpenPassword }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
      <Button type="neutral" label="Alterar Senha" onClick={onOpenPassword} />
      <Button type="neutral" label="Configurar Pousada" onClick={() => alert('Funcionalidade a ser implementada!')} />
    </div>
  );
};

// O componente de exemplo 'Button' foi removido daqui para resolver o conflito.

export default QuickActions;

