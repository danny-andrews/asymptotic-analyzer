export const rangeKeysMap = (start, length, step = 1) =>
  [...Array(length).keys()].map((num) => (num + start) * step);

export const rangeSpreadMap = (start, length, step = 1) =>
  [...Array(length)].map((num) => (num + start) * step);

export const rangeFillMap = (start, length, step = 1) =>
  Array(length)
    .fill()
    .map((_, i) => (i + start) * step);

export const rangeFrom = (start, length, step = 1) =>
  Array.from({ length }, (_, i) => (i + start) * step);

export const rangeForLoop = (start, length, step = 1) => {
  const result = [];

  for (let i = 0; i < length; i++) {
    result.push((i + start) * step);
  }

  return result;
};
