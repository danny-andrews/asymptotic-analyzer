import * as R from "ramda";
import { pipeline } from "./shared.js";

const time = (fn) => {
  const start = performance.now();
  fn();
  return performance.now() - start;
};

export const medianTime = (fn, iterations) =>
  R.mean(R.times(() => time(fn), iterations));

export const normalizeStats = (stats) => {
  const iterationTime = pipeline(
    stats,
    R.map(({ duration, n }) => duration / n),
    R.mean
  );

  const firstDuration = R.head(stats).duration;
  const constantTerm = firstDuration - iterationTime;
  const scaler = 1 / iterationTime;

  return stats.map((stat) =>
    Math.ceil((stat.duration - constantTerm) * scaler)
  );
};

export const asympoticBenchmarks = ({
  subjects,
  domain,
  generator,
  iterations = 100,
}) => {
  const generators = [].concat(generator);
  const generateInputs = (n) => generators.map((generator) => generator(n));

  async function* benchmarkSets() {
    for (let n of domain) {
      const inputs = generateInputs(n);
      yield subjects.map((subject) => ({
        name: subject.name,
        n,
        duration: medianTime(() => {
          subject(...inputs.map((input) => structuredClone(input)));
        }, iterations),
      }));
    }
  }

  return benchmarkSets;
};
