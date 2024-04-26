import { Observable } from "rxjs";

export const handleMessages = (source, handlers) => {
  source.on("message", (message) => {
    if (message instanceof Buffer) {
      message = JSON.parse(message.toString());
    }

    if (handlers[message.type] === undefined) {
      throw new Error(`Unrecognized message type given: ${message.type}`);
    }

    handlers[message.type](message.payload);
  });
};

export const fromSocketEvent = (
  socket,
  eventType,
  endEventType = null,
  cancelEventType = null
) =>
  new Observable((observer) => {
    const listener = (event) => {
      const { type, payload } = JSON.parse(event.data);
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

export const fromWorkerEvent = (worker, eventType, endEventType = null) =>
  new Observable((observer) => {
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
