import React, { useState, useEffect } from "react";
import { Sparkles, Zap, Copy, Check, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SourceCard from "../components/sources/SourceCard";
import { sourcesApi, generationApi } from "../lib/api";

const TONES    = ["estratégico", "educativo", "inspiracional", "direto"];
const FORMATS  = ["lista", "narrativa", "pergunta", "dado"];
const CHANNELS = [{ value: "linkedin", label: "LinkedIn" }, { value: "x", label: "X / Twitter" }];
const MODES    = [
  { value: "template", label: "Template", desc: "Rápido, sempre funciona" },
  { value: "ollama",   label: "Ollama IA", desc: "LLM local real (requer Docker)" },
];

export default function GeneratorPage() {
  const navigate = useNavigate();
  const [sources, setSources]         = useState([]);
  const [selected, setSelected]       = useState([]);   // max 3 IDs
  const [channel, setChannel]         = useState("linkedin");
  const [tone, setTone]               = useState("estratégico");
  const [format, setFormat]           = useState("lista");
  const [mode, setMode]               = useState("template");
  const [objective, setObjective]     = useState("");
  const [result, setResult]           = useState(null);
  const [loading, setLoading]         = useState(false);
  const [copied, setCopied]           = useState(false);
  const [saving, setSaving]           = useState(false);

  useEffect(() => { fetchSources(); }, []);

  async function fetchSources() {
    try { const r = await sourcesApi.list(); setSources(r.data); }
    catch (e) { console.error(e); }
  }

  function toggleSource(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  }

  async function handleGenerate() {
    if (!selected.length) return;
    setLoading(true); setResult(null);
    try {
      const r = await generationApi.preview({ source_ids: selected, channel, tone, format, objective, mode });
      setResult(r.data);
    } catch (e) {
      alert("Erro ao gerar. Verifique se o backend está rodando.");
    } finally { setLoading(false); }
  }

  async function handleSaveAsPost() {
    if (!result) return;
    setSaving(true);
    try {
      await generationApi.createPost({ source_ids: selected, channel, tone, format, objective, mode });
      navigate("/pipeline");
    } catch (e) { alert("Erro ao salvar post."); }
    finally { setSaving(false); }
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(`${result.hook}\n\n${result.body}\n\n${result.cta}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-text-primary">Generator</h1>
        <p className="text-text-muted text-sm mt-0.5">Selecione até 3 sources e gere um post</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Coluna esquerda: configuração ──────────────────── */}
        <div className="space-y-5">
          {/* Seleção de sources */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label">Sources ({selected.length}/3)</label>
              {selected.length > 0 && (
                <button className="btn-ghost text-xs" onClick={() => setSelected([])}>Limpar</button>
              )}
            </div>
            {sources.length === 0 ? (
              <p className="text-text-muted text-sm card text-center py-4">
                Nenhuma source. <a className="text-flowity-cyan underline cursor-pointer" onClick={() => navigate("/sources")}>Adicione uma</a>.
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {sources.map((s) => (
                  <SourceCard key={s.id} source={s} onSelect={() => toggleSource(s.id)} selected={selected.includes(s.id)} />
                ))}
              </div>
            )}
          </div>

          {/* Config */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Canal</label>
              <select className="select" value={channel} onChange={(e) => setChannel(e.target.value)}>
                {CHANNELS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Tom</label>
              <select className="select" value={tone} onChange={(e) => setTone(e.target.value)}>
                {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Formato</label>
              <select className="select" value={format} onChange={(e) => setFormat(e.target.value)}>
                {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Modo</label>
              <select className="select" value={mode} onChange={(e) => setMode(e.target.value)}>
                {MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Objetivo (opcional)</label>
            <input className="input" value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="Ex: gerar leads, educar sobre IA..." />
          </div>

          <button className="btn-primary w-full justify-center" onClick={handleGenerate} disabled={loading || !selected.length}>
            {loading ? (
              <span className="flex items-center gap-2"><Zap size={16} className="animate-spin" /> Gerando...</span>
            ) : (
              <span className="flex items-center gap-2"><Sparkles size={16} /> Gerar conteúdo</span>
            )}
          </button>
        </div>

        {/* ── Coluna direita: resultado ───────────────────────── */}
        <div>
          {!result && !loading && (
            <div className="card h-full flex items-center justify-center text-center py-16">
              <div>
                <Sparkles size={32} className="text-text-muted mx-auto mb-3" />
                <p className="text-text-muted text-sm">O resultado aparecerá aqui</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="card h-full flex items-center justify-center py-16">
              <div className="text-center">
                <Zap size={32} className="text-flowity-purple mx-auto mb-3 animate-pulse" />
                <p className="text-text-muted text-sm">Gerando com {mode === "ollama" ? "Ollama" : "template"}...</p>
              </div>
            </div>
          )}

          {result && (
            <div className="card space-y-4 animate-slide-up">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">via {result.mode} · {result.model_used}</span>
                <button className="btn-ghost text-xs" onClick={handleCopy}>
                  {copied ? <><Check size={12} /> Copiado!</> : <><Copy size={12} /> Copiar</>}
                </button>
              </div>

              <div>
                <label className="label">Hook</label>
                <p className="text-text-primary font-semibold text-sm leading-relaxed bg-flowity-purple-dim rounded-lg px-3 py-2 border border-flowity-purple/20">{result.hook}</p>
              </div>

              {result.body && (
                <div>
                  <label className="label">Corpo</label>
                  <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">{result.body}</p>
                </div>
              )}

              {result.cta && (
                <div>
                  <label className="label">CTA</label>
                  <p className="text-flowity-cyan text-sm">{result.cta}</p>
                </div>
              )}

              {result.short_x && channel === "x" && (
                <div>
                  <label className="label">Versão X</label>
                  <p className="text-text-secondary text-sm font-mono">{result.short_x}</p>
                </div>
              )}

              <div className="divider pt-2">
                <button className="btn-primary w-full justify-center mt-4" onClick={handleSaveAsPost} disabled={saving}>
                  <ArrowRight size={16} />
                  {saving ? "Salvando..." : "Salvar como rascunho"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
