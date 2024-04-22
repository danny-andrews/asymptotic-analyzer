import { WebSocketServer } from "ws";
import { Worker } from "worker_threads";
import { fileURLToPath } from "node:url";
import { handleMessages } from "./shared.js";

const setupWebsocket = async (ws, workbenchesFilepath) => {
  const send = (type, payload = null) =>
    ws.send(JSON.stringify({ type, payload }));

  let workers = [];

  const { default: workbenches } = await import(workbenchesFilepath);

  const startTimeAnalysis = async ({ workbenchName, iterations }) => {
    const { subjects, generator } = workbenches.find(
      ({ name }) => workbenchName === name
    );

    const inputSets = [...generator()];
    let marksReceived = 0;
    const totalMarks = subjects.length * inputSets.length;

    for (const subject of subjects) {
      const worker = new Worker(
        fileURLToPath(new URL("./worker.js", import.meta.url))
      );
      workers.push(worker);
      handleMessages(worker, {
        NEW_TIME_MARK: (payload) => {
          marksReceived++;
          send("NEW_TIME_MARK", payload);
          if (marksReceived === totalMarks) {
            send("TIME_ANALYSIS_COMPLETE");
          }
        },
        TIME_ANALYSIS_COMPLETE: () => {
          worker.terminate();
        },
      });

      worker.postMessage({
        type: "START_TIME_ANALYSIS",
        payload: {
          workbenchName,
          workbenchesFilepath,
          iterations,
          subjectName: subject.name,
        },
      });
    }
  };

  const stopTimeAnalysis = () => {
    for (let worker of workers) {
      worker.terminate();
    }
    workers = [];
  };

  handleMessages(ws, {
    START_TIME_ANALYSIS: startTimeAnalysis,
    STOP_TIME_ANALYSIS: stopTimeAnalysis,
  });
};

export default async (workbenchesFilepath, server) => {
  const wsServer = new WebSocketServer({ server });

  wsServer.on("connection", (ws) => {
    setupWebsocket(ws, workbenchesFilepath);
  });
};
