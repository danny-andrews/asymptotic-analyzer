import { h } from "preact";
import * as R from "ramda";
import c from "./WorkbenchTable.module.css";
import { formatNumber } from "../shared.js";

const WorkbenchTable = ({ domain, subjects }) => {
  const domainStr = [R.head(domain), R.last(domain)]
    .filter(Boolean)
    .map(formatNumber)
    .join(" - ");

  return (
    <table class={c["workbench-details"]}>
      <tbody>
        <tr>
          <th>Functions</th>
          <td class={c["tag-cell"]}>
            {subjects.map((fn) => (
              <sl-tag size="small" type="neutral">
                {fn.name}
              </sl-tag>
            ))}
          </td>
        </tr>
        <tr>
          <th>Iterations</th>
          <td>100</td>
        </tr>
        <tr>
          <th>Domain</th>
          <td class={c["tag-cell"]}>
            <sl-dropdown>
              <sl-button size="small" slot="trigger" caret>
                {domainStr}
              </sl-button>
              <sl-menu>
                {domain.map((number) => (
                  <sl-menu-item value={number} disabled>
                    {formatNumber(number)}
                  </sl-menu-item>
                ))}
              </sl-menu>
            </sl-dropdown>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default WorkbenchTable;
