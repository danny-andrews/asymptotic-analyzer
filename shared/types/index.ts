import type { Observable } from "rxjs";
import type { Point, Chart } from "chart.js";

export type Workbench = {
  name: string;
  subjects: Subject[];
  generator: () => Generator<InputSet, void, unknown>;
};

export type Workbenches = Workbench[];

export type Subject = (...args: any[]) => unknown;

// export type Subject<R, I extends any[]> = (...args: I) => R;

export type InputSet = { n: number; inputs: unknown[] };

export type AnalysisTarget = "time" | "space" | "time-and-space";

export type Mark = {
  name: string;
  n: number;
  val: number;
};

export type Runner = {
  startTimeAnalysis: (workbenchName: string) => Observable<Mark>;
  startSpaceAnalysis: (workbenchName: string) => Observable<Mark>;
};

export type LineChart = Chart<"line", Point[]>;
