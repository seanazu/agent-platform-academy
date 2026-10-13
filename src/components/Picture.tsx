import { useEffect, useRef, useState } from 'react';
import NodeIcon from './NodeIcon';
import Stack from './Stack';
import type { Picture as PictureData, PictureNode } from '../lib/types';

type Laid = PictureNode & { x: number; y: number; w: number; h: number; row: number; col: number };
type Layout = { width: number; height: number; nodes: Laid[] };

// A word longer than a line (a path like .github/workflows/x.yml) breaks after / _ - . or, failing that, anywhere.
const pieces = (word: string, max: number): string[] => {
  if (word.length <= max) return [word];
  const out: string[] = [];
  let cur = '';
  for (const part of word.split(/(?<=[/_\-.])/)) {
    if (cur && (cur + part).length > max) {
      out.push(cur);
      cur = part;
    } else cur += part;
  }
  if (cur) out.push(cur);
  return out.flatMap((s) => (s.length <= max ? [s] : (s.match(new RegExp(`.{1,${max}}`, 'g')) ?? [s])));
};

const wrap = (label: string, max: number): string[] => {
  // glue: the token continues the previous word, so no space goes between them
  const tokens = label.split(' ').flatMap((w) => pieces(w, max).map((t, i) => ({ t, glue: i > 0 })));
  const lines: string[] = [];
  let line = '';
  for (const { t, glue } of tokens) {
    const next = glue ? line + t : line ? `${line} ${t}` : t;
    if (line && next.length > max) {
      lines.push(line);
      line = t;
    } else line = next;
  }
  if (line) lines.push(line);
  if (lines.length > 2) {
    const second = lines.slice(1).join(' ');
    return [lines[0] ?? '', second.length > max ? `${second.slice(0, max - 1)}…` : second];
  }
  return lines;
};

// Nodes are placed in reading order; the second row runs right to left so step arrows stay short.
const layout = (nodes: PictureNode[], narrow: boolean): Layout => {
  const n = nodes.length;
  if (narrow) {
    const w = 190;
    const h = 64;
    const pitch = 108;
    const rows = Math.ceil(n / 2);
    const laid = nodes.map((node, i) => {
      const row = Math.floor(i / 2);
      const col = row % 2 === 0 ? i % 2 : 1 - (i % 2);
      return { ...node, x: 20 + col * 250, y: 20 + row * pitch, w, h, row, col };
    });
    return { width: 460, height: rows * pitch + 40 - (pitch - h), nodes: laid };
  }
  const w = 196;
  const h = 68;
  const width = 960;
  const twoRows = n > 4;
  const first = twoRows ? Math.ceil(n / 2) : n;
  const rowOf = (i: number) => (i < first ? 0 : 1);
  const counts = [first, n - first];
  const laid = nodes.map((node, i) => {
    const row = rowOf(i);
    const idx = row === 0 ? i : i - first;
    const k = counts[row] ?? 1;
    const gap = (width - k * w) / (k + 1);
    const col = row === 0 ? idx : k - 1 - idx;
    const y = twoRows ? (row === 0 ? 36 : 236) : 56;
    return { ...node, x: gap + col * (w + gap), y, w, h, row, col };
  });
  return { width, height: twoRows ? 340 : 180, nodes: laid };
};

const center = (b: Laid) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });

// The point where a line from the box centre towards (tx, ty) leaves the box, padded a little.
const edgePoint = (b: Laid, tx: number, ty: number, pad: number) => {
  const c = center(b);
  const dx = tx - c.x;
  const dy = ty - c.y;
  const hw = b.w / 2 + pad;
  const hh = b.h / 2 + pad;
  const t = Math.min(dx === 0 ? Infinity : hw / Math.abs(dx), dy === 0 ? Infinity : hh / Math.abs(dy));
  return { x: c.x + dx * t, y: c.y + dy * t };
};

type Path = { d: string; mid: { x: number; y: number } };

const arrow = (from: Laid, to: Laid, bend: number, offset: number): Path => {
  const cf = center(from);
  const ct = center(to);
  const dx = ct.x - cf.x;
  const dy = ct.y - cf.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const a = edgePoint(from, ct.x, ct.y, 6);
  const b = edgePoint(to, cf.x, cf.y, 10);
  const ax = a.x + nx * offset;
  const ay = a.y + ny * offset;
  const bx = b.x + nx * offset;
  const by = b.y + ny * offset;
  if (bend === 0) return { d: `M${ax} ${ay} L${bx} ${by}`, mid: { x: (ax + bx) / 2, y: (ay + by) / 2 } };
  const mx = (ax + bx) / 2 + nx * bend;
  const my = (ay + by) / 2 + ny * bend;
  const cx = 2 * mx - (ax + bx) / 2;
  const cy = 2 * my - (ay + by) / 2;
  return { d: `M${ax} ${ay} Q${cx} ${cy} ${bx} ${by}`, mid: { x: mx, y: my } };
};

type Props = { picture: PictureData; lessonId: string };

function Picture({ picture, lessonId }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [narrow, setNarrow] = useState(() => window.innerWidth < 700);
  const [step, setStep] = useState(0);
  useEffect(() => setStep(0), [lessonId]);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setNarrow(el.getBoundingClientRect().width < 640));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const lay = layout(picture.nodes, narrow);
  const byId = new Map(lay.nodes.map((n) => [n.id, n]));
  const steps = picture.steps;
  const total = steps.length;
  const current = steps[step - 1];

  const paths = steps.map((s, i) => {
    const from = byId.get(s.from);
    const to = byId.get(s.to);
    if (!from || !to) return undefined;
    const sameRow = from.row === to.row;
    const sameCol = from.col === to.col;
    const far = sameRow ? Math.abs(from.col - to.col) > 1 : sameCol && Math.abs(from.row - to.row) > 1;
    const bend = far ? (from.col < to.col || from.row < to.row ? -46 : 46) : 0;
    const reverse = steps.some((o, j) => j !== i && o.from === s.to && o.to === s.from);
    const dup = steps.findIndex((o) => o.from === s.from && o.to === s.to);
    const offset = reverse ? 7 : dup !== i ? (i - dup) * 10 : 0;
    return arrow(from, to, bend, offset);
  });

  const active = new Set(current ? [current.from, current.to] : []);

  return (
    <figure className="picture" data-stable="picture" ref={wrapRef}>
      <div className="picture-stage" style={{ aspectRatio: `${lay.width} / ${lay.height}` }}>
        <svg viewBox={`0 0 ${lay.width} ${lay.height}`} className="picture-svg" role="img" aria-label={picture.caption}>
          <defs>
            <marker id="arrow-done" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
              <path d="M0 0L10 5L0 10z" className="pic-arrowhead" />
            </marker>
            <marker id="arrow-now" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
              <path d="M0 0L10 5L0 10z" className="pic-arrowhead" data-now="" />
            </marker>
          </defs>
          {paths.map((p, i) =>
            p && i < step ? (
              <g key={i} className="pic-edge" data-now={i === step - 1 || undefined}>
                <path d={p.d} markerEnd={i === step - 1 ? 'url(#arrow-now)' : 'url(#arrow-done)'} />
                <circle cx={p.mid.x} cy={p.mid.y} r="11" className="pic-badge" />
                <text x={p.mid.x} y={p.mid.y + 4} textAnchor="middle" className="pic-badge-text">{i + 1}</text>
              </g>
            ) : null,
          )}
          {lay.nodes.map((n) => {
            const lines = wrap(n.label, narrow ? 18 : 20);
            const ty = n.y + n.h / 2 + (lines.length === 1 ? 5 : -3);
            return (
              <g key={n.id} className="pic-node" data-kind={n.kind} data-active={active.has(n.id) || undefined}>
                <rect x={n.x} y={n.y} width={n.w} height={n.h} rx="12" />
                <rect x={n.x + 10} y={n.y + n.h / 2 - 18} width="36" height="36" rx="10" className="pic-icon-bg" />
                <NodeIcon kind={n.kind} x={n.x + 16} y={n.y + n.h / 2 - 12} />
                <text x={n.x + 56} y={ty} className="pic-label">
                  {lines.map((line, i) => (
                    <tspan key={i} x={n.x + 56} dy={i === 0 ? 0 : 16}>{line}</tspan>
                  ))}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="picture-steps">
        <div className="picture-nav">
          <button type="button" className="btn" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} aria-label="Previous step">
            ← Back
          </button>
          <span className="picture-count" aria-live="polite">{step === 0 ? `${total} steps` : `Step ${step} of ${total}`}</span>
          <button type="button" className="btn btn-primary" onClick={() => setStep((s) => Math.min(total, s + 1))} disabled={step === total} aria-label="Next step">
            Next →
          </button>
        </div>
        <Stack index={step} className="picture-text">
          {[
            <p key="start" className="picture-start">Press <b>Next</b> to walk through the drawing one arrow at a time.</p>,
            ...steps.map((s, i) => (
              <p key={i} className="picture-step-text">
                <span className="picture-step-n">{i + 1}</span>
                {s.text}
              </p>
            )),
          ]}
        </Stack>
      </div>
      <figcaption className="picture-caption">{picture.caption}</figcaption>
    </figure>
  );
}

export default Picture;
