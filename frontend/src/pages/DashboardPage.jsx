import React, { useState, useEffect } from "react";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import ContentCalendar from "../components/calendar/ContentCalendar";
import PostModal from "../components/posts/PostModal";
import { postsApi } from "../lib/api";

export default function DashboardPage() {
  const [month, setMonth]       = useState(new Date());
  const [posts, setPosts]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [newPostDate, setNewPostDate]   = useState(null);

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
      console.error("Erro ao carregar posts do calendário:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSavePost(data) {
    await postsApi.update(selectedPost.id, data);
    fetchPosts();
  }

  function handleAddPost(date) {
    setNewPostDate(date);
    // TODO: abrir modal de criação com a data pré-preenchida
    // Por enquanto, redirecione para /generator com a data como parâmetro
    console.log("Criar post para:", format(date, "yyyy-MM-dd"));
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Calendário Editorial</h1>
          <p className="text-text-muted text-sm mt-0.5">
            Visualize e gerencie seus posts agendados
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Navegação de mês */}
          <div className="flex items-center gap-1 bg-bg-surface border border-border rounded-lg p-1">
            <button className="btn-ghost p-1.5" onClick={() => setMonth(subMonths(month, 1))}>
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-text-primary px-2 min-w-36 text-center capitalize">
              {format(month, "MMMM yyyy", { locale: ptBR })}
            </span>
            <button className="btn-ghost p-1.5" onClick={() => setMonth(addMonths(month, 1))}>
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            className="btn-ghost text-xs"
            onClick={() => setMonth(new Date())}
          >
            Hoje
          </button>
        </div>
      </div>

      {/* Legenda de status */}
      <div className="flex gap-4 mb-4">
        {[
          { status: "draft",     label: "Rascunho"  },
          { status: "revised",   label: "Revisado"  },
          { status: "scheduled", label: "Agendado"  },
          { status: "published", label: "Publicado" },
        ].map(({ status, label }) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full bg-status-${status}`} />
            <span className="text-xs text-text-muted">{label}</span>
          </div>
        ))}
      </div>

      {/* Calendário */}
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

      {/* Modal de edição */}
      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onSave={handleSavePost}
        />
      )}
    </div>
  );
}
