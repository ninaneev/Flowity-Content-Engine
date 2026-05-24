import React from "react";
import { Plus } from "lucide-react";
import PostEventCard from "./PostEventCard";

export default function CalendarDayCell({ day, posts = [], isToday, onAddPost, onEditPost }) {
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
        <Plus
          size={12}
          className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>

      <div className="space-y-1">
        {posts.slice(0, 3).map((post) => (
          <PostEventCard key={post.id} post={post} onClick={onEditPost} />
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
