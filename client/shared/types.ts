import type { Observable } from "rxjs";
import type { Point, Chart } from "chart.js";
import type { Mark } from "../../core/types.js";

export type AnalysisTarget = "time" | "space" | "time-and-space";

export type Runner = {
  startTimeAnalysis: (workbenchName: string) => Observable<Mark>;
  startSpaceAnalysis: (workbenchName: string) => Observable<Mark>;
};

export type LineChart = Chart<"line", Point[]>;
