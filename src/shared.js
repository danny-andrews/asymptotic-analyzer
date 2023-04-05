import { Observable } from "rxjs";

export const pipeline = (arg, ...fns) => fns.reduce((v, fn) => fn(v), arg);

export const noop = () => {};

export const wait = (time) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(time), time);
  });

export const fromWorkerEvent = (worker, eventType, endEventType = null) =>
  new Observable((observer) => {
    const listener = (e) => {
      const { name, payload } = e.data;
      if (name === eventType) {
        observer.next(payload);
      }
      if (name === endEventType) {
        observer.complete();
      }
    };
    worker.addEventListener("message", listener);
  });
