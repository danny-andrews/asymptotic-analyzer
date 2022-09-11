const rotateLinear = (arr, k) => {
  const n = arr.length;
  const shiftCount = Math.abs(k % n);
  const startIndex = k > 0 ? n - shiftCount : shiftCount;

  return [...arr.slice(startIndex), ...arr.slice(0, startIndex)];
};

const rotateQuadratic = (arr, k) => {
  const shiftCount = Math.abs(k % arr.length);
  let i = 1;
  while (i++ <= shiftCount) {
    if (k > 0) {
      arr.unshift(arr.pop());
    } else {
      arr.push(arr.shift());
    }
  }

  return arr;
};

export { rotateQuadratic, rotateLinear };
