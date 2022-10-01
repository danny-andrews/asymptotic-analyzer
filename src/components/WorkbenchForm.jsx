import { h, Fragment } from "preact";
import WorkbenchTable from "./WorkbenchTable.jsx";
import c from "./WorkbenchForm.module.css";

const WorkbenchForm = ({
  isRunning,
  selectedWorkbench,
  workbenches,
  onStart,
  onStop,
  onWorkbenchChange,
}) => {
  const options = ["---", ...workbenches.map((workbench) => workbench.name)];
  const {
    name: workbenchName,
    subjects,
    domain,
  } = selectedWorkbench || { name: "" };
  const shouldShowWorkbenchTable = Boolean(selectedWorkbench);

  const handleSubmit = (e) => {
    e.preventDefault();
    onStart();
  };

  const handleWorkbenchChange = (event) => {
    onWorkbenchChange(event.target.value);
  };

  const header = (
    <sl-select
      onsl-change={handleWorkbenchChange}
      value={workbenchName || "---"}
      name="workbench"
      label="Select a workbench"
      disabled={isRunning}
    >
      {options.map((name) => (
        <sl-menu-item value={name}>{name}</sl-menu-item>
      ))}
    </sl-select>
  );

  return (
    <form class={c.form} onsubmit={handleSubmit}>
      <sl-card class={c["workbench-controls"]}>
        {header}
        {shouldShowWorkbenchTable && (
          <>
            <WorkbenchTable
              subjects={subjects}
              domain={domain}
            ></WorkbenchTable>
            <div class={c["button-container"]}>
              <sl-button
                variant="danger"
                onclick={onStop}
                disabled={!isRunning}
              >
                Stop
              </sl-button>
              <sl-button
                submit
                variant="success"
                type="submit"
                loading={isRunning}
                disabled={isRunning}
              >
                Start
              </sl-button>
            </div>
          </>
        )}
      </sl-card>
    </form>
  );
};

export default WorkbenchForm;
