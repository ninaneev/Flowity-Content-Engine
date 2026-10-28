import React, { useState } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import PostEventCard from "./PostEventCard";
import { PillarTag } from "../posts/PostMeta";

export default function CalendarDayCell({
  day,
  posts = [],
  isToday,
  dayPlan,
  postPlans = {},
  onDayClick,
  onEditPost,
  onRemoveDate,
  onDropPost,
}) {
  const [over, setOver] = useState(false);

  if (!day) {
    return <div className="bg-bg-base border border-border/30 rounded-lg min-h-24" />;
  }

  return (
    <div
      className={`bg-bg-surface border rounded-lg min-h-24 p-2 cursor-pointer group transition-colors hover:border-border-bright ${
        isToday ? "border-flowity-purple/50" : "border-border"
      } ${over ? "ring-1 ring-flowity-purple/60 bg-flowity-purple/10" : ""}`}
      onClick={() => onDayClick(day)}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const id = Number(e.dataTransfer.getData("text/plain"));
        if (id) onDropPost(id, day);
      }}
    >
      <div className="flex items-center justify-between mb-1.5 gap-1">
        <span
          className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full shrink-0 ${
            isToday
              ? "bg-flowity-purple text-white"
              : "text-text-muted"
          }`}
        >
          {day.getDate()}
        </span>
        {dayPlan && (
          <PillarTag pillar={dayPlan.pillar} suggested={dayPlan.suggested} className="truncate min-w-0" />
        )}
        <button
          type="button"
          className="shrink-0 rounded p-0.5 text-text-muted opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-text-primary transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-flowity-cyan"
          aria-label={`Add a post on ${format(day, "MMMM d")}`}
          onClick={(e) => {
            e.stopPropagation();
            onDayClick(day);
          }}
        >
          <Plus size={12} aria-hidden="true" />
        </button>
      </div>

      <div className="space-y-1">
        {posts.slice(0, 3).map((post) => (
          <PostEventCard
            key={post.id}
            post={post}
            plan={postPlans[post.id]}
            onClick={onEditPost}
            onRemoveDate={onRemoveDate}
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
