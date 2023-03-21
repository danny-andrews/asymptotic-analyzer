import fc from "fast-check";
import * as sortingSubjects from "./algorithms/sorting/index.js";
import * as reverseSubjects from "./algorithms/reverse.js";
import * as rotationSubjects from "./algorithms/rotate.js";
import { generate } from "../index.js";

export const range = (startAt, size, step = 1) =>
  [...Array(size).keys()].map((num) => (num + startAt) * step);

// Fancy generator via fast-check.
const arrGenerator = (n) =>
  generate(fc.array(fc.nat(n), { minLength: n, maxLength: n }));

// Regular function generator.
const arrForN = (n) =>
  [...Array(n)].map(() => Math.floor(Math.random() * 1000));

export default [
  {
    name: "Sorting",
    subjects: Object.values(sortingSubjects),
    generator: [arrGenerator],
    domain: [1, ...range(1, 10, 100)],
  },
  {
    name: "Array Reverse",
    subjects: Object.values(reverseSubjects),
    generator: [arrForN],
    domain: range(1, 10, 8000),
  },
  {
    name: "Array Rotation",
    subjects: Object.values(rotationSubjects),
    generator: [
      arrGenerator,
      (n) => generate(fc.integer({ min: n / 2, max: n / 2 })),
    ],
    domain: range(1, 8, 2000),
  },
];
