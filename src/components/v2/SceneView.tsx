import NodeIcon from '../NodeIcon';
import type { SceneState } from '../../lib/narration';
import type { NodeKind, Scene, SceneActor } from '../../lib/types';

const W = 1000;
const CELL_H = 150;
const BOX_H = 76;

type Box = SceneActor & { x: number; y: number; w: number; h: number };

const iconKind = (kind: SceneActor['kind']): NodeKind => (kind === 'queue' ? 'service' : kind === 'data' ? 'file' : kind);

const layout = (scene: Scene): Box[] => {
  const cellW = W / scene.cols;
  const w = Math.min(210, cellW - 36);
  return scene.actors.map((a) => ({
    ...a,
    w,
    h: BOX_H,
    x: a.at[0] * cellW + (cellW - w) / 2,
    y: a.at[1] * CELL_H + (CELL_H - BOX_H) / 2,
  }));
};

const center = (b: Box) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });

// Where the line from the box centre towards (tx, ty) leaves the box, plus a little padding.
const edge = (b: Box, tx: number, ty: number, pad: number) => {
  const c = center(b);
  const dx = tx - c.x;
  const dy = ty - c.y;
  const t = Math.min(dx === 0 ? Infinity : (b.w / 2 + pad) / Math.abs(dx), dy === 0 ? Infinity : (b.h / 2 + pad) / Math.abs(dy));
  return { x: c.x + dx * t, y: c.y + dy * t };
};

const segment = (from: Box, to: Box) => {
  const a = edge(from, center(to).x, center(to).y, 4);
  const b = edge(to, center(from).x, center(from).y, 8);
  return { a, b, d: `M${a.x} ${a.y} L${b.x} ${b.y}` };
};

type Props = { scene: Scene; state: SceneState; label: string };

function SceneView({ scene, state, label }: Props) {
  const boxes = layout(scene);
  const byId = new Map(boxes.map((b) => [b.id, b]));
  const height = scene.rows * CELL_H;
  const focusing = state.focus.length > 0;
  const send = state.send;
  const sendFrom = send && byId.get(send.from);
  const sendTo = send && byId.get(send.to);
  const sendPath = sendFrom && sendTo ? segment(sendFrom, sendTo) : undefined;

  return (
    <svg className="scene" viewBox={`0 0 ${W} ${height}`} role="img" aria-label={label}>
      <defs>
        <marker id="scene-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" className="scene-arrowhead" />
        </marker>
      </defs>
      {scene.links.map((l) => {
        const from = byId.get(l.from);
        const to = byId.get(l.to);
        if (!from || !to) return null;
        const lit = !focusing || (state.focus.includes(l.from) && state.focus.includes(l.to));
        return <path key={`${l.from}-${l.to}`} d={segment(from, to).d} className="scene-link" data-lit={lit || undefined} markerEnd="url(#scene-arrow)" />;
      })}
      {sendPath && send && (
        <g key={send.key} className="scene-send" data-tone={send.tone}>
          <path d={sendPath.d} className="scene-send-path" />
          <circle r="9" className="scene-token">
            <animateMotion dur="0.9s" fill="freeze" path={sendPath.d} keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.4 0 0.2 1" />
          </circle>
          {send.label && (
            <foreignObject x={(sendPath.a.x + sendPath.b.x) / 2 - 110} y={(sendPath.a.y + sendPath.b.y) / 2 - 34} width="220" height="30">
              <div className="scene-send-label">{send.label}</div>
            </foreignObject>
          )}
        </g>
      )}
      {boxes.map((b) => {
        const badge = state.badges[b.id];
        const failed = state.failed.includes(b.id);
        const dim = focusing && !state.focus.includes(b.id);
        return (
          <g key={b.id} className="scene-actor" data-dim={dim || undefined} data-focus={(focusing && !dim) || undefined} data-failed={failed || undefined} data-kind={b.kind}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="12" className="scene-box" />
            <NodeIcon kind={iconKind(b.kind)} x={b.x + 12} y={b.y + 12} size={22} />
            <foreignObject x={b.x + 42} y={b.y + 6} width={b.w - 48} height={b.h - 12}>
              <div className="scene-text">
                <span className="scene-label">{b.label}</span>
                {b.sub && <span className="scene-sub">{b.sub}</span>}
              </div>
            </foreignObject>
            {badge && (
              <foreignObject x={b.x - 10} y={b.y + b.h - 4} width={b.w + 20} height="30">
                <div className="scene-badge-wrap"><span className="scene-badge" data-tone={badge.tone}>{badge.badge}</span></div>
              </foreignObject>
            )}
            {failed && (
              <g className="scene-cross" transform={`translate(${b.x + b.w - 14} ${b.y - 10})`}>
                <circle r="13" />
                <path d="M-5 -5L5 5M5 -5L-5 5" />
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default SceneView;
