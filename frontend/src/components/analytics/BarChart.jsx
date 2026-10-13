import React, { useId } from "react";
import { DIAS_SEMANA, formatarPercentual, formatarPublicacoes } from "./format";

const LARGURA_BARRA = 32;
const ESPACO = 48;
const ALTURA = 200;
const TOPO = 24; // espaço para o número acima da barra
const BASE = 24; // espaço para o nome do dia abaixo da barra

/**
 * Gráfico de barras em SVG inline (sem biblioteca) com a taxa média de
 * engajamento por dia da semana. O valor de cada barra aparece escrito
 * acima dela, e a mesma informação é repetida numa tabela para leitor de tela.
 *
 * dados: [{ dia: 0..6, media: 0.042, publicacoes: 3 }]
 */
export default function BarChart({ dados = [] }) {
  const id = useId();
  const tituloId = `${id}-titulo`;
  const descId = `${id}-desc`;

  const porDia = new Map(dados.map((d) => [d.dia, d]));
  const maior = Math.max(...dados.map((d) => d.media), 0);
  const alturaUtil = ALTURA - TOPO - BASE;
  const largura = DIAS_SEMANA.length * ESPACO;

  return (
    <div>
      <svg
        role="img"
        aria-labelledby={`${tituloId} ${descId}`}
        viewBox={`0 0 ${largura} ${ALTURA}`}
        className="w-full max-w-xl h-auto"
      >
        <title id={tituloId}>Engajamento médio por dia da semana</title>
        <desc id={descId}>Barras comparando a taxa média de engajamento de cada dia.</desc>
        <line
          x1="0"
          y1={ALTURA - BASE}
          x2={largura}
          y2={ALTURA - BASE}
          stroke="#2D3748"
          strokeWidth="1"
        />
        {DIAS_SEMANA.map(({ dia, curto }, i) => {
          const d = porDia.get(dia);
          const altura = d && maior > 0 ? Math.max((d.media / maior) * alturaUtil, 2) : 0;
          const x = i * ESPACO + (ESPACO - LARGURA_BARRA) / 2;
          const centro = x + LARGURA_BARRA / 2;
          return (
            <g key={dia}>
              {d && (
                <rect
                  x={x}
                  y={ALTURA - BASE - altura}
                  width={LARGURA_BARRA}
                  height={altura}
                  rx="3"
                  fill="#9C83F7"
                />
              )}
              <text
                x={centro}
                y={ALTURA - BASE - altura - 6}
                textAnchor="middle"
                fontSize="10"
                fill="#F0F2FF"
              >
                {d ? formatarPercentual(d.media) : "—"}
              </text>
              <text x={centro} y={ALTURA - 6} textAnchor="middle" fontSize="11" fill="#A8B3C7">
                {curto}
              </text>
            </g>
          );
        })}
      </svg>

      <table className="sr-only">
        <caption>Engajamento médio por dia da semana</caption>
        <thead>
          <tr>
            <th scope="col">Dia</th>
            <th scope="col">Taxa média de engajamento</th>
            <th scope="col">Publicações</th>
          </tr>
        </thead>
        <tbody>
          {DIAS_SEMANA.map(({ dia, longo }) => {
            const d = porDia.get(dia);
            return (
              <tr key={dia}>
                <th scope="row">{longo}</th>
                <td>{d ? formatarPercentual(d.media) : "sem dados"}</td>
                <td>{formatarPublicacoes(d ? d.publicacoes : 0)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
