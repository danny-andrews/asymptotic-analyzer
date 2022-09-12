import * as R from "ramda";
import fc from "fast-check";
import { range } from "../src/shared.js";
import * as sortingSubjects from "./algorithms/sorting/index.js";
import * as reverseSubjects from "./algorithms/reverse.js";
import * as rotationSubjects from "./algorithms/rotate.js";

const arrGenerator = (n) => fc.array(fc.nat(n), { minLength: n, maxLength: n });

export default [
  {
    name: "Sorting",
    subjects: R.values(sortingSubjects),
    generator: arrGenerator,
    domain: [1, ...range(10, 1, 500)],
  },
  {
    name: "Array Reverse",
    subjects: R.values(reverseSubjects),
    generator: arrGenerator,
    domain: range(10, 1, 2000),
  },
  {
    name: "Array Rotation",
    subjects: R.values(rotationSubjects),
    generator: [arrGenerator, (n) => fc.integer(0, n)],
    domain: range(15, 1, 2000),
  },
];
