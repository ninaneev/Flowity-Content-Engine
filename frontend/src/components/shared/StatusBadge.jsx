import React from "react";
import { CheckCircle, XCircle, Clock, Loader, FileText, Lightbulb, Eye } from "lucide-react";

const STATUS_CONFIG = {
  idea: {
    label: "Idea",
    icon: Lightbulb,
    color: "text-text-muted bg-bg-elevated border-border",
  },
  draft: {
    label: "Draft",
    icon: FileText,
    color: "text-status-draft bg-status-draft/10 border-status-draft/30",
  },
  revised: {
    label: "Reviewed",
    icon: Eye,
    color: "text-status-revised bg-status-revised/10 border-status-revised/30",
  },
  scheduled: {
    label: "Scheduled",
    icon: Clock,
    color: "text-status-scheduled bg-status-scheduled/10 border-status-scheduled/30",
  },
  publishing: {
    label: "Publishing",
    icon: Loader,
    color: "text-status-publishing bg-status-publishing/10 border-status-publishing/30",
    spin: true,
  },
  published: {
    label: "Published",
    icon: CheckCircle,
    color: "text-status-published bg-status-published/10 border-status-published/30",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    color: "text-status-failed bg-status-failed/10 border-status-failed/30",
  },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.idea;
  const Icon = config.icon;

  return (
    <span className={`badge border flex items-center gap-1 ${config.color}`}>
      <Icon size={10} className={config.spin ? "animate-spin" : ""} />
      {config.label}
    </span>
  );
}
