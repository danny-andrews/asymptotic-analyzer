export const keysMap = (start, length, step = 1) =>
  [...Array(length).keys()].map((num) => (num + start) * step);

export const spreadMap = (start, length, step = 1) =>
  [...Array(length)].map((_, num) => (num + start) * step);

export const fillMap = (start, length, step = 1) =>
  Array(length)
    .fill()
    .map((_, i) => (i + start) * step);

export const from = (start, length, step = 1) =>
  Array.from({ length }, (_, i) => (i + start) * step);

export const forLoop = (start, length, step = 1) => {
  const result = [];

  for (let i = 0; i < length; i++) {
    result.push((i + start) * step);
  }

  return result;
};
