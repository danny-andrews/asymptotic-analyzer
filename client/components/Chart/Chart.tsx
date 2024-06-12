import { MutableRef, useEffect, useRef } from "preact/hooks";
import { forwardRef } from "preact/compat";
import type { TooltipItem } from "chart.js";
import ChartJS from "./init.js";
import { makeChartConfig } from "./chartUtil.js";
import { throttle, useWindowSize } from "../../../shared/index.js";
import type { LineChart } from "../../../shared/types/index.js";

type PropTypes = {
  title: string;
  yAxisTitle: string;
  dataLabels: string[];
  formatTooltip: (tooltipItem: TooltipItem<"line">) => string;
};

const Chart = forwardRef<LineChart, PropTypes>(
  (
    { title, yAxisTitle, dataLabels, formatTooltip },
    ref: MutableRef<LineChart | null>,
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const windowSize = useWindowSize();

    const adjustSize = () => {
      if (!ref.current) return;

      ref.current.options.aspectRatio = windowSize.width / windowSize.height;
      ref.current.resize();
    };

    useEffect(() => {
      if (
        !ref.current ||
        !ref.current.options.plugins ||
        !ref.current.options.plugins.title
      )
        return;

      ref.current.options.plugins.title.text = title;
      ref.current.update();
    }, [title, dataLabels]);

    useEffect(() => {
      setTimeout(adjustSize);
    }, []);

    useEffect(throttle(adjustSize, 200), [windowSize]);

    useEffect(() => {
      if (canvasRef.current === null) return;
      const context = canvasRef.current.getContext("2d");
      if (context === null) return;

      const chart = new ChartJS(
        context,
        // @ts-expect-error Come back to this later
        makeChartConfig({ title, yAxisTitle, dataLabels, formatTooltip }),
      ) as LineChart;

      ref.current = chart;

      return () => {
        if (ref.current) {
          ref.current.destroy();
        }
      };
    }, [dataLabels]);

    return (
      <div>
        <canvas ref={canvasRef} />
      </div>
    );
  },
);

export default Chart;
