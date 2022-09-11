import { LitElement, html, css } from "lit";
import { fromWorkerEvent } from "../shared.js";

const markToDataPoint = ({ n, duration }) => ({ x: n, y: duration });

class App extends LitElement {
  static properties = {
    isRunning: { state: true },
    workbenches: {},
    selectedWorkbench: { state: true },
    shouldShowGraph: { state: true },
  };

  static styles = css`
    :host > * + * {
      margin-top: var(--sl-spacing-small);
    }

    .heading {
      margin-bottom: var(--sl-spacing-small);
      text-align: center;
    }

    sl-card.full-width,
    sl-card.full-width::part(body) {
      width: 100%;
    }
  `;

  #addMarksToChart = (marks) => {
    marks.forEach((mark) => {
      this.#chartEl.addDatapointFor(mark.name, markToDataPoint(mark));
    });
  };

  #postMessage = (name, payload) => {
    this.worker.postMessage({ name, payload });
  };

  #clearChart = () => {
    this.#chartEl && this.#chartEl.reset();
  };

  #handleStop = () => {
    this.#postMessage("STOP_WORKBENCH");
    this.#clearChart();
    this.shouldShowGraph = false;
    this.isRunning = false;
  };

  #handleWorkbenchChange = (event) => {
    const workbenchName = event.detail;
    this.shouldShowGraph = false;
    this.selectedWorkbench = this.workbenches.find(
      ({ name }) => workbenchName === name
    );
  };

  #handleStart = () => {
    this.shouldShowGraph = true;
    this.isRunning = true;
    this.#clearChart();
    this.#postMessage("RUN_WORKBENCH", this.selectedWorkbench.name);
  };

  connectedCallback() {
    super.connectedCallback();

    this.worker = new Worker("src/worker.js", { type: "module" });
    this.isRunning = false;
    this.selectedWorkbench = null;
    this.shouldShowGraph = false;
    const newMarksObserver = fromWorkerEvent(this.worker, "NEW_MARKS");
    fromWorkerEvent(this.worker, "MARKSET_COMPLETE").subscribe(() => {
      // Render form for running asymptotic benchmarks
      this.isRunning = false;
    });

    newMarksObserver.subscribe(this.#addMarksToChart);
  }

  get #chartEl() {
    return this.renderRoot.querySelector("my-chart");
  }

  render() {
    return html`
      <abm-h class="heading" as="2" level="1">Asymptotic Analysis</abm-h>
      <workbench-form
        @start=${this.#handleStart}
        @stop=${this.#handleStop}
        @workbench-change=${this.#handleWorkbenchChange}
        .selectedWorkbench=${this.selectedWorkbench}
        .workbenches=${this.workbenches}
        ?isRunning=${this.isRunning}
      >
      </workbench-form>
      ${this.selectedWorkbench && this.shouldShowGraph
        ? html`
            <sl-card class="full-width">
              <div>
                <my-chart .title=${this.selectedWorkbench.name}></my-chart>
              </div>
            </sl-card>
          `
        : null}
    `;
  }
}

customElements.define("abm-app", App);
