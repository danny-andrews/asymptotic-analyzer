export const median = (nums) => {
  nums.sort((a, b) => a - b);
  const n = nums.length;
  if (n === 1) return nums[0];

  return (nums[Math.floor(n / 2)] + nums[Math.ceil(n / 2)]) / 2;
};

export const mean = (nums) =>
  nums.reduce((sum, num) => sum + num, 0) / nums.length;

export const sum = (nums) => nums.reduce((sum, num) => sum + num, 0);

export const standardDeviation = (nums) => {
  const n = nums.length;
  const sampleMean = mean(nums);

  return Math.sqrt(
    nums.reduce((sum, num) => sum + (num - sampleMean) ** 2) / (n - 1)
  );
};

export const standardError = (nums) =>
  standardDeviation(nums) / Math.sqrt(nums.length);

export class P2QuantileEstimator {
  #quantile;
  #size = 0;
  #n = [0, 1, 2, 3, 4];
  #ns = Array(5);
  #q = Array(5);

  constructor(desiredQuantile) {
    if (desiredQuantile <= 0 || desiredQuantile >= 1) {
      throw new Error("Quantile must be between 0 and 1.");
    }

    this.#quantile = desiredQuantile;
    this.#ns = [
      0,
      2 * this.#quantile,
      4 * this.#quantile,
      2 + 2 * this.#quantile,
      4,
    ];
  }

  add(number) {
    if (this.#size < 5) {
      this.#q[this.#size] = number;
      this.#size++;

      if (this.#size === 5) {
        this.#q.sort((a, b) => a - b);
      }

      return;
    }

    this.#size++;

    let k;
    if (number < this.#q[0]) {
      this.#q[0] = number;
      k = 0;
    } else if (number < this.#q[1]) {
      k = 0;
    } else if (number < this.#q[2]) {
      k = 1;
    } else if (number < this.#q[3]) {
      k = 2;
    } else if (number < this.#q[4]) {
      k = 3;
    } else {
      this.#q[4] = number;
      k = 3;
    }

    for (let i = k + 1; i < 5; i++) {
      this.#n[i]++;
    }

    this.#ns[1] += this.#quantile / 2;
    this.#ns[2] += this.#quantile;
    this.#ns[3] += (this.#quantile + 1) / 2;
    this.#ns[4] += 1;

    for (let i = 1; i <= 3; i++) {
      this.#adjust(i);
    }
  }

  value() {
    return this.#q[2];
  }

  #adjust(i) {
    const d = this.#ns[i] - this.#n[i];

    if (
      (d >= 1 && this.#n[i + 1] - this.#n[i] > 1) ||
      (d <= -1 && this.#n[i - 1] - this.#n[i] < -1)
    ) {
      const sign = Math.sign(d);
      const newHeight = this.#parabolic(i, sign);
      if (this.#q[i - 1] < newHeight && newHeight < this.#q[i + 1]) {
        this.#q[i] = newHeight;
      } else {
        this.#q[i] = this.#linear(i, sign);
      }
      this.#n[i] += sign;
    }
  }

  #parabolic(i, d) {
    const q = this.#q;
    const n = this.#n;
    const b1 = d / (n[i + 1] - n[i - 1]);
    const b2 = (n[i] - n[i - 1] + d) * ((q[i + 1] - q[i]) / (n[i + 1] - n[i]));
    const b3 = (n[i + 1] - n[i] - d) * ((q[i] - q[i - 1]) / (n[i] - n[i - 1]));

    return q[i] + b1 * (b2 + b3);
  }

  #linear(i, d) {
    const q = this.#q;
    const n = this.#n;

    return q[i] + (d * (q[i + d] - q[i])) / (n[i + d] - n[i]);
  }
}

export class OnlineStats {
  #mean = 0;
  #s = 0;
  #sampleSize = 0;
  #total = 0;

  addData(number) {
    this.#sampleSize++;
    const newMean = this.#mean + (number - this.#mean) / this.#sampleSize;
    this.#s += (number - this.#mean) * (number - newMean);
    this.#mean = newMean;
    this.#total += number;
  }

  get sampleSize() {
    return this.#sampleSize;
  }

  get total() {
    return this.#total;
  }

  get mean() {
    return this.#mean;
  }

  get variance() {
    return this.#sampleSize > 1 ? this.#s / (this.#sampleSize - 1) : 0;
  }

  get standardDeviation() {
    return Math.sqrt(this.variance);
  }

  get standardError() {
    return this.standardDeviation / Math.sqrt(this.#sampleSize);
  }

  get relativeStandardError() {
    return this.standardError / this.#mean;
  }
}

export const linearRegression = (data) => {
  let slope = 0;
  let intercept = 0;

  const n = data.length;
  const xs = data.map(([x]) => x);
  const ys = data.map(([, y]) => y);
  const meanX = mean(xs);
  const meanY = mean(ys);

  // Calculate the slope (m) and intercept (b)
  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (xs[i] - meanX) * (ys[i] - meanY);
    denominator += (ys[i] - meanX) ** 2;
  }

  slope = numerator / denominator;
  intercept = meanY - slope * meanX;

  const predict = (x) => slope * x + intercept;
  const ssr = sum(data.map(([x, y]) => (y - predict(y)) ** 2));
  const sst = sum(data.map(([x], y) => (y - meanY) ** 2));

  const error = sum(data.map(([x, y]) => (predict(x) - y) ** 2)) / n;
  const r2 = 1 - ssr / sst;

  return { slope, intercept, predict, error, r2 };
};
