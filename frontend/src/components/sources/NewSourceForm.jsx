/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  TAREFA DO INTEGRANTE 2 — Formulário de Nova Source                  ║
 * ║  Issue: #2 no GitHub Projects                                        ║
 * ║  Branch: feat/issue-2-new-source-form                                ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * O QUE VOCÊ VAI FAZER:
 *   Criar o formulário completo para cadastrar uma nova source.
 *   Atualmente só tem o campo "title". Você vai adicionar os outros campos.
 *
 * CAMPOS QUE PRECISA TER:
 *   - title (texto, obrigatório)
 *   - source_type (select, obrigatório) — opções: post_antigo, insight, frase,
 *     objecao, dor, trecho, comentario, newsletter, referencia
 *   - content (textarea grande, obrigatório) — o texto da source
 *   - theme (texto, opcional) — ex: "automação", "ia", "saas"
 *   - origin (texto, opcional) — ex: "linkedin", "email", "reunião"
 *   - notes (textarea pequeno, opcional)
 *
 * COMO FUNCIONA:
 *   1. Usuário preenche o formulário
 *   2. Clica em "Salvar"
 *   3. A função onSave(data) é chamada com os dados
 *   4. (A SourcesPage já faz a chamada para a API, você só cuida do form)
 *
 * PROPS:
 *   onSave   = função assíncrona recebe { title, source_type, content, theme, origin, notes }
 *   onCancel = função chamada ao clicar em "Cancelar"
 *   loading  = true enquanto está salvando (desabilita o botão)
 */

import React, { useState } from "react";
import { X } from "lucide-react";

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
  // Estado inicial do formulário
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
      {/* TODO Integrante 2: adicione os campos abaixo usando as classes CSS do tema */}
      {/* Classe para label: "label" */}
      {/* Classe para input: "input" */}
      {/* Classe para textarea: "textarea" */}
      {/* Classe para select: "select" */}

      {/* CAMPO 1: title (já feito — use como exemplo para os outros) */}
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

      {/* TODO: CAMPO 2 — source_type (select com as opções de SOURCE_TYPES) */}

      {/* TODO: CAMPO 3 — content (textarea, obrigatório, 6 linhas) */}

      {/* CAMPO 4 — theme (input texto, opcional) */}
      <div>
        <label className="label">Tema *</label>
        <input
          className="input"
          name="theme"
          value={form.theme}
          onChange={handleChange}
          placeholder="Tema do Arquivo"

        />
      </div>
      {/* TODO: CAMPO 5 — origin (input texto, opcional) */}

      {/* TODO: CAMPO 6 — notes (textarea, opcional, 3 linhas) */}

      {/* Botões */}
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
