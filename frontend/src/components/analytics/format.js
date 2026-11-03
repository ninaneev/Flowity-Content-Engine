// en-US formatting used by the analytics dashboard.

/** 0.0423 -> "4.2%" */
export function formatarPercentual(taxa, casas = 1) {
  const valor = (Number(taxa) || 0) * 100;
  return `${valor.toLocaleString("en-US", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  })}%`;
}

/** 12500 -> "12,500" */
export function formatarNumero(valor) {
  return (Number(valor) || 0).toLocaleString("en-US");
}

/** 1 -> "1 post", 3 -> "3 posts" */
export function formatarPublicacoes(qtd) {
  return `${formatarNumero(qtd)} ${qtd === 1 ? "post" : "posts"}`;
}

// Same convention as PostgreSQL "dow": 0 = Sunday ... 6 = Saturday.
export const DIAS_SEMANA = [
  { dia: 0, curto: "Sun", longo: "Sunday" },
  { dia: 1, curto: "Mon", longo: "Monday" },
  { dia: 2, curto: "Tue", longo: "Tuesday" },
  { dia: 3, curto: "Wed", longo: "Wednesday" },
  { dia: 4, curto: "Thu", longo: "Thursday" },
  { dia: 5, curto: "Fri", longo: "Friday" },
  { dia: 6, curto: "Sat", longo: "Saturday" },
];
