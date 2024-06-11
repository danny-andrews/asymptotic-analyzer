import type { ChangeEvent } from "preact/compat";
import c from "./WorkbenchForm.module.css";
import Subjects from "../Subjects/Subjects.jsx";
import type { Workbench, AnalysisTarget } from "../../../shared/types/index.js";

type PropTypes = {
  isRunning: boolean;
  selectedWorkbench: Workbench;
  analysisTarget: AnalysisTarget;
  onAnalysisTargetChange: (target: AnalysisTarget) => void;
  onStart: () => void;
  onStop: () => void;
}

const WorkbenchForm = ({
  isRunning,
  selectedWorkbench,
  analysisTarget,
  onAnalysisTargetChange,
  onStart,
  onStop,
}: PropTypes) => {
  const handleAnalysisTargetChanged = (event: ChangeEvent<HTMLInputElement>) => {
    onAnalysisTargetChange(event.currentTarget.value as AnalysisTarget);
  };

  const handleSubmit = (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!event.currentTarget.querySelector("[data-invalid]")) {
      onStart();
    }
  };

  return (
    <form class={c.form} onSubmit={handleSubmit}>
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
      <Subjects subjects={selectedWorkbench.subjects} />
      {isRunning ? (
        <sl-button
          class={c.fullWidth}
          variant="danger"
          size="small"
          onclick={onStop}
        >
          Stop
        </sl-button>
      ) : (
        <sl-button
          class={c.fullWidth}
          variant="success"
          size="small"
          type="submit"
        >
          Start
        </sl-button>
      )}
    </form>
  );
};

export default WorkbenchForm;
