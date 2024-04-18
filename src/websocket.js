import { WebSocketServer } from "ws";
import { Worker } from "worker_threads";
import { fileURLToPath } from "node:url";

const setupWebsocket = async (ws, workbenchesFilepath) => {
  const send = (name, payload = null) =>
    ws.send(JSON.stringify({ name, payload }));

  let workers = [];

  const { default: workbenches } = await import(workbenchesFilepath);

  const runWorkbench = async ({ workbenchName, iterations }) => {
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
      worker.on("message", (message) => {
        if (message.type === "NEW_MARK") {
          marksReceived++;
          send("NEW_MARKS", message.payload);
          if (marksReceived === totalMarks) {
            send("MARKSET_COMPLETE");
          }
        }
        if (message.type === "SUBJECT_COMPLETE") {
          worker.terminate();
        }
      });

      worker.postMessage({
        type: "START",
        payload: {
          workbenchName,
          workbenchesFilepath,
          iterations,
          subjectName: subject.name,
        },
      });
    }
  };

  const stopWorkbench = () => {
    for (let worker of workers) {
      worker.terminate();
    }
    workers = [];
  };

  ws.on("message", (data) => {
    const { name, payload } = JSON.parse(data.toString());
    if (name === "RUN_WORKBENCH") {
      runWorkbench(payload);
    } else if (name === "STOP_WORKBENCH") {
      stopWorkbench();
    }
  });
};

export default async (workbenchesFilepath, server) => {
  const wsServer = new WebSocketServer({ server });

  wsServer.on("connection", (ws) => {
    setupWebsocket(ws, workbenchesFilepath);
  });
};
