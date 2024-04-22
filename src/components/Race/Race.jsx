import { useRef, useState, useEffect } from "preact/hooks";
import cn from "classnames";
import c from "./Race.module.css";
import WorkbenchForm from "../WorkbenchForm/WorkbenchForm.jsx";
import Chart from "../Chart/Chart.jsx";
import { noop } from "../../shared.js";
import { addDataToChart, clearChart } from "../Chart/chartUtil.js";
import { iterations } from "../../signals.js";

const Race = ({ workbenches, runner }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [selectedWorkbench, setSelectedWorkbench] = useState(null);
  const [shouldShowGraph, setShouldShowGraph] = useState(false);
  const [subscription, setSubscription] = useState({ unsubscribe: noop });
  const chartRef = useRef(null);

  useEffect(() => {
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleWorkbenchChange = (workbenchName) => {
    setShouldShowGraph(false);
    setSelectedWorkbench(
      workbenches.find(({ name }) => workbenchName === name.replaceAll(" ", ""))
    );
  };

  useEffect(() => {
    if (!isRunning) return;

    clearChart(chartRef.current);
    const sub = runner
      .startTimeAnalysis(selectedWorkbench.name, iterations.value)
      .subscribe({
        next: ({ name, n, stats }) => {
          addDataToChart(chartRef.current, {
            datapoint: { x: n, y: stats.median, sem: stats.sem },
            label: name,
          });
        },
        complete: () => {
          setIsRunning(false);
        },
      });
    setSubscription(sub);
    setShouldShowGraph(true);
  }, [isRunning]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handleStop = () => {
    runner.stopTimeAnalysis();
    setIsRunning(false);
  };

  return (
    <div class={c.root}>
      <WorkbenchForm
        onStart={handleStart}
        onStop={handleStop}
        onWorkbenchChange={handleWorkbenchChange}
        selectedWorkbench={selectedWorkbench}
        workbenches={workbenches}
        isRunning={isRunning}
      />
      {shouldShowGraph && (
        <sl-card class={cn(c.graphCard)}>
          <Chart
            ref={chartRef}
            title={selectedWorkbench && selectedWorkbench.name}
            yAxisTitle="Average Runtime (ms)"
          />
        </sl-card>
      )}
    </div>
  );
};

export default Race;
