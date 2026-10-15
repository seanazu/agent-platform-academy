import { useState } from 'react';
import CodeBlock from '../CodeBlock';
import CommandBlock from '../CommandBlock';
import Terminal from '../Terminal';
import type { LabV2 } from '../../lib/types';

type Props = { lab: LabV2; passed: boolean; guess?: number; onGuess: (option: number) => void; onPass: () => void };

const passCode = async (id: string): Promise<string> => {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`apa:${id}`));
  const hex = [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `APA-${id}-${hex.slice(0, 6)}`;
};

// The lab as five plain steps. Everything runs on the learner's laptop through ./academy, and the check prints a
// pass code that marks the lab done here.
function LabSteps({ lab, passed, guess, onGuess, onPass }: Props) {
  const guided = lab.mode === 'guided';
  const [code, setCode] = useState('');
  const [wrong, setWrong] = useState(false);

  const submit = async () => {
    const ok = code.trim().toUpperCase() === (await passCode(lab.id)).toUpperCase();
    setWrong(!ok);
    if (ok) onPass();
  };

  return (
    <section className="lab2" data-stable="lab" aria-labelledby="lab-title">
      <header className="lab2-head">
        <div>
          <h3 id="lab-title">{lab.title}</h3>
          <p className="lab2-goal">{lab.goal}</p>
        </div>
        <ul className="lab-needs" aria-label="You need">
          <li className="chip" data-tone="soft">about {lab.minutes} min</li>
          {lab.needs.map((item) => (
            <li key={item} className="chip" data-tone="soft">{item}</li>
          ))}
        </ul>
      </header>

      {guided ? (
        <div className="lab2-start">
          <p>A guided lab: you run real commands on your laptop and check your result against the list in step 3. Nothing touches company systems.</p>
        </div>
      ) : (
        <div className="lab2-start">
          <p>Everything happens on your laptop, in <code>~/academy-labs</code>. From the course folder, start the lab:</p>
          <CommandBlock command={`./academy lab ${lab.id}`} />
          <details className="lab2-setup">
            <summary>First time? Get the course folder</summary>
            <CommandBlock command="git clone https://github.com/seanazu/agent-platform-academy.git && cd agent-platform-academy" />
          </details>
        </div>
      )}

      <ol className="lab2-steps">
        <li className="lab2-step">
          <p className="lab2-step-name"><span>1</span>Guess</p>
          <p className="lab2-step-text">{lab.guess.q}</p>
          <div className="lab2-guess" role="group" aria-label="Your guess">
            {lab.guess.options.map((o, oi) => (
              <button
                key={oi}
                type="button"
                className="quiz-option"
                aria-pressed={guess === oi}
                data-mark={guess === undefined ? undefined : o.correct ? 'right' : guess === oi ? 'wrong' : undefined}
                onClick={() => onGuess(oi)}
              >
                <span className="quiz-letter">{String.fromCharCode(65 + oi)}</span>
                <span>{o.text}</span>
              </button>
            ))}
          </div>
          <div className="lab2-why" aria-live="polite">
            <p data-on={guess === undefined || undefined}>Commit to a guess before you run anything. You will see if you were right in the next step.</p>
            {lab.guess.options.map((o, oi) => (
              <p key={oi} data-on={guess === oi || undefined}>{o.correct ? 'Right.' : 'Not quite.'} {o.why}</p>
            ))}
          </div>
        </li>

        <li className="lab2-step">
          <p className="lab2-step-name"><span>2</span>Follow along</p>
          <ol className="lab2-follow">
            {lab.follow.map((s, i) => (
              <li key={i}>
                <p>{s.say}</p>
                {s.do && <CommandBlock command={s.do} />}
                {s.see && <Terminal text={s.see} />}
              </li>
            ))}
          </ol>
        </li>

        <li className="lab2-step">
          <p className="lab2-step-name"><span>3</span>Build it</p>
          <p className="lab2-step-text">{lab.build}</p>
          {guided ? (
            <>
              {lab.checks && lab.checks.length > 0 && (
                <ul className="lab2-checks" aria-label="Check yourself">
                  {lab.checks.map((c) => <li key={c}>{c}</li>)}
                </ul>
              )}
              {lab.solution && (
                <details className="lab2-setup">
                  <summary>Stuck? Show one possible solution</summary>
                  <CodeBlock code={{ ...lab.solution, notes: lab.solution.notes ?? [] }} />
                </details>
              )}
            </>
          ) : (
            <>
              <CommandBlock command="./academy check" />
              <p className="lab2-small">Stuck? <code>./academy hint</code> gives one hint at a time. <code>./academy diff</code> shows the solution next to your code.</p>
            </>
          )}
        </li>

        {lab.fix && (
          <li className="lab2-step">
            <p className="lab2-step-name"><span>4</span>Fix it</p>
            <p className="lab2-step-text">{lab.fix}</p>
            {!guided && <CommandBlock command="./academy check --fix" />}
          </li>
        )}

        <li className="lab2-step">
          <p className="lab2-step-name"><span>{lab.fix ? 5 : 4}</span>Explain it</p>
          <ul className="lab2-explain">
            {lab.explain.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
          {guided ? (
            <p className="lab2-small">Write your three answers down, then paste them into Claude with "Check my understanding of {lab.title}: what did I miss?"</p>
          ) : (
            <>
              <CommandBlock command="./academy explain" />
              <p className="lab2-small">It saves your answers and prints a prompt you can paste into Claude to find what you missed.</p>
            </>
          )}
        </li>
      </ol>

      <div className="lab2-done" data-passed={passed || undefined}>
        <p><b>Done when:</b> {lab.done}</p>
        {passed ? (
          <p className="lab2-passed">✓ Lab passed</p>
        ) : guided ? (
          <button type="button" className="btn" onClick={onPass}>I finished this lab</button>
        ) : (
          <form
            className="lab2-code"
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            <label htmlFor={`pass-${lab.id}`}>Pass code from <code>./academy check</code></label>
            <input id={`pass-${lab.id}`} value={code} onChange={(e) => setCode(e.target.value)} placeholder={`APA-${lab.id}-……`} autoComplete="off" spellCheck={false} />
            <button type="submit" className="btn">Mark lab passed</button>
            <span className="lab2-wrong" aria-live="polite">{wrong ? 'That code does not match this lab.' : ' '}</span>
          </form>
        )}
      </div>
    </section>
  );
}

export default LabSteps;
