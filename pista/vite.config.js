import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// `npm run build:single` emits one self-contained dist-single/index.html (hash routing) for static hosting.
export default defineConfig(({ mode }) => {
  const single = mode === "single";
  return {
    plugins: [react(), ...(single ? [viteSingleFile({ removeViteModuleLoader: true })] : [])],
    server: { port: 5173, open: true },
    build: single
      ? { outDir: "dist-single", assetsInlineLimit: 100_000_000, cssCodeSplit: false, chunkSizeWarningLimit: 5000 }
      : {
          chunkSizeWarningLimit: 700,
          rollupOptions: {
            output: {
              manualChunks: {
                react: ["react", "react-dom", "react-router-dom"],
                charts: ["recharts"],
                markdown: ["react-markdown", "remark-gfm", "remark-math", "rehype-katex", "katex"],
              },
            },
          },
        },
  };
});
