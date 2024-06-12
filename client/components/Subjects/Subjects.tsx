import { memo } from "preact/compat";
import { useRef, useEffect } from "preact/hooks";
import hljs from "highlight.js/lib/core";
import c from "./Subjects.module.css";
import type { Subject } from "../../../core/types.js";
import type { SlTabGroup } from "@shoelace-style/shoelace";

type PropTypes = {
  subjects: Subject[];
};

const Subjects = memo(({ subjects }: PropTypes) => {
  const rootRef = useRef<SlTabGroup>(null);

  useEffect(() => {
    if (rootRef.current === null) return;

    for (const element of rootRef.current.querySelectorAll<HTMLElement>(
      "pre code",
    )) {
      hljs.highlightElement(element);
    }

    rootRef.current.show(subjects[0].name);
  }, [subjects]);

  return (
    <div>
      <div class={c.label}>Subjects</div>
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
    </div>
  );
});

export default Subjects;
