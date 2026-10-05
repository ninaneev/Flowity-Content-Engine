
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Calendar,
  BookOpen,
  Sparkles,
  LayoutList,
  Settings,
  LogOut,
  Zap,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/", icon: Calendar, label: "Calendar" },
  { to: "/sources", icon: BookOpen, label: "Library" },
  { to: "/generator", icon: Sparkles, label: "Generator" },
  { to: "/pipeline", icon: LayoutList, label: "Pipeline" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function AppShell({ children }) {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("flowity_token");
    navigate("/login");
  }

  return (
    <div className="flex h-screen bg-bg-base overflow-hidden">
      <a href="#conteudo-principal" className="skip-link">
        Pular para o conteúdo principal
      </a>

      <aside className="w-56 flex-shrink-0 bg-bg-surface border-r border-border flex flex-col">
        <header className="px-5 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-flowity-cyan" aria-hidden="true" />
            <span className="font-bold text-sm gradient-text">Flowity</span>
          </div>
          <p className="text-text-muted text-xs mt-0.5 pl-6">
            Content Engine
          </p>
        </header>

        <nav
          aria-label="Navegação principal"
          className="flex-1 px-2 py-3 space-y-0.5"
        >
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-flowity-purple-dim text-flowity-purple border border-flowity-purple/20"
                    : "text-text-muted hover:text-text-secondary hover:bg-bg-elevated"
                }`
              }
            >
              <Icon size={16} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-2 py-3 border-t border-border">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-muted hover:text-status-failed hover:bg-bg-elevated w-full transition-all duration-150"
          >
            <LogOut size={16} aria-hidden="true" />
            Log out
          </button>
        </div>
      </aside>

      <main
        id="conteudo-principal"
        tabIndex={-1}
        className="flex-1 overflow-y-auto"
      >
        {children}
      </main>
    </div>
  );
}