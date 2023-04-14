import { Observable } from "rxjs";

export const pipeline = (arg, ...fns) => fns.reduce((v, fn) => fn(v), arg);

export const noop = () => {};

export const wait = (time) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(time), time);
  });

export const fromSocketEvent = (socket, eventType, endEventType = null) =>
  new Observable((observer) => {
    const listener = (event) => {
      const { name, payload } = JSON.parse(event.data);
      if (name === eventType) {
        observer.next(payload);
      }
      if (name === endEventType) {
        observer.complete();
      }
    };

    socket.addEventListener("message", listener);
  });
