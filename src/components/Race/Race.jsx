import { h, Fragment } from "preact";
import { useState, useEffect } from "preact/hooks";
import c from "./Race.module.css";
import WorkbenchForm from "../WorkbenchForm/WorkbenchForm.jsx";
import Chart from "../Chart/Chart.jsx";
import { noop } from "../../shared.js";
import { addDataToChart, clearChart } from "../Chart/chartUtil.js";
import { iterations } from "../../signals";

const addMarksToChart = (chart, marks) =>
  marks
    .map(({ name, n, duration }) => ({
      datapoint: { x: n, y: duration },
      label: name,
    }))
    .forEach(addDataToChart(chart));

let chartRef = { current: null };

const Race = ({ workbenches, runner }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [selectedWorkbench, setSelectedWorkbench] = useState(null);
  const [shouldShowGraph, setShouldShowGraph] = useState(false);
  const [subscription, setSubscription] = useState({ unsubscribe: noop });

  useEffect(
    () => () => {
      subscription.unsubscribe();
    },
    []
  );

  const handleWorkbenchChange = (workbenchName) => {
    setShouldShowGraph(false);
    setSelectedWorkbench(
      workbenches.find(({ name }) => workbenchName === name)
    );
  };

  const handleStart = () => {
    clearChart(chartRef.current);
    const sub = runner
      .runWorkbench(selectedWorkbench.name, iterations.value)
      .subscribe({
        next: (marks) => {
          addMarksToChart(chartRef.current, marks);
        },
        complete: () => {
          setIsRunning(false);
        },
      });
    setSubscription(sub);
    setShouldShowGraph(true);
    setIsRunning(true);
  };

  const handleStop = () => {
    clearChart(chartRef.current);
    runner.stopWorkbench();
    setIsRunning(false);
  };
  const tutorial = (
    <>
      <p>How to use:</p>
      <ol>
        <li>1. Select a workbench to get started.</li>
        <li>2. Hit Start to run subjects (i.e. functions) in the workbench.</li>
      </ol>
    </>
  );

  return (
    <div class={c["race-root"]}>
      <WorkbenchForm
        onStart={handleStart}
        onStop={handleStop}
        onWorkbenchChange={handleWorkbenchChange}
        selectedWorkbench={selectedWorkbench}
        workbenches={workbenches}
        isRunning={isRunning}
      />
      <sl-card class={c["graph-card"]}>
        {shouldShowGraph ? (
          <Chart chartRef={chartRef} title={selectedWorkbench.name} />
        ) : (
          tutorial
        )}
      </sl-card>
    </div>
  );
};

export default Race;
