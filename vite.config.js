import WebsocketServer from "./bin/websocket.js";
import { createServer } from "http";

const addWebSocketServer = () => ({
  name: "add-web-socket-server",
  configureServer() {
    const httpServer = createServer();

    httpServer.listen(3000);

    WebsocketServer("./test/workbenches.js", httpServer);
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
