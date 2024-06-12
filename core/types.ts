export type Workbench = {
  name: string;
  subjects: Subject[];
  generator: () => Generator<InputSet, void, unknown>;
};

export type Workbenches = Workbench[];

export type Subject = (...args: any[]) => unknown;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type InputSet = { n: number; inputs: any[] };

export type Mark = {
  name: string;
  n: number;
  val: number;
};
