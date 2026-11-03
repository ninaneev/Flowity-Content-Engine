import React from "react";
import { format } from "date-fns";
import { BookOpen, Building2, FileText, Linkedin, Mail, Twitter } from "lucide-react";
import { PILLARS } from "../../lib/pillars.js";
import { isMissed, parseApiDate } from "../../lib/postDates.js";
import { postIssues } from "../../lib/postIssues.js";
import { ChannelTag, IssueDot, MissedFlag, OffStructureFlag, PillarTag, RemoveDateButton, StatusFlag } from "../posts/PostMeta";

const STATUS_BG = {
  idea: "bg-bg-elevated border-border",
  draft: "bg-status-draft/10 border-status-draft/30",
  revised: "bg-status-revised/10 border-status-revised/30",
  to_approve: "bg-amber-400/10 border-amber-400/50 border-dashed",
  scheduled: "bg-status-scheduled/20 border-status-scheduled/60",
  publishing: "bg-status-publishing/20 border-status-publishing/60",
  published: "bg-status-published/30 border-status-published/70",
  failed: "bg-status-failed/30 border-status-failed/70",
};

const CHANNEL_ICONS = { linkedin: Linkedin, linkedin_company: Building2, x: Twitter, newsletter: Mail, article: FileText, blog: BookOpen };

export default function PostEventCard({ post, onClick, onRemoveDate, plan, now = new Date() }) {
  const bgClass = STATUS_BG[post.status] || STATUS_BG.idea;
  const Icon = CHANNEL_ICONS[post.channel] || Linkedin;
  const date = parseApiDate(post.scheduled_at);
  const missed = isMissed(post, now);
  const offStructure = plan?.offStructure;
  const pillar = PILLARS[post.pillar];
  const issues = postIssues(post, now);

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.stopPropagation();
        e.dataTransfer.setData("text/plain", String(post.id));
        e.dataTransfer.effectAllowed = "move";
      }}
      className={`rounded border text-[10px] leading-tight cursor-pointer transition-all hover:scale-[1.02] active:scale-95 ${bgClass} ${
        missed || issues.length ? "ring-1 ring-red-500/60" : ""
      }`}
      style={pillar ? { borderLeft: `3px solid ${pillar.color}` } : undefined}
      onClick={(e) => {
        e.stopPropagation();
        onClick(post);
      }}
      title={`${post.status.toUpperCase()} · ${post.channel.toUpperCase()}${pillar ? ` · ${pillar.label}` : ""}: ${post.hook}`}
    >
      <div className="flex items-center gap-1.5 px-1.5 py-0.5 min-w-0">
        <Icon size={10} className="shrink-0 opacity-80" />
        {date && <span className="shrink-0 font-mono opacity-80">{format(date, "HH:mm")}</span>}
        <span className="font-medium truncate flex-1 min-w-0">{post.hook}</span>
        <IssueDot issues={issues} />
        <RemoveDateButton post={post} onRemoveDate={onRemoveDate} />
      </div>
      <div className="flex flex-wrap items-center gap-1 px-1.5 pb-0.5">
        <ChannelTag channel={post.channel} />
        <StatusFlag status={post.status} />
        <PillarTag pillar={post.pillar} />
        {missed && <MissedFlag />}
        {offStructure && <OffStructureFlag expected={plan.expected} />}
      </div>
    </div>
  );
}
