import React from "react";
import { format } from "date-fns";
import { Linkedin, Mail, Twitter } from "lucide-react";

const STATUS_BG = {
  idea: "bg-bg-elevated border-border",
  draft: "bg-status-draft/10 border-status-draft/30",
  revised: "bg-status-revised/10 border-status-revised/30",
  scheduled: "bg-status-scheduled/20 border-status-scheduled/60",
  publishing: "bg-status-publishing/20 border-status-publishing/60",
  published: "bg-status-published/30 border-status-published/70",
  failed: "bg-status-failed/30 border-status-failed/70",
};

export default function PostEventCard({ post, onClick }) {
  const bgClass = STATUS_BG[post.status] || STATUS_BG.idea;
  const Icon = post.channel === "linkedin" ? Linkedin : post.channel === "newsletter" ? Mail : Twitter;

  return (
    <div
      className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded border text-[10px] leading-tight cursor-pointer truncate transition-all hover:scale-[1.02] active:scale-95 ${bgClass}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick(post);
      }}
      title={`${post.status.toUpperCase()} · ${post.channel.toUpperCase()}: ${post.hook}`}
    >
      <Icon size={10} className="shrink-0 opacity-80" />
      {post.scheduled_at && (
        <span className="shrink-0 font-mono opacity-80">
          {format(new Date(post.scheduled_at), "HH:mm")}
        </span>
      )}
      <span className="font-medium truncate">
        {post.hook}
      </span>
    </div>
  );
}
