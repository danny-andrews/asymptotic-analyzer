export default {
  worker: {
    format: "es",
    rollupOptions: {
      external: ["/workbenches.js"],
    },
  },
  build: {
    target: "esnext",
    rollupOptions: {
      external: ["/workbenches.js"],
    },
  },
  esbuild: {
    logOverride: { "this-is-undefined-in-esm": "silent" },
    jsxFactory: "h",
    jsxFragment: "Fragment",
  },
  plugins: [
    {
      name: "configure-response-headers",
      configureServer: (server) => {
        server.middlewares.use((_req, res, next) => {
          res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
          res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
          next();
        });
      },
    },
  ],
  server: {
    port: 1337,
    open: true,
  },
};
