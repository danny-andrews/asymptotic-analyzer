import * as R from "ramda";
import fc from "fast-check";
import { capitalCase } from "change-case";
import { range } from "../src/shared.js";
import * as sortingSubjects from "./algorithms/sorting/index.js";
import * as reverseSubjects from "./algorithms/reverse.js";
import * as rotationSubjects from "./algorithms/rotate.js";

const arrGenerator = (n) => fc.array(fc.nat(n), { minLength: n, maxLength: n });

export const WORKBENCHES = [
  {
    title: "Sorting",
    subjects: R.values(sortingSubjects),
    comparisonFns: [
      { fn: (n) => 50 * n ** 2, name: "cn²" },
      { fn: (n) => 90 * n * Math.log2(n), name: "cn log₂(n)" },
    ],
    generator: arrGenerator,
    range: [1, ...range(10, 1, 500)],
  },
  {
    title: "Array Reverse",
    subjects: R.values(reverseSubjects),
    generator: arrGenerator,
    range: range(10, 1, 2000),
  },
  {
    title: "Array Rotation",
    subjects: R.values(rotationSubjects),
    generator: [arrGenerator, (n) => fc.integer(0, n)],
    range: range(10, 1, 2000),
  },
];

export const getWorkbenches = () =>
  WORKBENCHES.map((workbench) => ({
    ...workbench,
    subjects: workbench.subjects.map((subject) => ({
      ...(subject instanceof Function ? { fn: subject } : subject),
      name: capitalCase(subject.name),
    })),
    name: workbench.title,
  }));
