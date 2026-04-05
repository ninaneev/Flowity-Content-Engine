/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  TAREFA DO INTEGRANTE 7 — UI Polish (componente StatusBadge)       ║
 * ║  Issue: #7 no GitHub Projects                                       ║
 * ║  Branch: feat/issue-7-ui-polish                                     ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * O QUE VOCÊ VAI FAZER:
 *   Melhorar o visual deste badge para cada status ficar mais elegante.
 *   Atualmente funciona mas está simples. Você pode:
 *   - Adicionar ícones do lucide-react ao lado do texto
 *   - Melhorar o tamanho, padding, bordas
 *   - Adicionar um ponto colorido animado no status "publishing"
 *
 * COMO USAR ESTE COMPONENTE (já está pronto e funcionando):
 *   <StatusBadge status="draft" />
 *   <StatusBadge status="published" />
 */

import React from "react";

// Mapeamento de status → cores e texto
const STATUS_CONFIG = {
  idea:       { label: "Ideia",       color: "text-text-muted   bg-bg-elevated       border-border"           },
  draft:      { label: "Rascunho",    color: "text-status-draft     bg-status-draft/10   border-status-draft/30"  },
  revised:    { label: "Revisado",    color: "text-status-revised   bg-status-revised/10 border-status-revised/30"},
  scheduled:  { label: "Agendado",    color: "text-status-scheduled bg-status-scheduled/10 border-status-scheduled/30" },
  publishing: { label: "Publicando",  color: "text-status-publishing bg-status-publishing/10 border-status-publishing/30" },
  published:  { label: "Publicado",   color: "text-status-published bg-status-published/10 border-status-published/30" },
  failed:     { label: "Falhou",      color: "text-status-failed    bg-status-failed/10  border-status-failed/30"  },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.idea;

  return (
    <span className={`badge border ${config.color}`}>
      {/* TODO Integrante 7: adicione um ícone aqui do lucide-react */}
      {config.label}
    </span>
  );
}
