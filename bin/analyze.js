#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stripIndent } from "common-tags";
import { createServer } from "http";
import express from "express";
import esbuild from "esbuild";
import WebsocketServer from "./websocket.js";

const PORT = 3000;

const fail = (msg) => {
  console.error(msg);
  process.exit(1);
};

const app = express();

const dirname = fileURLToPath(new URL(".", import.meta.url));
const root = path.join(dirname, "..");

const workbenchesFilepath = process.argv[2];
if (!workbenchesFilepath) {
  fail(stripIndent`
    Path to workbenches file required!

    Example: $ npx analyze ./test/workbenches.js
  `);
}

app.use(express.static(path.join(root, "dist")));

app.get("/test/workbenches.js", (req, res) => {
  esbuild
    .build({
      bundle: true,
      write: false,
      entryPoints: [workbenchesFilepath],
      format: "esm",
    })
    .catch((e) => {
      fail(stripIndent`
        Build error. This is usually caused by a syntax error in your workbench filepath.

        ${e.errors[0].text}.
      `);
    })
    .then((result) => {
      res.set("Content-Type", "text/javascript");
      res.send(result.outputFiles[0].text);
    });
});

const server = createServer(app);

server.listen(PORT, () => {
  console.log(`Hosting asymptotic analysis on http://localhost:${PORT}.`);
});

WebsocketServer(workbenchesFilepath, server);
