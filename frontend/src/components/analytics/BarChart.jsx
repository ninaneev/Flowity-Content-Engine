import React, { useId } from "react";
import { DIAS_SEMANA, formatarPercentual, formatarPublicacoes } from "./format";

const LARGURA_BARRA = 32;
const ESPACO = 48;
const ALTURA = 200;
const TOPO = 24; // space for the number above the bar
const BASE = 24; // space for the day name below the bar

/**
 * Inline SVG bar chart (no library) with the average engagement rate
 * by weekday. Each bar's value is written above it, and the same
 * information is repeated in a table for screen readers.
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
        <title id={tituloId}>Average engagement by day of the week</title>
        <desc id={descId}>Bars comparing the average engagement rate for each day.</desc>
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
        <caption>Average engagement by day of the week</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Average engagement rate</th>
            <th scope="col">Posts</th>
          </tr>
        </thead>
        <tbody>
          {DIAS_SEMANA.map(({ dia, longo }) => {
            const d = porDia.get(dia);
            return (
              <tr key={dia}>
                <th scope="row">{longo}</th>
                <td>{d ? formatarPercentual(d.media) : "no data"}</td>
                <td>{formatarPublicacoes(d ? d.publicacoes : 0)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
