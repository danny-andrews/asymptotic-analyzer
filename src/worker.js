import { parentPort } from "node:worker_threads";
import {
  analyzeTimeComplexity,
  analyzeSpaceComplexity,
} from "./benchmarking.js";
import { handleMessages, EVENT_TYPES } from "./shared/index.js";

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
  subjectName,
}) => {
  const workbench = await getWorkbench(workbenchesFilepath, workbenchName);
  const subject = getSubject(workbench.subjects, subjectName);
  const marks = analyzeTimeComplexity(subject, [...workbench.generator()]);

  for await (const mark of marks) {
    send(EVENT_TYPES.NEW_TIME_MARK, mark);
  }

  send(EVENT_TYPES.TIME_ANALYSIS_COMPLETE);
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
    send(EVENT_TYPES.NEW_SPACE_MARK, mark);
  }

  send(EVENT_TYPES.SPACE_ANALYSIS_COMPLETE);
};

handleMessages(parentPort, {
  [EVENT_TYPES.START_TIME_ANALYSIS]: startTimeAnalysis,
  [EVENT_TYPES.START_SPACE_ANALYSIS]: startSpaceAnalysis,
});
