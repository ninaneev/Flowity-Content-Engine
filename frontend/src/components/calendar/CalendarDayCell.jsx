/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  TAREFA DO INTEGRANTE 3 — Calendário (CalendarDayCell)             ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * O QUE VOCÊ VAI FAZER:
 *   Renderizar uma célula do calendário para um dia específico.
 *   - Mostra o número do dia
 *   - Mostra os PostEventCards dos posts daquele dia
 *   - Clicar no dia vazio → abre criação de post (onAddPost)
 *
 * PROPS:
 *   day        = objeto Date do dia (ou null se é padding antes do mês)
 *   posts      = lista de posts agendados neste dia
 *   isToday    = boolean
 *   onAddPost  = função chamada ao clicar no dia
 *   onEditPost = função chamada ao clicar num card de post
 */

import React from "react";
import { Plus } from "lucide-react";
import PostEventCard from "./PostEventCard";

export default function CalendarDayCell({ day, posts = [], isToday, onAddPost, onEditPost }) {
  // Célula vazia (padding antes do início do mês)
  if (!day) {
    return <div className="bg-bg-base border border-border/30 rounded-lg min-h-24" />;
  }

  return (
    <div
      className={`bg-bg-surface border rounded-lg min-h-24 p-2 cursor-pointer group transition-colors hover:border-border-bright ${
        isToday ? "border-flowity-purple/50" : "border-border"
      }`}
      onClick={() => onAddPost(day)}
    >
      {/* Número do dia */}
      <div className="flex items-center justify-between mb-1.5">
        <span
          className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
            isToday
              ? "bg-flowity-purple text-white"
              : "text-text-muted"
          }`}
        >
          {day.getDate()}
        </span>
        {/* Botão "+" aparece no hover */}
        <Plus
          size={12}
          className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>

      {/* Posts do dia */}
      <div className="space-y-1">
        {posts.map((post) => (
          <PostEventCard key={post.id} post={post} onClick={onEditPost} />
        ))}
      </div>

      {/* TODO Integrante 3: se tiver mais de 3 posts no dia, mostre "+N mais" */}
    </div>
  );
}
