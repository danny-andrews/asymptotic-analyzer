import { parentPort } from "worker_threads";
import { asymptoticBenchmarksSingle } from "./benchmarking.js";
import { wait, handleMessages } from "./shared.js";

const send = (type, payload = null) => {
  parentPort.postMessage({ type, payload });
};

const startTimeAnalysis = async ({
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
    send("NEW_TIME_MARK", mark);
    await wait();
  }

  if (marksReceived === inputSets.length) {
    send("TIME_ANALYSIS_COMPLETE");
  }
};

handleMessages(parentPort, { START_TIME_ANALYSIS: startTimeAnalysis });
