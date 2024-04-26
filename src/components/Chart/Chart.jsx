import { useEffect, useRef } from "preact/hooks";
import { forwardRef } from "preact/compat";
import ChartJS from "./init.js";
import { makeChartConfig } from "./chartUtil";
import { throttle, useWindowSize } from "../../shared/index.js";

const Chart = ({ title, yAxisTitle, dataLabels }, chartRef) => {
  const canvasRef = useRef(null);
  const windowSize = useWindowSize();

  useEffect(() => {
    if (!chartRef.current) return;

    chartRef.current.options.plugins.title.text = title;
    chartRef.current.update();
  }, [title, dataLabels]);

  useEffect(
    throttle(() => {
      if (!chartRef.current) return;

      chartRef.current.options.aspectRatio =
        windowSize.width / windowSize.height;
      chartRef.current.resize();
    }, 200),
    [windowSize]
  );

  useEffect(() => {
    const chart = new ChartJS(
      canvasRef.current.getContext("2d"),
      makeChartConfig({ title, yAxisTitle, dataLabels })
    );

    chartRef.current = chart;

    return () => {
      chartRef.current.destroy();
      chartRef.current = null;
    };
  }, [dataLabels]);

  return (
    <div>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default forwardRef(Chart);
