import { useMemo, useState } from 'react';
import { findLesson } from '../lib/course';
import { loadedLessons } from '../lib/lessons';
import { href } from '../lib/router';
import { useGrowOnly } from '../lib/stable';

function WordsPage() {
  const [q, setQ] = useState('');
  const listRef = useGrowOnly<HTMLDListElement>();
  const entries = useMemo(
    () =>
      loadedLessons()
        .flatMap((l) => l.words.map((w) => ({ ...w, lessonId: l.id, lessonTitle: l.title })))
        .sort((a, b) => a.term.localeCompare(b.term)),
    [],
  );
  const needle = q.trim().toLowerCase();
  const shown = needle ? entries.filter((e) => e.term.toLowerCase().includes(needle) || e.plain.toLowerCase().includes(needle)) : entries;
  return (
    <div className="words-page">
      <header className="page-head">
        <span className="eyebrow">Glossary</span>
        <h1>Words</h1>
        <p className="page-lead">Every term the lessons explain, in plain words. {entries.length} so far.</p>
        <label className="search-field">
          <span className="sr-only">Search words</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a term…" autoComplete="off" />
        </label>
      </header>
      <dl className="words words-all" ref={listRef}>
        {shown.length === 0 && <p className="muted">No words match.</p>}
        {shown.map((e) => {
          const part = findLesson(e.lessonId)?.part;
          return (
            <div key={`${e.lessonId}-${e.term}`} className="word" data-accent={part?.accent}>
              <dt>{e.term}</dt>
              <dd>
                {e.plain}
                <a className="word-source" href={href.lesson(e.lessonId)}>{e.lessonTitle}</a>
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

export default WordsPage;
