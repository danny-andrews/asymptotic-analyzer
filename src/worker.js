import { parentPort } from "worker_threads";
import {
  analyzeTimeComplexity,
  analyzeSpaceComplexity,
} from "./benchmarking.js";
import { handleMessages } from "./shared.js";

const send = (type, payload = null) => {
  parentPort.postMessage({ type, payload });
};

const getWorkbench = async (workbenchesFilepath, workbenchName) => {
  const { default: workbenches } = await import(workbenchesFilepath);

  return workbenches.find((workbench) => workbench.name === workbenchName);
};

const getSubject = (subjects, subjectName) =>
  subjects.find((subject) => subject.name === subjectName);

const startTimeAnalysis = async ({
  workbenchName,
  workbenchesFilepath,
  iterations,
  subjectName,
}) => {
  const workbench = await getWorkbench(workbenchesFilepath, workbenchName);
  const subject = getSubject(workbench.subjects, subjectName);
  const marks = analyzeTimeComplexity(
    subject,
    [...workbench.generator()],
    iterations
  );

  for await (const mark of marks) {
    send("NEW_TIME_MARK", mark);
  }

  send("TIME_ANALYSIS_COMPLETE");
};

const startSpaceAnalysis = async ({
  workbenchName,
  workbenchesFilepath,
  subjectName,
}) => {
  const workbench = await getWorkbench(workbenchesFilepath, workbenchName);
  const subject = getSubject(workbench.subjects, subjectName);
  const marks = analyzeSpaceComplexity(subject, [...workbench.generator()]);

  for await (const mark of marks) {
    send("NEW_SPACE_MARK", mark);
  }

  send("SPACE_ANALYSIS_COMPLETE");
};

handleMessages(parentPort, {
  START_TIME_ANALYSIS: startTimeAnalysis,
  START_SPACE_ANALYSIS: startSpaceAnalysis,
});
