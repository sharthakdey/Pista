/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#080B1F",
          900: "#0E1330",
          800: "#161C44",
          700: "#222A5C",
          600: "#353E78",
          400: "#7C84B3",
          300: "#A9AFD3",
        },
        brand: {
          50: "#EEF0FF",
          100: "#E0E3FF",
          200: "#C4C8FF",
          500: "#5B5BF0",
          600: "#4338CA",
          700: "#3730A3",
        },
        electric: { 400: "#5B9BFF", 500: "#2F7BFF", 600: "#1D63E0" },
        violet: { 400: "#A78BFA", 500: "#8B5CF6", 600: "#7C3AED" },
        surface: "#F4F6FC",
        line: "#E3E6F2",
        muted: "#5E6587",
        coral: { 50: "#FFF0F2", 500: "#E8475F", 600: "#C9304A" },
        amber: { 50: "#FFF7E6", 500: "#F09A0A", 600: "#C97C00" },
        mint: { 50: "#E9F9F1", 500: "#16A765", 600: "#0E8A52" },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Figtree", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(14,19,48,0.04), 0 4px 16px -6px rgba(14,19,48,0.08)",
        lift: "0 2px 4px rgba(14,19,48,0.05), 0 16px 32px -12px rgba(14,19,48,0.18)",
        glow: "0 10px 30px -10px rgba(67,56,202,0.55)",
      },
      keyframes: {
        "fade-in": { from: { opacity: 0, transform: "translateY(6px)" }, to: { opacity: 1, transform: "none" } },
        "pop-in": { from: { opacity: 0, transform: "scale(.96)" }, to: { opacity: 1, transform: "none" } },
        "draw": { from: { strokeDashoffset: "var(--len, 1200)" }, to: { strokeDashoffset: "0" } },
        "dot": { "0%, 80%, 100%": { transform: "scale(.6)", opacity: .4 }, "40%": { transform: "scale(1)", opacity: 1 } },
        "shimmer": { from: { backgroundPosition: "-400px 0" }, to: { backgroundPosition: "400px 0" } },
        "pulse-ring": { "0%": { boxShadow: "0 0 0 0 rgba(139,92,246,.45)" }, "100%": { boxShadow: "0 0 0 12px rgba(139,92,246,0)" } },
        "slide-in-left": { from: { transform: "translateX(-100%)" }, to: { transform: "none" } },
      },
      animation: {
        "fade-in": "fade-in .35s ease-out both",
        "pop-in": "pop-in .25s ease-out both",
        "draw": "draw 1.8s cubic-bezier(.65,0,.35,1) both",
        "dot": "dot 1.2s infinite ease-in-out",
        "shimmer": "shimmer 1.4s infinite linear",
        "pulse-ring": "pulse-ring 1.8s infinite",
        "slide-in-left": "slide-in-left .25s ease-out both",
      },
    },
  },
  plugins: [],
};
