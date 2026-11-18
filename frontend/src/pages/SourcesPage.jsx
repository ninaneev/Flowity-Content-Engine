import React, { useState, useEffect } from "react";
import { Plus, BookOpen, CheckCircle } from "lucide-react";
import SourceCard from "../components/sources/SourceCard";
import NewSourceForm from "../components/sources/NewSourceForm";
import SourceFilters from "../components/sources/SourceFilters";
import EmptyState from "../components/shared/EmptyState";
import { sourcesApi } from "../lib/api";

export default function SourcesPage() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [approving, setApproving] = useState(null);
  const [approveError, setApproveError] = useState(null);

  useEffect(() => {
    fetchSources();
  }, []);

  async function fetchSources() {
    setLoading(true);
    try {
      const res = await sourcesApi.list();
      setSources(res.data);
    } catch (err) {
      console.error("Error loading sources:", err);
    } finally {
      setLoading(false);
    }
  }

  function openCreateForm() {
    setEditingSource(null);
    setShowForm(true);
  }

  function openEditForm(source) {
    setEditingSource(source);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingSource(null);
  }

  async function handleSave(data) {
    setSaving(true);
    try {
      if (editingSource) {
        await sourcesApi.update(editingSource.id, data);
      } else {
        await sourcesApi.create(data);
      }
      closeForm();
      fetchSources();
    } catch (err) {
      console.error("Error saving source:", err);
    } finally {
      setSaving(false);
    }
  }

  async function handleApprove(source) {
    setApproving(source.id);
    setApproveError(null);
    try {
      await sourcesApi.approve(source.id);
      setSources((prev) => prev.map((s) => (s.id === source.id ? { ...s, used: true } : s)));
      setEditingSource((cur) => (cur?.id === source.id ? { ...cur, used: true } : cur));
    } catch (err) {
      console.error("Error approving source:", err);
      setApproveError(source.id);
    } finally {
      setApproving(null);
    }
  }

  const filtered = sources.filter((s) => {
    const searchTerm = search.toLowerCase();
    const matchesSearch =
      s.title.toLowerCase().includes(searchTerm) ||
      s.content.toLowerCase().includes(searchTerm);
    const matchesType = typeFilter ? s.source_type === typeFilter : true;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Library</h1>
          <p className="text-text-muted text-sm mt-0.5">
            {sources.length} saved reference{sources.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button className="btn-primary" onClick={openCreateForm}>
          <Plus size={16} />
          New source
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="text-sm font-semibold text-text-primary mb-4">
            {editingSource ? "Edit source" : "New reference"}
          </h2>
          <NewSourceForm
            initialData={editingSource}
            onSave={handleSave}
            onCancel={closeForm}
            loading={saving}
          />
          {editingSource && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
              {editingSource.used ? (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-300">
                  <CheckCircle size={13} aria-hidden="true" />
                  Used (post in Pipeline)
                </span>
              ) : (
                <button
                  type="button"
                  className="btn-secondary text-xs px-2.5 py-1.5"
                  onClick={() => handleApprove(editingSource)}
                  disabled={approving === editingSource.id}
                  aria-label={`Approve ${editingSource.title}: create a post in To approve`}
                >
                  {approving === editingSource.id ? "Creating post..." : "Approve"}
                </button>
              )}
              {approveError === editingSource.id && (
                <span role="alert" className="text-xs text-red-300">Could not create the post. Try again.</span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mb-4">
        <SourceFilters
          search={search}
          onSearchChange={setSearch}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
        />
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="card h-24 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title={search || typeFilter ? "No sources found" : "No sources yet"}
          description={
            search || typeFilter
              ? "Try another search term or remove the filters."
              : "Add your first content reference."
          }
          action={
            !search && !typeFilter && (
              <button className="btn-primary" onClick={openCreateForm}>
                <Plus size={16} /> Add source
              </button>
            )
          }
        />
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((source) => (
            <div key={source.id} className="flex flex-col gap-1.5">
              <SourceCard
                source={source}
                onSelect={() => openEditForm(source)}
                selected={editingSource?.id === source.id}
                selectedLabel="Open"
              />
              <div className="flex items-center gap-2 px-1">
                {source.used ? (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-300">
                    <CheckCircle size={13} aria-hidden="true" />
                    Used (post in Pipeline)
                  </span>
                ) : (
                  <button
                    type="button"
                    className="btn-secondary text-xs px-2.5 py-1.5"
                    onClick={() => handleApprove(source)}
                    disabled={approving === source.id}
                    aria-label={`Approve ${source.title}: create a post in To approve`}
                  >
                    {approving === source.id ? "Creating post..." : "Approve"}
                  </button>
                )}
                {approveError === source.id && (
                  <span role="alert" className="text-xs text-red-300">Could not create the post. Try again.</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
