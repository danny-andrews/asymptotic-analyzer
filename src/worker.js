import { asymptoticBenchmarks } from "./benchmarking.js";
import { wait } from "./shared.js";

const { default: workbenches } = await import("/test/workbenches.js");

const stopWorkbench = () => {
  stopReceived = true;
};

let stopReceived = false;

const runWorkbench = async ({ workbenchName, iterations }) => {
  const { subjects, generator } = workbenches.find(
    ({ name }) => workbenchName === name
  );
  const benchmarkGenerator = asymptoticBenchmarks({
    subjects,
    generator,
    iterations,
  });

  for await (const marks of benchmarkGenerator) {
    if (stopReceived) {
      return;
    }

    await wait();
    postMessage({ name: "NEW_MARKS", payload: marks });
    await wait();
  }

  postMessage({ name: "MARKSET_COMPLETE" });
};

onmessage = (message) => {
  const { name, payload } = message.data;
  if (name === "RUN_WORKBENCH") runWorkbench(payload);
  if (name === "STOP_WORKBENCH") stopWorkbench();
};

onerror = (e) => {
  console.error(e);
};
