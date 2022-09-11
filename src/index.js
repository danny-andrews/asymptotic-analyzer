import "./components/index.js";
import { render, html } from "lit";
import { getWorkbenches } from "../build/workbenches.js";

render(
  html`
    <abm-app class="inner-spacing-small" .workbenches=${getWorkbenches()}>
    </abm-app>
  `,
  document.getElementById("main")
);
