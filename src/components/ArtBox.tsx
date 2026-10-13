import { useState } from 'react';
import type { Accent } from '../lib/types';

type Props = {
  src: string;
  ratio: '21/9' | '16/9';
  accent?: Accent;
  seed: string;
  alt?: string;
  className?: string;
};

const hash = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};

// A fixed-ratio image slot. The drawn fallback is always underneath; the image covers it when it loads
// and is hidden when it fails, so the box never changes size either way.
function ArtBox({ src, ratio, accent = 'sky', seed, alt = '', className }: Props) {
  const [failed, setFailed] = useState(false);
  const h = hash(seed);
  const cx = 20 + (h % 50);
  const cy = 30 + ((h >> 8) % 40);
  const r = 18 + ((h >> 16) % 20);
  const wide = ratio === '21/9';
  return (
    <div className={`art ${className ?? ''}`} data-ratio={ratio} data-accent={accent} aria-hidden={alt === '' || undefined}>
      <svg className="art-fallback" viewBox={wide ? '0 0 210 90' : '0 0 160 90'} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id={`g-${h}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--accent-soft)" />
            <stop offset="1" stopColor="var(--accent-deep)" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill={`url(#g-${h})`} />
        <circle cx={cx} cy={cy} r={r} fill="var(--accent)" opacity="0.35" />
        <circle cx={cx + r * 1.6} cy={cy + r * 0.4} r={r * 0.6} fill="var(--accent-ink)" opacity="0.18" />
        <path d={`M0 ${70 + (h % 10)} Q ${wide ? 105 : 80} ${50 + ((h >> 4) % 20)} ${wide ? 210 : 160} ${75 - (h % 8)}`} stroke="var(--accent-ink)" strokeWidth="0.6" fill="none" opacity="0.4" />
        <path d={`M0 ${80 + (h % 6)} Q ${wide ? 105 : 80} ${60 + ((h >> 6) % 20)} ${wide ? 210 : 160} ${84 - (h % 5)}`} stroke="var(--accent-ink)" strokeWidth="0.6" fill="none" opacity="0.25" />
      </svg>
      {!failed && <img className="art-img" src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} />}
    </div>
  );
}

export default ArtBox;
