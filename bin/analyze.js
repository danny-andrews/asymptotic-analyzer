#!/usr/bin/env node
import esbuild from "esbuild";
import { stripIndent } from "common-tags";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createServer } from "vite";

const fail = (msg) => {
  console.error(msg);
  process.exit(1);
};

const workbenchesFilepath = process.argv[2];
if (!workbenchesFilepath) {
  fail(stripIndent`
    Path to workbenches file required!

    Example: $ benchmark ./src/workbenches.js
  `);
}

const dirname = fileURLToPath(new URL(".", import.meta.url));
const root = path.join(dirname, "..");

esbuild
  .build({
    bundle: true,
    entryPoints: [workbenchesFilepath],
    format: "esm",
    outfile: path.join(root, "build", "workbenches.js"),
    // logLevel: "silent",
  })
  .catch((e) => {
    fail(stripIndent`
      Build error. This is usually caused by a syntax error in your workbench filepath.

      ${e.errors[0].text}.
    `);
  })
  .then(() =>
    createServer({
      esbuild: {
        logOverride: { "this-is-undefined-in-esm": "silent" },
        jsxFactory: "h",
        jsxFragment: "Fragment",
      },
      configFile: false,
      open: true,
      root,
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
    })
  )
  .then((server) => server.listen())
  .then((instance) => {
    const port = instance.httpServer.address().port;
    console.log(`Hosting asymptotic analysis on http://localhost:${port}.`);
  })
  .catch((e) => {
    fail(stripIndent`
      Error starting dev server.
      
      ${e.message}
    `);
  });
