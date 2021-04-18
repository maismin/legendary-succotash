import { Publisher, Subjects, OrderCancelledEvent } from '@ticketingsm/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
