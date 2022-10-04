import { h, Fragment } from "preact";
import c from "./App.module.css";
import Race from "../Race/Race.jsx";
import { fromWorkerEvent, validateWorkbenches } from "../../shared.js";

const { default: workbenches } = await import("/workbenches.js");

const worker = new Worker(new URL("../../worker.js", import.meta.url), {
  type: "module",
});

const Runner = () => {
  const postMessage = (name, payload) => {
    worker.postMessage({ name, payload });
  };

  return {
    runWorkbench: (workbenchName, iterations) => {
      postMessage("RUN_WORKBENCH", { workbenchName, iterations });

      return fromWorkerEvent(worker, "NEW_MARKS", "MARKSET_COMPLETE");
    },
    stopWorkbench: () => {
      postMessage("STOP_WORKBENCH");
    },
  };
};

const App = () => {
  const runner = Runner();
  try {
    validateWorkbenches(workbenches);
  } catch (e) {
    return <p>{e.message}</p>;
  }

  return (
    <main>
      <sl-tab-group class={c["action-tab-group"]}>
        <sl-tab slot="nav" panel="race">
          Race
        </sl-tab>
        <sl-tab slot="nav" panel="analyze">
          Analyze
        </sl-tab>

        <sl-tab-panel name="race">
          <Race workbenches={workbenches} runner={runner} />
        </sl-tab-panel>
        <sl-tab-panel name="analyze">[Analysis Form Here]</sl-tab-panel>
      </sl-tab-group>
    </main>
  );
};

export default App;
