import { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, type Ref } from 'react';
import { ISLANDS, LINKS, WORLD, asset, islandById, type Island } from './data';

export type IslandProgress = { done: number; total: number; ready: number };
export type WorldHandle = { flyTo: (id: string, opts?: { panel?: number; scale?: number }) => void; fit: () => void; moveToken: (from: string, to: string, ms: number) => Promise<void>; hideToken: () => void };
type Cam = { x: number; y: number; s: number };

const LIFT = 46; // wires meet the islands a little below their centre, where the rock is

const pathBetween = (a: Island, b: Island) => {
  const ax = a.x, ay = a.y + LIFT, bx = b.x, by = b.y + LIFT;
  const dx = bx - ax, dy = by - ay;
  return Math.abs(dx) > Math.abs(dy)
    ? `M${ax} ${ay} C${ax + dx * 0.5} ${ay}, ${bx - dx * 0.5} ${by}, ${bx} ${by}`
    : `M${ax} ${ay} C${ax} ${ay + dy * 0.5}, ${bx} ${by - dy * 0.5}, ${bx} ${by}`;
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

type Props = {
  ref?: Ref<WorldHandle>;
  progress: Record<string, IslandProgress>;
  revealed: Set<string>;
  selected?: string;
  dimmed?: boolean;
  bloom?: string;
  leftInset?: number;
  onSelect: (id: string) => void;
};

// The course as a map: islands on an endless dotted canvas. Drag or scroll to move, pinch or ctrl+scroll to zoom.
function World({ ref, progress, revealed, selected, dimmed, bloom, leftInset = 0, onSelect }: Props) {
  const viewport = useRef<HTMLDivElement | null>(null);
  const [cam, setCam] = useState<Cam>({ x: 0, y: 0, s: 0.5 });
  const [flying, setFlying] = useState(false);
  const [token, setToken] = useState<{ x: number; y: number } | null>(null);
  const drag = useRef<{ px: number; py: number; cx: number; cy: number; moved: boolean } | null>(null);
  const paths = useRef(new Map<string, SVGPathElement>());

  const size = () => {
    const el = viewport.current;
    return el ? { w: el.clientWidth, h: el.clientHeight } : { w: 1200, h: 800 };
  };

  const fly = useCallback((next: Cam) => {
    setFlying(!reduced());
    setCam(next);
    window.setTimeout(() => setFlying(false), 900);
  }, []);

  // Fit the whole world into the part of the screen that is not covered by the path card on the left.
  const fitCam = useCallback((): Cam => {
    const { w, h } = size();
    const inset = w > 1100 ? leftInset : 0;
    const s = clamp(Math.min((w - inset) / (WORLD.w + 120), h / (WORLD.h + 160)), 0.28, 1);
    return { s, x: inset + (w - inset - WORLD.w * s) / 2, y: (h - WORLD.h * s) / 2 };
  }, [leftInset]);

  useLayoutEffect(() => setCam(fitCam()), [fitCam]);

  useImperativeHandle(ref, () => ({
    fit: () => fly(fitCam()),
    flyTo: (id, opts) => {
      const island = islandById(id);
      if (!island) return;
      const { w, h } = size();
      const panel = opts?.panel ?? 0;
      const s = opts?.scale ?? clamp(Math.min((w - panel) / 900, h / 760), 0.55, 1.1);
      fly({ s, x: (w - panel) / 2 - island.x * s, y: h / 2 - (island.y + 10) * s });
    },
    moveToken: (from, to, ms) =>
      new Promise<void>((resolve) => {
        const el = paths.current.get(`${from}-${to}`) ?? paths.current.get(`${to}-${from}`);
        const forward = paths.current.has(`${from}-${to}`);
        if (!el || reduced()) {
          const b = islandById(to);
          if (b) setToken({ x: b.x, y: b.y + LIFT });
          resolve();
          return;
        }
        const len = el.getTotalLength();
        const start = performance.now();
        const step = (now: number) => {
          const t = clamp((now - start) / ms, 0, 1);
          const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
          const p = el.getPointAtLength((forward ? e : 1 - e) * len);
          setToken({ x: p.x, y: p.y });
          if (t < 1) requestAnimationFrame(step);
          else resolve();
        };
        requestAnimationFrame(step);
      }),
    hideToken: () => setToken(null),
  }));

  // Wheel: pan by default, zoom with ctrl (trackpad pinch sends ctrl) around the cursor.
  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setCam((c) => {
        if (!e.ctrlKey) return { ...c, x: c.x - e.deltaX, y: c.y - e.deltaY };
        const r = el.getBoundingClientRect();
        const mx = e.clientX - r.left, my = e.clientY - r.top;
        const s = clamp(c.s * Math.exp(-e.deltaY * 0.01), 0.25, 1.6);
        return { s, x: mx - ((mx - c.x) / c.s) * s, y: my - ((my - c.y) / c.s) * s };
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const zoom = (factor: number) => {
    const { w, h } = size();
    fly({ s: clamp(cam.s * factor, 0.25, 1.6), x: w / 2 - ((w / 2 - cam.x) / cam.s) * clamp(cam.s * factor, 0.25, 1.6), y: h / 2 - ((h / 2 - cam.y) / cam.s) * clamp(cam.s * factor, 0.25, 1.6) });
  };

  const links = useMemo(
    () => LINKS.flatMap(([a, b]) => {
      const ia = islandById(a), ib = islandById(b);
      return ia && ib ? [{ key: `${a}-${b}`, d: pathBetween(ia, ib), lit: revealed.has(a) && revealed.has(b) }] : [];
    }),
    [revealed],
  );

  return (
    <div
      className="isl-world"
      ref={viewport}
      data-dimmed={dimmed || undefined}
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest('button, a')) return;
        drag.current = { px: e.clientX, py: e.clientY, cx: cam.x, cy: cam.y, moved: false };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        const dx = e.clientX - d.px, dy = e.clientY - d.py;
        if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;
        setCam((c) => ({ ...c, x: d.cx + dx, y: d.cy + dy }));
      }}
      onPointerUp={() => {
        drag.current = null;
      }}
    >
      <div className="isl-plane" data-flying={flying || undefined} data-far={cam.s < 0.62 || undefined} data-tiny={cam.s < 0.42 || undefined} style={{ width: WORLD.w, height: WORLD.h, transform: `translate3d(${cam.x}px, ${cam.y}px, 0) scale(${cam.s})`, ['--inv' as string]: 1 / cam.s }}>
        <svg className="isl-wires" width={WORLD.w} height={WORLD.h} aria-hidden="true">
          <defs>
            <linearGradient id="isl-wire" x1="0" x2="1">
              <stop offset="0" stopColor="#8fb5ff" />
              <stop offset="0.5" stopColor="#b9a8ff" />
              <stop offset="1" stopColor="#7fd6c8" />
            </linearGradient>
          </defs>
          {links.map((l, i) => (
            <g key={l.key} className="isl-link" data-lit={l.lit || undefined}>
              <path d={l.d} className="isl-link-glow" />
              <path
                d={l.d}
                className="isl-link-line"
                ref={(el) => {
                  if (el) paths.current.set(l.key, el);
                }}
              />
              {!reduced() && [0, 1].map((k) => (
                <circle key={k} r="7" className="isl-packet" style={{ animationDelay: `${-(i * 0.7 + k * 2.2)}s` }}>
                  <animateMotion dur="4.4s" repeatCount="indefinite" begin={`${-(i * 0.7 + k * 2.2)}s`} path={l.d} />
                </circle>
              ))}
            </g>
          ))}
          {token && (
            <g className="isl-token" transform={`translate(${token.x} ${token.y})`}>
              <circle r="30" className="isl-token-halo" />
              <rect x="-46" y="-17" width="92" height="34" rx="9" className="isl-token-tag" />
              <text y="6" textAnchor="middle">RH-1234</text>
            </g>
          )}
        </svg>

        {ISLANDS.map((island, i) => {
          const p = progress[island.id] ?? { done: 0, total: 0, ready: 0 };
          const pct = p.total ? p.done / p.total : 0;
          return (
            <div key={island.id} className="isl-spot" style={{ left: island.x, top: island.y }} data-selected={selected === island.id || undefined} data-revealed={revealed.has(island.id) || undefined} data-card={island.card} data-bloom={bloom === island.id || undefined}>
              <button
                type="button"
                className="isl-island"
                style={{ animationDelay: `${-i * 0.9}s` }}
                onClick={() => {
                  if (!drag.current?.moved) onSelect(island.id);
                }}
                aria-label={`${island.name}: ${p.total} lessons, ${p.done} done`}
              >
                <img src={asset(`${island.art}.webp`)} alt="" draggable={false} />
              </button>
              <button type="button" className="isl-card" onClick={() => onSelect(island.id)} tabIndex={-1} aria-hidden="true">
                <span className="isl-card-text">
                  <span className="isl-card-name">{island.name}</span>
                  <span className="isl-card-meta">{p.total} lessons{p.ready ? ` · ${p.ready} ready` : ''}</span>
                </span>
                <span className="isl-ring" style={{ ['--p' as string]: pct }}>
                  <span>{Math.round(pct * 100)}%</span>
                </span>
              </button>
            </div>
          );
        })}
      </div>

      <div className="isl-zoom" role="group" aria-label="Map zoom">
        <button type="button" onClick={() => zoom(1.25)} aria-label="Zoom in">+</button>
        <button type="button" onClick={() => zoom(0.8)} aria-label="Zoom out">−</button>
        <button type="button" onClick={() => fly(fitCam())} aria-label="Show the whole map">⤢</button>
      </div>
    </div>
  );
}

export default World;
