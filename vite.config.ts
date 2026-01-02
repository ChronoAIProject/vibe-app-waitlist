import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import dts from "vite-plugin-dts";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Library build mode
  if (mode === "lib") {
    return {
      plugins: [
        react(),
        dts({
          include: ["src/index.ts", "src/components/**/*.tsx"],
          exclude: ["src/main.tsx", "src/App.tsx", "src/screens/**/*"],
          outDir: "dist",
          insertTypesEntry: true,
          copyDtsFiles: true,
        }),
      ],
      build: {
        lib: {
          entry: resolve(__dirname, "src/index.ts"),
          name: "GodgptWebWaitlist",
          formats: ["es", "cjs"],
          fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`,
        },
        rollupOptions: {
          // Externalize deps that shouldn't be bundled
          external: ["react", "react-dom", "react/jsx-runtime"],
          output: {
            // Global vars for UMD build
            globals: {
              react: "React",
              "react-dom": "ReactDOM",
              "react/jsx-runtime": "jsxRuntime",
            },
          },
        },
        sourcemap: true,
        minify: false,
      },
    };
  }

  // Development/demo build mode (default)
  return {
    plugins: [react()],
    server: {
      host: "0.0.0.0",
      port: 5173,
      strictPort: false,
    },
  };
});
