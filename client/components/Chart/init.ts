import {
  Chart,
  CategoryScale,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  ScatterController,
  Title,
  Tooltip,
} from "chart.js";

Chart.register(
  CategoryScale,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  ScatterController,
  Title,
  Tooltip,
);

Chart.defaults.color = "rgb(182, 182, 190)";
Chart.defaults.font.size = 16;
Chart.defaults.borderColor = "hsl(240 4.6% 22%)";

export default Chart;
