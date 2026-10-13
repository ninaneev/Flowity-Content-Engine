import React from 'react';

/**
 * Componente de cartão individual para exibição de métricas numéricas simples.
 *
 * Props:
 * - rotulo: Rótulo da métrica (ex: "Publicações")
 * - valor: Valor principal a ser exibido (ex: 42 ou "4,2%")
 * - detalhe: Texto auxiliar ou de contexto (opcional)
 * - icone: Componente de ícone do Lucide (opcional, decorativo)
 */
export default function StatCard({ rotulo, valor, detalhe, icone: Icone }) {
  return (
    <div className="card p-6 flex flex-col justify-between">
      {/* Cabeçalho do cartão: Rótulo e Ícone */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-text-muted">{rotulo}</span>
        {Icone && <Icone className="w-5 h-5 text-flowity-purple" aria-hidden="true" />}
      </div>

      {/* Conteúdo principal: Valor numérico e descrição */}
      <div>
        <div className="text-3xl font-bold text-flowity-purple tracking-tight">
          {valor}
        </div>
        {detalhe && (
          <p className="text-xs text-text-muted mt-1">{detalhe}</p>
        )}
      </div>
    </div>
  );
}
