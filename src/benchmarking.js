const time = (fn) => {
  const start = performance.now();
  fn();
  return performance.now() - start;
};

export const medianTime = (fn, iterations) => {
  let total = 0;
  for (let i = 1; i <= iterations; i++) {
    total += time(fn);
  }

  return total / iterations;
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
