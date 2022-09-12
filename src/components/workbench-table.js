import { LitElement, html, css } from "lit";
import * as R from "ramda";
import { formatNumber } from "../shared.js";

class WorkbenchTable extends LitElement {
  static styles = css`
    :host {
      --border: 1px solid var(--border-color);
      --border-radius: var(--sl-input-border-radius-medium);

      display: block;
    }

    h2 {
      margin: 0;
    }

    .workbench-details th {
      /* Ensures th shrinks to smallest possible size. */
      width: 1px;
    }

    sl-tag::part(base) {
      line-height: 1;
      user-select: auto;
    }

    .tag-cell {
      display: flex;
      gap: var(--sl-spacing-2x-small);
      flex-wrap: wrap;
    }

    table {
      border-spacing: 0;
      border: var(--border);
      border-radius: var(--border-radius);
      width: 100%;
    }

    th + td {
      border-left: var(--border);
    }

    tr + tr > th,
    tr + tr > td {
      border-top: var(--border);
    }

    th,
    td {
      padding: var(--sl-spacing-x-small);
    }

    tr:nth-child(even) {
      background: var(--sl-color-neutral-50);
    }

    .heading {
      background: var(--sl-color-neutral-50);
      border-bottom: var(--border);
      border-top-left-radius: var(--border-radius);
      border-top-right-radius: var(--border-radius);
    }
  `;

  static properties = {
    subjects: { type: Array },
    domain: { type: Array },
  };

  render() {
    const domainStr = [R.head(this.domain), R.last(this.domain)]
      .filter(Boolean)
      .map(formatNumber)
      .join(" - ");

    return html`
      <table class="workbench-details">
        <thead>
          <tr>
            <th class="heading" colspan="2">Workbench Details</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Functions</th>
            <td class="tag-cell">
              ${this.subjects.map(
                (fn) =>
                  html`<sl-tag size="small" type="neutral">${fn.name}</sl-tag>`
              )}
            </td>
          </tr>
          <tr>
            <th>Iterations</th>
            <td>100</td>
          </tr>
          <tr>
            <th>Domain</th>
            <td class="tag-cell">
              <sl-dropdown>
                <sl-button size="small" slot="trigger" caret>
                  ${domainStr}
                </sl-button>
                <sl-menu>
                  ${this.domain.map(
                    (number) => html`
                      <sl-menu-item value=${number} disabled>
                        ${formatNumber(number)}
                      </sl-menu-item>
                    `
                  )}
                </sl-menu>
              </sl-dropdown>
            </td>
          </tr>
        </tbody>
      </table>
    `;
  }
}

customElements.define("workbench-table", WorkbenchTable);
