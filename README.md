# Asymptotic Analyzer

This repo contains a command-line tool for benchmarking functions asymptotically in an interactive way. Currently, it's most useful for comparing various implementations of algorithms to see which one performs better for various input sizes; so it gives you much more information than a simple benchmarking tool that only runs a single input against a function.

Eventually, this tool can be used to estimate runtime complexity in an interactive way, as well as profile memory usage, but these features have not been completed yet.

## Usage

1. Install: `$ npm install --save-dev asymptotic-analyzer`.
2. Define a workbenches file, for example `./test/workbenches.js` (more on that below).
3. Run the script against your workbenches file: `$ npx analyze ./test/workbenches.js`.

## Defining a Workbenches File

Next, you'll need to create a file which exports the sets of functions you are interested in benchmarking, along with functions for generating valid inputs for those functions. Take a look at `./test/workbenches.js` for an example.

The default export in this file must match the following `Workbenches` type:

```ts
type Workbenches = Array<Workbench>;

type Workbench = {
  // The name of the workbench to display in the UI. Must be unique.
  name: string;
  // The functions to analyze.
  subjects: Array<Subject>;
  // A function which, given an input size, returns a valid input for the
  // subjects you're testing.
  generator: InputGenerator | Array<InputGenerator>;
  // An array containing values to use as n values.
  domain: Array<Number>;
};

type Subject = (...args: Array<any>) => any;

type InputGenerator = (n: number) => any;
```

Here's a simple example:

```js
// workbenches.js

const copyWithForLoop = (arr) => {
  let result = [];
  for (let i = 0; i < arr.length; i++) {
    result.push(arr[i]);
  }

  return result;
};

const copyWithForEachLoop = (arr) => {
  let result = [];
  arr.forEach((val) => {
    result.push(val);
  });

  return result;
};

export default [
  {
    name: "Array Copy",
    subjects: [copyWithForLoop, copyWithForEachLoop],
    generator: (n) => [...Array(n).keys()],
    domain: [1, 2, 3, 4, 5, 6, 7, 8].map((num) => num * 10000),
  },
];
```

## Future Plans

1. Memory usage profiling.
1. Interactive time complexity estimation.
