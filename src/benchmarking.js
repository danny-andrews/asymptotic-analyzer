import { mean, median, standardError } from "./shared.js";
import process from "node:process";

export const getStats = (fn, iterations) => {
  let durations = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn(i);
    durations.push(performance.now() - start);
  }

  return {
    mean: mean(durations),
    median: median(durations),
    sem: standardError(durations),
  };
};

export async function* analyzeTimeComplexity({
  subject,
  inputSets,
  iterations,
}) {
  for (let inputSet of inputSets) {
    const inputs = Array.from({ length: iterations }).map(() =>
      structuredClone(inputSet.inputs)
    );

    const stats = getStats((iteration) => {
      subject(...inputs[iteration]);
    }, iterations);

    yield {
      name: subject.name,
      n: inputSet.n,
      val: stats.median,
    };
  }
}

export function* analyzeSpaceComplexity(subject, inputSets) {
  const iterations = 100;

  for (let inputSet of inputSets) {
    const inputs = Array.from({ length: iterations }).map(() =>
      structuredClone(inputSet.inputs)
    );

    let sizes = [];
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
