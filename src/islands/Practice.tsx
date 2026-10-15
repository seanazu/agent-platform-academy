import { useMemo, useState } from 'react';
import type { ChoiceDrill, Drill, FillDrill, OrderDrill } from '../lib/types';

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

function Choice({ drill }: { drill: ChoiceDrill }) {
  const [chosen, setChosen] = useState<number>();
  const pick = chosen === undefined ? undefined : drill.options[chosen];
  return (
    <>
      <div className="isl-drill-options">
        {drill.options.map((o, i) => (
          <button key={o.text} type="button" className="isl-option" aria-pressed={chosen === i} data-mark={chosen === undefined ? undefined : o.correct ? 'right' : chosen === i ? 'wrong' : undefined} onClick={() => setChosen(i)}>
            {o.text}
          </button>
        ))}
      </div>
      <p className="isl-drill-why" data-state={pick ? (pick.correct ? 'right' : 'wrong') : undefined}>{pick ? `${pick.correct ? 'Right.' : 'Not quite.'} ${pick.why}` : ' '}</p>
    </>
  );
}

function Fill({ drill }: { drill: FillDrill }) {
  const [value, setValue] = useState('');
  const [result, setResult] = useState<'right' | 'wrong' | 'shown'>();
  const check = () => setResult(drill.answers.some((a) => norm(a) === norm(value)) ? 'right' : 'wrong');
  return (
    <>
      <form className="isl-fill" onSubmit={(e) => { e.preventDefault(); check(); }}>
        <code>
          {drill.before}
          <input value={value} onChange={(e) => { setValue(e.target.value); setResult(undefined); }} aria-label="Your answer" spellCheck={false} autoComplete="off" size={Math.max(8, (drill.answers[0] ?? '').length + 2)} />
          {drill.after}
        </code>
        <div className="isl-fill-actions">
          <button type="submit" className="isl-btn">Check</button>
          <button type="button" className="isl-link-btn" onClick={() => { setValue(drill.answers[0] ?? ''); setResult('shown'); }}>Show the answer</button>
        </div>
      </form>
      <p className="isl-drill-why" data-state={result === 'shown' ? 'right' : result}>
        {result === 'right' && `Right. ${drill.why}`}
        {result === 'wrong' && `Not yet. ${drill.hint ?? 'Look at the lesson notes and try again.'}`}
        {result === 'shown' && drill.why}
        {!result && ' '}
      </p>
    </>
  );
}

// Items are shown in a fixed scrambled order (reversed, then rotated) so the drill is the same on every visit.
function Order({ drill }: { drill: OrderDrill }) {
  const shuffled = useMemo(() => {
    const s = [...drill.items].reverse();
    const first = s.shift();
    return first === undefined ? s : [...s, first];
  }, [drill.items]);
  const [picked, setPicked] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const done = picked.length === drill.items.length;
  return (
    <>
      <div className="isl-order">
        <div className="isl-order-pool" aria-label="Pick in order">
          {shuffled.map((item) => (
            <button key={item} type="button" className="isl-option" disabled={picked.includes(item)} onClick={() => { setPicked([...picked, item]); setChecked(false); }}>
              {item}
            </button>
          ))}
        </div>
        <ol className="isl-order-picked" aria-label="Your order">
          {drill.items.map((_, i) => {
            const v = picked[i];
            const ok = checked && v === drill.items[i];
            return (
              <li key={i} data-mark={checked && v ? (ok ? 'right' : 'wrong') : undefined}>
                <span>{i + 1}</span>{v ?? <em>…</em>}
              </li>
            );
          })}
        </ol>
      </div>
      <div className="isl-fill-actions">
        <button type="button" className="isl-btn" disabled={!done} onClick={() => setChecked(true)}>Check the order</button>
        <button type="button" className="isl-link-btn" onClick={() => { setPicked([]); setChecked(false); }}>Start over</button>
      </div>
      <p className="isl-drill-why" data-state={checked ? (picked.every((v, i) => v === drill.items[i]) ? 'right' : 'wrong') : undefined}>
        {checked ? (picked.every((v, i) => v === drill.items[i]) ? `Right. ${drill.why}` : `Some are out of place (marked red). ${drill.why}`) : ' '}
      </p>
    </>
  );
}

// Short drills that make you use the idea: pick, fill in, or put in order. Nothing here blocks you.
function Practice({ drills }: { drills: Drill[] }) {
  return (
    <ol className="isl-drills">
      {drills.map((d, i) => (
        <li key={d.q} className="isl-drill">
          <p className="isl-drill-q"><span>{i + 1}</span>{d.q}</p>
          {d.kind === 'choice' && <Choice drill={d} />}
          {d.kind === 'fill' && <Fill drill={d} />}
          {d.kind === 'order' && <Order drill={d} />}
        </li>
      ))}
    </ol>
  );
}

export default Practice;
