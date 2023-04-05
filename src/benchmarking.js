export const meanTime = (fn, iterations) => {
  let total = 0;

  const start = performance.now();
  for (let i = 1; i <= iterations; i++) {
    fn(i);
    total += performance.now() - start;
  }

  return total / iterations;
};

export const asympoticBenchmarks = ({ subjects, generator, iterations }) => {
  async function* benchmarkSets() {
    for (let { n, inputs } of generator()) {
      const inputSets = Array.from({ length: subjects.length }).map(() =>
        Array.from({ length: iterations }).map(() => structuredClone(inputs))
      );

      yield subjects.map((subject, subjectIndex) => ({
        name: subject.name,
        n,
        duration: meanTime((iteration) => {
          subject(...inputSets[subjectIndex][iteration - 1]);
        }, iterations),
      }));
    }
  }

  return benchmarkSets;
};
