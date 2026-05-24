import React, { useEffect, useState } from "react";

const EMPTY_FORM = {
  title: "",
  source_type: "insight",
  content: "",
  theme: "",
  origin: "",
  notes: "",
};

const SOURCE_TYPES = [
  { value: "post_antigo", label: "Old post" },
  { value: "insight", label: "Insight" },
  { value: "frase", label: "Positioning line" },
  { value: "objecao", label: "Prospect objection" },
  { value: "dor", label: "Founder pain point" },
  { value: "trecho", label: "Website excerpt" },
  { value: "comentario", label: "Customer comment" },
  { value: "newsletter", label: "Newsletter" },
  { value: "referencia", label: "External reference" },
];

export default function NewSourceForm({ initialData, onSave, onCancel, loading }) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    setForm(initialData ? { ...EMPTY_FORM, ...initialData } : EMPTY_FORM);
  }, [initialData]);

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
        <label className="label">Title *</label>
        <input
          className="input"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Example: LinkedIn post about automation"
          required
        />
      </div>

      <div>
        <label className="label">Type *</label>
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
        <label className="label">Content *</label>
        <textarea
          name="content"
          className="textarea"
          rows={6}
          value={form.content}
          onChange={handleChange}
          placeholder="Paste the source content here..."
          required
        />
      </div>

      <div>
        <label className="label">Theme</label>
        <input
          className="input"
          name="theme"
          value={form.theme || ""}
          onChange={handleChange}
          placeholder="Example: automation, AI, SaaS"
        />
      </div>

      <div>
        <label className="label">Origin</label>
        <input
          className="input"
          name="origin"
          value={form.origin || ""}
          onChange={handleChange}
          placeholder="Example: LinkedIn, email, meeting"
        />
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea
          name="notes"
          className="textarea"
          rows={3}
          value={form.notes || ""}
          onChange={handleChange}
          placeholder="Internal notes..."
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Saving..." : initialData ? "Save changes" : "Save source"}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
