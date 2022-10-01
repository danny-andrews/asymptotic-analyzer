import { useState, useRef, useEffect } from "preact/hooks";
import workbenches from "../../build/workbenches.js";
import { fromWorkerEvent } from "../shared.js";
import c from "./App.module.css";
import WorkbenchForm from "./WorkbenchForm.jsx";
import H from "./H.jsx";
import Chart from "./Chart.jsx";

const markToDataPoint = ({ n, duration }) => ({ x: n, y: duration });

let chartRef = { current: null };

const CHART_COLORS = [
  "rgb(80, 227, 133)",
  "rgb(102, 170, 255",
  "rgb(254, 118, 118)",
  "rgb(255, 209, 30)",
  "rgb(197, 137, 255)",
  "rgb(255, 151, 65)",
];

export const createDataset = ({ num, label, data }) => ({
  borderColor: CHART_COLORS[num],
  backgroundColor: CHART_COLORS[num],
  showLine: true,
  label,
  data,
});

const App = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [selectedWorkbench, setSelectedWorkbench] = useState(null);
  const [shouldShowGraph, setShouldShowGraph] = useState(false);
  const worker = useRef(null);

  const addDatapointFor = (label, datapoint) => {
    const chartDatasets = chartRef.current.data.datasets;
    const existingDatasetIndex = chartDatasets.findIndex(
      (dataset) => dataset.label === label
    );

    if (existingDatasetIndex !== -1) {
      chartDatasets[existingDatasetIndex].data.push(datapoint);
    } else {
      chartDatasets.push(
        createDataset({
          num: chartDatasets.length,
          label,
          data: [datapoint],
        })
      );
    }
    chartRef.current.update();
  };

  useEffect(() => {
    worker.current = new Worker("src/worker.js", { type: "module" });

    // FIXME: Dispose of subscriptions on unmount.
    fromWorkerEvent(worker.current, "NEW_MARKS").subscribe(addMarksToChart);
    fromWorkerEvent(worker.current, "MARKSET_COMPLETE").subscribe(() => {
      setIsRunning(false);
    });
  }, []);

  const postMessage = (name, payload) => {
    worker.current.postMessage({ name, payload });
  };

  const addMarksToChart = (marks) => {
    marks.forEach((mark) => {
      addDatapointFor(mark.name, markToDataPoint(mark));
    });
  };

  const clearChart = () => {
    if (!chartRef.current) return;
    chartRef.current.data.datasets = [];
    chartRef.current.update();
  };

  const handleStart = () => {
    clearChart();
    postMessage("RUN_WORKBENCH", selectedWorkbench.name);
    setShouldShowGraph(true);
    setIsRunning(true);
  };

  const handleStop = () => {
    clearChart();
    postMessage("STOP_WORKBENCH");
    setShouldShowGraph(false);
    setIsRunning(false);
  };

  const handleWorkbenchChange = (workbenchName) => {
    setShouldShowGraph(false);
    setSelectedWorkbench(
      workbenches.find(({ name }) => workbenchName === name)
    );
  };

  const racePanel = (
    <WorkbenchForm
      onStart={handleStart}
      onStop={handleStop}
      onWorkbenchChange={handleWorkbenchChange}
      selectedWorkbench={selectedWorkbench}
      workbenches={workbenches}
      isRunning={isRunning}
    />
  );

  const chart = selectedWorkbench && shouldShowGraph && (
    <sl-card class={c["full-width"]}>
      <div>
        <Chart chartRef={chartRef} title={selectedWorkbench.name} />
      </div>
    </sl-card>
  );

  return (
    <>
      <header>
        <H class={c.heading} as="3" level="1">
          Asymptotic Analysis
        </H>
      </header>
      <main>
        <sl-tab-group class={c["action-tab-group"]}>
          <sl-tab slot="nav" panel="race">
            Race
          </sl-tab>
          <sl-tab slot="nav" panel="analyze">
            Analyze
          </sl-tab>

          <sl-tab-panel name="race">{racePanel}</sl-tab-panel>
          <sl-tab-panel name="analyze">[Analysis Form Here]</sl-tab-panel>
        </sl-tab-group>
        {chart}
      </main>
    </>
  );
};

export default App;
