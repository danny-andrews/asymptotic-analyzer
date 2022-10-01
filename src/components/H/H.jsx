import { h } from "preact";
import c from "./H.module.css";

const H = ({ level, as, children }) => {
  const Tag = `h${level}`;
  const className = c[`h${as || level}`];

  return <Tag class={className}>{children}</Tag>;
};

export default H;
