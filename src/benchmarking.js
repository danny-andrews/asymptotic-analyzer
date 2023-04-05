const median = (nums) => {
  const n = nums.length;
  if (n === 1) return nums[0];

  return (nums[Math.floor(n / 2)] + nums[Math.ceil(n / 2)]) / 2;
};

const mean = (nums) => nums.reduce((sum, num) => sum + num, 0) / nums.length;

const standardDeviation = (nums) => {
  const n = nums.length;
  const sampleMean = mean(nums);

  return Math.sqrt(
    nums.reduce((sum, num) => sum + (num - sampleMean) ** 2) / (n - 1)
  );
};

const standardError = (nums) =>
  standardDeviation(nums) / Math.sqrt(nums.length);

export const meanTime = (fn, iterations) => {
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
        stats: meanTime((iteration) => {
          subject(...inputSets[iteration - 1]);
        }, iterations),
      };
    });
  }
}
