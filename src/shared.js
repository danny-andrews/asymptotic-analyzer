import { Observable } from "rxjs";
import workbenches from "../build/workbenches.js";
import Ajv from "ajv";
import { stripIndent } from "common-tags";

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

const ajv = new Ajv();

const WorkbenchSchema = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 1 },
    subjects: { type: "array", minItems: 1 },
    domain: { type: "array", minItems: 1, items: { type: "number" } },
    generator: { type: "array" },
  },
  required: ["name", "subjects", "domain", "generator"],
};

const WorkbenchesSchema = {
  type: "array",
  minItems: 1,
  items: WorkbenchSchema,
};

export const validateWorkbenches = (workbenches) => {
  const validate = ajv.compile(WorkbenchesSchema);

  const valid = validate(workbenches);
  if (!valid) {
    console.log(validate.errors);
    throw new Error(ajv.errorsText(validate.errors));
  }

  for (let workbench of workbenches) {
    let arity = workbench.subjects[0].length;
    const generatorLength = workbench.generator.length;
    if (arity !== generatorLength) {
      throw new Error(stripIndent`
        Generator for workbench "${workbench.name}" does not generate inputs for all arguments of subject.
        
        "${workbench.name}" subjects take ${arity} arguments, but the provided generator only generates ${generatorLength}.
      `);
    }
  }
};

export { workbenches };
