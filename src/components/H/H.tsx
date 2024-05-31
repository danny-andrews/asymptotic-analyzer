import type { ComponentChildren } from "preact";
import c from "./H.module.css";

type HeadingLevels = 1 | 2 | 3 | 4 | 5 | 6;

type PropTypes = {
  level: HeadingLevels,
  as: HeadingLevels,
  children: ComponentChildren,
};

const H = ({ level, as, children }: PropTypes) => {
  const Tag = `h${level}`;
  const className = c[`h${as || level}`];

  // @ts-ignore
  return <Tag class={className}>{children}</Tag>;
};

export default H;
