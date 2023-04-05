import { h, Fragment } from "preact";
import Race from "../Race/Race.jsx";
import { fromWorkerEvent } from "../../shared.js";

const { default: workbenches } = await import("/test/workbenches.js");

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

  return (
    <main>
      <Race workbenches={workbenches} runner={runner} />
    </main>
  );
};

export default App;
