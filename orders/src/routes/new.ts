import express, { Request, Response } from 'express';
import {
  BadRequestError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from '@ticketingsm/common';
import { body } from 'express-validator';
import mongoose from 'mongoose';

import { Ticket } from '../models/ticket';
import { Order, OrderStatus } from '../models/order';
import { natsWrapper } from '../nats-wrapper';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';

const router = express.Router();
const EXPIRATION_WINDOW_SECONDS = 15 * 60;

router.post(
  '/api/orders',
  requireAuth,
  [
    body('ticketId')
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('ticketId must be provided'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    // find the ticket the user is trying to order in the database
    const { ticketId } = req.body;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }

    // make sure that the ticket isn't already reserved
    // run query to look at all orders, and find one order where the ticket matches and the status it not cancelled
    // if we do find that order, then the ticket is reserved
    const isReserved = await ticket.isReserved();
    if (isReserved) {
      throw new BadRequestError('Ticket is already reserved');
    }

    // calculate an expiration date for the order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // build the order and save it to the database
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket,
    });
    await order.save();

    // publish an event saying that an order was created
    await new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      version: order.version,
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    });

    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
