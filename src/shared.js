import * as R from "ramda";
import { Observable } from "rxjs";

export const range = (size, startAt = 0, step = 1) =>
  R.range(startAt, startAt + size).map((n) => n * step);

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

const numberFormat = new Intl.NumberFormat("en-US", {
  style: "decimal",
});

export const formatNumber = numberFormat.format;
