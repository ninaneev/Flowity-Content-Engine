import React, { useState } from "react";

const SOURCE_TYPES = [
  { value: "post_antigo", label: "Post antigo" },
  { value: "insight", label: "Insight" },
  { value: "frase", label: "Frase de posicionamento" },
  { value: "objecao", label: "Objeção de prospect" },
  { value: "dor", label: "Dor de founder" },
  { value: "trecho", label: "Trecho do site" },
  { value: "comentario", label: "Comentário de cliente" },
  { value: "newsletter", label: "Newsletter" },
  { value: "referencia", label: "Referência externa" },
];

export default function NewSourceForm({ onSave, onCancel, loading }) {
  const [form, setForm] = useState({
    title: "",
    source_type: "insight",
    content: "",
    theme: "",
    origin: "",
    notes: "",
  });

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">

      <div>
        <label className="label">Título *</label>
        <input
          className="input"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Ex: Post sobre automação no LinkedIn"
          required
        />
      </div>

      <div>
        <label className="label">Tipo *</label>
        <select
          name="source_type"
          className="select"
          value={form.source_type}
          onChange={handleChange}
          required
        >
          {SOURCE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Conteúdo *</label>
        <textarea
          name="content"
          className="textarea"
          rows={6}
          value={form.content}
          onChange={handleChange}
          placeholder="Cole aqui o conteúdo da source..."
          required
        />
      </div>

      <div>
        <label className="label">Tema</label>
        <input
          className="input"
          name="theme"
          value={form.theme}
          onChange={handleChange}
          placeholder="Ex: automação, ia, saas"
        />
      </div>

      <div>
        <label className="label">Origem</label>
        <input
          className="input"
          name="origin"
          value={form.origin}
          onChange={handleChange}
          placeholder="Ex: LinkedIn, Email, Reunião"
        />
      </div>

      <div>
        <label className="label">Observações</label>
        <textarea
          name="notes"
          className="textarea"
          rows={3}
          value={form.notes}
          onChange={handleChange}
          placeholder="Anotações internas..."
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Salvando..." : "Salvar Source"}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
