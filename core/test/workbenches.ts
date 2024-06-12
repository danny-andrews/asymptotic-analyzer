import * as sortingSubjects from "./algorithms/sorting/index.js";
import * as reverseSubjects from "./algorithms/reverse.js";
import * as rangeSubjects from "./algorithms/range.js";

type RangeConfig = {
  start: number;
  length: number;
  step?: number;
};

export const range = ({ start, length, step = 1 }: RangeConfig) =>
  Array(length)
    .fill(null)
    .map((_, num) => (num + start) * step);

// Regular function generator.
const arrForN = (n: number) =>
  Array(n)
    .fill(null)
    .map(() => Math.floor(Math.random() * 100_000));

export default [
  {
    name: "Sorting",
    subjects: Object.values(sortingSubjects),
    generator: function* () {
      for (const n of range({ start: 0, length: 10, step: 1_000 })) {
        yield { n, inputs: [arrForN(n)] };
      }
    },
  },
  {
    name: "Array Reverse",
    subjects: Object.values(reverseSubjects),
    generator: function* () {
      for (const n of range({ start: 0, length: 10, step: 4_000 })) {
        yield { n, inputs: [arrForN(n)] };
      }
    },
  },
  {
    name: "Range",
    subjects: Object.values(rangeSubjects),
    generator: function* () {
      for (const n of range({ start: 0, length: 10, step: 1_000 })) {
        yield { n, inputs: [0, n] };
      }
    },
  },
];
