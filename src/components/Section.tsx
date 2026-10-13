import Callout from './Callout';
import CodeBlock from './CodeBlock';
import Terminal from './Terminal';
import type { Section as SectionData } from '../lib/types';

function Section({ section, index }: { section: SectionData; index: number }) {
  const id = `s-${index}`;
  return (
    <section className="lesson-section" aria-labelledby={id}>
      <h3 id={id}>{section.h}</h3>
      {section.p.map((text, i) => (
        <p key={i}>{text}</p>
      ))}
      {section.because && <p className="because"><span className="because-label">Why</span>{section.because}</p>}
      {section.code && <CodeBlock code={section.code} />}
      {section.see && <Terminal text={section.see} />}
      {section.ifInstead && <p className="if-instead">{section.ifInstead}</p>}
      {section.callout && <Callout callout={section.callout} />}
    </section>
  );
}

export default Section;
