import { WebSocketServer } from "ws";
import { Worker } from "worker_threads";
import { fileURLToPath } from "node:url";
import { merge } from "rxjs";
import { handleMessages, fromWorkerEvent, noop } from "./shared.js";

const getWorkbench = (workbenches, workbenchName) =>
  workbenches.find(({ name }) => workbenchName === name);

const setupWebsocket = async (ws, workbenchesFilepath) => {
  const send = (type, payload = null) =>
    ws.send(JSON.stringify({ type, payload }));

  let timeSubscription = { unsubscribe: noop };
  let spaceSubscription = { unsubscribe: noop };

  const { default: workbenches } = await import(workbenchesFilepath);

  const startTimeAnalysis = async ({ workbenchName, iterations }) => {
    const { subjects } = getWorkbench(workbenches, workbenchName);

    timeSubscription = merge(
      ...subjects.map((subject) => {
        const worker = new Worker(
          fileURLToPath(new URL("./worker.js", import.meta.url))
        );

        const observable = fromWorkerEvent(
          worker,
          "NEW_TIME_MARK",
          "TIME_ANALYSIS_COMPLETE"
        );

        worker.postMessage({
          type: "START_TIME_ANALYSIS",
          payload: {
            workbenchName,
            workbenchesFilepath,
            iterations,
            subjectName: subject.name,
          },
        });

        return observable;
      })
    ).subscribe({
      next: (payload) => {
        send("NEW_TIME_MARK", payload);
      },
      complete: () => {
        send("TIME_ANALYSIS_COMPLETE");
      },
    });
  };

  const startSpaceAnalysis = async ({ workbenchName }) => {
    const { subjects } = getWorkbench(workbenches, workbenchName);

    spaceSubscription = merge(
      ...subjects.map((subject) => {
        const worker = new Worker(
          fileURLToPath(new URL("./worker.js", import.meta.url))
        );

        const observable = fromWorkerEvent(
          worker,
          "NEW_SPACE_MARK",
          "SPACE_ANALYSIS_COMPLETE"
        );

        worker.postMessage({
          type: "START_SPACE_ANALYSIS",
          payload: {
            workbenchName,
            workbenchesFilepath,
            subjectName: subject.name,
          },
        });

        return observable;
      })
    ).subscribe({
      next: (payload) => {
        send("NEW_SPACE_MARK", payload);
      },
      complete: () => {
        send("SPACE_ANALYSIS_COMPLETE");
      },
    });
  };

  const stopTimeAnalysis = () => {
    timeSubscription.unsubscribe();
  };

  const stopSpaceAnalysis = () => {
    spaceSubscription.unsubscribe();
  };

  handleMessages(ws, {
    START_TIME_ANALYSIS: startTimeAnalysis,
    STOP_TIME_ANALYSIS: stopTimeAnalysis,
    START_SPACE_ANALYSIS: startSpaceAnalysis,
    STOP_SPACE_ANALYSIS: stopSpaceAnalysis,
  });
};

export default async (workbenchesFilepath, server) => {
  new WebSocketServer({ server }).on("connection", (ws) => {
    setupWebsocket(ws, workbenchesFilepath);
  });
};
