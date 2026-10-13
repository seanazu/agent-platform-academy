import type { ReactNode } from 'react';

type Props = { index: number; children: ReactNode[]; className?: string };

// Every variant is rendered in the same grid cell; one is visible. The box is always as tall as the tallest
// variant, so switching never moves the page.
function Stack({ index, children, className }: Props) {
  return (
    <div className={className ? `stack ${className}` : 'stack'}>
      {children.map((child, i) => (
        <div
          key={i}
          className="stack-item"
          data-on={i === index || undefined}
          aria-hidden={i !== index || undefined}
          inert={i !== index || undefined}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

export default Stack;
