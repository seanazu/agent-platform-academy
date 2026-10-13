import type { Callout as CalloutData } from '../lib/types';

const TITLES: Record<CalloutData['kind'], string> = { why: 'Why', gotcha: 'Gotcha', tip: 'Tip', wall: 'Wall' };

function Callout({ callout }: { callout: CalloutData }) {
  return (
    <aside className="callout" data-kind={callout.kind}>
      <span className="callout-kind">{TITLES[callout.kind]}</span>
      <p>{callout.text}</p>
    </aside>
  );
}

export default Callout;
