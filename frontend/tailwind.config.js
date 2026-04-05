/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // ── Flowity AI Brand Colors ─────────────────────────────────
        flowity: {
          purple:       "#9C83F7",  // logoPurple — cor primária
          "purple-hover": "#B39EFA",
          "purple-dim": "rgba(156, 131, 247, 0.15)",
          cyan:         "#1CD8DE",  // logoCyan — cor secundária
          "cyan-hover": "#40E4EA",
          "cyan-dim":   "rgba(28, 216, 222, 0.15)",
        },
        // ── Backgrounds ─────────────────────────────────────────────
        bg: {
          base:     "#07080F",  // fundo principal
          surface:  "#0E1018",  // cards, modais, painéis
          elevated: "#151820",  // hover, dropdowns
        },
        // ── Bordas ──────────────────────────────────────────────────
        border: {
          DEFAULT: "#1E2433",
          bright:  "#2D3748",
        },
        // ── Texto ───────────────────────────────────────────────────
        text: {
          primary:   "#F0F2FF",
          secondary: "#A8B3C7",
          muted:     "#5C6A82",
        },
        // ── Status dos posts ─────────────────────────────────────────
        status: {
          idea:       "#5C6A82",
          draft:      "#3B82F6",
          revised:    "#8B5CF6",
          scheduled:  "#F59E0B",
          published:  "#10B981",
          publishing: "#F59E0B",
          failed:     "#EF4444",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "monospace"],
      },
      borderRadius: {
        DEFAULT: "8px",
        lg: "12px",
        xl: "16px",
      },
    },
  },
  plugins: [],
};
