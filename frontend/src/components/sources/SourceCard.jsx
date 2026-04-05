/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  TAREFA DO INTEGRANTE 1 — Library / Sources (SourceCard)           ║
 * ║  Issue: #1 no GitHub Projects                                       ║
 * ║  Branch: feat/issue-1-sources-page                                  ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * O QUE VOCÊ VAI FAZER:
 *   Esse componente recebe uma "source" e mostra ela como um card.
 *   Você vai substituir o bloco TODO abaixo pelo card real.
 *
 * PROPS QUE VOCÊ RECEBE:
 *   source = {
 *     id: 1,
 *     title: "Post sobre automação",
 *     source_type: "post_antigo",
 *     content: "Texto completo...",
 *     theme: "automação",
 *     origin: "linkedin",
 *     tags_json: '["ia","saas"]'
 *   }
 *   onSelect = função chamada ao clicar (para escolher a source no Generator)
 *   selected = true/false (se está selecionada)
 *
 * EXEMPLO DE COMO USAR:
 *   <SourceCard source={source} onSelect={() => {}} selected={false} />
 *
 * COMO TESTAR:
 *   1. Abra a tela /sources no navegador
 *   2. O card deve aparecer para cada source que existe no banco
 */

import React from "react";
import { BookOpen } from "lucide-react";

export default function SourceCard({ source, onSelect, selected }) {
  return (
    // TODO Integrante 1: substitua este bloco pelo card real
    // Dica: use as classes CSS do tema: card, badge, text-text-primary, etc.
    // Dica: mostre title, source_type, theme, e um trecho do content
    // Dica: quando selected=true, adicione uma borda colorida (border-flowity-purple)
    <div
      className={`card cursor-pointer transition-all duration-200 hover:border-border-bright ${
        selected ? "border-flowity-purple purple-glow" : ""
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <BookOpen size={16} className="text-text-muted mt-0.5 flex-shrink-0" />
        <div className="min-w-0">
          {/* TODO: mostre o título aqui */}
          <p className="text-text-secondary font-medium text-sm truncate">
            {source.title}
          </p>
          {/* TODO: mostre source_type e theme como badges */}
          <p className="text-text-muted text-xs mt-1">{source.source_type}</p>
          {/* TODO: mostre um trecho do content (primeiros 100 chars) */}
        </div>
      </div>
    </div>
  );
}
