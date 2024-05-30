import { useEffect, useRef } from "preact/hooks";
import { forwardRef } from "preact/compat";
import ChartJS from "./init.js";
import { makeChartConfig } from "./chartUtil.js";
import { throttle, useWindowSize } from "../../shared/index.js";

const Chart = ({ title, yAxisTitle, dataLabels, formatTooltip }, chartRef) => {
  const canvasRef = useRef(null);
  const windowSize = useWindowSize();

  const adjustSize = () => {
    if (!chartRef.current) return;

    chartRef.current.options.aspectRatio = windowSize.width / windowSize.height;
    chartRef.current.resize();
  };

  useEffect(() => {
    if (!chartRef.current) return;

    chartRef.current.options.plugins.title.text = title;
    chartRef.current.update();
  }, [title, dataLabels]);

  useEffect(() => {
    setTimeout(adjustSize);
  }, []);

  useEffect(throttle(adjustSize, 200), [windowSize]);

  useEffect(() => {
    const chart = new ChartJS(
      canvasRef.current.getContext("2d"),
      makeChartConfig({ title, yAxisTitle, dataLabels, formatTooltip })
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
