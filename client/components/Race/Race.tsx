import { useSignal, useComputed } from "@preact/signals";
import { map, merge } from "rxjs";
import { useRef, useEffect } from "preact/hooks";
import cn from "classnames";
import c from "./Race.module.css";
import WorkbenchForm from "../WorkbenchForm/WorkbenchForm.jsx";
import Chart from "../Chart/Chart.jsx";
import { addDataToChart, clearChart } from "../Chart/chartUtil.js";
import { noop, formatBytes, roundTo } from "../../../shared/index.js";
import type { Workbench, Workbenches, Runner, AnalysisTarget, LineChart } from "../../../shared/types/index.js";
import type { SlInputEvent } from "@shoelace-style/shoelace";

type PropTypes = {
  workbenches: Workbenches;
  runner: Runner;
};

const Race = ({ workbenches, runner }: PropTypes) => {
  const timeChartRef = useRef<LineChart>(null);
  const spaceChartRef = useRef<LineChart>(null);
  const isRunning = useSignal(false);
  const selectedWorkbench = useSignal<Workbench | null>(null);
  const analysisSubscription = useSignal({ unsubscribe: noop });
  const analysisTarget = useSignal<AnalysisTarget>("time");
  const workbenchName = useComputed(() =>
    selectedWorkbench.value ? selectedWorkbench.value.name : ""
  );
  const subjectNames = useComputed(
    () =>
      selectedWorkbench.value === null ? [] :
      selectedWorkbench.value.subjects.map((subject) => subject.name)
  );
  const shouldShowGraphs = useComputed(() => selectedWorkbench.value !== null);
  const shouldRunTimeAnalysis = useComputed(() =>
    ["time", "time-and-space"].includes(analysisTarget.value)
  );
  const shouldRunSpaceAnalysis = useComputed(() =>
    ["space", "time-and-space"].includes(analysisTarget.value)
  );

  useEffect(() => {
    return () => {
      analysisSubscription.value.unsubscribe();
    };
  }, []);

  const handleAnalysisTargetChange = (newTarget: AnalysisTarget) => {
    analysisTarget.value = newTarget;
  };

  const clearCharts = () => {
    if(timeChartRef.current) {
      clearChart(timeChartRef.current);
    }

    if(spaceChartRef.current) {
      clearChart(spaceChartRef.current);
    }
  };

  const handleStart = () => {
    if(selectedWorkbench.value === null) return;

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
        }))
      );

    const subscription = merge(
      ...[
        ...(shouldRunTimeAnalysis.value ? [timeMarks] : []),
        ...(shouldRunSpaceAnalysis.value ? [spaceMarks] : []),
      ]
    ).subscribe({
      next: ({ mark, chart }) => {
        if(!chart) return;

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

  const handleWorkbenchChange = (event: SlInputEvent) => {
    if(event.target === null) return;
    const target = event.target as HTMLSelectElement;

    const workbenchName = target.value;

    clearCharts();
    selectedWorkbench.value = workbenches.find(
      ({ name }) => workbenchName === name.replaceAll(" ", "")
    ) || null;
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
          disabled={isRunning.value}
        >
          {workbenches.map(({ name }) => (
            <sl-option value={name.replaceAll(" ", "")}>{name}</sl-option>
          ))}
        </sl-select>
        {selectedWorkbench.value && (
          <WorkbenchForm
            onStart={handleStart}
            onStop={handleStop}
            onAnalysisTargetChange={handleAnalysisTargetChange}
            analysisTarget={analysisTarget.value}
            selectedWorkbench={selectedWorkbench.value}
            isRunning={isRunning.value}
          />
        )}
      </div>
      {selectedWorkbench.value !== null && (
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
                    parsed.y * 1000
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
