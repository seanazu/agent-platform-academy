import CodeBlock from '../CodeBlock';
import CommandBlock from '../CommandBlock';
import CopyButton from '../CopyButton';
import Terminal from '../Terminal';
import { findLesson } from '../../lib/course';
import { getCard } from '../../lib/cards';
import { href } from '../../lib/router';
import type { CardStep } from '../../lib/types';

function Steps({ steps }: { steps: CardStep[] }) {
  return (
    <ol className="card-steps">
      {steps.map((s, i) => (
        <li key={i}>
          <p>{s.do}</p>
          {s.cmd && <CommandBlock command={s.cmd} />}
          {s.see && <Terminal text={s.see} />}
        </li>
      ))}
    </ol>
  );
}

// A "do this ticket" guide: everything needed to pick up one ticket and finish it, separate from the lesson that
// teaches the idea behind it.
function TicketCardPage({ ticketKey }: { ticketKey: string }) {
  const card = getCard(ticketKey);
  if (!card) {
    return (
      <div className="empty">
        <h1>No card for {ticketKey} yet</h1>
        <p><a href={href.tickets(ticketKey)}>See the ticket in the ticket map</a></p>
      </div>
    );
  }
  const lesson = findLesson(card.lesson);
  return (
    <article className="card-page" data-accent={lesson?.part.accent}>
      <header className="card-head">
        <a className="eyebrow" href={href.tickets(card.key)}>Ticket {card.key}</a>
        <h1>{card.title}</h1>
        <p className="card-goal">{card.goal}</p>
        <p className="card-outcome"><b>When it's done:</b> {card.outcome}</p>
        {lesson && <p className="card-lesson">Learn the idea first: <a href={href.lesson(card.lesson)}>{lesson.lesson.title}</a></p>}
      </header>

      <section className="card-prompt">
        <div className="card-prompt-head">
          <h2>Do it with Claude Code</h2>
          <CopyButton text={card.prompt} label="Copy prompt" />
        </div>
        <pre>{card.prompt}</pre>
      </section>

      <div className="card-grid">
        <section>
          <h2>Before you start</h2>
          {card.dependsOn.length > 0 && (
            <>
              <h3>Must be merged first</h3>
              <ul className="card-list">
                {card.dependsOn.map((d) => (
                  <li key={d.key}>
                    <a href={href.card(d.key)}>{d.key}</a> {d.why}
                    {d.proof && <CommandBlock command={d.proof} />}
                  </li>
                ))}
              </ul>
            </>
          )}
          {card.access.length > 0 && (
            <>
              <h3>Access you need</h3>
              <ul className="card-list">
                {card.access.map((a) => (
                  <li key={a.what}>{a.what} <span className="muted">· {a.who}</span></li>
                ))}
              </ul>
            </>
          )}
          {card.decide.length > 0 && (
            <>
              <h3>Decide first</h3>
              <ul className="card-list">
                {card.decide.map((d) => (
                  <li key={d.q}>
                    <b>{d.q}</b> Ask {d.owner}. If nobody answers: {d.fallback}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
        {card.gaps.length > 0 && (
          <section className="card-gaps">
            <h2>Gaps in the plan</h2>
            <ul className="card-list">
              {card.gaps.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <section>
        <h2>Steps</h2>
        <Steps steps={card.steps} />
      </section>

      {card.files.length > 0 && (
        <section className="card-files">
          <h2>The code</h2>
          {card.files.map((f) => (
            <div key={f.path} className="card-file">
              <p><code>{f.path}</code> {f.what}</p>
              {f.code && <CodeBlock code={{ ...f.code, notes: f.code.notes ?? [] }} />}
            </div>
          ))}
        </section>
      )}

      <section>
        <h2>Prove it works</h2>
        <Steps steps={card.prove} />
      </section>

      <div className="card-grid">
        <section>
          <h2>Pull request checklist</h2>
          <ul className="card-checklist">
            {card.pr.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2>If it goes wrong</h2>
          <p>{card.rollback}</p>
        </section>
      </div>
    </article>
  );
}

export default TicketCardPage;
