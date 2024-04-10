import { h } from "preact";
import ChartJS from "./init.js";
import { makeChartConfig } from "./chartUtil";
import { useEffect, useRef, useState } from "preact/hooks";
import { throttle } from "../../shared.js";

export function useWindowSize() {
  const [size, setSize] = useState({
    width: null,
    height: null,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return size;
}

const Chart = ({ title, chartSig, hide }) => {
  const canvasRef = useRef(null);
  const windowSize = useWindowSize();

  useEffect(() => {
    if (chartSig.value) {
      chartSig.value.options.plugins.title.text = title;
      chartSig.value.update();
    }
  }, [title]);

  useEffect(
    throttle(() => {
      if (chartSig.value) {
        chartSig.value.options.aspectRatio =
          windowSize.width / windowSize.height;
        chartSig.value.resize();
      }
    }, 200),
    [windowSize]
  );

  useEffect(() => {
    const chart = new ChartJS(
      canvasRef.current.getContext("2d"),
      makeChartConfig({ title })
    );

    chartSig.value = chart;
  }, []);

  const style = hide ? { display: "none" } : {};

  return (
    <div>
      <canvas style={style} ref={canvasRef} />
    </div>
  );
};

export default Chart;
