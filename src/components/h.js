import { LitElement, css } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

class H extends LitElement {
  static properties = {
    level: { type: Number, reflect: true },
    as: { type: Number, reflect: true },
  };

  static styles = css`
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      margin: 0;
      padding: 0;
      margin-bottom: var(--sl-spacing-x-small);
    }

    .h1 {
      font-size: var(--sl-font-size-4x-large);
    }

    .h2 {
      font-size: var(--sl-font-size-3x-large);
    }

    .h3 {
      font-size: var(--sl-font-size-2x-large);
    }

    .h4 {
      font-size: var(--sl-font-size-x-large);
    }

    .h5 {
      font-size: var(--sl-font-size-large);
    }

    .h6 {
      font-size: var(--sl-font-size-medium);
    }
  `;

  render() {
    const as = this.as || this.level;
    const tag = `h${this.level}`;
    const className = `h${as}`;

    return unsafeHTML(
      `<${tag} class=${className}>
        <slot></slot>
      </${tag}>`
    );
  }
}

customElements.define("abm-h", H);
