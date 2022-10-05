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

const Chart = ({ title, chartSig, hide }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const chart = new ChartJS(
      canvasRef.current.getContext("2d"),
      makeChartConfig({ title })
    );

    chartSig.value = chart;

    const updateAspectRatio = () => {
      chart.options.aspectRatio = window.innerWidth / window.innerHeight;
      chart.update();
    };

    useResize(updateAspectRatio);
    updateAspectRatio();
  }, []);
  const style = hide ? { display: "none" } : {};

  return (
    <div>
      <canvas style={style} ref={canvasRef} />
    </div>
  );
};

export default Chart;
