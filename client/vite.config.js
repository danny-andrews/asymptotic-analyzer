export default {
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
    jsxImportSource: "preact",
  },
  cacheDir: "../node_modules/.vite",
};
