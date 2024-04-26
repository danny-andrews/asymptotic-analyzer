import { useSignal, useComputed } from "@preact/signals";
import { map, merge } from "rxjs";
import { useRef, useEffect } from "preact/hooks";
import c from "./Race.module.css";
import WorkbenchForm from "../WorkbenchForm/WorkbenchForm.jsx";
import Chart from "../Chart/Chart.jsx";
import { addDataToChart, clearChart } from "../Chart/chartUtil.js";
import { iterations } from "../../signals.js";
import { noop } from "../../shared.js";

const Race = ({ workbenches, runner }) => {
  const timeChartRef = useRef(null);
  const spaceChartRef = useRef(null);
  const isRunning = useSignal(false);
  const selectedWorkbench = useSignal(null);
  const analysisSubscription = useSignal({ unsubscribe: noop });
  const analysisTarget = useSignal("time");
  const subjectNames = useComputed(
    () =>
      selectedWorkbench.value &&
      selectedWorkbench.value.subjects.map((subject) => subject.name)
  );
  const shouldShowGraphs = useComputed(() => Boolean(selectedWorkbench.value));
  const shouldRunTimeAnalysis = useComputed(() =>
    ["time", "time-and-space"].includes(analysisTarget.value)
  );
  const shouldRunSpaceAnalysis = useComputed(() =>
    ["space", "time-and-space"].includes(analysisTarget.value)
  );

  useEffect(() => {
    return () => {
      analysisSubscription.value.unsubscribe();
    };
  }, []);

  const handleAnalysisTargetChange = (newTarget) => {
    analysisTarget.value = newTarget;
  };

  const clearCharts = () => {
    clearChart(timeChartRef.current);
    clearChart(spaceChartRef.current);
  };

  const handleWorkbenchChange = (workbenchName) => {
    clearCharts();
    selectedWorkbench.value = workbenches.find(
      ({ name }) => workbenchName === name.replaceAll(" ", "")
    );
  };

  const handleStart = () => {
    isRunning.value = true;
    clearCharts();
    const timeMarks = runner
      .startTimeAnalysis(selectedWorkbench.value.name, iterations.value)
      .pipe(map((mark) => ({ mark, chart: timeChartRef.current })));
    const spaceMarks = runner
      .startSpaceAnalysis(selectedWorkbench.value.name)
      .pipe(map((mark) => ({ mark, chart: spaceChartRef.current })));

    const subscription = merge(
      ...[
        ...(shouldRunTimeAnalysis.value ? [timeMarks] : []),
        ...(shouldRunSpaceAnalysis.value ? [spaceMarks] : []),
      ]
    ).subscribe({
      next: ({ mark, chart }) => {
        const { name, n, val } = mark;

        addDataToChart(chart, {
          datapoint: { x: n, y: val },
          label: name,
        });
      },
      complete: () => {
        isRunning.value = false;
      },
    });

    analysisSubscription.value = subscription;
  };

  const handleStop = () => {
    analysisSubscription.value.unsubscribe();
    isRunning.value = false;
  };

  return (
    <div class={c.root}>
      <WorkbenchForm
        onStart={handleStart}
        onStop={handleStop}
        onWorkbenchChange={handleWorkbenchChange}
        onAnalysisTargetChange={handleAnalysisTargetChange}
        analysisTarget={analysisTarget.value}
        selectedWorkbench={selectedWorkbench.value}
        workbenches={workbenches}
        isRunning={isRunning.value}
      />
      {shouldShowGraphs.value && (
        <div class={c.graphs}>
          {shouldRunTimeAnalysis.value && (
            <sl-card class={c.graph}>
              <Chart
                ref={timeChartRef}
                title={`${selectedWorkbench.value.name} - Time Complexity`}
                dataLabels={subjectNames.value}
                yAxisTitle="Median Runtime (ms)"
              />
            </sl-card>
          )}
          {shouldRunSpaceAnalysis.value && (
            <sl-card class={c.graph}>
              <Chart
                ref={spaceChartRef}
                title={`${selectedWorkbench.value.name} - Auxiliary Space Complexity`}
                dataLabels={subjectNames.value}
                yAxisTitle="Median Heap Usage (bytes)"
              />
            </sl-card>
          )}
        </div>
      )}
    </div>
  );
};

export default Race;
