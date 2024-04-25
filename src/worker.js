import { parentPort } from "worker_threads";
import {
  analyzeTimeComplexity,
  analyzeSpaceComplexity,
} from "./benchmarking.js";
import { handleMessages } from "./shared.js";

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

  for await (const mark of analyzeTimeComplexity({
    subject,
    inputSets,
    iterations,
  })) {
    marksReceived++;
    send("NEW_TIME_MARK", mark);
  }

  if (marksReceived === inputSets.length) {
    send("TIME_ANALYSIS_COMPLETE");
  }
};

const startSpaceAnalysis = async ({
  workbenchName,
  workbenchesFilepath,
  subjectName,
}) => {
  const { default: workbenches } = await import(workbenchesFilepath);
  const { subjects, generator } = workbenches.find(
    ({ name }) => workbenchName === name
  );
  const subject = subjects.find((subject) => subject.name === subjectName);
  const inputSets = [...generator()];

  let marksReceived = 0;

  for (const mark of analyzeSpaceComplexity(subject, inputSets)) {
    marksReceived++;
    send("NEW_SPACE_MARK", mark);
    if (marksReceived === inputSets.length) {
      send("SPACE_ANALYSIS_COMPLETE");
    }
  }
};

handleMessages(parentPort, {
  START_TIME_ANALYSIS: startTimeAnalysis,
  START_SPACE_ANALYSIS: startSpaceAnalysis,
});
