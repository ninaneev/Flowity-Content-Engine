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

/**
 //CODIGO ANTIGO PARA CONSULTA
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
    

      {config.label}
    </span>
   );
}
 */


import React from "react";
import { CheckCircle, XCircle, Clock, Loader, FileText, Lightbulb } from "lucide-react";

// Mapeamento de status → cores, texto e ícones
const STATUS_CONFIG = {
  idea: {
    label: "Ideia",
    icon: Lightbulb,
    color: "text-text-muted bg-bg-elevated border-border",
  },
  draft: {
    label: "Rascunho",
    icon: FileText,
    color: "text-status-draft bg-status-draft/10 border-status-draft/30",
  },
  revised: {
    label: "Revisado",
    icon: FileText,
    color: "text-status-revised bg-status-revised/10 border-status-revised/30",
  },
  scheduled: {
    label: "Agendado",
    icon: Clock,
    color: "text-status-scheduled bg-status-scheduled/10 border-status-scheduled/30",
  },
  publishing: {
    label: "Publicando",
    icon: Loader,
    color: "text-status-publishing bg-status-publishing/10 border-status-publishing/30",
  },
  published: {
    label: "Publicado",
    icon: CheckCircle,
    color: "text-status-published bg-status-published/10 border-status-published/30",
  },
  failed: {
    label: "Falhou",
    icon: XCircle,
    color: "text-status-failed bg-status-failed/10 border-status-failed/30",
  },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.idea;
  const Icon = config.icon;

  return (
    <span className={`badge border ${config.color} flex items-center gap-1`}>
      <Icon size={10} />
      {config.label}
    </span>
  );
}

