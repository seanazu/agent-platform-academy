import { href } from '../../lib/router';

type Piece = { id: string; label: string; short: string; plain: string; group: string; at: [number, number]; lessons: string[] };
type MapData = { pieces: Piece[]; links: { from: string; to: string; label?: string }[] };

const files = import.meta.glob('../../../content/platform-map.json', { eager: true, import: 'default' }) as Record<string, MapData>;
const data: MapData | undefined = Object.values(files)[0];

const COL = 132;
const ROW = 52;

// The whole platform as a small map, with the piece this lesson is about lit up. Every piece links to its first lesson.
function PlatformMap({ here }: { here: string }) {
  if (!data) return null;
  const cols = Math.max(...data.pieces.map((p) => p.at[0])) + 1;
  const rows = Math.max(...data.pieces.map((p) => p.at[1])) + 1;
  const pos = new Map(data.pieces.map((p) => [p.id, { x: p.at[0] * COL + COL / 2, y: p.at[1] * ROW + ROW / 2 }]));
  const current = data.pieces.find((p) => p.id === here);
  return (
    <figure className="pmap">
      <svg viewBox={`0 0 ${cols * COL} ${rows * ROW}`} role="img" aria-label={`Platform map, you are here: ${current?.label ?? here}`}>
        {data.links.map((l) => {
          const a = pos.get(l.from);
          const b = pos.get(l.to);
          if (!a || !b) return null;
          return <line key={`${l.from}-${l.to}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="pmap-link" />;
        })}
        {data.pieces.map((p) => {
          const c = pos.get(p.id);
          if (!c) return null;
          const first = p.lessons[0];
          return (
            <a key={p.id} href={first ? href.lesson(first) : undefined} className="pmap-piece" data-here={p.id === here || undefined} data-group={p.group}>
              <title>{`${p.label}: ${p.plain}`}</title>
              <rect x={c.x - COL / 2 + 7} y={c.y - 18} width={COL - 14} height="36" rx="9" />
              <text x={c.x} y={c.y + 5} textAnchor="middle">{p.short}</text>
            </a>
          );
        })}
      </svg>
      {current && (
        <figcaption><span className="pmap-dot" aria-hidden="true" /> You are here: <b>{current.label}</b>. {current.plain}</figcaption>
      )}
    </figure>
  );
}

export default PlatformMap;
