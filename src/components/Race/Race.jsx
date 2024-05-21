import { useSignal, useComputed } from "@preact/signals";
import { map, merge } from "rxjs";
import { useRef, useEffect } from "preact/hooks";
import cn from "classnames";
import c from "./Race.module.css";
import WorkbenchForm from "../WorkbenchForm/WorkbenchForm.jsx";
import Chart from "../Chart/Chart.jsx";
import { addDataToChart, clearChart } from "../Chart/chartUtil.js";
import { noop, formatBytes, roundTo } from "../../shared/index.js";

const Race = ({ workbenches, runner }) => {
  const timeChartRef = useRef(null);
  const spaceChartRef = useRef(null);
  const isRunning = useSignal(false);
  const selectedWorkbench = useSignal(null);
  const analysisSubscription = useSignal({ unsubscribe: noop });
  const analysisTarget = useSignal("time");
  const workbenchName = useComputed(() =>
    selectedWorkbench.value ? selectedWorkbench.value.name : "",
  );
  const subjectNames = useComputed(
    () =>
      selectedWorkbench.value &&
      selectedWorkbench.value.subjects.map((subject) => subject.name),
  );
  const shouldShowGraphs = useComputed(() => Boolean(selectedWorkbench.value));
  const shouldRunTimeAnalysis = useComputed(() =>
    ["time", "time-and-space"].includes(analysisTarget.value),
  );
  const shouldRunSpaceAnalysis = useComputed(() =>
    ["space", "time-and-space"].includes(analysisTarget.value),
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

  const handleStart = () => {
    isRunning.value = true;
    clearCharts();
    const timeMarks = runner
      .startTimeAnalysis(selectedWorkbench.value.name)
      .pipe(map((mark) => ({ mark, chart: timeChartRef.current })));
    const spaceMarks = runner
      .startSpaceAnalysis(selectedWorkbench.value.name)
      .pipe(
        map((mark) => ({
          mark: {
            ...mark,
            val: mark.val / 1000,
          },
          chart: spaceChartRef.current,
        })),
      );

    const subscription = merge(
      ...[
        ...(shouldRunTimeAnalysis.value ? [timeMarks] : []),
        ...(shouldRunSpaceAnalysis.value ? [spaceMarks] : []),
      ],
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

  const handleWorkbenchChange = (event) => {
    const workbenchName = event.target.value;

    clearCharts();
    selectedWorkbench.value = workbenches.find(
      ({ name }) => workbenchName === name.replaceAll(" ", ""),
    );
  };

  return (
    <div class={c.root}>
      <div class={c.container}>
        <sl-select
          size="small"
          class={cn(c.workbenchSelect, {
            [c.isEmpty]: !shouldShowGraphs.value,
          })}
          onsl-change={handleWorkbenchChange}
          placeholder="Select a workbench"
          value={workbenchName.value.replaceAll(" ", "")}
          name="workbench"
          disabled={isRunning}
        >
          {workbenches.map(({ name }) => (
            <sl-option value={name.replaceAll(" ", "")}>{name}</sl-option>
          ))}
        </sl-select>
        {selectedWorkbench.value && (
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
        )}
      </div>
      {shouldShowGraphs.value && (
        <div class={c.graphs}>
          {shouldRunTimeAnalysis.value && (
            <sl-card class={c.graph}>
              <Chart
                ref={timeChartRef}
                title={`${selectedWorkbench.value.name} - Time Complexity`}
                dataLabels={subjectNames.value}
                formatTooltip={({ dataset, parsed }) =>
                  `${dataset.label}: (${parsed.x}, ${roundTo(parsed.y, 3)})`
                }
                yAxisTitle="Median Runtime (ms)"
              />
            </sl-card>
          )}
          {shouldRunSpaceAnalysis.value && (
            <sl-card class={c.graph}>
              <Chart
                ref={spaceChartRef}
                title={`${selectedWorkbench.value.name} - (Auxiliary) Space Complexity`}
                dataLabels={subjectNames.value}
                formatTooltip={({ dataset, parsed }) =>
                  `${dataset.label}: (${parsed.x}, ${formatBytes(
                    parsed.y * 1000,
                  )})`
                }
                yAxisTitle="Median Heap Usage (kB)"
              />
            </sl-card>
          )}
        </div>
      )}
    </div>
  );
};

export default Race;
