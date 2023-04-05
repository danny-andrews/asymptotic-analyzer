export const meanTime = (fn, iterations) => {
  let total = 0;

  const start = performance.now();
  for (let i = 1; i <= iterations; i++) {
    fn(i);
    total += performance.now() - start;
  }

  return total / iterations;
};

export async function* asymptoticBenchmarks({
  subjects,
  generator,
  iterations,
}) {
  for (let { n, inputs } of generator()) {
    yield subjects.map((subject) => {
      const inputSets = Array.from({ length: iterations }).map(() =>
        structuredClone(inputs)
      );

      return {
        name: subject.name,
        n,
        duration: meanTime((iteration) => {
          subject(...inputSets[iteration - 1]);
        }, iterations),
      };
    });
  }
}
