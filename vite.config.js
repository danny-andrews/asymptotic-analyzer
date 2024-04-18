import WebsocketServer from "./src/websocket.js";
import { createServer } from "http";
import { fileURLToPath } from "node:url";

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
  },
  esbuild: {
    logOverride: { "this-is-undefined-in-esm": "silent" },
    jsxFactory: "h",
    jsxFragment: "Fragment",
  },
};
