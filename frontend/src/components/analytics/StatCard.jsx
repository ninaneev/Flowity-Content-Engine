import React from 'react';

/**
 * Single card for showing simple numeric metrics.
 *
 * Props:
 * - rotulo: Metric label (e.g. "Posts")
 * - valor: Main value to display (e.g. 42 or "4.2%")
 * - detalhe: Helper or context text (optional)
 * - icone: Lucide icon component (optional, decorative)
 */
export default function StatCard({ rotulo, valor, detalhe, icone: Icone }) {
  return (
    <div className="card p-6 flex flex-col justify-between">
      {/* Card header: label and icon */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-text-muted">{rotulo}</span>
        {Icone && <Icone className="w-5 h-5 text-flowity-purple" aria-hidden="true" />}
      </div>

      {/* Main content: numeric value and description */}
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
