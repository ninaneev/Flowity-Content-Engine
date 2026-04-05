import React, { useState, useEffect } from "react";
import {
  Settings,
  Zap,
  Bot,
  CheckCircle,
  XCircle,
  Monitor,
  FileText,
  ExternalLink,
} from "lucide-react";
import { automationApi } from "../lib/api";

export default function SettingsPage() {
  const [config, setConfig]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    automationApi.config()
      .then((r) => setConfig(r.data))
      .catch(() => setConfig(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-text-primary">Settings</h1>
        <p className="text-text-muted text-sm mt-0.5">Configurações de automação e IA</p>
      </div>

      <div className="space-y-4">
        {/* Ambiente Local */}
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <Monitor size={18} className="text-flowity-purple" />
            <h2 className="font-medium text-text-primary text-sm">Ambiente Local</h2>
          </div>
          <p className="text-text-muted text-xs mb-4">
            Use estes links durante a demo local do projeto.
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
                <p className="text-xs text-text-muted">http://localhost:5173</p>
              </div>
              <ExternalLink size={14} className="text-text-muted" />
            </a>

            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm text-text-secondary transition-all hover:border-flowity-cyan/40 hover:text-text-primary"
            >
              <div className="flex items-start gap-2">
                <FileText size={14} className="mt-0.5 text-flowity-cyan" />
                <div>
                  <p className="font-medium">Backend Docs</p>
                  <p className="text-xs text-text-muted">http://localhost:8000/docs</p>
                </div>
              </div>
              <ExternalLink size={14} className="text-text-muted" />
            </a>

            <a
              href="http://localhost:5678"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm text-text-secondary transition-all hover:border-flowity-purple/40 hover:text-text-primary"
            >
              <div className="flex items-start gap-2">
                <Zap size={14} className="mt-0.5 text-flowity-purple" />
                <div>
                  <p className="font-medium">n8n</p>
                  <p className="text-xs text-text-muted">http://localhost:5678</p>
                </div>
              </div>
              <ExternalLink size={14} className="text-text-muted" />
            </a>
          </div>
        </div>

        {/* Ollama */}
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <Bot size={18} className="text-flowity-purple" />
            <h2 className="font-medium text-text-primary text-sm">Ollama (IA Local)</h2>
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
                <span className="text-text-secondary font-mono text-xs">{config?.ollama_base_url || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Modelo</span>
                <span className="text-text-secondary font-mono text-xs">{config?.ollama_model || "—"}</span>
              </div>
            </div>
          )}
          <p className="text-text-muted text-xs mt-3">
            Para trocar o modelo: edite <code className="bg-bg-elevated px-1 rounded">OLLAMA_MODEL</code> no <code className="bg-bg-elevated px-1 rounded">.env</code> e reinicie o Docker.
          </p>
        </div>

        {/* n8n */}
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <Zap size={18} className="text-flowity-cyan" />
            <h2 className="font-medium text-text-primary text-sm">n8n (Automação)</h2>
            {!loading && (
              config?.n8n_configured
                ? <CheckCircle size={14} className="text-status-published ml-auto" />
                : <XCircle    size={14} className="text-status-failed    ml-auto" />
            )}
          </div>
          <p className="text-text-muted text-xs">
            O n8n consulta posts agendados a cada 5 minutos e publica automaticamente.
          </p>
          <div className="mt-3 space-y-1 text-xs text-text-muted">
            <p>• Acesse o painel em <code className="bg-bg-elevated px-1 rounded">http://localhost:5678</code></p>
            <p>• Importe o workflow em <code className="bg-bg-elevated px-1 rounded">infra/n8n/flowity-publishing.json</code></p>
            <p>• Configure <code className="bg-bg-elevated px-1 rounded">N8N_WEBHOOK_SECRET</code> igual ao do <code className="bg-bg-elevated px-1 rounded">.env</code></p>
          </div>
        </div>

        {/* Supabase */}
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <Settings size={18} className="text-text-muted" />
            <h2 className="font-medium text-text-primary text-sm">Banco de Dados (Supabase)</h2>
          </div>
          <p className="text-text-muted text-xs">
            Configure <code className="bg-bg-elevated px-1 rounded">DATABASE_URL</code> no <code className="bg-bg-elevated px-1 rounded">.env</code> com a URL do Supabase.
            Veja <code className="bg-bg-elevated px-1 rounded">docs/supabase-setup.md</code> para o passo a passo completo.
          </p>
        </div>
      </div>
    </div>
  );
}
