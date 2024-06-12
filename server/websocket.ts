import { Worker } from "node:worker_threads";
import { fileURLToPath } from "node:url";
import { Server, createServer } from "node:http";
import WebSocketNode, { WebSocketServer } from "ws";
import { zip } from "rxjs";
import {
  handleSocketMessages,
  fromWorkerEvent,
  noop,
  EVENT_TYPES,
} from "../shared/index.js";
import type { Workbenches, Mark } from "../shared/types/index.js";

const getWorkbench = (workbenches: Workbenches, workbenchName: string) =>
  workbenches.find((workbench) => workbench.name === workbenchName);

const setupWebsocket = async (
  ws: WebSocketNode,
  workbenchesFilepath: string,
) => {
  const send = (type: string, payload: object | null = null) =>
    ws.send(JSON.stringify({ type, payload }));

  let timeSubscription = { unsubscribe: noop };
  let spaceSubscription = { unsubscribe: noop };

  const { default: workbenches } = await import(workbenchesFilepath);

  const startTimeAnalysis = async ({
    workbenchName,
  }: {
    workbenchName: string;
  }) => {
    const workbench = getWorkbench(workbenches, workbenchName);
    if (!workbench) throw new Error(`Cannot run workbench ${workbench}.`);

    timeSubscription = zip(
      ...workbench.subjects.map((subject) => {
        const worker = new Worker(
          fileURLToPath(new URL("./worker.js", import.meta.url)),
        );

        const observable = fromWorkerEvent<Mark>(
          worker,
          EVENT_TYPES.NEW_TIME_MARK,
          EVENT_TYPES.TIME_ANALYSIS_COMPLETE,
        );

        worker.postMessage({
          type: EVENT_TYPES.START_TIME_ANALYSIS,
          payload: {
            workbenchName,
            workbenchesFilepath,
            subjectName: subject.name,
          },
        });

        return observable;
      }),
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

  const startSpaceAnalysis = async ({
    workbenchName,
  }: {
    workbenchName: string;
  }) => {
    const workbench = getWorkbench(workbenches, workbenchName);
    if (!workbench) throw new Error(`Cannot run workbench ${workbench}.`);

    spaceSubscription = zip(
      ...workbench.subjects.map((subject) => {
        const worker = new Worker(
          fileURLToPath(new URL("./worker.js", import.meta.url)),
        );

        const observable = fromWorkerEvent<Mark>(
          worker,
          EVENT_TYPES.NEW_SPACE_MARK,
          EVENT_TYPES.SPACE_ANALYSIS_COMPLETE,
        );

        worker.postMessage({
          type: EVENT_TYPES.START_SPACE_ANALYSIS,
          payload: {
            workbenchName,
            workbenchesFilepath,
            subjectName: subject.name,
          },
        });

        return observable;
      }),
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

  handleSocketMessages(ws, {
    [EVENT_TYPES.START_TIME_ANALYSIS]: startTimeAnalysis,
    [EVENT_TYPES.STOP_TIME_ANALYSIS]: stopTimeAnalysis,
    [EVENT_TYPES.START_SPACE_ANALYSIS]: startSpaceAnalysis,
    [EVENT_TYPES.STOP_SPACE_ANALYSIS]: stopSpaceAnalysis,
  });
};

const WSServer = async (workbenchesFilepath: string, server: Server) => {
  new WebSocketServer({ server }).on("connection", (ws) => {
    setupWebsocket(ws, workbenchesFilepath);
  });
};

export default WSServer;

const httpServer = createServer();
httpServer.listen(3000);

WSServer(
  fileURLToPath(new URL("./test/workbenches.js", import.meta.url)),
  httpServer,
);
