export const pipeline = (arg, ...fns) => fns.reduce((v, fn) => fn(v), arg);

export const noop = () => {};

export const wait = (time) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(time), time);
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
