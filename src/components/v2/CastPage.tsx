import { findLesson } from '../../lib/course';
import { href } from '../../lib/router';

type Member = { id: string; name: string; kind: string; role: string; plain: string; firstLesson?: string; fictional?: boolean };

const files = import.meta.glob('../../../content/cast.json', { eager: true, import: 'default' }) as Record<string, Member[]>;
const cast: Member[] = Object.values(files)[0] ?? [];

const GROUPS: { kind: string; title: string; lead: string }[] = [
  { kind: 'agent', title: 'Agents', lead: 'Programs that run Claude with tools and do real work.' },
  { kind: 'bot', title: 'Bots', lead: 'Accounts that act in GitHub, Jira or Slack on the platform’s behalf.' },
  { kind: 'service', title: 'Services', lead: 'The parts of the platform around the agents: they start runs, hold keys and keep watch.' },
  { kind: 'place', title: 'Places and test sets', lead: 'Where things live, and the fixed sets of cases we test agents against.' },
  { kind: 'team', title: 'Teams', lead: 'Groups of people you will hear about.' },
  { kind: 'person', title: 'People', lead: 'Who to ask about each area.' },
];

// Who's who: every agent, service, place and person the course mentions, introduced once in plain words.
function CastPage() {
  return (
    <div className="cast-page">
      <header className="page-head">
        <span className="eyebrow">Who's who</span>
        <h1>Everyone in the story</h1>
        <p className="cast-lead">The lessons mention agents, services and people by name. Here is each of them in two sentences, and the lesson where you meet them first.</p>
      </header>
      {GROUPS.map((g) => {
        const members = cast.filter((m) => m.kind === g.kind);
        if (members.length === 0) return null;
        return (
          <section key={g.kind} className="cast-group" aria-labelledby={`cast-${g.kind}`}>
            <h2 id={`cast-${g.kind}`}>{g.title}</h2>
            <p className="cast-group-lead">{g.lead}</p>
            <div className="cast-grid">
              {members.map((m) => {
                const first = m.firstLesson ? findLesson(m.firstLesson) : undefined;
                return (
                  <article key={m.id} id={`who-${m.id}`} className="cast-card">
                    <h3>{m.name}</h3>
                    <p className="cast-role">{m.role}</p>
                    <p className="cast-plain">{m.plain}</p>
                    {first && <a className="cast-first" href={href.lesson(first.lesson.id)}>First met in: {first.lesson.title}</a>}
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default CastPage;
