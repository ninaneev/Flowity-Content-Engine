import React from "react";
import { CheckCircle2, CircleAlert } from "lucide-react";
import { montarChecklist } from "../../lib/publishChecklist.mjs";

/**
 * Checklist de publicação no LinkedIn. Cada item mostra ícone e texto ("Pronto" / "Falta"),
 * nunca só a cor, e vem calculado a partir dos dados reais.
 */
export default function PublishChecklist({ post, totalSlides, imagens, pdfBaixado }) {
  const itens = montarChecklist({ post, totalSlides, imagens, pdfBaixado });
  const prontos = itens.filter((i) => i.pronto).length;

  return (
    <section aria-labelledby="checklist-titulo" className="card space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="checklist-titulo" className="text-base font-semibold text-text-primary">
          Checklist de publicação no LinkedIn
        </h2>
        <p className="text-sm text-text-secondary">
          {prontos} de {itens.length} itens prontos
        </p>
      </div>
      <ul className="space-y-2">
        {itens.map((item) => (
          <li
            key={item.id}
            className={`flex items-start gap-3 rounded-lg border p-3 bg-bg-surface ${
              item.pronto ? "border-emerald-400/40" : "border-amber-300/40"
            }`}
          >
            {item.pronto ? (
              <CheckCircle2 size={18} aria-hidden="true" className="mt-0.5 flex-shrink-0 text-emerald-300" />
            ) : (
              <CircleAlert size={18} aria-hidden="true" className="mt-0.5 flex-shrink-0 text-amber-300" />
            )}
            <div className="min-w-0">
              <p className="text-sm text-text-primary">
                <strong className={item.pronto ? "text-emerald-300" : "text-amber-300"}>
                  {item.pronto ? "Pronto" : "Falta"}:
                </strong>{" "}
                {item.rotulo}
              </p>
              <p className="text-xs text-text-secondary mt-0.5">{item.detalhe}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
