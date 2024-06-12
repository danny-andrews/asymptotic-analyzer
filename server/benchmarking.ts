import { mean, median } from "../shared/index.js";
import { Mark, InputSet } from "../shared/types/index.js";

const warmup = <R>(
  subject: (...args: any[]) => R,
  duration: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generateInputs: () => any[],
) => {
  const startTime = performance.now();
  let iterations = 0;

  while (performance.now() - startTime <= duration) {
    const inputs = generateInputs();
    subject(...inputs);
    iterations++;
  }

  return {
    duration: performance.now() - startTime,
    iterations,
  };
};

export const sample = <R>(
  subject: (...args: any[]) => R,
  iterations: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generateInputs: () => any[],
) => {
  let totalDuration = 0;

  for (let i = 0; i < iterations; i++) {
    const inputs = generateInputs();
    const startTime = performance.now();
    subject(...inputs);
    totalDuration += performance.now() - startTime;
  }

  return totalDuration;
};

type BenchmarkingOptions = {
  maximumDuration?: number;
  warmupDuration?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generateInputs: () => any[];
};

export const benchmarkTime = <R, I extends unknown[]>(
  subject: (...args: I) => R,
  options: BenchmarkingOptions,
) => {
  const {
    maximumDuration = 3000,
    warmupDuration = 300,
    generateInputs,
  } = options;

  const SAMPLE_SIZE = 50;
  const averageDurations = [];
  const { iterations, duration } = warmup(
    subject,
    warmupDuration,
    generateInputs,
  );
  const msPerIteration = duration / iterations;
  const iterationsPerSample = Math.max(
    Math.floor(maximumDuration / msPerIteration / SAMPLE_SIZE),
    1,
  );

  const startTime = performance.now();

  while (performance.now() - startTime < maximumDuration) {
    const duration = sample(subject, iterationsPerSample, generateInputs);
    averageDurations.push(duration / iterationsPerSample);
  }

  return {
    mean: mean(averageDurations),
  };
};

export async function* analyzeTimeComplexity<R, I extends unknown[]>(
  subject: (...args: I) => R,
  inputSets: InputSet[],
): AsyncGenerator<Mark, void, void> {
  for (const inputSet of inputSets) {
    const stats = benchmarkTime(subject, {
      generateInputs: () => structuredClone(inputSet.inputs),
    });

    yield {
      name: subject.name,
      n: inputSet.n,
      val: stats.mean,
    };
  }
}

export async function* analyzeSpaceComplexity<R>(
  subject: (...args: any[]) => R,
  inputSets: InputSet[],
) {
  const ITERATIONS = 100;

  for (const inputSet of inputSets) {
    const inputs = Array(ITERATIONS)
      .fill(null)
      .map(() => structuredClone(inputSet.inputs));

    const sizes = Array(ITERATIONS);

    for (let i = 0; i < ITERATIONS; i++) {
      const before = process.memoryUsage().heapUsed;

      subject(...inputs[i]);

      sizes[i] = process.memoryUsage().heapUsed - before;
    }

    yield {
      name: subject.name,
      n: inputSet.n,
      val: median(sizes),
    };
  }
}
