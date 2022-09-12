import "./components/index.js";
import { render, html } from "lit";
import WORKBENCHES from "../build/workbenches.js";

render(
  html`
    <abm-app class="inner-spacing-small" .workbenches=${WORKBENCHES}> </abm-app>
  `,
  document.body
);
