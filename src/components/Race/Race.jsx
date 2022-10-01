import { h, Fragment } from "preact";
import { useState, useEffect } from "preact/hooks";
import c from "./Race.module.css";
import WorkbenchForm from "../WorkbenchForm/WorkbenchForm.jsx";
import Chart from "../Chart/Chart.jsx";
import { noop } from "../../shared.js";
import { addDataToChart, clearChart } from "../Chart/chartUtil.js";

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

  useEffect(() => () => subscription.unsubscribe(), []);

  const handleWorkbenchChange = (workbenchName) => {
    setShouldShowGraph(false);
    setSelectedWorkbench(
      workbenches.find(({ name }) => workbenchName === name)
    );
  };

  const handleStart = () => {
    clearChart(chartRef.current);
    const sub = runner.runWorkbench(selectedWorkbench.name).subscribe({
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
    setShouldShowGraph(false);
    setIsRunning(false);
  };

  return (
    <>
      <div class={c["form-container"]}>
        <WorkbenchForm
          onStart={handleStart}
          onStop={handleStop}
          onWorkbenchChange={handleWorkbenchChange}
          selectedWorkbench={selectedWorkbench}
          workbenches={workbenches}
          isRunning={isRunning}
        />
      </div>
      {selectedWorkbench && shouldShowGraph && (
        <sl-card class={c["full-width"]}>
          <div>
            <Chart chartRef={chartRef} title={selectedWorkbench.name} />
          </div>
        </sl-card>
      )}
    </>
  );
};

export default Race;
