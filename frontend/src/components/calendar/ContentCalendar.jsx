/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  TAREFA DO INTEGRANTE 3 — Calendário (ContentCalendar)             ║
 * ║  Issue: #3 no GitHub Projects                                       ║
 * ║  Branch: feat/issue-3-calendar                                      ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * O QUE VOCÊ VAI FAZER:
 *   Implementar o grid mensal do calendário.
 *   O esqueleto (estrutura) já está aqui. Você vai preencher o TODO.
 *
 * COMO FUNCIONA:
 *   - O DashboardPage passa a lista de posts e o mês atual
 *   - Você distribui os posts nos dias corretos
 *   - Cada dia é um CalendarDayCell
 *   - Clicar num dia vazio → onAddPost(date)
 *   - Clicar num post → onEditPost(post)
 *
 * PROPS:
 *   posts      = lista de posts do mês (cada um tem scheduled_at)
 *   month      = objeto Date do primeiro dia do mês atual
 *   onAddPost  = função chamada com o Date do dia clicado (cria novo post)
 *   onEditPost = função chamada com o post clicado (abre modal de edição)
 */

import React from "react";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, isSameDay, isToday, isSameMonth
} from "date-fns";
import { ptBR } from "date-fns/locale";
import CalendarDayCell from "./CalendarDayCell";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function ContentCalendar({ posts = [], month, onAddPost, onEditPost }) {
  const firstDay   = startOfMonth(month);
  const lastDay    = endOfMonth(month);
  const days       = eachDayOfInterval({ start: firstDay, end: lastDay });
  const startPadding = getDay(firstDay); // 0=Dom, 1=Seg, ...

  // Células de padding antes do dia 1
  const paddingCells = Array(startPadding).fill(null);

  // Distribui os posts por dia
  function getPostsForDay(day) {
    return posts.filter((post) => {
      if (!post.scheduled_at) return false;
      return isSameDay(new Date(post.scheduled_at), day);
    });
  }

  return (
    <div className="animate-fade-in">
      {/* Cabeçalho dos dias da semana */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs text-text-muted font-medium py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Grid dos dias */}
      {/* TODO Integrante 3: preencha o grid abaixo corretamente */}
      {/* Dica: o grid já está configurado para 7 colunas */}
      {/* Dica: paddingCells são as células vazias antes do dia 1 */}
      {/* Dica: use getPostsForDay(day) para buscar posts de cada dia */}
      <div className="grid grid-cols-7 gap-1.5">
        {paddingCells.map((_, i) => (
          <CalendarDayCell key={`pad-${i}`} day={null} />
        ))}

        {days.map((day) => (
          <CalendarDayCell
            key={day.toISOString()}
            day={day}
            posts={getPostsForDay(day)}
            isToday={isToday(day)}
            onAddPost={onAddPost}
            onEditPost={onEditPost}
          />
        ))}
      </div>
    </div>
  );
}
