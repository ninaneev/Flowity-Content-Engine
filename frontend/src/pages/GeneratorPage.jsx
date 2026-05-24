import React, { useState, useEffect } from "react";
import { Sparkles, Zap, Copy, Check, ArrowRight, CalendarPlus, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SourceCard from "../components/sources/SourceCard";
import { sourcesApi, generationApi, postsApi } from "../lib/api";
import { validateGenerationSelection } from "../lib/generatorValidation.mjs";

const TONES = [
  { value: "strategic", label: "Strategic" },
  { value: "educational", label: "Educational" },
  { value: "inspirational", label: "Inspirational" },
  { value: "direct", label: "Direct" },
];
const FORMATS = [
  { value: "list", label: "List" },
  { value: "narrative", label: "Narrative" },
  { value: "question", label: "Question" },
  { value: "data point", label: "Data Point" },
];
const CHANNELS = [{ value: "linkedin", label: "LinkedIn" }, { value: "x", label: "X / Twitter" }];
const MODES = [
  { value: "template", label: "Template", desc: "Fast and always available" },
  { value: "ollama", label: "Ollama AI", desc: "Local LLM mode, requires Docker" },
];

function GeneratorDropdown({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value) || options[0];

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <label className="label">{label}</label>
      <button
        type="button"
        className="input flex items-center justify-between text-left cursor-pointer"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{selected.label}</span>
        <ChevronDown
          size={16}
          className={`text-text-muted transition-transform duration-200 ease-out ${open ? "-rotate-90" : "rotate-0"}`}
        />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-border bg-bg-elevated shadow-xl" role="listbox">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={`w-full px-3 py-2 text-left text-sm transition-colors duration-150 ${
                option.value === value
                  ? "bg-flowity-purple-dim text-text-primary"
                  : "text-text-secondary hover:bg-bg-surface hover:text-text-primary"
              }`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GeneratorPage() {
  const navigate = useNavigate();
  const [sources, setSources] = useState([]);
  const [selected, setSelected] = useState([]);
  const [channel, setChannel] = useState("linkedin");
  const [tone, setTone] = useState("strategic");
  const [format, setFormat] = useState("list");
  const [mode, setMode] = useState("template");
  const [objective, setObjective] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [scheduling, setScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [scheduleTime, setScheduleTime] = useState("09:00");

  useEffect(() => { fetchSources(); }, []);

  async function fetchSources() {
    try {
      const r = await sourcesApi.list();
      setSources(r.data);
    } catch (e) {
      console.error(e);
    }
  }

  function toggleSource(id) {
    setError("");
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  }

  function handleClearSources(e) {
    e.preventDefault();
    e.stopPropagation();
    setSelected([]);
    setResult(null);
    setError("");
    setCopied(false);
    setScheduling(false);
  }

  async function handleGenerate() {
    const validationError = validateGenerationSelection(selected);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const r = await generationApi.preview({ source_ids: selected, channel, tone, format, objective, mode });
      setResult(r.data);
      setError("");
    } catch (e) {
      console.error(e);
      setError("Unable to generate content. Make sure the backend is running and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveAsPost() {
    if (!result) return;
    setSaving(true);
    try {
      await generationApi.createPost({ source_ids: selected, channel, tone, format, objective, mode });
      navigate("/pipeline");
    } catch (e) {
      console.error(e);
      setError("Unable to save the draft.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSchedule() {
    if (!result || !scheduleDate) return;
    setSaving(true);
    try {
      const r = await generationApi.createPost({ source_ids: selected, channel, tone, format, objective, mode });
      const postId = r.data.run_id; // backend returns new_post.id in run_id field
      await postsApi.update(postId, {
        scheduled_at: `${scheduleDate}T${scheduleTime}:00`,
        status: "scheduled",
      });
      navigate("/");
    } catch (e) {
      console.error(e);
      setError("Unable to schedule the post.");
    } finally {
      setSaving(false);
      setScheduling(false);
    }
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(`${result.hook}\n\n${result.body}\n\n${result.cta}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-text-primary">Generator</h1>
        <p className="text-text-muted text-sm mt-0.5">Select up to 3 sources and generate a post</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label">Sources ({selected.length}/3)</label>
              {selected.length > 0 && (
                <button type="button" className="btn-ghost text-xs" onClick={handleClearSources}>
                  Clear
                </button>
              )}
            </div>
            {sources.length === 0 ? (
              <p className="text-text-muted text-sm card text-center py-4">
                No sources yet. <a className="text-flowity-cyan underline cursor-pointer" onClick={() => navigate("/sources")}>Add one</a>.
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {sources.map((s) => (
                  <SourceCard key={s.id} source={s} onSelect={() => toggleSource(s.id)} selected={selected.includes(s.id)} />
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <GeneratorDropdown label="Channel" value={channel} options={CHANNELS} onChange={setChannel} />
            <GeneratorDropdown label="Tone" value={tone} options={TONES} onChange={setTone} />
            <GeneratorDropdown label="Format" value={format} options={FORMATS} onChange={setFormat} />
            <GeneratorDropdown label="Mode" value={mode} options={MODES} onChange={setMode} />
          </div>

          <div>
            <label className="label">Objective (optional)</label>
            <input className="input" value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="Example: generate leads, educate about AI..." />
          </div>

          {error && (
            <p className="text-status-failed text-sm">{error}</p>
          )}

          <button className="btn-primary w-full justify-center" onClick={handleGenerate} disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2"><Zap size={16} className="animate-spin" /> Generating...</span>
            ) : (
              <span className="flex items-center gap-2"><Sparkles size={16} /> Generate content</span>
            )}
          </button>
        </div>

        <div>
          {!result && !loading && (
            <div className="card h-full flex items-center justify-center text-center py-16">
              <div>
                <Sparkles size={32} className="text-text-muted mx-auto mb-3" />
                <p className="text-text-muted text-sm">The result will appear here</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="card h-full flex items-center justify-center py-16">
              <div className="text-center">
                <Zap size={32} className="text-flowity-purple mx-auto mb-3 animate-pulse" />
                <p className="text-text-muted text-sm">Generating with {mode === "ollama" ? "Ollama" : "template"}...</p>
              </div>
            </div>
          )}

          {result && (
            <div className="card space-y-4 animate-slide-up">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">via {result.mode} - {result.model_used}</span>
                <button className="btn-ghost text-xs" onClick={handleCopy}>
                  {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                </button>
              </div>

              <div>
                <label className="label">Hook</label>
                <p className="text-text-primary font-semibold text-sm leading-relaxed bg-flowity-purple-dim rounded-lg px-3 py-2 border border-flowity-purple/20">{result.hook}</p>
              </div>

              {result.body && (
                <div>
                  <label className="label">Body</label>
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
                  <label className="label">X version</label>
                  <p className="text-text-secondary text-sm font-mono">{result.short_x}</p>
                </div>
              )}

              <div className="divider pt-2 space-y-2 mt-4">
                {!scheduling ? (
                  <div className="flex gap-2">
                    <button className="btn-secondary flex-1 justify-center" onClick={handleSaveAsPost} disabled={saving}>
                      <ArrowRight size={16} />
                      {saving ? "Saving..." : "Save as draft"}
                    </button>
                    <button className="btn-primary flex-1 justify-center" onClick={() => setScheduling(true)} disabled={saving}>
                      <CalendarPlus size={16} />
                      Schedule
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="label">Date</label>
                        <input
                          className="input"
                          type="date"
                          value={scheduleDate}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) => setScheduleDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="label">Time</label>
                        <input
                          className="input"
                          type="time"
                          value={scheduleTime}
                          onChange={(e) => setScheduleTime(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-secondary flex-1 justify-center" onClick={() => setScheduling(false)} disabled={saving}>
                        Cancel
                      </button>
                      <button className="btn-primary flex-1 justify-center" onClick={handleSchedule} disabled={saving || !scheduleDate}>
                        <CalendarPlus size={16} />
                        {saving ? "Scheduling..." : "Confirm"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
