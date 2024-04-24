import { WebSocketServer } from "ws";
import { Worker } from "worker_threads";
import { fileURLToPath } from "node:url";
import { handleMessages } from "./shared.js";

const setupWebsocket = async (ws, workbenchesFilepath) => {
  const send = (type, payload = null) =>
    ws.send(JSON.stringify({ type, payload }));

  // TODO: Use a pool here?
  let timeWorkers = [];
  let spaceWorkers = [];

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
      timeWorkers.push(worker);
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

  const startSpaceAnalysis = async ({ workbenchName }) => {
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
      spaceWorkers.push(worker);

      handleMessages(worker, {
        NEW_SPACE_MARK: (payload) => {
          marksReceived++;
          send("NEW_SPACE_MARK", payload);
          if (marksReceived === totalMarks) {
            send("SPACE_ANALYSIS_COMPLETE");
          }
        },
        SPACE_ANALYSIS_COMPLETE: () => {
          worker.terminate();
        },
      });

      worker.postMessage({
        type: "START_SPACE_ANALYSIS",
        payload: {
          workbenchName,
          workbenchesFilepath,
          subjectName: subject.name,
        },
      });
    }
  };

  const stopTimeAnalysis = () => {
    for (let worker of timeWorkers) {
      worker.terminate();
    }
    timeWorkers = [];
  };

  const stopSpaceAnalysis = () => {
    for (let worker of spaceWorkers) {
      worker.terminate();
    }
    spaceWorkers = [];
  };

  handleMessages(ws, {
    START_TIME_ANALYSIS: startTimeAnalysis,
    STOP_TIME_ANALYSIS: stopTimeAnalysis,
    START_SPACE_ANALYSIS: startSpaceAnalysis,
    STOP_SPACE_ANALYSIS: stopSpaceAnalysis,
  });
};

export default async (workbenchesFilepath, server) => {
  const wsServer = new WebSocketServer({ server });

  wsServer.on("connection", (ws) => {
    setupWebsocket(ws, workbenchesFilepath);
  });
};
