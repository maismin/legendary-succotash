import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from '@ticketingsm/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
