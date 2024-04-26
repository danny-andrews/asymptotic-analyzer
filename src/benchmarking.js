import { median } from "./shared/index.js";
import process from "node:process";

export async function* analyzeTimeComplexity(subject, inputSets, iterations) {
  for (let inputSet of inputSets) {
    const inputs = Array.from({ length: iterations }).map(() =>
      structuredClone(inputSet.inputs)
    );

    const durations = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();

      subject(...inputs[i]);

      durations.push(performance.now() - start);
    }

    yield {
      name: subject.name,
      n: inputSet.n,
      val: median(durations),
    };
  }
}

export async function* analyzeSpaceComplexity(
  subject,
  inputSets,
  iterations = 100
) {
  for (let inputSet of inputSets) {
    const inputs = Array.from({ length: iterations }).map(() =>
      structuredClone(inputSet.inputs)
    );

    const sizes = [];

    for (let i = 0; i < iterations; i++) {
      const before = process.memoryUsage().heapUsed;

      subject(...inputs[i]);

      sizes.push(process.memoryUsage().heapUsed - before);
    }

    yield {
      name: subject.name,
      n: inputSet.n,
      val: median(sizes),
    };
  }
}
