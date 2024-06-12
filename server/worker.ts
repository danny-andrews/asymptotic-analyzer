import { parentPort } from "node:worker_threads";
import {
  analyzeTimeComplexity,
  analyzeSpaceComplexity,
} from "./benchmarking.js";
import { handleWorkerMessages, EVENT_TYPES } from "../shared/index.js";
import type { Workbench, Subject } from "../shared/types/index.js";

const send = (type: string, payload: object | null = null) => {
  if (parentPort) {
    parentPort.postMessage({ type, payload });
  }
};

const getWorkbench = async (
  workbenchesFilepath: string,
  workbenchName: string,
) => {
  const { default: workbenches } = await import(workbenchesFilepath);

  return workbenches.find(
    (workbench: Workbench) => workbench.name === workbenchName,
  );
};

const getSubject = (subjects: Subject[], subjectName: string) =>
  subjects.find((subject) => subject.name === subjectName);

type AnalysisParams = {
  workbenchName: string;
  workbenchesFilepath: string;
  subjectName: string;
};

const startTimeAnalysis = async ({
  workbenchName,
  workbenchesFilepath,
  subjectName,
}: AnalysisParams) => {
  const workbench = await getWorkbench(workbenchesFilepath, workbenchName);
  const subject = getSubject(workbench.subjects, subjectName);
  if (!subject) throw new Error(`Subject not found: ${subjectName}!`);

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
}: AnalysisParams) => {
  const workbench = await getWorkbench(workbenchesFilepath, workbenchName);
  const subject = getSubject(workbench.subjects, subjectName);
  if (!subject) throw new Error(`Subject not found: ${subjectName}!`);

  const marks = analyzeSpaceComplexity(subject, [...workbench.generator()]);

  for await (const mark of marks) {
    send(EVENT_TYPES.NEW_SPACE_MARK, mark);
  }

  send(EVENT_TYPES.SPACE_ANALYSIS_COMPLETE);
};

if (parentPort) {
  handleWorkerMessages(parentPort, {
    [EVENT_TYPES.START_TIME_ANALYSIS]: startTimeAnalysis,
    [EVENT_TYPES.START_SPACE_ANALYSIS]: startSpaceAnalysis,
  });
}
