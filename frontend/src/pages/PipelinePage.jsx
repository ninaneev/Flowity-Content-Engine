import React, { useState, useEffect } from "react";
import { LayoutList } from "lucide-react";
import StatusBadge from "../components/shared/StatusBadge";
import PostModal from "../components/posts/PostModal";
import EmptyState from "../components/shared/EmptyState";
import { postsApi } from "../lib/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const PIPELINE_COLUMNS = [
  { status: "idea",       label: "Ideia"      },
  { status: "draft",      label: "Rascunho"   },
  { status: "revised",    label: "Revisado"   },
  { status: "scheduled",  label: "Agendado"   },
  { status: "published",  label: "Publicado"  },
];

export default function PipelinePage() {
  const [posts, setPosts]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => { fetchPosts(); }, []);

  async function fetchPosts() {
    setLoading(true);
    try { const r = await postsApi.list(); setPosts(r.data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleSave(data) {
    await postsApi.update(selectedPost.id, data);
    fetchPosts();
  }

  function postsByStatus(status) {
    return posts.filter((p) => p.status === status);
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-text-primary">Pipeline</h1>
        <p className="text-text-muted text-sm mt-0.5">{posts.length} posts no total</p>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_COLUMNS.map((col) => (
            <div key={col.status} className="flex-shrink-0 w-56 bg-bg-surface border border-border rounded-xl p-3 space-y-2">
              <div className="h-4 bg-bg-elevated rounded animate-pulse w-20" />
              {[1,2].map(i => <div key={i} className="h-16 bg-bg-elevated rounded animate-pulse" />)}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_COLUMNS.map((col) => {
            const colPosts = postsByStatus(col.status);
            return (
              <div key={col.status} className="flex-shrink-0 w-60">
                {/* Column header */}
                <div className="flex items-center justify-between mb-2 px-1">
                  <StatusBadge status={col.status} />
                  <span className="text-xs text-text-muted">{colPosts.length}</span>
                </div>

                {/* Column posts */}
                <div className="space-y-2 min-h-16">
                  {colPosts.length === 0 && (
                    <div className="border-2 border-dashed border-border rounded-lg h-16 flex items-center justify-center">
                      <span className="text-xs text-text-muted">Vazio</span>
                    </div>
                  )}
                  {colPosts.map((post) => (
                    <div
                      key={post.id}
                      className="card cursor-pointer hover:border-border-bright transition-all"
                      onClick={() => setSelectedPost(post)}
                    >
                      <p className="text-text-primary text-sm font-medium line-clamp-2 mb-2">{post.hook}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-muted">{post.channel === "linkedin" ? "LinkedIn" : "X"}</span>
                        {post.scheduled_at && (
                          <span className="text-xs text-text-muted">
                            {format(new Date(post.scheduled_at), "dd MMM", { locale: ptBR })}
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
