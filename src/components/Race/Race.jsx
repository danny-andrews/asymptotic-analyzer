import { h, Fragment } from "preact";
import { useState, useEffect } from "preact/hooks";
import c from "./Race.module.css";
import { fromWorkerEvent } from "../../shared.js";
import WorkbenchForm from "../WorkbenchForm/WorkbenchForm.jsx";
import Chart from "../Chart/Chart.jsx";

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

const createDataset = ({ num, label, data }) => ({
  borderColor: CHART_COLORS[num],
  backgroundColor: CHART_COLORS[num],
  showLine: true,
  label,
  data,
});

const Race = ({ worker, workbenches }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [selectedWorkbench, setSelectedWorkbench] = useState(null);
  const [shouldShowGraph, setShouldShowGraph] = useState(false);

  useEffect(() => {
    console.log(worker);
    if (worker) {
      fromWorkerEvent(worker, "NEW_MARKS").subscribe(addMarksToChart);
      fromWorkerEvent(worker, "MARKSET_COMPLETE").subscribe(() => {
        setIsRunning(false);
      });
    }
  }, [worker]);

  const handleWorkbenchChange = (workbenchName) => {
    setShouldShowGraph(false);
    setSelectedWorkbench(
      workbenches.find(({ name }) => workbenchName === name)
    );
  };

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

  const postMessage = (name, payload) => {
    worker.postMessage({ name, payload });
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
