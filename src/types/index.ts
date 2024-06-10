import type { Observable } from "rxjs";
import type ChartJS from "../components/Chart/init.ts";
import type { Point } from "chart.js";

export type Workbench = {
  name: string;
  subjects: Subject[];
  generator: Generator<InputSet>;
};

export type Workbenches = Workbench[];

export type Subject = (...args: any[]) => any;

export type InputSet = { n: Number; inputs: any[] };

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

export type LineChart = ChartJS<"line", Point[]>;
