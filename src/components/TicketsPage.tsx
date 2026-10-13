import { useEffect, useMemo, useState } from 'react';
import Chip from './Chip';
import ProgressBar from './ProgressBar';
import { course, goalOfTicket, partTeaching } from '../lib/course';
import { useProgress } from '../lib/progress';
import { href } from '../lib/router';
import { useGrowOnly } from '../lib/stable';
import { TEAM_LABELS, teamLabel, useTickets } from '../lib/tickets';

const goals = course.parts.filter((p) => p.kind === 'walkthrough');

function TicketsPage({ focusKey }: { focusKey?: string }) {
  const state = useTickets();
  const { progress } = useProgress();
  const [goal, setGoal] = useState<string>('all');
  const [team, setTeam] = useState<string>('all');
  const listRef = useGrowOnly<HTMLDivElement>();

  const tickets = state.status === 'ready' ? state.tickets : [];
  const canDo = useMemo(
    () => tickets.filter((t) => {
      const ref = partTeaching(t.key);
      return ref ? progress.done[ref.lesson.id] === true : false;
    }).length,
    [tickets, progress],
  );

  useEffect(() => {
    if (!focusKey || state.status !== 'ready') return;
    const g = goalOfTicket(focusKey);
    if (goal !== 'all' && goal !== g) setGoal('all');
    const el = document.getElementById(`ticket-${focusKey}`);
    if (el) el.scrollIntoView({ block: 'center' });
  }, [focusKey, state.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const visible = tickets.filter((t) => (goal === 'all' || goalOfTicket(t.key) === goal) && (team === 'all' || t.team.includes(team)));
  const grouped = goals
    .map((p) => ({ part: p, items: visible.filter((t) => goalOfTicket(t.key) === p.id) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="tickets-page">
      <header className="page-head">
        <span className="eyebrow">Ticket map</span>
        <h1>Every ticket, and the lesson that teaches it</h1>
        <p className="page-lead">The platform is {course.ticketCount} tickets in nine goals. Finish a lesson and the tickets it covers turn green.</p>
        <div className="tickets-progress" data-testid="tickets-progress">
          <span>You can do <b>{canDo}</b> of {course.ticketCount} tickets</span>
          <ProgressBar value={canDo} max={course.ticketCount} />
        </div>
      </header>

      <div className="filters">
        <div className="filter-row" role="group" aria-label="Filter by goal">
          <span className="filter-label">Goal</span>
          <Chip onClick={() => setGoal('all')} pressed={goal === 'all'} tone={goal === 'all' ? 'accent' : 'plain'}>All</Chip>
          {goals.map((p) => (
            <Chip key={p.id} onClick={() => setGoal(p.id)} pressed={goal === p.id} tone={goal === p.id ? 'accent' : 'plain'}>{p.id.toUpperCase()}</Chip>
          ))}
        </div>
        <div className="filter-row" role="group" aria-label="Filter by team">
          <span className="filter-label">Team</span>
          <Chip onClick={() => setTeam('all')} pressed={team === 'all'} tone={team === 'all' ? 'accent' : 'plain'}>All</Chip>
          {Object.keys(TEAM_LABELS).map((t) => (
            <Chip key={t} onClick={() => setTeam(t)} pressed={team === t} tone={team === t ? 'accent' : 'plain'}>{teamLabel(t)}</Chip>
          ))}
        </div>
      </div>

      <div className="ticket-groups" ref={listRef}>
        {state.status === 'loading' && <p className="muted">Loading tickets…</p>}
        {state.status === 'error' && <p className="muted">The ticket files could not be loaded. Run <code>npm run tickets</code> and reload.</p>}
        {state.status === 'ready' && visible.length === 0 && <p className="muted">No tickets match these filters.</p>}
        {grouped.map(({ part, items }) => (
          <section key={part.id} className="ticket-group" data-accent={part.accent} aria-labelledby={`tg-${part.id}`}>
            <div className="ticket-group-head">
              <h2 id={`tg-${part.id}`}>{part.title}</h2>
              <a href={href.part(part.id)} className="ticket-group-link">Open the walkthrough →</a>
            </div>
            <div className="ticket-grid">
              {items.map((t) => {
                const ref = partTeaching(t.key);
                const can = ref ? progress.done[ref.lesson.id] === true : false;
                return (
                  <article key={t.key} id={`ticket-${t.key}`} className="tmap" data-can={can || undefined} data-focus={focusKey === t.key || undefined} data-testid="ticket">
                    <header className="tmap-head">
                      <span className="tmap-key">{t.key}</span>
                      <span className="tmap-days">{t.days} {t.days === 1 ? 'day' : 'days'}</span>
                      <span className="chip" data-tone={can ? 'done' : 'soft'}>{can ? 'You can do this' : 'Not yet'}</span>
                    </header>
                    <h3 className="tmap-title">{t.title}</h3>
                    <div className="tmap-foot">
                      <span className="tmap-teams">
                        {t.team.map((tm) => (
                          <span key={tm} className="chip" data-tone="plain">{teamLabel(tm)}</span>
                        ))}
                      </span>
                      {ref ? (
                        <a className="tmap-lesson" href={href.lesson(ref.lesson.id)}>Taught in: {ref.lesson.title}</a>
                      ) : (
                        <span className="tmap-lesson muted">No lesson yet</span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default TicketsPage;
