// Formatação em pt-BR usada pelo painel de análise.

/** 0.0423 -> "4,2%" */
export function formatarPercentual(taxa, casas = 1) {
  const valor = (Number(taxa) || 0) * 100;
  return `${valor.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  })}%`;
}

/** 12500 -> "12.500" */
export function formatarNumero(valor) {
  return (Number(valor) || 0).toLocaleString("pt-BR");
}

/** 1 -> "1 publicação", 3 -> "3 publicações" */
export function formatarPublicacoes(qtd) {
  return `${formatarNumero(qtd)} ${qtd === 1 ? "publicação" : "publicações"}`;
}

// Mesma convenção do "dow" do PostgreSQL: 0 = domingo ... 6 = sábado.
export const DIAS_SEMANA = [
  { dia: 0, curto: "Dom", longo: "Domingo" },
  { dia: 1, curto: "Seg", longo: "Segunda-feira" },
  { dia: 2, curto: "Ter", longo: "Terça-feira" },
  { dia: 3, curto: "Qua", longo: "Quarta-feira" },
  { dia: 4, curto: "Qui", longo: "Quinta-feira" },
  { dia: 5, curto: "Sex", longo: "Sexta-feira" },
  { dia: 6, curto: "Sáb", longo: "Sábado" },
];
