import React, { useState, useEffect } from "react";
import { format, addMonths, subMonths, setHours, setMinutes } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import ContentCalendar from "../components/calendar/ContentCalendar";
import PostModal from "../components/posts/PostModal";
import { postsApi } from "../lib/api";

function newPostForDate(date = new Date()) {
  const scheduled = setMinutes(setHours(date, 9), 0);
  return {
    hook: "New post",
    body: "",
    cta: "",
    short_x: "",
    alt_title: "",
    channel: "linkedin",
    tone: "strategic",
    objective: "",
    format: "list",
    status: "idea",
    scheduled_at: format(scheduled, "yyyy-MM-dd'T'HH:mm"),
    generation_mode: "manual",
    notes: "",
    source_ids: [],
  };
}

export default function DashboardPage() {
  const [month, setMonth] = useState(new Date());
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [creatingPost, setCreatingPost] = useState(null);

  const monthKey = format(month, "yyyy-MM");

  useEffect(() => {
    fetchPosts();
  }, [monthKey]);

  async function fetchPosts() {
    setLoading(true);
    try {
      const res = await postsApi.calendar(monthKey);
      setPosts(res.data);
    } catch (err) {
      console.error("Error loading calendar posts:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveExistingPost(data) {
    await postsApi.update(selectedPost.id, data);
    await fetchPosts();
  }

  async function handleCreatePost(data) {
    await postsApi.create(data);
    setCreatingPost(null);
    await fetchPosts();
  }

  function handleAddPost(date = new Date()) {
    setCreatingPost(newPostForDate(date));
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Editorial Calendar</h1>
          <p className="text-text-muted text-sm mt-0.5">
            Review, approve, and schedule this month&apos;s posts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="btn-primary" onClick={() => handleAddPost(new Date())}>
            <Plus size={16} /> New post
          </button>
          <div className="flex items-center gap-1 bg-bg-surface border border-border rounded-lg p-1">
            <button className="btn-ghost p-1.5" onClick={() => setMonth(subMonths(month, 1))}>
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-text-primary px-2 min-w-36 text-center">
              {format(month, "MMMM yyyy")}
            </span>
            <button className="btn-ghost p-1.5" onClick={() => setMonth(addMonths(month, 1))}>
              <ChevronRight size={16} />
            </button>
          </div>
          <button className="btn-ghost text-xs" onClick={() => setMonth(new Date())}>
            Today
          </button>
        </div>
      </div>

      <div className="card mb-4 bg-bg-surface/70">
        <h2 className="text-sm font-semibold text-text-primary mb-2">Approval flow</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs text-text-muted">
          <p><strong className="text-text-secondary">1. Idea/Draft:</strong> content created manually or by Generator.</p>
          <p><strong className="text-text-secondary">2. Revised:</strong> human editorial approval before publishing.</p>
          <p><strong className="text-text-secondary">3. Scheduled:</strong> n8n can publish when the date arrives.</p>
          <p><strong className="text-text-secondary">4. Published/Failed:</strong> automation result is recorded.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        {[
          { status: "idea", label: "Idea" },
          { status: "draft", label: "Draft" },
          { status: "revised", label: "Revised" },
          { status: "scheduled", label: "Scheduled" },
          { status: "published", label: "Published" },
          { status: "failed", label: "Failed" },
        ].map(({ status, label }) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full bg-status-${status}`} />
            <span className="text-xs text-text-muted">{label}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-7 gap-1.5">
          {Array(35).fill(0).map((_, i) => (
            <div key={i} className="bg-bg-surface border border-border rounded-lg min-h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <ContentCalendar
          posts={posts}
          month={month}
          onAddPost={handleAddPost}
          onEditPost={setSelectedPost}
        />
      )}

      {selectedPost && (
        <PostModal
          post={selectedPost}
          mode="edit"
          onClose={() => setSelectedPost(null)}
          onSave={handleSaveExistingPost}
        />
      )}

      {creatingPost && (
        <PostModal
          post={creatingPost}
          mode="create"
          onClose={() => setCreatingPost(null)}
          onSave={handleCreatePost}
        />
      )}
    </div>
  );
}
