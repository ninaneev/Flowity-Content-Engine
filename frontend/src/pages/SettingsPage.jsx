import React, { useState, useEffect } from "react";
import {
  Settings,
  Zap,
  Bot,
  CheckCircle,
  XCircle,
  Monitor,
} from "lucide-react";
import { automationApi } from "../lib/api";

export default function SettingsPage() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    automationApi
      .config()
      .then((r) => setConfig(r.data))
      .catch(() => setConfig(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-text-primary">Settings</h1>
        <p className="text-text-muted text-sm mt-0.5">
          Automation and AI configuration
        </p>
      </div>

      <div className="space-y-4">
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <Bot size={18} className="text-flowity-purple" />
            <h2 className="font-medium text-text-primary text-sm">
              Ollama (local AI)
            </h2>
          </div>
          {loading ? (
            <div className="space-y-2">
              <div className="h-4 bg-bg-elevated rounded animate-pulse w-3/4" />
              <div className="h-4 bg-bg-elevated rounded animate-pulse w-1/2" />
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">URL</span>
                <span className="text-text-secondary font-mono text-xs">
                  {config?.ollama_base_url || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Model</span>
                <span className="text-text-secondary font-mono text-xs">
                  {config?.ollama_model || "-"}
                </span>
              </div>
            </div>
          )}
          <p className="text-text-muted text-xs mt-3">
            To change the model, edit{" "}
            <code className="bg-bg-elevated px-1 rounded">OLLAMA_MODEL</code> in{" "}
            <code className="bg-bg-elevated px-1 rounded">.env</code> and restart
            Docker.
          </p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <Zap size={18} className="text-flowity-cyan" />
            <h2 className="font-medium text-text-primary text-sm">
              n8n (automation)
            </h2>
            {!loading &&
              (config?.n8n_configured ? (
                <CheckCircle size={14} className="text-status-published ml-auto" />
              ) : (
                <XCircle size={14} className="text-status-failed ml-auto" />
              ))}
          </div>
          <p className="text-text-muted text-xs">
            n8n checks scheduled posts every 5 minutes and publishes them automatically.
          </p>
          <div className="mt-3 space-y-1 text-xs text-text-muted">
            <p>
              Open the panel at{" "}
              <code className="bg-bg-elevated px-1 rounded">
                http://localhost:5678
              </code>
            </p>
            <p>
              Import the workflow from{" "}
              <code className="bg-bg-elevated px-1 rounded">
                infra/n8n/flowity-publishing.json
              </code>
            </p>
            <p>
              Match{" "}
              <code className="bg-bg-elevated px-1 rounded">
                N8N_WEBHOOK_SECRET
              </code>{" "}
              to the value in{" "}
              <code className="bg-bg-elevated px-1 rounded">.env</code>
            </p>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <Settings size={18} className="text-text-muted" />
            <h2 className="font-medium text-text-primary text-sm">
              Database (Supabase)
            </h2>
          </div>
          <p className="text-text-muted text-xs">
            Set{" "}
            <code className="bg-bg-elevated px-1 rounded">DATABASE_URL</code> in{" "}
            <code className="bg-bg-elevated px-1 rounded">.env</code> with your
            Supabase URL. See{" "}
            <code className="bg-bg-elevated px-1 rounded">
              docs/supabase-setup.md
            </code>{" "}
            for the full setup guide.
          </p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <Monitor size={18} className="text-text-muted" />
            <h2 className="font-medium text-text-primary text-sm">
              Local environment
            </h2>
          </div>
          <p className="text-text-muted text-xs mb-4">
            Use these links during the local project demo.
          </p>
          <div className="space-y-2">
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm text-text-secondary transition-all hover:border-flowity-purple/40 hover:text-text-primary"
            >
              <div>
                <p className="font-medium">Frontend</p>
                <p className="text-text-muted text-xs">
                  Open the frontend at http://localhost:5173
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
