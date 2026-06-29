import { resolve } from "node:path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const projectRoot = process.cwd();
const fromRoot = (...s: string[]) => resolve(projectRoot, ...s);

export default defineConfig({
  root: resolve(__dirname, "src/web"),
  envDir: resolve(__dirname, "."),
  base: "./",
  plugins: [
    vue(),
    nodePolyfills(),
    {
      name: "stub-iroha-native",
      enforce: "pre",
      resolveId(id) {
        const nodeOnly = [
          "native.js",
          "telemetryReplay.js",
          "connectQueueDiagnostics.js",
          "connectQueueJournal.js",
          "compute.js",
          "dataAvailability.js",
          "norito.js",
          "toriiClient.js",
        ];
        if (nodeOnly.some((f) => id.endsWith("/" + f) || id.endsWith(f))) {
          return fromRoot("src/services/nativeStub.ts");
        }
      },
    },
  ],
  resolve: {
   alias: {
      "@": fromRoot("src"),
      "vite-plugin-node-polyfills/shims/process": fromRoot("node_modules/vite-plugin-node-polyfills/shims/process"),
      // The SDK's native-addon loader (Node-only: fs, module). Browser never
      // uses it — stub it to an empty module so Vite stops trying to bundle it.
      "@iroha/iroha-js/dist/native.js": fromRoot("src/services/nativeStub.ts"),
    },
    // HONOR the SDK's "browser" export conditions -> toriiBrowserClient.js + crypto.browser.js
    conditions: ["browser", "module", "import", "default"],
  },
  define: {
    // the SDK references `global`; browsers only have globalThis
    global: "globalThis",
  },
  optimizeDeps: {
    exclude: ["@iroha/iroha-js"],
  },
  server: {
    port: 5174,
    proxy: {
      "/taira": {
        target: "https://taira.sora.org",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/taira/, ""),
      },
      "/minamoto": {
        target: "https://minamoto.sora.org",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/minamoto/, ""),
      },
    },
  },
  build: {
    outDir: fromRoot("dist/web"),
    emptyOutDir: true,
    rollupOptions: {
      input: fromRoot("src/web/index.html"),
    },
  },
});