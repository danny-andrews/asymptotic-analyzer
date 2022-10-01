const roundTo = (precision, num) => Number(num.toFixed(precision));

export const makeChartConfig = ({ title = "" } = {}) => ({
  type: "scatter",
  data: {
    datasets: [],
  },
  options: {
    plugins: {
      title: {
        display: true,
        text: title,
      },
      tooltip: {
        callbacks: {
          label: ({ dataset, parsed }) => {
            return `${dataset.label}: (${parsed.x}, ${roundTo(3, parsed.y)})`;
          },
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
          text: "Average Runtime (ms)",
        },
      },
    },
  },
});
