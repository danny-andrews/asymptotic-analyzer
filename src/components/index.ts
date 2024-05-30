// Shoelace components
import SlCard from "@shoelace-style/shoelace/dist/components/card/card.js";
import SlSelect from "@shoelace-style/shoelace/dist/components/select/select.js";
import SlOption from "@shoelace-style/shoelace/dist/components/option/option.js";
import SlButton from "@shoelace-style/shoelace/dist/components/button/button.js";
import SlButtonGroup from "@shoelace-style/shoelace/dist/components/button-group/button-group.js";
import SlInput from "@shoelace-style/shoelace/dist/components/input/input.js";
import SlRadioButton from "@shoelace-style/shoelace/dist/components/radio-button/radio-button.js";
import SlRadioGroup from "@shoelace-style/shoelace/dist/components/radio-group/radio-group.js";
import SlTabGroup from "@shoelace-style/shoelace/dist/components/tab-group/tab-group.js";
import SlTabPanel from "@shoelace-style/shoelace/dist/components/tab-panel/tab-panel.js";
import SlTab from "@shoelace-style/shoelace/dist/components/tab/tab.js";
import type { JSX } from "preact";

type ElementProps<I> = Partial<Omit<I, keyof HTMLElement>>;

type DefaultProps<I extends HTMLElement> = Omit<
  JSX.DetailedHTMLProps<JSX.HTMLAttributes<I>, I>,
  keyof ElementProps<I>
>;

type WebComponentProps<I extends HTMLElement> = DefaultProps<I> &
  ElementProps<I>;

declare module "preact" {
  namespace JSX {
    interface IntrinsicElements {
      "sl-card": WebComponentProps<SlCard>;
      "sl-select": WebComponentProps<SlSelect>;
      "sl-option": WebComponentProps<SlOption>;
      "sl-button": WebComponentProps<SlButton>;
      "sl-button-group": WebComponentProps<SlButtonGroup>;
      "sl-input": WebComponentProps<SlInput>;
      "sl-radio-button": WebComponentProps<SlRadioButton>;
      "sl-radio-group": WebComponentProps<SlRadioGroup>;
      "sl-tab-group": WebComponentProps<SlTabGroup>;
      "sl-tab-panel": WebComponentProps<SlTabPanel>;
      "sl-tab": WebComponentProps<SlTab>;
    }
  }
}
