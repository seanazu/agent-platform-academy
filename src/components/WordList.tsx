import type { Word } from '../lib/types';

function WordList({ words }: { words: Word[] }) {
  return (
    <dl className="words">
      {words.map((w) => (
        <div key={w.term} className="word">
          <dt>{w.term}</dt>
          <dd>{w.plain}</dd>
        </div>
      ))}
    </dl>
  );
}

export default WordList;
