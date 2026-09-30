import React, { useEffect, useState } from "react";
import { metricsApi } from "../lib/api";
import StatCard from "../components/analytics/StatCard";
import BarChart from "../components/analytics/BarChart";
import PlatformCompare from "../components/analytics/PlatformCompare";
import { formatarNumero, formatarPercentual } from "../components/analytics/format";

export default function AnalyticsPage() {
  const [resumo, setResumo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    metricsApi
      .summary()
      .then((r) => setResumo(r.data))
      .catch(() => setErro("Não foi possível carregar as métricas. Tente novamente em instantes."))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-text-primary">Análise das publicações</h1>
        <p className="text-text-secondary text-sm mt-0.5">
          Em que dia o engajamento é maior e qual plataforma rende mais por publicação.
        </p>
      </div>

      {carregando && (
        <p role="status" className="text-sm text-text-secondary">
          Carregando métricas...
        </p>
      )}

      {erro && (
        <p role="alert" className="card text-sm text-text-primary">
          {erro}
        </p>
      )}

      {resumo && (
        <div className="space-y-6">
          <section aria-labelledby="titulo-numeros">
            <h2 id="titulo-numeros" className="sr-only">
              Números gerais
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard rotulo="Publicações" valor={formatarNumero(resumo.total_publicados)} />
              <StatCard rotulo="Impressões" valor={formatarNumero(resumo.total_impressoes)} />
              <StatCard
                rotulo="Interações"
                valor={formatarNumero(resumo.total_interacoes)}
                detalhe="Curtidas, comentários e compartilhamentos"
              />
              <StatCard
                rotulo="Taxa média de engajamento"
                valor={formatarPercentual(resumo.engagement_rate)}
              />
            </div>
          </section>

          {resumo.total_publicados === 0 ? (
            <p className="card text-sm text-text-secondary">
              Nenhuma métrica registrada ainda. Registre os números de um post publicado para ver o
              painel.
            </p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <section className="card lg:col-span-3" aria-labelledby="titulo-dias">
                <h2 id="titulo-dias" className="font-medium text-text-primary text-sm mb-1">
                  Engajamento médio por dia da semana
                </h2>
                <p className="text-xs text-text-secondary mb-4">
                  Pelo dia em que o post foi publicado. Dias sem publicação aparecem com um traço.
                </p>
                <BarChart dados={resumo.por_dia_semana} />
              </section>

              <section className="card lg:col-span-2" aria-labelledby="titulo-plataformas">
                <h2 id="titulo-plataformas" className="font-medium text-text-primary text-sm mb-1">
                  LinkedIn x X
                </h2>
                <p className="text-xs text-text-secondary mb-4">
                  Taxa normalizada: interações divididas por impressões.
                </p>
                <PlatformCompare porPlataforma={resumo.por_plataforma} />
              </section>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
