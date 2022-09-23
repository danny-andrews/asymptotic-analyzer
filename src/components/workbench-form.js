import { LitElement, html, css } from "lit";

const SELECT_NAME = "workbench";

class WorkbenchForm extends LitElement {
  static properties = {
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

    .workbench-controls > * + * {
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
      width: 100%;
    }

    .workbench-controls::part(body) {
      display: grid;
      grid-template-columns: 1fr;
      grid-template-rows: 1fr auto;
      align-items: center;
    }
  `;

  dispatch(name, data = null) {
    this.dispatchEvent(new CustomEvent(name, data ? { detail: data } : null));
  }

  #handleSubmit = (e) => {
    e.preventDefault();
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
      domain,
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
      <form class="form" @submit=${this.#handleSubmit}>
        <sl-card class="workbench-controls">
          ${shouldShowWorkbenchTable
            ? html`
                ${header}
                <workbench-table
                  .subjects=${subjects}
                  .domain=${domain}
                ></workbench-table>
                <div class="button-container">
                  <sl-button
                    variant="danger"
                    @click=${() => this.dispatch("stop")}
                    ?disabled=${!this.isRunning}
                  >
                    Stop
                  </sl-button>
                  <sl-button
                    submit
                    variant="success"
                    type="submit"
                    ?loading=${this.isRunning}
                    ?disabled=${this.isRunning}
                  >
                    Start
                  </sl-button>
                </div>
              `
            : header}
        </sl-card>
      </form>
    `;
  }
}

customElements.define("workbench-form", WorkbenchForm);
