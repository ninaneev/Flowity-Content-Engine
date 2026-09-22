import React from "react";

/** Cartão com um rótulo e um número grande. */
export default function StatCard({ rotulo, valor, detalhe }) {
  return (
    <div className="card">
      <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">{rotulo}</p>
      <p className="mt-2 text-2xl font-semibold text-flowity-purple">{valor}</p>
      {detalhe && <p className="mt-1 text-xs text-text-secondary">{detalhe}</p>}
    </div>
  );
}
