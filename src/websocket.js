import { WebSocketServer } from "ws";
import { asymptoticBenchmarks } from "./benchmarking.js";

const wait = (time) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(time), time);
  });

const stopWorkbench = () => {
  stopReceived = true;
};

let stopReceived = false;

export default async (workbenchesFilepath, server) => {
  const { default: workbenches } = await import(workbenchesFilepath);

  const wsServer = new WebSocketServer({ server });

  wsServer.on("connection", (ws) => {
    const send = (name, payload = null) =>
      ws.send(JSON.stringify({ name, payload }));

    const runWorkbench = async ({ workbenchName, iterations }) => {
      stopReceived = false;
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
};
