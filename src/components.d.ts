import type SlCard from "@shoelace-style/shoelace/dist/components/card/card-component.js";
import type SlSelect from "@shoelace-style/shoelace/dist/components/select/select-component.js";
import type SlOption from "@shoelace-style/shoelace/dist/components/option/option-component.js";
import type SlButton from "@shoelace-style/shoelace/dist/components/button/button-component.js";
import type SlButtonGroup from "@shoelace-style/shoelace/dist/components/button-group/button-group-component.js";
import type SlInput from "@shoelace-style/shoelace/dist/components/input/input-component.js";
import type SlRadioButton from "@shoelace-style/shoelace/dist/components/radio-button/radio-button-component.js";
import type SlRadioGroup from "@shoelace-style/shoelace/dist/components/radio-group/radio-group-component.js";
import type SlTabGroup from "@shoelace-style/shoelace/dist/components/tab-group/tab-group-component.js";
import type SlTabPanel from "@shoelace-style/shoelace/dist/components/tab-panel/tab-panel-component.js";
import type SlTab from "@shoelace-style/shoelace/dist/components/tab/tab-component.js";
import type { JSX } from "preact";
import type { SLInputEvent } from "@shoelace-style/shoelace";

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
      "sl-select": WebComponentProps<SlSelect> & {
        "onsl-change": (e: SlInputEvent) => void;
      };
      "sl-option": WebComponentProps<SlOption>;
      "sl-button": WebComponentProps<SlButton> & {
        onclick?: (e: CustomEvent<never>) => void;
      };
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
