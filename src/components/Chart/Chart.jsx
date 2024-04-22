import { useEffect, useRef } from "preact/hooks";
import { forwardRef } from "preact/compat";
import ChartJS from "./init.js";
import { makeChartConfig } from "./chartUtil";
import { throttle, useWindowSize } from "../../shared.js";

const Chart = ({ title, yAxisTitle }, chartRef) => {
  const canvasRef = useRef(null);
  const windowSize = useWindowSize();

  useEffect(() => {
    if (!chartRef.current) return;

    chartRef.current.options.plugins.title.text = title;
    chartRef.current.update();
  }, [title]);

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
      makeChartConfig({ title, yAxisTitle })
    );

    chartRef.current = chart;

    return () => {
      chartRef.current.destroy();
      chartRef.current = null;
    };
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default forwardRef(Chart);
