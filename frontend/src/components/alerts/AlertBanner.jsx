import React, { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { alertsApi } from "../../lib/api";
import { formatarPercentual } from "../analytics/format";

const PLATAFORMA = { linkedin: "LinkedIn", x: "X" };

function formatarLimite(taxa) {
  // 0.02 -> "2%", 0.025 -> "2,5%"
  const valor = Math.round((Number(taxa) || 0) * 1000) / 10;
  return `${valor.toLocaleString("pt-BR")}%`;
}

/**
 * Lista os posts abaixo do limite de engajamento.
 * Cada item tem ícone E texto; o alerta nunca depende só da cor.
 */
export default function AlertBanner() {
  const [alertas, setAlertas] = useState([]);
  const [limite, setLimite] = useState(null);

  useEffect(() => {
    Promise.all([alertsApi.list(), alertsApi.getSettings()])
      .then(([lista, config]) => {
        setAlertas(lista.data);
        setLimite(config.data.min_engagement_rate);
      })
      .catch(() => {
        setAlertas([]);
      });
  }, []);

  return (
    <div role="status" aria-live="polite">
      {alertas.length > 0 && (
        <section
          aria-labelledby="titulo-alertas"
          className="mb-6 rounded-lg border border-amber-400/60 bg-bg-surface p-4"
        >
          <h2 id="titulo-alertas" className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <AlertTriangle size={16} className="text-amber-300" aria-hidden="true" />
            {alertas.length === 1
              ? "1 post abaixo do limite de engajamento"
              : `${alertas.length} posts abaixo do limite de engajamento`}
          </h2>
          <ul className="mt-3 space-y-2">
            {alertas.map((a) => (
              <li key={`${a.post_id}-${a.platform}`} className="flex items-start gap-2 text-sm">
                <AlertTriangle
                  size={14}
                  className="mt-0.5 flex-shrink-0 text-amber-300"
                  aria-hidden="true"
                />
                <span className="text-text-primary">
                  <span className="font-semibold">
                    Abaixo do limite — {formatarPercentual(a.engagement_rate)} (limite:{" "}
                    {formatarLimite(limite)})
                  </span>
                  <span className="text-text-secondary">
                    {" "}
                    · {PLATAFORMA[a.platform] || a.platform} · “{a.hook}”
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
