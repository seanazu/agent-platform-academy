import { href } from '../lib/router';
import type { LessonTicket } from '../lib/types';

function TicketCard({ ticket }: { ticket: LessonTicket }) {
  return (
    <article className="ticket">
      <header className="ticket-head">
        <a className="ticket-key" href={href.tickets(ticket.key)}>{ticket.key}</a>
        <p className="ticket-why">{ticket.why}</p>
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
