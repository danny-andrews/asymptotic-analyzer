import { Observable } from "rxjs";
import type WebSocketNode from "ws";
import type { Worker, MessagePort } from "node:worker_threads";

type Message<T> = {
  type: string;
  payload: T;
};

export const handleSocketMessages = <T>(
  source: WebSocketNode,
  // eslint-disable-next-line @typescript-eslint/ban-types
  handlers: { [type: string]: Function },
) => {
  source.on("message", (message: Message<T>) => {
    message = JSON.parse(message.toString());

    if (handlers[message.type] === undefined) {
      throw new Error(`Unrecognized message type given: ${message.type}`);
    }

    handlers[message.type](message.payload);
  });
};

export const handleWorkerMessages = (
  source: MessagePort,
  // eslint-disable-next-line @typescript-eslint/ban-types
  handlers: { [type: string]: Function },
) => {
  source.on("message", (event) => {
    if (handlers[event.type] === undefined) {
      throw new Error(`Unrecognized message type given: ${event.type}`);
    }

    handlers[event.type](event.payload);
  });
};

export const fromSocketEvent = <T>(
  socket: WebSocket,
  eventType: string,
  endEventType: string | null = null,
  cancelEventType: string | null = null,
): Observable<T> =>
  new Observable<T>((observer) => {
    const listener = (event: MessageEvent<string>) => {
      const { type, payload }: Message<T> = JSON.parse(event.data);
      if (type === eventType) {
        observer.next(payload);
      }
      if (type === endEventType) {
        observer.complete();
      }
    };

    socket.addEventListener("message", listener);

    return () => {
      if (cancelEventType) {
        socket.send(JSON.stringify({ type: cancelEventType }));
      }

      socket.removeEventListener("message", listener);
    };
  });

export const fromWorkerEvent = <T>(
  worker: Worker,
  eventType: string,
  endEventType: string | null = null,
): Observable<T> =>
  new Observable<T>((observer) => {
    worker.on("message", ({ type, payload }) => {
      if (type === eventType) {
        observer.next(payload);
      }
      if (type === endEventType) {
        observer.complete();
      }
    });

    return () => {
      worker.terminate();
    };
  });
