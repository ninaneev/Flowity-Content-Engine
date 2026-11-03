import React, { useState, useEffect, useMemo } from "react";
import { format, addMonths, subMonths, endOfMonth } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import ContentCalendar from "../components/calendar/ContentCalendar";
import DayActionDialog from "../components/calendar/DayActionDialog";
import PostModal from "../components/posts/PostModal";
import { postsApi } from "../lib/api";
import { PILLARS, PILLAR_ROTATION, COMPANY_PILLAR_KEYS, dayKey, planPillars } from "../lib/pillars.js";
import { filterPosts } from "../lib/channels.js";
import PostFilters, { useSavedFilters } from "../components/posts/PostFilters";
import { DEFAULT_POST_TIME, atTimeOnDay, moveToDay } from "../lib/postDates.js";

function newPostForDate(date = new Date(), time = DEFAULT_POST_TIME, pillar = "") {
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
    pillar: pillar || "",
    status: "draft",
    scheduled_at: atTimeOnDay(date, time),
    generation_mode: "manual",
    notes: "",
    source_ids: [],
  };
}

export default function DashboardPage() {
  const [month, setMonth] = useState(new Date());
  // Same list as the pipeline: the calendar shows every post with a date, whatever its status.
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [creatingPost, setCreatingPost] = useState(null);
  const [dayAction, setDayAction] = useState(null);
  const [filters, setFilters] = useSavedFilters("ce-calendar-filters");
  const visiblePosts = useMemo(() => filterPosts(posts, filters), [posts, filters]);
  const channelCounts = useMemo(
    () => posts.reduce((acc, p) => ({ ...acc, [p.channel]: (acc[p.channel] || 0) + 1 }), {}),
    [posts],
  );

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
      const res = await postsApi.list();
      setPosts(res.data);
    } catch (err) {
      console.error("Error loading calendar posts:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  }

  const plan = useMemo(
    // The Mon-Fri rotation is for Nina's own LinkedIn; the other channels have their own rhythm.
    () => planPillars({ posts: posts.filter((p) => p.channel === "linkedin"), today: new Date(), until: endOfMonth(month) }),
    [posts, month],
  );

  function applySaved(saved) {
    setPosts((prev) =>
      prev.some((p) => p.id === saved.id)
        ? prev.map((p) => (p.id === saved.id ? saved : p))
        : [saved, ...prev],
    );
  }

  async function updatePost(post, data) {
    // Optimistic: the screen updates at once; if the API fails, it rolls back.
    setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, ...data } : p)));
    try {
      const res = await postsApi.update(post.id, data);
      applySaved(res.data);
      return res.data;
    } catch (err) {
      console.error("Error updating post:", err);
      applySaved(post);
      throw err;
    }
  }

  async function handleSaveExistingPost(data) {
    const res = await postsApi.update(selectedPost.id, data);
    applySaved(res.data);
  }

  async function handleDeletePost(post) {
    await postsApi.remove(post.id);
    setPosts((prev) => prev.filter((p) => p.id !== post.id));
  }

  async function handleCreatePost(data) {
    const res = await postsApi.create(data);
    setCreatingPost(null);
    applySaved(res.data);
  }

  function handleEditPost(post) {
    setSelectedPost(posts.find((p) => p.id === post.id) || post);
  }

  function handleRemoveDate(post) {
    updatePost(post, { scheduled_at: null }).catch(() => {});
  }

  function handleDropPost(id, day) {
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    const scheduled_at = moveToDay(post.scheduled_at, day);
    if (scheduled_at === post.scheduled_at) return;
    updatePost(post, { scheduled_at }).catch(() => {});
  }

  function suggestedPillarFor(day) {
    return plan.days[dayKey(day)]?.pillar || "";
  }

  function handleNewPostOnDay(time) {
    const day = dayAction;
    setDayAction(null);
    setCreatingPost(newPostForDate(day, time, suggestedPillarFor(day)));
  }

  async function handleUseExisting(post, time) {
    await updatePost(post, { scheduled_at: atTimeOnDay(dayAction, time) });
    setDayAction(null);
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
          <button
            className="btn-primary"
            onClick={() => setCreatingPost(newPostForDate(new Date(), DEFAULT_POST_TIME, suggestedPillarFor(new Date())))}
          >
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
          <p><strong className="text-amber-300">1. To approve:</strong> Claude wrote it, with image and a proposed date. Nothing goes out yet.</p>
          <p><strong className="text-text-secondary">2. You approve:</strong> open it, check text and image, click Approve. It becomes Scheduled.</p>
          <p><strong className="text-text-secondary">3. Make publishes:</strong> your LinkedIn (Mon to Fri) and the Flowity page (Mon, Wed, Fri, reposted on your profile in the afternoon).</p>
          <p><strong className="text-text-secondary">4. Manual channels:</strong> X, newsletter, articles and blog. Copy, post, then click Mark published.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        {[
          { status: "idea", label: "Idea" },
          { status: "draft", label: "Draft" },
          { status: "revised", label: "Revised" },
          { status: "to_approve", label: "To approve" },
          { status: "scheduled", label: "Scheduled" },
          { status: "published", label: "Published" },
          { status: "failed", label: "Failed" },
        ].map(({ status, label }) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${status === "to_approve" ? "bg-amber-400" : `bg-status-${status}`}`} />
            <span className="text-xs text-text-muted">{label}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-4" aria-label="Content pillars">
        <span className="text-xs font-semibold text-text-secondary">Pillars (Mon to Fri, in this order)</span>
        {PILLAR_ROTATION.map((key) => (
          <div key={key} className="flex items-center gap-1.5" title={`${PILLARS[key].description} Goal: ${PILLARS[key].goal}.`}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PILLARS[key].color }} />
            <span className="text-xs" style={{ color: PILLARS[key].color }}>{PILLARS[key].label}</span>
            <span className="text-[10px] text-text-muted">{PILLARS[key].goal}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-4 mb-4" aria-label="Flowity page pillars">
        <span className="text-xs font-semibold text-text-secondary">Flowity page (Mon, Wed, Fri)</span>
        {COMPANY_PILLAR_KEYS.map((key) => (
          <div key={key} className="flex items-center gap-1.5" title={`${PILLARS[key].description} Goal: ${PILLARS[key].goal}.`}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PILLARS[key].color }} />
            <span className="text-xs" style={{ color: PILLARS[key].color }}>{PILLARS[key].label}</span>
          </div>
        ))}
      </div>

      <PostFilters filters={filters} onChange={setFilters} counts={channelCounts} />

      {loading ? (
        <div className="grid grid-cols-7 gap-1.5">
          {Array(35).fill(0).map((_, i) => (
            <div key={i} className="bg-bg-surface border border-border rounded-lg min-h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <ContentCalendar
          posts={visiblePosts}
          month={month}
          plan={plan}
          onDayClick={(day) => setDayAction(day)}
          onEditPost={handleEditPost}
          onRemoveDate={handleRemoveDate}
          onDropPost={handleDropPost}
        />
      )}

      {selectedPost && (
        <PostModal
          post={selectedPost}
          mode="edit"
          onClose={() => setSelectedPost(null)}
          onSave={handleSaveExistingPost}
          onDelete={handleDeletePost}
        />
      )}

      {dayAction && (
        <DayActionDialog
          day={dayAction}
          suggestedPillar={suggestedPillarFor(dayAction)}
          posts={posts}
          onClose={() => setDayAction(null)}
          onNewPost={handleNewPostOnDay}
          onUseExisting={handleUseExisting}
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
