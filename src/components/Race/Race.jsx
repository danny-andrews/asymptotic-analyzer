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
  const shouldShowGraph = Boolean(selectedWorkbench);
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

  const handleWorkbenchChange = (workbenchName) => {
    clearChart(timeChartRef.current);
    clearChart(spaceChartRef.current);
    setSelectedWorkbench(
      workbenches.find(({ name }) => workbenchName === name.replaceAll(" ", ""))
    );
  };

  const handleStart = () => {
    setIsRunning(true);
    clearChart(timeChartRef.current);
    clearChart(spaceChartRef.current);

    const timeAnalysisObserver = runner
      .startTimeAnalysis(selectedWorkbench.name, iterations.value)
      .pipe(map((mark) => ({ mark, type: "TIME" })));
    const spaceAnalysisObserver = runner
      .startSpaceAnalysis(selectedWorkbench.name)
      .pipe(map((mark) => ({ mark, type: "SPACE" })));

    const mergedObserver = merge(
      ...[
        ...(shouldRunTimeAnalysis.value ? [timeAnalysisObserver] : []),
        ...(shouldRunSpaceAnalysis.value ? [spaceAnalysisObserver] : []),
      ]
    );

    const subscription = mergedObserver.subscribe({
      next: (data) => {
        console.log(data);
        const chart = (data.type === "TIME" ? timeChartRef : spaceChartRef)
          .current;

        const { name, n, val } = data.mark;

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
    runner.stopTimeAnalysis();
    runner.stopSpaceAnalysis();
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
      {shouldShowGraph && (
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
