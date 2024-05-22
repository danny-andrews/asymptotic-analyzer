import { memo } from "preact/compat";
import { useRef, useEffect } from "preact/hooks";
import hljs from "highlight.js/lib/core";
import c from "./Subjects.module.css";

const Subjects = memo(({ subjects }) => {
  const rootRef = useRef(null);

  useEffect(() => {
    for (let element of rootRef.current.querySelectorAll("pre code")) {
      hljs.highlightElement(element);
    }
    rootRef.current.show(subjects[0].name);
  }, [subjects]);

  return (
    <sl-tab-group class={c.root} ref={rootRef}>
      {subjects.map((subject) => (
        <sl-tab key={subject.name} slot="nav" panel={subject.name}>
          {subject.name}
        </sl-tab>
      ))}

      {subjects.map((subject) => (
        <sl-tab-panel key={subject.name} name={subject.name}>
          <pre>
            <code>{subject.toString()}</code>
          </pre>
        </sl-tab-panel>
      ))}
    </sl-tab-group>
  );
});

export default Subjects;
