import "./components/index.ts";
import "./styles/app.css";
import App from "./components/App/App.jsx";
import { render, h } from "preact";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";

hljs.registerLanguage("javascript", javascript);

render(h(App, null), document.body);
