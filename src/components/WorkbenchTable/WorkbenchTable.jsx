import { h, Fragment } from "preact";
import { useRef } from "preact/hooks";
import * as R from "ramda";
import c from "./WorkbenchTable.module.css";
import { formatNumber } from "../../shared.js";
import { iterations } from "../../signals";

const Subject = ({ fn }) => {
  const dialogRef = useRef(null);
  const showDialog = () => {
    dialogRef.current.show();
  };

  return (
    <>
      <sl-dialog ref={dialogRef} label="Source Code">
        <code>
          <pre>{fn.toString()}</pre>
        </code>
      </sl-dialog>
      <sl-button size="small" type="neutral" onClick={showDialog}>
        {fn.name}
      </sl-button>
    </>
  );
};

const WorkbenchTable = ({ domain, subjects, onIterationsChanged }) => {
  const domainStr = [R.head(domain), R.last(domain)]
    .filter(Boolean)
    .map(formatNumber)
    .join(" - ");

  const handleIterationsChanged = (event) => {
    const numIterations = Number(event.target.value);
    iterations.value = numIterations;
    console.log(iterations.value, "changed");
  };

  return (
    <table class={c["workbench-details"]}>
      <tbody>
        <tr>
          <th>Functions</th>
          <td class={c["tag-cell"]}>
            {subjects.map((fn) => (
              <Subject fn={fn} />
            ))}
          </td>
        </tr>
        <tr>
          <th>Iterations</th>
          <td>
            <sl-input
              size="small"
              type="number"
              value={iterations}
              onInput={handleIterationsChanged}
            />
          </td>
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
