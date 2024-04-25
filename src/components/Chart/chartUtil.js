const roundTo = (precision, num) => Number(num.toFixed(precision));

const CHART_COLORS = [
  "rgb(80, 227, 133)",
  "rgb(102, 170, 255",
  "rgb(254, 118, 118)",
  "rgb(255, 209, 30)",
  "rgb(197, 137, 255)",
  "rgb(255, 151, 65)",
];

const createDataset = ({ num, label, data }) => ({
  borderColor: CHART_COLORS[num],
  backgroundColor: CHART_COLORS[num],
  showLine: true,
  label,
  data,
});

export const clearChart = (chart) => {
  if (!chart) return;
  chart.data.datasets.forEach((dataset) => {
    dataset.data = [];
  });
  chart.update();
};

export const addDataToChart = (chart, { datapoint, label }) => {
  const { datasets } = chart.data;
  const dataset = createDataset({
    num: datasets.length,
    label,
    data: [datapoint],
  });

  const existingDataset = datasets.find((dataset) => dataset.label === label);

  if (existingDataset) {
    existingDataset.data.push(datapoint);
  } else {
    datasets.push(dataset);
  }
  chart.update();
};

export const makeChartConfig = ({ title, yAxisTitle, dataLabels }) => ({
  type: "scatter",
  data: {
    datasets: dataLabels.map((label, index) => {
      return createDataset({
        label,
        data: [],
        num: index,
      });
    }),
  },
  plugins: [
    {
      beforeInit: function (chart) {
        const original = chart.legend.fit.bind(chart.legend);
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
          label: ({ dataset, parsed }) =>
            `${dataset.label}: (${parsed.x}, ${roundTo(3, parsed.y)})`,
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
