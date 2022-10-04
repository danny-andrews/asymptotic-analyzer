import * as R from "ramda";
import { Observable } from "rxjs";
import { asympoticBenchmarks } from "./benchmarking.js";
import { noop, wait, pipeline } from "./shared.js";

const { default: workbenches } = await import("/workbenches.js");

const makeBenchmarkObservable = (generator) =>
  new Observable((observer) => {
    (async () => {
      for await (const marks of generator()) {
        if (observer.closed) {
          break;
        }

        await wait();
        observer.next(marks);
        await wait();
      }
      observer.complete();
    })();
  });

let subscription = { unsubscribe: noop };

const stopWorkbench = () => {
  subscription.unsubscribe();
};

const runWorkbench = ({ workbenchName, iterations }) => {
  subscription = pipeline(
    workbenches,
    R.find(({ name }) => workbenchName === name),
    (benchmark) => ({ ...benchmark, iterations }),
    asympoticBenchmarks,
    makeBenchmarkObservable
  ).subscribe({
    next: (marks) => {
      postMessage({
        name: "NEW_MARKS",
        payload: marks,
      });
    },
    complete: () => {
      postMessage({ name: "MARKSET_COMPLETE" });
    },
  });
};

onmessage = (message) => {
  const { name, payload } = message.data;
  if (name === "RUN_WORKBENCH") runWorkbench(payload);
  if (name === "STOP_WORKBENCH") stopWorkbench();
};

onerror = (e) => {
  console.error(e);
};
