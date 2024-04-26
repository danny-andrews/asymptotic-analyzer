import fc from "fast-check";
import * as sortingSubjects from "./algorithms/sorting/index.js";
import * as reverseSubjects from "./algorithms/reverse.js";
import * as rangeSubjects from "./algorithms/range.js";
import { generate } from "../index.js";

export const range = ({ start, length, step = 1 }) =>
  Array(length)
    .fill()
    .map((_, num) => (num + start) * step);

// Fancy generator via fast-check.
const arrGenerator = (n) =>
  generate(fc.array(fc.integer(), { minLength: n, maxLength: n }));

// Regular function generator.
const arrForN = (n) =>
  Array(n)
    .fill()
    .map(() => Math.floor(Math.random() * 100_000));

export default [
  {
    name: "Sorting",
    subjects: Object.values(sortingSubjects),
    generator: function* () {
      for (let n of range({ start: 0, length: 10, step: 1_000 })) {
        yield { n, inputs: [arrForN(n)] };
      }
    },
  },
  {
    name: "Array Reverse",
    subjects: Object.values(reverseSubjects),
    generator: function* () {
      for (let n of range({ start: 0, length: 10, step: 4_000 })) {
        yield { n, inputs: [arrGenerator(n)] };
      }
    },
  },
  {
    name: "Range",
    subjects: Object.values(rangeSubjects),
    generator: function* () {
      for (let n of range({ start: 0, length: 10, step: 1_000 })) {
        yield { n, inputs: [0, n] };
      }
    },
  },
];
