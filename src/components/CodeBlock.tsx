import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import CopyButton from './CopyButton';
import { plainLines, type TokenLine } from '../lib/tokens';
import type { CodeBlock as CodeData } from '../lib/types';

type Props = { code: CodeData };

const LINE = 22; // px, matches --code-line in CSS
const GAP = 8;

// Code with line numbers and notes. On a wide container the notes sit in a column beside the code, each
// starting at its line (pushed down when the previous note is taller than the gap). On a narrow container
// the same notes are listed under the code. Plain text renders first so the block has its final height
// before the highlighter finishes.
function CodeBlock({ code }: Props) {
  const text = code.text.replace(/\n$/, '');
  const [lines, setLines] = useState<TokenLine[]>(() => plainLines(text));
  useEffect(() => {
    let alive = true;
    setLines(plainLines(text));
    import('../lib/highlight')
      .then((m) => m.highlight(text, code.lang))
      .then((t) => alive && t.length === text.split('\n').length && setLines(t))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [text, code.lang]);

  const notes = [...code.notes].sort((a, b) => a.line - b.line);
  const noted = new Set(notes.map((n) => n.line));
  const asideRef = useRef<HTMLDivElement | null>(null);
  const [tops, setTops] = useState<number[]>([]);
  const [asideHeight, setAsideHeight] = useState(0);

  const place = () => {
    const aside = asideRef.current;
    if (!aside) return;
    const items = Array.from(aside.querySelectorAll<HTMLElement>('.note'));
    let bottom = 0;
    const next: number[] = [];
    items.forEach((item, i) => {
      const line = notes[i]?.line ?? 1;
      const top = Math.max((line - 1) * LINE, bottom);
      next.push(top);
      bottom = top + item.offsetHeight + GAP;
    });
    setTops(next);
    setAsideHeight(Math.max(0, bottom - GAP));
  };

  useLayoutEffect(place, [code]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const aside = asideRef.current;
    if (!aside || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(place);
    ro.observe(aside);
    return () => ro.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <figure className="code" data-lang={code.lang}>
      <figcaption className="code-head">
        <span className="code-file" title={code.file}>{code.file}</span>
        <span className="code-lang">{code.lang}</span>
        <CopyButton text={text} />
      </figcaption>
      <div className="code-body">
        <pre className="code-pre" tabIndex={0}>
          <code>
            {lines.map((tokens, i) => (
              <span key={i} className="code-line" data-noted={noted.has(i + 1) || undefined}>
                <span className="code-ln" aria-hidden="true">{i + 1}</span>
                <span className="code-text">
                  {tokens.map((t, j) => (
                    <span key={j} style={t.style as CSSProperties | undefined}>{t.text}</span>
                  ))}
                  {tokens.length === 0 && ' '}
                </span>
              </span>
            ))}
          </code>
        </pre>
        <div className="code-notes" ref={asideRef} style={{ '--aside-h': `${asideHeight}px` } as CSSProperties}>
          {notes.map((n, i) => (
            <div key={i} className="note" style={{ '--top': `${tops[i] ?? (n.line - 1) * LINE}px` } as CSSProperties}>
              <span className="note-line">line {n.line}</span>
              <span className="note-text">{n.text}</span>
            </div>
          ))}
        </div>
      </div>
    </figure>
  );
}

export default CodeBlock;
