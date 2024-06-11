export const swap = <T>(array: T[], i: number, j: number) => {
  const temp = array[i];
  array[i] = array[j];
  array[j] = temp;
};

export const defaultComparator = (a: number, b: number) =>
  a > b ? 1 : a === b ? 0 : -1;
