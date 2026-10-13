import { useState } from 'react';
import CommandBlock from './CommandBlock';
import Stack from './Stack';
import Terminal from './Terminal';
import type { Lab as LabData } from '../lib/types';

const TABS = ['Worked', 'Faded', 'Alone'] as const;

function Lab({ lab }: { lab: LabData }) {
  const [tab, setTab] = useState(0);
  return (
    <section className="lab" data-stable="lab" aria-labelledby="lab-title">
      <div className="lab-head">
        <h3 id="lab-title">{lab.title}</h3>
        <ul className="lab-needs" aria-label="You need">
          {lab.youNeed.map((item) => (
            <li key={item} className="chip" data-tone="soft">{item}</li>
          ))}
        </ul>
      </div>
      <div className="tabs" role="tablist" aria-label="Lab rungs">
        {TABS.map((name, i) => (
          <button
            key={name}
            type="button"
            role="tab"
            id={`lab-tab-${i}`}
            aria-selected={tab === i}
            aria-controls={`lab-pane-${i}`}
            className="tab"
            onClick={() => setTab(i)}
          >
            <span className="tab-n">{i + 1}</span>
            {name}
          </button>
        ))}
      </div>
      <Stack index={tab} className="lab-panes">
        {[
          <div key="w" role="tabpanel" id="lab-pane-0" aria-labelledby="lab-tab-0" className="lab-pane">
            <p className="lab-lead">Follow along. Every command, and what you should see.</p>
            <ol className="lab-steps">
              {lab.worked.map((s, i) => (
                <li key={i} className="lab-step">
                  <CommandBlock command={s.do} />
                  <Terminal text={s.see} />
                </li>
              ))}
            </ol>
          </div>,
          <div key="f" role="tabpanel" id="lab-pane-1" aria-labelledby="lab-tab-1" className="lab-pane">
            <p className="lab-lead">The same task, with the last part left to you.</p>
            <p className="lab-text">{lab.faded}</p>
          </div>,
          <div key="a" role="tabpanel" id="lab-pane-2" aria-labelledby="lab-tab-2" className="lab-pane">
            <p className="lab-lead">A new task of the same shape. No help this time.</p>
            <p className="lab-text">{lab.alone}</p>
          </div>,
        ]}
      </Stack>
      <p className="lab-done"><b>Done when:</b> {lab.done}</p>
    </section>
  );
}

export default Lab;
