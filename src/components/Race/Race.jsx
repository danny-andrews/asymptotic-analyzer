import { h, Fragment } from "preact";
import { signal, effect } from "@preact/signals";
import { useState, useEffect } from "preact/hooks";
import c from "./Race.module.css";
import WorkbenchForm from "../WorkbenchForm/WorkbenchForm.jsx";
import Chart from "../Chart/Chart.jsx";
import H from "../H/H.jsx";
import { noop } from "../../shared.js";
import { addDataToChart, clearChart } from "../Chart/chartUtil.js";
import { iterations } from "../../signals";

const addMarksToChart = (chart, marks) =>
  marks
    .map(({ name, n, stats }) => {
      return {
        datapoint: { x: n, y: stats.mean, sem: stats.sem },
        label: name,
      };
    })
    .forEach((data) => addDataToChart(chart, data));

let chart = signal(null);

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
    clearChart(chart.value);
    const sub = runner
      .runWorkbench(selectedWorkbench.name, iterations.value)
      .subscribe({
        next: (marks) => {
          addMarksToChart(chart.value, marks);
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
    runner.stopWorkbench();
    setIsRunning(false);
  };

  const tutorial = (
    <>
      <p>
        Race different implementations against each other and analyze their
        performance for various <code>n</code> values.
      </p>
      <br />
      <H level="3" as="4">
        How to Use
      </H>
      <br />
      <ol>
        <li>- Select a workbench.</li>
        <li>- Hit Start to benchmark all functions in the workbench.</li>
      </ol>
      <br />
      <H level="3" as="4">
        Tips
      </H>
      <br />
      <p>
        <strong>View Source</strong>: Click on a Function to view its source
        code.
      </p>
      <br />
      <p>
        <strong>Setting Iterations</strong>: Iterations is the number of times a
        particular test case will be run against each function for a given{" "}
        <code>n</code> value. Running a function several times and taking a
        median helps to reduce the impact of outlier values. Aim for something
        around 10-100 and adjust as needed for optimal results. Jagged,
        non-monotonically increasing graphs mean your iterations value is too
        low. Aim for monotonically-increasing, smooth lines.
      </p>
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
        <Chart
          chartSig={chart}
          hide={!shouldShowGraph}
          title={selectedWorkbench && selectedWorkbench.name}
        />
        {!shouldShowGraph && tutorial}
      </sl-card>
    </div>
  );
};

export default Race;
