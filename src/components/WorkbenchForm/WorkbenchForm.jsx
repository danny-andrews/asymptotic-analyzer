import { serialize } from "@shoelace-style/shoelace/dist/utilities/form.js";
import { useSignal } from "@preact/signals";
import c from "./WorkbenchForm.module.css";
import Subjects from "../Subjects/Subjects.jsx";
import { DEFAULT_ITERATIONS } from "../../shared/index.js";

const WorkbenchForm = ({
  isRunning,
  selectedWorkbench,
  analysisTarget,
  onAnalysisTargetChange,
  onStart,
  onStop,
}) => {
  const iterations = useSignal(DEFAULT_ITERATIONS);

  const handleAnalysisTargetChanged = (event) => {
    onAnalysisTargetChange(event.target.value);
  };

  const handleIterationsChanged = (event) => {
    iterations.value = Number(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!event.target.querySelector("[data-invalid]")) {
      onStart(serialize(event.target));
    }
  };

  return (
    <form onsubmit={handleSubmit}>
      <div class={c.fieldset}>
        <sl-radio-group
          label="Analysis Target(s)"
          name="analysis-target"
          size="small"
          value={analysisTarget}
          onsl-change={handleAnalysisTargetChanged}
        >
          <sl-radio-button disabled={isRunning} value="time">
            Time
          </sl-radio-button>
          <sl-radio-button disabled={isRunning} value="space">
            Space
          </sl-radio-button>
          <sl-radio-button disabled={isRunning} value="time-and-space">
            Time + Space
          </sl-radio-button>
        </sl-radio-group>
        <sl-input
          name="iterations"
          label="Iterations"
          size="small"
          type="number"
          value={iterations}
          disabled={isRunning}
          noSpinButtons
          required
          min={10}
          helpText="Must be 10 or greater."
          onInput={handleIterationsChanged}
        />
        <div class={c.buttonContainer}>
          <sl-button
            class={c.fullWidth}
            variant="danger"
            size="small"
            onclick={onStop}
            disabled={!isRunning}
          >
            Stop
          </sl-button>
          <sl-button
            class={c.fullWidth}
            variant="success"
            size="small"
            type="submit"
            loading={isRunning}
            disabled={isRunning}
          >
            Start
          </sl-button>
        </div>
        <Subjects class={c.subjects} subjects={selectedWorkbench.subjects} />
      </div>
    </form>
  );
};

export default WorkbenchForm;
