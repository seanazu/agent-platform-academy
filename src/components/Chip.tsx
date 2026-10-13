import type { ReactNode } from 'react';

type Props = { children: ReactNode; href?: string; tone?: 'plain' | 'accent' | 'done' | 'soft'; onClick?: () => void; pressed?: boolean };

function Chip({ children, href, tone = 'plain', onClick, pressed }: Props) {
  if (href) return <a className="chip" data-tone={tone} href={href}>{children}</a>;
  if (onClick) return <button type="button" className="chip" data-tone={tone} onClick={onClick} aria-pressed={pressed}>{children}</button>;
  return <span className="chip" data-tone={tone}>{children}</span>;
}

export default Chip;
