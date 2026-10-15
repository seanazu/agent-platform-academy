import { useMemo, useState } from 'react';
import { allLessons } from '../lib/course';
import { getLesson } from '../lib/lessons';
import { href } from '../lib/router';
import { useGrowOnly } from '../lib/stable';

type Hit = { kind: 'lesson' | 'heading' | 'word'; title: string; detail: string; lessonId: string; part: string };

function SearchPage({ initial }: { initial?: string }) {
  const [q, setQ] = useState(initial ?? '');
  const listRef = useGrowOnly<HTMLUListElement>();
  const index = useMemo<Hit[]>(() => {
    const hits: Hit[] = [];
    for (const { part, lesson } of allLessons) {
      hits.push({ kind: 'lesson', title: lesson.title, detail: lesson.goal, lessonId: lesson.id, part: part.title });
      const data = getLesson(lesson.id);
      if (!data) continue;
      for (const s of 'sections' in data ? data.sections : data.read) hits.push({ kind: 'heading', title: s.h, detail: lesson.title, lessonId: lesson.id, part: part.title });
      for (const w of data.words) hits.push({ kind: 'word', title: w.term, detail: w.plain, lessonId: lesson.id, part: part.title });
    }
    return hits;
  }, []);
  const needle = q.trim().toLowerCase();
  const results = needle
    ? index.filter((h) => h.title.toLowerCase().includes(needle) || h.detail.toLowerCase().includes(needle)).slice(0, 60)
    : [];
  return (
    <div className="search-page">
      <header className="page-head">
        <span className="eyebrow">Search</span>
        <h1>Find a lesson, a heading or a word</h1>
        <label className="search-field">
          <span className="sr-only">Search</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try: heartbeat, ruleset, Terraform…" autoFocus autoComplete="off" />
        </label>
      </header>
      <ul className="search-results" ref={listRef}>
        {needle && results.length === 0 && <li className="muted">Nothing found for “{q}”.</li>}
        {results.map((h, i) => (
          <li key={i} className="search-hit" data-kind={h.kind}>
            <a href={href.lesson(h.lessonId)}>
              <span className="search-kind">{h.kind}</span>
              <span className="search-title">{h.title}</span>
              <span className="search-detail">{h.detail}</span>
              <span className="search-part">{h.part}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SearchPage;
