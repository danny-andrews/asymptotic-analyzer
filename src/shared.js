import { Observable } from "rxjs";

export const pipeline = (arg, ...fns) => fns.reduce((v, fn) => fn(v), arg);

export const noop = () => {};

export const wait = (time) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(time), time);
  });

export const fromSocketEvent = (socket, eventType, endEventType = null) =>
  new Observable((observer) => {
    const listener = (event) => {
      const { name, payload } = JSON.parse(event.data);
      if (name === eventType) {
        observer.next(payload);
      }
      if (name === endEventType) {
        observer.complete();
      }
    };

    socket.addEventListener("message", listener);
  });

export const throttle = (cb, delay) => {
  let wait = false;

  return (...args) => {
    if (wait) return;

    cb(...args);
    wait = true;
    setTimeout(() => {
      wait = false;
    }, delay);
  };
};

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
