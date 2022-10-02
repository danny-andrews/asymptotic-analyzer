import { h } from "preact";
import ChartJS from "./init.js";
import { makeChartConfig } from "./chartUtil";
import { useEffect, useRef } from "preact/hooks";

const useResize = (fn) => {
  window.addEventListener("resize", fn);

  return () => {
    window.removeEventListener("resize", fn);
  };
};

const Chart = ({ title, chartRef }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const chart = new ChartJS(
      canvasRef.current.getContext("2d"),
      makeChartConfig({ title })
    );

    // FIXME: THIS IS GROSS.
    chartRef.current = chart;

    const updateAspectRatio = () => {
      chart.options.aspectRatio = window.innerWidth / window.innerHeight;
      chart.update();
    };

    useResize(updateAspectRatio);
    updateAspectRatio();
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default Chart;
