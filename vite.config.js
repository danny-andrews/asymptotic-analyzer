export default {
  worker: {
    format: "es",
    rollupOptions: {
      external: ["/test/workbenches.js"],
    },
  },
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
  server: {
    port: 1337,
    open: true,
  },
};
