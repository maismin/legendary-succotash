import { Publisher, Subjects, TicketUpdatedEvent } from '@ticketingsm/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
