import React from "react";
import { formatarPercentual, formatarPublicacoes } from "./format";

const PLATAFORMAS = [
  { chave: "linkedin", nome: "LinkedIn" },
  { chave: "x", nome: "X" },
];

/** Taxa normalizada: interações divididas por impressões, somadas na plataforma. */
export function taxaNormalizada(p) {
  if (!p || !p.impressions) return 0;
  return (p.interacoes || 0) / p.impressions;
}

/**
 * Compara LinkedIn e X lado a lado pela taxa normalizada, mostrando também
 * quantas publicações entraram na conta, para o leitor entender o peso do número.
 * A barra é só apoio visual: o valor está sempre escrito em texto.
 */
export default function PlatformCompare({ porPlataforma = [] }) {
  const porChave = new Map(porPlataforma.map((p) => [p.platform, p]));
  const linhas = PLATAFORMAS.map(({ chave, nome }) => {
    const p = porChave.get(chave);
    return { chave, nome, taxa: taxaNormalizada(p), posts: p?.posts || 0 };
  });
  const maior = Math.max(...linhas.map((l) => l.taxa), 0);

  return (
    <ul className="space-y-4">
      {linhas.map(({ chave, nome, taxa, posts }) => (
        <li key={chave}>
          <p className="text-sm text-text-primary">
            <span className="font-semibold">{nome}:</span>{" "}
            {posts > 0
              ? `${formatarPercentual(taxa)} em ${formatarPublicacoes(posts)}`
              : "sem publicações com métricas"}
          </p>
          <div className="mt-1.5 h-2 rounded-full bg-bg-elevated" aria-hidden="true">
            <div
              className={`h-2 rounded-full ${chave === "linkedin" ? "bg-flowity-purple" : "bg-flowity-cyan"}`}
              style={{ width: maior > 0 ? `${(taxa / maior) * 100}%` : "0%" }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
