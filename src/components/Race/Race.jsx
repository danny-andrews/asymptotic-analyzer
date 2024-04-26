import { useSignal, useComputed } from "@preact/signals";
import { map, merge } from "rxjs";
import { useRef, useState, useEffect } from "preact/hooks";
import c from "./Race.module.css";
import WorkbenchForm from "../WorkbenchForm/WorkbenchForm.jsx";
import Chart from "../Chart/Chart.jsx";
import { addDataToChart, clearChart } from "../Chart/chartUtil.js";
import { iterations } from "../../signals.js";

const Race = ({ workbenches, runner }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [selectedWorkbench, setSelectedWorkbench] = useState(null);
  const [subscription, setSubscription] = useState([]);
  const subjectNames =
    selectedWorkbench &&
    selectedWorkbench.subjects.map((subject) => subject.name);
  const timeChartRef = useRef(null);
  const spaceChartRef = useRef(null);
  const shouldShowGraphs = Boolean(selectedWorkbench);
  const analysisTarget = useSignal("time");
  const shouldRunTimeAnalysis = useComputed(() =>
    ["time", "time-and-space"].includes(analysisTarget.value)
  );
  const shouldRunSpaceAnalysis = useComputed(() =>
    ["space", "time-and-space"].includes(analysisTarget.value)
  );

  useEffect(() => {
    return () => {
      subscription.unsubscribe();
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
    setSelectedWorkbench(
      workbenches.find(({ name }) => workbenchName === name.replaceAll(" ", ""))
    );
  };

  const handleStart = () => {
    setIsRunning(true);
    clearCharts();
    const timeMarks = runner
      .startTimeAnalysis(selectedWorkbench.name, iterations.value)
      .pipe(map((mark) => ({ mark, chart: timeChartRef.current })));
    const spaceMarks = runner
      .startSpaceAnalysis(selectedWorkbench.name)
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
        setIsRunning(false);
      },
    });

    setSubscription(subscription);
  };

  const handleStop = () => {
    subscription.unsubscribe();
    setIsRunning(false);
  };

  return (
    <div class={c.root}>
      <WorkbenchForm
        onStart={handleStart}
        onStop={handleStop}
        onWorkbenchChange={handleWorkbenchChange}
        onAnalysisTargetChange={handleAnalysisTargetChange}
        analysisTarget={analysisTarget.value}
        selectedWorkbench={selectedWorkbench}
        workbenches={workbenches}
        isRunning={isRunning}
      />
      {shouldShowGraphs && (
        <div class={c.graphs}>
          {shouldRunTimeAnalysis.value && (
            <sl-card class={c.graph}>
              <Chart
                ref={timeChartRef}
                title={`${selectedWorkbench.name} - Time Complexity`}
                dataLabels={subjectNames}
                yAxisTitle="Median Runtime (ms)"
              />
            </sl-card>
          )}
          {shouldRunSpaceAnalysis.value && (
            <sl-card class={c.graph}>
              <Chart
                ref={spaceChartRef}
                title={`${selectedWorkbench.name} - Auxiliary Space Complexity`}
                dataLabels={subjectNames}
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
