import type { Chart, Point } from "chart.js";
import type { LineChart } from "../../shared/types.js";

const CHART_COLORS = [
  "rgb(80, 227, 133)",
  "rgb(102, 170, 255",
  "rgb(254, 118, 118)",
  "rgb(255, 209, 30)",
  "rgb(197, 137, 255)",
  "rgb(255, 151, 65)",
];

type Dataset = {
  num: number;
  label: string;
  data: Point[];
};

const createDataset = ({ num, label, data }: Dataset) => ({
  borderColor: CHART_COLORS[num],
  backgroundColor: CHART_COLORS[num],
  pointRadius: 4,
  pointHoverRadius: 5,
  showLine: true,
  label,
  data,
});

export const clearChart = (chart: LineChart) => {
  if (!chart) return;

  chart.data.datasets.forEach((dataset) => {
    dataset.data = [];
  });
  chart.update();
};

export const addDataToChart = (
  chart: LineChart,
  { datapoint, label }: { datapoint: Point; label: string },
) => {
  if (!chart.data.datasets) return;

  const existingDataset = chart.data.datasets.find(
    (dataset) => dataset.label === label,
  );
  if (existingDataset) {
    existingDataset.data.push(datapoint);
  }

  chart.update();
};

type ConfigOptions = {
  title: string;
  yAxisTitle: string;
  dataLabels: string[];
  formatTooltip: () => void;
};

export const makeChartConfig = ({
  title,
  yAxisTitle,
  dataLabels,
  formatTooltip,
}: ConfigOptions) => ({
  type: "scatter",
  data: {
    datasets: dataLabels.map((label, index) =>
      createDataset({ label, data: [], num: index }),
    ),
  },
  plugins: [
    {
      beforeInit: function (chart: Chart<"line">) {
        if (!chart.legend) return;
        // @ts-expect-error FIXME
        const original = chart.legend.fit.bind(chart.legend);
        // @ts-expect-error FIXME
        chart.legend.fit = function () {
          original();
          this.height += 8;
        };
      },
    },
  ],
  options: {
    responsive: false,
    plugins: {
      title: {
        display: true,
        text: title,
        padding: {
          top: 0,
          bottom: 4,
        },
      },
      tooltip: {
        callbacks: {
          label: formatTooltip,
        },
      },
      legend: {
        labels: {
          padding: 16,
        },
      },
    },
    interaction: {
      intersect: false,
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "n",
        },
        ticks: {
          display: true,
        },
      },
      y: {
        title: {
          display: true,
          text: yAxisTitle,
        },
      },
    },
  },
});
