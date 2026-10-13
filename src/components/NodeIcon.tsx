import type { NodeKind } from '../lib/types';

type Props = { kind: NodeKind; x: number; y: number; size?: number };

// Small line icons for the picture, drawn in a 24x24 box and placed with a transform.
function NodeIcon({ kind, x, y, size = 24 }: Props) {
  const s = size / 24;
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} className="pic-icon" data-kind={kind}>
      {kind === 'person' && (
        <>
          <circle cx="12" cy="8" r="4" {...common} />
          <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" {...common} />
        </>
      )}
      {kind === 'agent' && (
        <>
          <rect x="4" y="8" width="16" height="12" rx="3" {...common} />
          <path d="M12 8V4M9 4h6" {...common} />
          <circle cx="9" cy="14" r="1.3" fill="currentColor" stroke="none" />
          <circle cx="15" cy="14" r="1.3" fill="currentColor" stroke="none" />
          <path d="M9.5 17.5h5" {...common} />
          <path d="M1.5 12v4M22.5 12v4" {...common} />
        </>
      )}
      {kind === 'machine' && (
        <>
          <rect x="3" y="4" width="18" height="7" rx="2" {...common} />
          <rect x="3" y="13" width="18" height="7" rx="2" {...common} />
          <circle cx="7" cy="7.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="7" cy="16.5" r="1" fill="currentColor" stroke="none" />
          <path d="M11 7.5h6M11 16.5h6" {...common} />
        </>
      )}
      {kind === 'service' && (
        <>
          <path d="M12 2.5l8.2 4.75v9.5L12 21.5l-8.2-4.75v-9.5z" {...common} />
          <path d="M13 7l-4 6h4l-2 4 5-7h-4z" fill="currentColor" stroke="none" />
        </>
      )}
      {kind === 'file' && (
        <>
          <path d="M6 3h8l5 5v13H6z" {...common} />
          <path d="M14 3v5h5" {...common} />
          <path d="M9 13h7M9 17h7" {...common} />
        </>
      )}
      {kind === 'cloud' && (
        <path d="M7 18a4 4 0 0 1-.5-7.97A6 6 0 0 1 18 9.5a4.25 4.25 0 0 1 0 8.5z" {...common} />
      )}
      {kind === 'check' && (
        <>
          <circle cx="12" cy="12" r="9" {...common} />
          <path d="M8 12.5l2.8 2.8L16.5 9" {...common} />
        </>
      )}
    </g>
  );
}

export default NodeIcon;
