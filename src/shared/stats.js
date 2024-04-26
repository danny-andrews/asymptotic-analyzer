export const median = (nums) => {
  nums.sort((a, b) => a - b);
  const n = nums.length;
  if (n === 1) return nums[0];

  return (nums[Math.floor(n / 2)] + nums[Math.ceil(n / 2)]) / 2;
};

export const mean = (nums) =>
  nums.reduce((sum, num) => sum + num, 0) / nums.length;

export const standardDeviation = (nums) => {
  const n = nums.length;
  const sampleMean = mean(nums);

  return Math.sqrt(
    nums.reduce((sum, num) => sum + (num - sampleMean) ** 2) / (n - 1)
  );
};

export const standardError = (nums) =>
  standardDeviation(nums) / Math.sqrt(nums.length);
