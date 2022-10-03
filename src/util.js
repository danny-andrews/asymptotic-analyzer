import fc from "fast-check";
import prand from "pure-rand";

const { performance } = self;

const rng = new fc.Random(prand.xoroshiro128plus(performance.now()));

export const generate = (generator) => generator.generate(rng).value;
