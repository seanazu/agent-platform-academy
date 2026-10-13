import { useEffect, useRef, useState } from 'react';

type Props = { text: string; label?: string };

const fallbackCopy = (text: string): boolean => {
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  area.remove();
  return ok;
};

function CopyButton({ text, label = 'Copy' }: Props) {
  const [state, setState] = useState<'idle' | 'done' | 'fail'>('idle');
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = async () => {
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        ok = true;
      }
    } catch {
      ok = false;
    }
    if (!ok) ok = fallbackCopy(text);
    setState(ok ? 'done' : 'fail');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState('idle'), 1600);
  };
  return (
    <button type="button" className="copy-btn" onClick={copy} data-state={state} aria-label={`${label} to clipboard`}>
      <span className="copy-label">{state === 'done' ? 'Copied' : state === 'fail' ? 'Select and copy' : label}</span>
    </button>
  );
}

export default CopyButton;
