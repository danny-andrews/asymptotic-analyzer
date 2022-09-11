export const swap = (array, i, j) => {
  const temp = array[i];
  array[i] = array[j];
  array[j] = temp;
};

export const defaultComparator = (a, b) => (a > b ? 1 : a === b ? 0 : -1);
