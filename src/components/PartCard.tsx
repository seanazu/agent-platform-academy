import ArtBox from './ArtBox';
import ProgressBar from './ProgressBar';
import { href } from '../lib/router';
import type { CoursePart } from '../lib/types';

const KIND: Record<CoursePart['kind'], string> = { start: 'Start', foundation: 'Foundation', walkthrough: 'Walkthrough' };

function PartCard({ part, done, number }: { part: CoursePart; done: number; number: number }) {
  const total = part.lessons.length;
  return (
    <a className="part-card" data-accent={part.accent} href={href.part(part.id)} data-testid="part-card">
      <ArtBox src={`${import.meta.env.BASE_URL}art/${part.id}.webp`} ratio="16/9" accent={part.accent} seed={part.id} />
      <span className="part-card-body">
        <span className="part-card-kind">{KIND[part.kind]} {number}</span>
        <span className="part-card-title">{part.title}</span>
        <span className="part-card-tag">{part.tagline}</span>
        <span className="part-card-foot">
          <span className="part-card-count">{done === total ? 'All done' : `${done} of ${total} lessons`}</span>
          <ProgressBar value={done} max={total} label={`${part.title}: ${done} of ${total} lessons done`} />
        </span>
      </span>
    </a>
  );
}

export default PartCard;
