import Chart from "./init.js";
import { LitElement, html, css } from "lit";
import { roundTo } from "../shared.js";

const makeChartConfig = ({
  title = "",
  displayXTicks = true,
  datasets = [],
} = {}) => ({
  type: "scatter",
  data: {
    datasets,
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
          display: displayXTicks,
        },
      },
      y: {
        title: {
          display: true,
          text: "Runtime (ms)",
        },
      },
    },
  },
});

const createDataset = ({ num, label, data }) => ({
  borderColor: CHART_COLORS[num],
  backgroundColor: CHART_COLORS[num],
  showLine: true,
  label,
  data,
});

const CHART_COLORS = [
  "rgb(80, 227, 133)",
  "rgb(102, 170, 255",
  "rgb(254, 118, 118)",
  "rgb(255, 209, 30)",
  "rgb(197, 137, 255)",
  "rgb(255, 151, 65)",
];

export default class MyChart extends LitElement {
  static properties = {
    title: { reflect: true },
    datasets: {},
  };

  static styles = css`
    :host {
      display: block;
    }
  `;

  firstUpdated() {
    const { title, datasets } = this;
    this.canvas = this.shadowRoot.querySelector("canvas");
    this.chart = new Chart(
      this.canvas.getContext("2d"),
      makeChartConfig({ title, datasets })
    );
    const updateAspectRatio = () => {
      this.chart.options.aspectRatio = window.innerWidth / window.innerHeight;
      this.chart.update();
    };
    window.addEventListener("resize", updateAspectRatio);
    updateAspectRatio();
  }

  willUpdate(changedProperties) {
    if (changedProperties.has("title") && this.chart) {
      this.chart.config.options.plugins.title.text = this.title;
      this.chart.update();
    }
  }

  reset() {
    this.chart.data.datasets = [];
    this.chart.update();
  }

  addDatapointFor(label, datapoint) {
    const chartDatasets = this.chart.data.datasets;
    const existingDatasetIndex = chartDatasets.findIndex(
      (dataset) => dataset.label === label
    );

    if (existingDatasetIndex !== -1) {
      chartDatasets[existingDatasetIndex].data.push(datapoint);
    } else {
      chartDatasets.push(
        createDataset({
          num: chartDatasets.length,
          label,
          data: [datapoint],
        })
      );
    }
    this.chart.update();
  }

  render() {
    return html`<canvas></canvas>`;
  }
}

customElements.define("my-chart", MyChart);
