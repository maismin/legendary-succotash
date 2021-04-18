import { Publisher, Subjects, TicketCreatedEvent } from '@ticketingsm/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
