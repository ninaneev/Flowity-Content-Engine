import React from "react";
import { Linkedin, Twitter } from "lucide-react";

const STATUS_BG = {
  idea: "bg-bg-elevated border-border",
  draft: "bg-status-draft/10 border-status-draft/30",
  revised: "bg-status-revised/10 border-status-revised/30",
  scheduled: "bg-status-scheduled/10 border-status-scheduled/30",
  publishing: "bg-status-scheduled/10 border-status-scheduled/30",
  published: "bg-status-published/10 border-status-published/30",
  failed: "bg-status-failed/10 border-status-failed/30",
};

export default function PostEventCard({ post, onClick }) {
  const bgClass = STATUS_BG[post.status] || STATUS_BG.idea;
  const Icon = post.channel === "linkedin" ? Linkedin : Twitter;

  return (
    <div
      className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded border text-[10px] leading-tight cursor-pointer truncate transition-all hover:scale-[1.02] active:scale-95 ${bgClass}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick(post);
      }}
      title={`${post.channel.toUpperCase()}: ${post.hook}`}
    >
      <Icon size={10} className="shrink-0 opacity-80" />
      <span className="font-medium truncate">
        {post.hook}
      </span>
    </div>
  );
}
