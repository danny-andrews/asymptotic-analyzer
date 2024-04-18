import { mean, median, standardError } from "./shared.js";

export const getStats = (fn, iterations) => {
  let durations = [];

  for (let i = 1; i <= iterations; i++) {
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

export function* asymptoticBenchmarksSingle({
  subject,
  inputSets,
  iterations,
}) {
  for (let inputSet of inputSets) {
    const inputs = Array.from({ length: iterations }).map(() =>
      structuredClone(inputSet.inputs)
    );

    yield {
      name: subject.name,
      n: inputSet.n,
      stats: getStats((iteration) => {
        subject(...inputs[iteration - 1]);
      }, iterations),
    };
  }
}
