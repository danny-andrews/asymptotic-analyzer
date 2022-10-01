import { h, Fragment } from "preact";
import { useState, useEffect } from "preact/hooks";
import workbenches from "../../../build/workbenches.js";
import c from "./App.module.css";
import Race from "../Race/Race.jsx";
import H from "../H/H.jsx";

const App = () => {
  const [worker, setWorker] = useState(null);

  useEffect(() => {
    setWorker(new Worker("src/worker.js", { type: "module" }));
  }, []);

  return (
    <>
      <header>
        <H class={c.heading} as="3" level="1">
          Asymptotic Analysis
        </H>
      </header>
      <main>
        <sl-tab-group class={c["action-tab-group"]}>
          <sl-tab slot="nav" panel="race">
            Race
          </sl-tab>
          <sl-tab slot="nav" panel="analyze">
            Analyze
          </sl-tab>

          <sl-tab-panel name="race">
            <Race workbenches={workbenches} worker={worker} />
          </sl-tab-panel>
          <sl-tab-panel name="analyze">[Analysis Form Here]</sl-tab-panel>
        </sl-tab-group>
      </main>
    </>
  );
};

export default App;
