import React, { useState, useEffect, useRef } from "react";
import StatusBadge from "../components/shared/StatusBadge";
import PostModal from "../components/posts/PostModal";
import { postsApi } from "../lib/api";
import { format } from "date-fns";

const PIPELINE_COLUMNS = [
  { status: "idea",      label: "Idea" },
  { status: "draft",     label: "Draft" },
  { status: "revised",   label: "Reviewed" },
  { status: "scheduled", label: "Scheduled" },
  { status: "published", label: "Published" },
];

export default function PipelinePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const draggingId = useRef(null);

  useEffect(() => { fetchPosts(); }, []);

  async function fetchPosts() {
    setLoading(true);
    try {
      const r = await postsApi.list();
      setPosts(r.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(data) {
    await postsApi.update(selectedPost.id, data);
    fetchPosts();
  }

  function postsByStatus(status) {
    return posts.filter((p) => p.status === status);
  }

  function handleDragStart(e, post) {
    draggingId.current = post.id;
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e, status) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCol(status);
  }

  function handleDragLeave(e) {
    // Only clear when leaving the column entirely (not entering a child)
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverCol(null);
    }
  }

  async function handleDrop(e, targetStatus) {
    e.preventDefault();
    setDragOverCol(null);
    const id = draggingId.current;
    draggingId.current = null;
    if (!id) return;

    const post = posts.find((p) => p.id === id);
    if (!post || post.status === targetStatus) return;

    // Optimistic update so the card moves instantly
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, status: targetStatus } : p));

    try {
      await postsApi.update(id, { status: targetStatus });
    } catch (e) {
      console.error(e);
      // Revert on failure
      setPosts((prev) => prev.map((p) => p.id === id ? { ...p, status: post.status } : p));
    }
  }

  function handleDragEnd() {
    draggingId.current = null;
    setDragOverCol(null);
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-text-primary">Pipeline</h1>
        <p className="text-text-muted text-sm mt-0.5">{posts.length} total posts</p>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_COLUMNS.map((col) => (
            <div key={col.status} className="flex-shrink-0 w-56 bg-bg-surface border border-border rounded-xl p-3 space-y-2">
              <div className="h-4 bg-bg-elevated rounded animate-pulse w-20" />
              {[1, 2].map((i) => <div key={i} className="h-16 bg-bg-elevated rounded animate-pulse" />)}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_COLUMNS.map((col) => {
            const colPosts = postsByStatus(col.status);
            const isOver = dragOverCol === col.status;
            return (
              <div
                key={col.status}
                className="flex-shrink-0 w-60"
                onDragOver={(e) => handleDragOver(e, col.status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.status)}
              >
                <div className="flex items-center justify-between mb-2 px-1">
                  <StatusBadge status={col.status} />
                  <span className="text-xs text-text-muted">{colPosts.length}</span>
                </div>

                <div
                  className={`space-y-2 min-h-16 rounded-xl p-1 transition-colors ${
                    isOver ? "bg-flowity-purple/10 ring-1 ring-flowity-purple/40" : ""
                  }`}
                >
                  {colPosts.length === 0 && (
                    <div className={`border-2 border-dashed rounded-lg h-16 flex items-center justify-center transition-colors ${
                      isOver ? "border-flowity-purple/50" : "border-border"
                    }`}>
                      <span className="text-xs text-text-muted">{isOver ? "Drop here" : "Empty"}</span>
                    </div>
                  )}
                  {colPosts.map((post) => (
                    <div
                      key={post.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, post)}
                      onDragEnd={handleDragEnd}
                      className="card cursor-grab active:cursor-grabbing hover:border-border-bright transition-all select-none"
                      onClick={() => setSelectedPost(post)}
                    >
                      <p className="text-text-primary text-sm font-medium line-clamp-2 mb-2">{post.hook}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-muted">{post.channel === "linkedin" ? "LinkedIn" : "X"}</span>
                        {post.scheduled_at && (
                          <span className="text-xs text-text-muted">
                            {format(new Date(post.scheduled_at), "MMM d")}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedPost && (
        <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} onSave={handleSave} />
      )}
    </div>
  );
}
