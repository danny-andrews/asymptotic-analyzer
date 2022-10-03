import * as R from "ramda";
import fc from "fast-check";
import * as sortingSubjects from "./algorithms/sorting/index.js";
import * as reverseSubjects from "./algorithms/reverse.js";
import * as rotationSubjects from "./algorithms/rotate.js";
import { generate } from "../src/util.js";

export const range = (startAt, size, step = 1) =>
  R.range(startAt, startAt + size).map((n) => n * step);

// Fancy generator via fast-check.
const arrGenerator = (n) =>
  generate(fc.array(fc.nat(n), { minLength: n, maxLength: n }));

// Regular function generator.
const arrForN = (n) =>
  [...Array(n)].map(() => Math.floor(Math.random() * 1000));

export default [
  {
    name: "Sorting",
    subjects: R.values(sortingSubjects),
    generator: [arrGenerator],
    domain: [1, ...range(1, 10, 500)],
  },
  {
    name: "Array Reverse",
    subjects: R.values(reverseSubjects),
    generator: [arrForN],
    domain: range(1, 10, 2000),
  },
  {
    name: "Array Rotation",
    subjects: R.values(rotationSubjects),
    generator: [arrGenerator, (n) => generate(fc.integer(0, n))],
    domain: range(10, 1, 2000),
  },
];
