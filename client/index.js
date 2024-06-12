import "./components/shoelace.ts";
import "./styles/app.css";
import App from "./components/App/App.tsx";
import { render, h } from "preact";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";

hljs.registerLanguage("javascript", javascript);

render(h(App, null), document.body);
