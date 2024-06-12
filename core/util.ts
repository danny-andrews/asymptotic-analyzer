export const noop = () => {};

export const wait = (time: number) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(time), time);
  });

export const throttle = <R, A extends unknown[]>(
  cb: (...args: A) => R,
  delay: number,
): ((...args: A) => R | undefined) => {
  let wait = false;

  return (...args) => {
    if (wait) return;

    const val = cb(...args);
    wait = true;
    setTimeout(() => {
      wait = false;
    }, delay);

    return val;
  };
};

export const formatBytes = (bytes: number) => {
  const bytePrefixes = ["", "kilo", "mega", "giga", "tera", "peta"];
  const index = Math.max(
    0,
    Math.min(Math.floor(Math.log10(bytes) / 3), bytePrefixes.length - 1),
  );
  const unit = bytePrefixes[index] + "byte";
  const valueToFormat = parseFloat(
    (bytes / Math.pow(1000, index)).toPrecision(3),
  );

  return new Intl.NumberFormat("en", {
    style: "unit",
    unit,
    unitDisplay: "short",
  }).format(valueToFormat);
};

export const roundTo = (num: number, precision: number) =>
  Number(num.toFixed(precision));
