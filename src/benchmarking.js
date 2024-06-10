import { mean, median } from "./shared/index.js";

const warmup = (subject, duration, generateInputs) => {
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

export function sample(subject, iterations, generateInputs) {
  let totalDuration = 0;

  for (let i = 0; i < iterations; i++) {
    const inputs = generateInputs();
    const startTime = performance.now();
    subject(...inputs);
    totalDuration += performance.now() - startTime;
  }

  return totalDuration;
}

export const benchmarkTime = (subject, options = {}) => {
  const {
    maximumDuration = 3000,
    warmupDuration = 300,
    generateInputs = () => {},
  } = options;

  const SAMPLE_SIZE = 50;
  const averageDurations = [];
  const { iterations, duration } = warmup(
    subject,
    warmupDuration,
    generateInputs
  );
  const msPerIteration = duration / iterations;
  const iterationsPerSample = Math.max(
    Math.floor(maximumDuration / msPerIteration / SAMPLE_SIZE),
    1
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

export async function* analyzeTimeComplexity(subject, inputSets) {
  for (let inputSet of inputSets) {
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

export async function* analyzeSpaceComplexity(subject, inputSets) {
  const ITERATIONS = 100;

  for (let inputSet of inputSets) {
    const inputs = Array(ITERATIONS)
      .fill()
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
