const reverse = (arr) => {
  const result = [];
  for (let i = arr.length - 1; i >= 0; i--) {
    result.push(arr[i]);
  }

  return result;
};

const reverseInPlace = (arr) => {
  let n = arr.length;
  for (let i = 0; i < (n - 1) / 2; i++) {
    const j = n - i - 1;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
};

export { reverse, reverseInPlace };
