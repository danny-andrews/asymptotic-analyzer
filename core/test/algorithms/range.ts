export const keysMap = (start: number, length: number, step = 1) =>
  [...Array(length).keys()].map((num) => (num + start) * step);

export const spreadMap = (start: number, length: number, step = 1) =>
  [...Array(length)].map((_, num) => (num + start) * step);

export const fillMap = (start: number, length: number, step = 1) =>
  Array(length)
    .fill(null)
    .map((_, i) => (i + start) * step);

export const from = (start: number, length: number, step = 1) =>
  Array.from({ length }, (_, i) => (i + start) * step);

export const forLoop = (start: number, length: number, step = 1) => {
  const result = [];

  for (let i = 0; i < length; i++) {
    result.push((i + start) * step);
  }

  return result;
};
