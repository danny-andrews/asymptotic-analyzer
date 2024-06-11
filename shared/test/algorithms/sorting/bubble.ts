import { swap } from "./shared.js";

const bubbleSort = (array: number[]) => {
  for (let i = 0; i < array.length; i++) {
    let madeSwap = false;
    for (let j = 0; j < array.length - 1 - i; j++) {
      if (array[j] > array[j + 1]) {
        swap(array, j, j + 1);
        madeSwap = true;
      }
    }

    if (!madeSwap) break;
  }
};

export default bubbleSort;
