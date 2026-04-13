/**
 * ╔══════════════════���════════════════════════════��══════════════════════╗
 * ║  TAREFA DO INTEGRANTE 3 — Calendário (PostEventCard)               ║
 * ║  Issue: #3 no GitHub Projects                                       ║
 * ║  Branch: feat/issue-3-calendar                                      ║
 * ╚══════════════════════════════════════���══════════════════════════��════╝
 *
 * O QUE VOCÊ VAI FAZER:
 *   Criar o card pequeno que aparece dentro de cada dia do calendário.
 *   Ele mostra o hook e o canal do post.
 *
 * PROPS:
 *   post    = { id, hook, channel, status, scheduled_at }
 *   onClick = função chamada ao clicar no card (abre o PostModal)
 *
 * DICA VISUAL:
 *   - Fundo: cor do status (use a variável CSS --color-purple-dim por exemplo)
 *   - Texto: o hook cortado com "..." se for muito longo
 *   - Ícone: LinkedIn ou X ao lado do hook
 *   - Tamanho: pequeno, cabe em 1 linha dentro do dia do calendário
 */

import React from "react";
import { Linkedin, Twitter } from "lucide-react";
// Cores de fundo por status
const STATUS_BG = {
  idea:       "bg-bg-elevated    border-border",
  draft:      "bg-status-draft/10     border-status-draft/30",
  revised:    "bg-status-revised/10   border-status-revised/30",
  scheduled:  "bg-status-scheduled/10 border-status-scheduled/30",
  publishing: "bg-status-scheduled/10 border-status-scheduled/30",
  published:  "bg-status-published/10 border-status-published/30",
  failed:     "bg-status-failed/10    border-status-failed/30",
};

export default function PostEventCard({ post, onClick }) {
  const bgClass = STATUS_BG[post.status] || STATUS_BG.idea;
  const Icon = post.channel === "linkedin" ? Linkedin : Twitter;
  return (
    // TODO Integrante 3: melhore o visual deste card
    <div
      className={`flex items-center gap-1.5 px-2 py-1 rounded border text-xs cursor-pointer truncate transition-all hover:opacity-80 ${bgClass}`}
      onClick={(e) => { e.stopPropagation(); onClick(post); }}
      title={post.hook}
    >
      {/* TODO: adicione ícone do canal (linkedin/x) antes do texto */}
      <Icon size={12} className="shrink-0 opacity-70" />
      <span className="text-text-secondary truncate">{post.hook}</span>
    </div>
  );
}
