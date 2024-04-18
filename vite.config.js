import { createServer } from "http";
import { fileURLToPath } from "node:url";
import WebsocketServer from "./src/websocket.js";

const addWebSocketServer = () => ({
  name: "add-web-socket-server",
  configureServer() {
    const httpServer = createServer();

    httpServer.listen(3000);

    WebsocketServer(
      fileURLToPath(new URL("./test/workbenches.js", import.meta.url)),
      httpServer
    );
  },
});

export default {
  plugins: [addWebSocketServer()],
  build: {
    target: "esnext",
    rollupOptions: {
      external: ["/test/workbenches.js"],
    },
    cssMinify: "lightningcss",
  },
  css: {
    transformer: "lightningcss",
    modules: {
      localsConvention: "camelCase",
    },
    lightningcss: {
      cssModules: {
        dashedIdents: true,
      },
    },
  },
  esbuild: {
    logOverride: { "this-is-undefined-in-esm": "silent" },
    jsx: "automatic",
    jsxImportSource: "preact"
  },
};
