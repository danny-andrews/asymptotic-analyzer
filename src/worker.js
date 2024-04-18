import { parentPort } from "worker_threads";
import { asymptoticBenchmarksSingle } from "./benchmarking.js";
import { wait } from "./shared.js";

const run = async ({
  workbenchName,
  workbenchesFilepath,
  iterations,
  subjectName,
}) => {
  const { default: workbenches } = await import(workbenchesFilepath);
  const { subjects, generator } = workbenches.find(
    ({ name }) => workbenchName === name
  );
  const subject = subjects.find((subject) => subject.name === subjectName);
  const inputSets = [...generator()];

  let marksReceived = 0;
  for await (const mark of asymptoticBenchmarksSingle({
    subject,
    inputSets,
    iterations,
  })) {
    marksReceived++;
    await wait();
    parentPort.postMessage({ type: "NEW_MARK", payload: mark });
    await wait();
  }

  if (marksReceived === inputSets.length) {
    parentPort.postMessage({ type: "SUBJECT_COMPLETE" });
  }
};

parentPort.on("message", (data) => {
  if (data.type === "START") {
    run(data.payload);
  }
});
