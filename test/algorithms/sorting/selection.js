import { swap } from "./shared.js";

const selectionSort = (array) => {
  for (let i = 0; i < array.length - 1; i++) {
    let minIndex = i;
    for (let j = i + 1; j < array.length; j++) {
      if (array[j] < array[minIndex]) {
        minIndex = j;
      }
    }

    if (i !== minIndex) {
      swap(array, i, minIndex);
    }
  }
};

export default selectionSort;
