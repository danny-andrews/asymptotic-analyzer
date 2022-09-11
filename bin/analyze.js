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

    Example: $ analyze ./src/workbenches.js
  `);
}

const dirname = fileURLToPath(new URL(".", import.meta.url));

esbuild
  .build({
    bundle: true,
    entryPoints: [workbenchesFilepath],
    format: "esm",
    outdir: "build",
    logLevel: "silent",
  })
  .catch((e) => {
    fail(stripIndent`
      Build error. This is usually caused by an invalid workbench filepath.

      ${e.errors[0].text}.
    `);
  })
  .then(() =>
    createServer({
      // any valid user config options, plus `mode` and `configFile`
      configFile: false,
      root: path.join(dirname, ".."),
      server: {
        port: 1337,
        open: true,
      },
    })
  )
  .then((server) => server.listen())
  .catch((e) => {
    fail(stripIndent`
      Error starting dev server.
      
      ${e.message}
    `);
  });
