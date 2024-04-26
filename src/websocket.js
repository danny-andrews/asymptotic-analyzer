import { WebSocketServer } from "ws";
import { Worker } from "worker_threads";
import { fileURLToPath } from "node:url";
import { zip } from "rxjs";
import {
  handleMessages,
  fromWorkerEvent,
  noop,
  EVENT_TYPES,
} from "./shared/index.js";

const getWorkbench = (workbenches, workbenchName) =>
  workbenches.find((workbench) => workbench.name === workbenchName);

const setupWebsocket = async (ws, workbenchesFilepath) => {
  const send = (type, payload = null) =>
    ws.send(JSON.stringify({ type, payload }));

  let timeSubscription = { unsubscribe: noop };
  let spaceSubscription = { unsubscribe: noop };

  const { default: workbenches } = await import(workbenchesFilepath);

  const startTimeAnalysis = async ({ workbenchName, iterations }) => {
    const { subjects } = getWorkbench(workbenches, workbenchName);

    timeSubscription = zip(
      ...subjects.map((subject) => {
        const worker = new Worker(
          fileURLToPath(new URL("./worker.js", import.meta.url))
        );

        const observable = fromWorkerEvent(
          worker,
          EVENT_TYPES.NEW_TIME_MARK,
          EVENT_TYPES.TIME_ANALYSIS_COMPLETE
        );

        worker.postMessage({
          type: EVENT_TYPES.START_TIME_ANALYSIS,
          payload: {
            workbenchName,
            workbenchesFilepath,
            subjectName: subject.name,
            iterations,
          },
        });

        return observable;
      })
    ).subscribe({
      next: (marks) => {
        for (const mark of marks) {
          send(EVENT_TYPES.NEW_TIME_MARK, mark);
        }
      },
      complete: () => {
        send(EVENT_TYPES.TIME_ANALYSIS_COMPLETE);
      },
    });
  };

  const startSpaceAnalysis = async ({ workbenchName, iterations }) => {
    const { subjects } = getWorkbench(workbenches, workbenchName);

    spaceSubscription = zip(
      ...subjects.map((subject) => {
        const worker = new Worker(
          fileURLToPath(new URL("./worker.js", import.meta.url))
        );

        const observable = fromWorkerEvent(
          worker,
          EVENT_TYPES.NEW_SPACE_MARK,
          EVENT_TYPES.SPACE_ANALYSIS_COMPLETE
        );

        worker.postMessage({
          type: EVENT_TYPES.START_SPACE_ANALYSIS,
          payload: {
            workbenchName,
            workbenchesFilepath,
            subjectName: subject.name,
            iterations,
          },
        });

        return observable;
      })
    ).subscribe({
      next: (marks) => {
        for (const mark of marks) {
          send(EVENT_TYPES.NEW_SPACE_MARK, mark);
        }
      },
      complete: () => {
        send(EVENT_TYPES.SPACE_ANALYSIS_COMPLETE);
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
    [EVENT_TYPES.START_TIME_ANALYSIS]: startTimeAnalysis,
    [EVENT_TYPES.STOP_TIME_ANALYSIS]: stopTimeAnalysis,
    [EVENT_TYPES.START_SPACE_ANALYSIS]: startSpaceAnalysis,
    [EVENT_TYPES.STOP_SPACE_ANALYSIS]: stopSpaceAnalysis,
  });
};

export default async (workbenchesFilepath, server) => {
  new WebSocketServer({ server }).on("connection", (ws) => {
    setupWebsocket(ws, workbenchesFilepath);
  });
};
