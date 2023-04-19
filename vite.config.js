import WebsocketServer from "./src/websocket.js";
import { createServer } from "http";

export default {
  plugins: [
    {
      name: "add-web-socket-server",
      configureServer() {
        const httpServer = createServer();

        httpServer.listen(3000);

        WebsocketServer("./test/workbenches.js", httpServer);
      },
    },
  ],
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
