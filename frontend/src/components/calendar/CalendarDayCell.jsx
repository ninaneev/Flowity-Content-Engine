
import React from "react";
import { Plus } from "lucide-react";
import PostEventCard from "./PostEventCard";

export default function CalendarDayCell({
  day,
  posts = [],
  isToday,
  onAddPost,
  onEditPost,
}) {
  if (!day) {
    return (
      <div
        aria-hidden="true"
        className="bg-bg-base border border-border/30 rounded-lg min-h-24"
      />
    );
  }

  const formattedDate = day.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className={`bg-bg-surface border rounded-lg min-h-24 p-2 group transition-colors hover:border-border-bright ${
        isToday ? "border-flowity-purple/50" : "border-border"
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span
          className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
            isToday ? "bg-flowity-purple text-white" : "text-text-muted"
          }`}
        >
          {day.getDate()}
        </span>

        <button
          type="button"
          onClick={() => onAddPost(day)}
          className="btn-ghost p-1 opacity-60 focus-visible:opacity-100 group-hover:opacity-100 transition-opacity"
          aria-label={`Criar post em ${formattedDate}`}
        >
          <Plus size={12} aria-hidden="true" />
        </button>
      </div>

      <div className="space-y-1">
        {posts.slice(0, 3).map((post) => (
          <PostEventCard
            key={post.id}
            post={post}
            onClick={onEditPost}
          />
        ))}

        {posts.length > 3 && (
          <p className="text-[10px] text-text-muted font-medium pl-1 italic">
            +{posts.length - 3} more
          </p>
        )}
      </div>
    </div>
  );
}