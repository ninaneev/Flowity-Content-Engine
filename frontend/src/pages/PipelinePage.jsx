import React, { useState, useEffect, useRef, useMemo } from "react";
import StatusBadge from "../components/shared/StatusBadge";
import PostModal from "../components/posts/PostModal";
import { IssueDot, PillarTag, PostDateChip, OffStructureFlag, StatusFlag } from "../components/posts/PostMeta";
import { postIssues } from "../lib/postIssues.js";
import { postsApi } from "../lib/api";
import { parseApiDate, sortByScheduled } from "../lib/postDates.js";
import { planPillars } from "../lib/pillars.js";
import { Link } from "react-router-dom";
import { Layers } from "lucide-react";

const PIPELINE_COLUMNS = [
  { status: "idea",      label: "Idea" },
  { status: "draft",     label: "Draft" },
  { status: "revised",   label: "Revised" },
  { status: "scheduled", label: "Scheduled" },
  { status: "published", label: "Published" },
];

const CHANNEL_LABELS = {
  linkedin: "LinkedIn",
  x: "X",
  newsletter: "Newsletter",
};

export default function PipelinePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const draggingId = useRef(null);

  useEffect(() => {
    fetchPosts();
    // Posts can change outside this tab (Make, imports, another window): refetch quietly on focus and every minute.
    const refresh = () => document.visibilityState === "visible" && fetchPosts({ silent: true });
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    const timer = setInterval(refresh, 60000);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
      clearInterval(timer);
    };
  }, []);

  async function fetchPosts({ silent = false } = {}) {
    if (!silent) setLoading(true);
    try {
      const r = await postsApi.list();
      setPosts(r.data);
    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) setLoading(false);
    }
  }

  // Swaps the post in the list for the saved version: the column reorders at once, without reloading everything.
  function applySaved(saved) {
    setPosts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
  }

  async function handleSave(data) {
    const r = await postsApi.update(selectedPost.id, data);
    applySaved(r.data);
  }

  async function handleDelete(post) {
    await postsApi.remove(post.id);
    setPosts((prev) => prev.filter((p) => p.id !== post.id));
  }

  async function handleRemoveDate(post) {
    setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, scheduled_at: null } : p)));
    try {
      const r = await postsApi.update(post.id, { scheduled_at: null });
      applySaved(r.data);
    } catch (e) {
      console.error(e);
      applySaved(post);
    }
  }

  const pillarPlan = useMemo(() => {
    const datas = posts.map((p) => parseApiDate(p.scheduled_at)).filter(Boolean);
    const until = datas.length ? new Date(Math.max(...datas)) : new Date();
    return planPillars({ posts, today: new Date(), until });
  }, [posts]);

  function postsByStatus(status) {
    // "publishing" stays in the Scheduled column until Make records it as published.
    // "failed" (Make could not post it) stays there too, flagged, until it gets a new date.
    const inScheduled = ["publishing", "failed"];
    return sortByScheduled(
      posts.filter((p) => p.status === status || (status === "scheduled" && inScheduled.includes(p.status))),
    );
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

    if (targetStatus === "scheduled" && !post.scheduled_at) {
      setSelectedPost({ ...post, status: "scheduled" });
      return;
    }

    // The date does not change with the status: the post stays on the calendar until someone removes the date.
    const updatePayload = { status: targetStatus };

    // Optimistic update so the card moves instantly
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, ...updatePayload } : p));

    try {
      const r = await postsApi.update(id, updatePayload);
      applySaved(r.data);
    } catch (e) {
      console.error(e);
      // Revert on failure
      setPosts((prev) => prev.map((p) => p.id === id ? { ...p, status: post.status, scheduled_at: post.scheduled_at } : p));
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
                      <div className="flex items-start gap-2 mb-2">
                        <p className="text-text-primary text-sm font-medium line-clamp-2 flex-1 min-w-0">{post.hook}</p>
                        <IssueDot issues={postIssues(post)} className="mt-1.5" />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-text-muted">{CHANNEL_LABELS[post.channel] || post.channel}</span>
                        <PillarTag pillar={post.pillar} />
                      </div>
                      {(post.status === "publishing" || post.status === "failed") && (
                        <div className="mt-2">
                          <StatusFlag status={post.status} />
                        </div>
                      )}
                      {(post.scheduled_at || pillarPlan.posts[post.id]?.offStructure) && (
                        <div className="mt-2 flex flex-wrap items-center gap-1">
                          <PostDateChip post={post} onRemoveDate={handleRemoveDate} />
                          {pillarPlan.posts[post.id]?.offStructure && (
                            <OffStructureFlag expected={pillarPlan.posts[post.id].expected} />
                          )}
                        </div>
                      )}
                      <Link
                        to={`/carousel/${post.id}`}
                        onClick={(event) => event.stopPropagation()}
                        draggable="false"
                        className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-text-primary hover:border-flowity-purple focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flowity-cyan"
                        aria-label={`Open carousel for post ${post.id}`}
                      >
                        <Layers size={13} aria-hidden="true" />
                        Edit carousel
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
