import React from "react";

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      {Icon && (
        <div className="w-14 h-14 rounded-xl bg-bg-elevated border border-border flex items-center justify-center mb-4">
          <Icon size={24} className="text-text-muted" />
        </div>
      )}
      <h3 className="text-text-primary font-medium mb-1">{title}</h3>
      {description && (
        <p className="text-text-muted text-sm max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
