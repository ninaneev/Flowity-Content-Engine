import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import DashboardPage from "./pages/DashboardPage";
import SourcesPage from "./pages/SourcesPage";
import GeneratorPage from "./pages/GeneratorPage";
import PipelinePage from "./pages/PipelinePage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";

// ── Proteção de rota ──────────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("flowity_token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Página de login — sem AppShell */}
      <Route path="/login" element={<LoginPage />} />

      {/* Todas as outras rotas ficam dentro do AppShell (com menu lateral) */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppShell>
              <Routes>
                <Route path="/"           element={<DashboardPage />} />
                <Route path="/sources"    element={<SourcesPage />} />
                <Route path="/generator"  element={<GeneratorPage />} />
                <Route path="/pipeline"   element={<PipelinePage />} />
                <Route path="/settings"   element={<SettingsPage />} />
                <Route path="*"           element={<Navigate to="/" replace />} />
              </Routes>
            </AppShell>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
