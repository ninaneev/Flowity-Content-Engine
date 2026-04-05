/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  TAREFA DO INTEGRANTE 1 — Library / Sources (SourcesPage)          ║
 * ║  Issue: #1 no GitHub Projects                                       ║
 * ║  Branch: feat/issue-1-sources-page                                  ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * O QUE VOCÊ VAI FAZER:
 *   Esta página já carrega as sources da API e mostra um estado de loading.
 *   O que falta é renderizar a LISTA DE CARDS e o FORMULÁRIO DE NOVA SOURCE.
 *
 * PASSO A PASSO:
 *   1. Encontre o bloco "TODO Integrante 1" abaixo
 *   2. Substitua o placeholder pela lista de <SourceCard /> componentes
 *   3. Quando showForm=true, mostre o <NewSourceForm />
 *   4. Teste abrindo http://localhost:5173/sources
 *
 * TUDO QUÊ VOCÊ PRECISA JÁ ESTÁ IMPORTADO:
 *   - sources     = lista de sources vindas do banco
 *   - showForm    = boolean que controla se o form aparece
 *   - setShowForm = função para mostrar/esconder o form
 *   - handleSave  = função que salva a source na API
 *   - saving      = boolean (true enquanto salva)
 *   - search      = texto de busca do filtro
 */

import React, { useState, useEffect } from "react";
import { Plus, BookOpen } from "lucide-react";
import SourceCard from "../components/sources/SourceCard";
import NewSourceForm from "../components/sources/NewSourceForm";
import SourceFilters from "../components/sources/SourceFilters";
import EmptyState from "../components/shared/EmptyState";
import { sourcesApi } from "../lib/api";

export default function SourcesPage() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [search, setSearch]   = useState("");

  useEffect(() => {
    fetchSources();
  }, []);

  async function fetchSources() {
    setLoading(true);
    try {
      const res = await sourcesApi.list();
      setSources(res.data);
    } catch (err) {
      console.error("Erro ao carregar sources:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(data) {
    setSaving(true);
    try {
      await sourcesApi.create(data);
      setShowForm(false);
      fetchSources(); // Atualiza a lista
    } catch (err) {
      console.error("Erro ao criar source:", err);
    } finally {
      setSaving(false);
    }
  }

  // Filtra sources pelo campo de busca (título ou conteúdo)
  const filtered = sources.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Library</h1>
          <p className="text-text-muted text-sm mt-0.5">
            {sources.length} referência{sources.length !== 1 ? "s" : ""} cadastrada{sources.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} />
          Nova source
        </button>
      </div>

      {/* Formulário (aparece quando showForm = true) */}
      {showForm && (
        <div className="card mb-6">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Nova referência</h2>
          <NewSourceForm
            onSave={handleSave}
            onCancel={() => setShowForm(false)}
            loading={saving}
          />
        </div>
      )}

      {/* Filtros */}
      <div className="mb-4">
        <SourceFilters search={search} onSearchChange={setSearch} />
      </div>

      {/* Estado de loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="card h-24 animate-pulse" />
          ))}
        </div>
      )}

      {/* Estado vazio */}
      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title={search ? "Nenhuma source encontrada" : "Nenhuma source ainda"}
          description={search ? "Tente outro termo de busca." : "Adicione sua primeira referência de conteúdo."}
          action={
            !search && (
              <button className="btn-primary" onClick={() => setShowForm(true)}>
                <Plus size={16} /> Adicionar source
              </button>
            )
          }
        />
      )}

      {/* ══════════════════════════════════════════════════════════════
          TODO Integrante 1: renderize a lista de sources aqui abaixo
          ══════════════════════════════════════════════════════════════
          Substitua este comentário pelo código abaixo:

          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((source) => (
                <SourceCard
                  key={source.id}
                  source={source}
                  onSelect={() => {}}
                  selected={false}
                />
              ))}
            </div>
          )}
      */}
    </div>
  );
}
