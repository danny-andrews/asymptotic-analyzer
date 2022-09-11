import { LitElement, html, css } from "lit";

const SELECT_NAME = "workbench";

class WorkbenchForm extends LitElement {
  static properties = {
    workbenches: { type: Array },
    subjects: { type: Array },
    range: { type: Array },
    isRunning: { type: Boolean, reflect: true },
    workbenchName: { type: String, reflect: true },
    selectedWorkbench: { type: Object },
  };

  static styles = css`
    :host {
      display: block;
    }

    .heading {
      text-align: center;
    }

    .form > * + * {
      margin-top: var(--sl-spacing-small);
    }

    .form::part(base) {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .button-container {
      display: flex;
      gap: var(--sl-spacing-x-small);
      flex-wrap: wrap;
      margin-top: var(--sl-spacing-x-small);
    }

    .button-container sl-button {
      width: 100%;
    }

    @media (min-width: 900px) {
      .button-container {
        flex-wrap: nowrap;
      }
    }

    .workbench-controls {
      max-width: 500px;
      width: 100%;
    }

    .workbench-controls::part(body) {
      display: grid;
      grid-template-columns: 1fr;
      grid-template-rows: 1fr auto;
      align-items: center;
    }

    .workbench-controls::part(header) {
      padding: var(--sl-spacing-large);
      border-bottom: dashed var(--border-width) var(--border-color);
    }
  `;

  dispatch(name, data = null) {
    this.dispatchEvent(new CustomEvent(name, data ? { detail: data } : null));
  }

  #handleSubmit = () => {
    this.dispatch("start");
  };

  #handleWorkbenchChange = (event) => {
    this.dispatch("workbench-change", event.target.value);
  };

  render() {
    const options = [
      "---",
      ...this.workbenches.map((workbench) => workbench.name),
    ];
    const {
      name: workbenchName,
      subjects,
      range,
    } = this.selectedWorkbench || { name: "" };
    const shouldShowWorkbenchTable = Boolean(this.selectedWorkbench);

    const header = html`
      <sl-select
        @sl-change=${this.#handleWorkbenchChange}
        value=${workbenchName || "---"}
        name=${SELECT_NAME}
        label="Select a workbench"
        ?disabled=${this.isRunning}
      >
        ${options.map(
          (name) => html`<sl-menu-item value=${name}>${name}</sl-menu-item>`
        )}
      </sl-select>
    `;

    return html`
      <sl-form class="form" @sl-submit=${this.#handleSubmit}>
        <sl-card class="workbench-controls">
          ${shouldShowWorkbenchTable
            ? html`
                <div slot="header">
                  ${header}
                  <div class="button-container">
                    <sl-button
                      type="danger"
                      @click=${() => this.dispatch("stop")}
                      ?disabled=${!this.isRunning}
                    >
                      Stop
                    </sl-button>
                    <sl-button
                      submit
                      type="success"
                      ?loading=${this.isRunning}
                      ?disabled=${this.isRunning}
                    >
                      Start
                    </sl-button>
                  </div>
                </div>
                <workbench-table
                  .subjects=${subjects}
                  .range=${range}
                ></workbench-table>
              `
            : header}
        </sl-card>
      </sl-form>
    `;
  }
}

customElements.define("workbench-form", WorkbenchForm);
