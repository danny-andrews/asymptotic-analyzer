import { h, Fragment } from "preact";
import { useRef, useEffect } from "preact/hooks";
import hljs from "highlight.js/lib/core";
import c from "./WorkbenchTable.module.css";
import { iterations } from "../../signals";

const Subject = ({ fn }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    hljs.highlightElement(dialogRef.current.querySelector("pre code"));
  }, []);

  const showDialog = () => {
    dialogRef.current.show();
  };

  return (
    <>
      <sl-dialog ref={dialogRef} label="Source Code">
        <pre>
          <code>{fn.toString()}</code>
        </pre>
      </sl-dialog>
      <sl-tooltip content="View source code">
        <sl-button size="small" type="neutral" onClick={showDialog}>
          {fn.name}
        </sl-button>
      </sl-tooltip>
    </>
  );
};

const WorkbenchTable = ({ subjects }) => {
  const handleIterationsChanged = (event) => {
    const numIterations = Number(event.target.value);
    iterations.value = numIterations;
  };

  return (
    <table class={c["workbench-details"]}>
      <tbody>
        <tr>
          <th>Functions</th>
          <td class={c["tag-cell"]}>
            {subjects.map((fn) => (
              <Subject key={fn.toString()} fn={fn} />
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
      </tbody>
    </table>
  );
};

export default WorkbenchTable;
