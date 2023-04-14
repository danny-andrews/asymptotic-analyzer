#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stripIndent } from "common-tags";
import { createServer } from "http";
import express from "express";
import esbuild from "esbuild";
import { WebSocketServer } from "ws";
import { asymptoticBenchmarks } from "../src/benchmarking.js";

const PORT = 3000;

const fail = (msg) => {
  console.error(msg);
  process.exit(1);
};

const wait = (time) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(time), time);
  });

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

const { default: workbenches } = await import(workbenchesFilepath);

const stopWorkbench = () => {
  stopReceived = true;
};

let stopReceived = false;

const wsServer = new WebSocketServer({ server });

wsServer.on("connection", (ws) => {
  const send = (name, payload = null) =>
    ws.send(JSON.stringify({ name, payload }));

  const runWorkbench = async ({ workbenchName, iterations }) => {
    const { subjects, generator } = workbenches.find(
      ({ name }) => workbenchName === name
    );
    const benchmarkGenerator = asymptoticBenchmarks({
      subjects,
      generator,
      iterations,
    });

    for await (const marks of benchmarkGenerator) {
      if (stopReceived) {
        return;
      }

      await wait();
      send("NEW_MARKS", marks);
      await wait();
    }

    send("MARKSET_COMPLETE");
  };

  ws.on("message", (data) => {
    const { name, payload } = JSON.parse(data.toString());
    if (name === "RUN_WORKBENCH") {
      runWorkbench(payload);
    } else if (name === "STOP_WORKBENCH") {
      stopWorkbench();
    }
  });
});
