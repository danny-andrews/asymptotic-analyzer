import fc from "fast-check";
import prand from "pure-rand";
import type { Arbitrary } from "fast-check";

const rng = new fc.Random(prand.xoroshiro128plus(performance.now()));

export const generate = <T>(generator: Arbitrary<T>) =>
  generator.generate(rng).value;
