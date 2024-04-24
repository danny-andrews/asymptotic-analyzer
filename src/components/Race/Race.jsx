import { useSignal, useComputed } from "@preact/signals";
import { useRef, useState, useEffect } from "preact/hooks";
import c from "./Race.module.css";
import WorkbenchForm from "../WorkbenchForm/WorkbenchForm.jsx";
import Chart from "../Chart/Chart.jsx";
import { addDataToChart, clearChart } from "../Chart/chartUtil.js";
import { iterations } from "../../signals.js";

const Race = ({ workbenches, runner }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [selectedWorkbench, setSelectedWorkbench] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
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
      subscriptions.forEach((subscription) => subscription.unsubscribe());
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
    if (shouldRunTimeAnalysis.value) {
      clearChart(timeChartRef.current);
      const subscription = runner
        .startTimeAnalysis(selectedWorkbench.name, iterations.value)
        .subscribe({
          next: ({ name, n, val }) => {
            addDataToChart(timeChartRef.current, {
              datapoint: { x: n, y: val },
              label: name,
            });
          },
          complete: () => {
            setIsRunning(false);
          },
        });
      setSubscriptions((subscriptions) => [...subscriptions, subscription]);
    }

    if (shouldRunSpaceAnalysis.value) {
      clearChart(spaceChartRef.current);
      const subscription = runner
        .startSpaceAnalysis(selectedWorkbench.name)
        .subscribe({
          next: ({ name, n, val }) => {
            addDataToChart(spaceChartRef.current, {
              datapoint: { x: n, y: val },
              label: name,
            });
          },
          complete: () => {
            setIsRunning(false);
          },
        });
      setSubscriptions((subscriptions) => [...subscriptions, subscription]);
    }

    setIsRunning(true);
  };

  const handleStop = () => {
    runner.stopTimeAnalysis();
    setIsRunning(false);
  };

  return (
    <div class={c.root}>
      <WorkbenchForm
        className={c.form}
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
                yAxisTitle="Median Runtime (ms)"
              />
            </sl-card>
          )}
          {shouldRunSpaceAnalysis.value && (
            <sl-card class={c.graph}>
              <Chart
                ref={spaceChartRef}
                title={`${selectedWorkbench.name} - Auxiliary Space Complexity`}
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
