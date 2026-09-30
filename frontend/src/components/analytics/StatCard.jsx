import React from 'react';

/**
 * Componente de cartão individual para exibição de métricas numéricas simples.
 * 
 * Props:
 * - title: Rótulo da métrica (ex: "Total de Publicações")
 * - value: Valor principal a ser exibido (ex: 42 ou "4,2%")
 * - description: Texto auxiliar ou de contexto (opcional)
 * - icon: Componente de ícone do Lucide/React-Icons (opcional)
 */
export default function StatCard({ title, value, description, icon: Icon }) {
  return (
    <div className="card p-6 flex flex-col justify-between">
      {/* Cabeçalho do cartão: Rótulo e Ícone */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-text-muted">{title}</span>
        {Icon && <Icon className="w-5 h-5 text-flowity-purple" />}
      </div>

      {/* Conteúdo principal: Valor numérico e descrição */}
      <div>
        <div className="text-3xl font-bold text-flowity-purple tracking-tight">
          {value}
        </div>
        {description && (
          <p className="text-xs text-text-muted mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}