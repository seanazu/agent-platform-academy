import { hasCard } from '../lib/cards';
import { href } from '../lib/router';
import type { LessonTicket } from '../lib/types';

function TicketCard({ ticket }: { ticket: LessonTicket }) {
  return (
    <article className="ticket">
      <header className="ticket-head">
        <a className="ticket-key" href={href.tickets(ticket.key)}>{ticket.key}</a>
        <p className="ticket-why">{ticket.why}</p>
        {hasCard(ticket.key) && <a className="ticket-card-link" href={href.card(ticket.key)}>Open the step-by-step card →</a>}
      </header>
      {ticket.walk && ticket.walk.length > 0 && (
        <ol className="ticket-walk">
          {ticket.walk.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      )}
    </article>
  );
}

export default TicketCard;
