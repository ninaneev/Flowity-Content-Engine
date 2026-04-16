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
  // TODO Integrante 3: melhore o visual deste card
return (
    <div
      // Estilização: Alinhamento, tamanho da fonte e efeitos de hover
      className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded border text-[10px] leading-tight cursor-pointer truncate transition-all hover:scale-[1.02] active:scale-95 ${bgClass}`}
      onClick={(e) => { 
        // Impede que o clique abra a criação de novo post no calendário
        e.stopPropagation(); 
        onClick(post); 
      }}
      // Tooltip com rede social e texto completo
      title={`${post.channel.toUpperCase()}: ${post.hook}`}
    >
      {/* Ícone: shrink-0 evita que o ícone seja "esmagado" pelo texto */}
      <Icon size={10} className="shrink-0 opacity-80" />
      
      {/* Texto: truncate adiciona os "..." se o hook for muito longo */}
      <span className="font-medium truncate">
        {post.hook}
      </span>
    </div>
  );
}
