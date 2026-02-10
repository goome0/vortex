import { ErrorResponse } from '@/common/responses/error-response';
import { SuccessResponse } from '@/common/responses/success-response';
import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  EVtxTicketAuthorRole,
  VtxSupportTicketMessageEntity,
} from '@/database/entities/vtx-support-ticket-message.entity';
import {
  EVtxTicketPriority,
  EVtxTicketStatus,
  VtxSupportTicketEntity,
} from '@/database/entities/vtx-support-ticket.entity';
import { AddTicketMessageInputDTO, CreateTicketInputDTO, ResolveTicketInputDTO } from './tickets.input';

@Injectable()
export class TicketsService {
  public constructor(
    @InjectRepository(VtxSupportTicketEntity)
    private readonly ticketsRepository: Repository<VtxSupportTicketEntity>,
    @InjectRepository(VtxSupportTicketMessageEntity)
    private readonly messagesRepository: Repository<VtxSupportTicketMessageEntity>,
  ) {}

  private now(): Date {
    return new Date();
  }

  private sanitizeCategory(category: string | null): string | null {
    // Do not allow legacy/invalid categories to leak via API responses.
    if (!category) return null;
    if (category === 'PAYMENT') return null;
    return category;
  }

  private sanitizeTicket<T extends { category: string | null }>(ticket: T): T {
    return { ...ticket, category: this.sanitizeCategory(ticket.category) };
  }

  private notFound(): never {
    throw ErrorResponse.toHttpException({
      message: 'Ticket not found',
      statusCode: HttpStatus.NOT_FOUND,
      code: 'TICKET_NOT_FOUND',
    });
  }

  private forbidden(): never {
    throw ErrorResponse.toHttpException({
      message: 'You do not have permission to access this ticket',
      statusCode: HttpStatus.FORBIDDEN,
      code: 'TICKET_FORBIDDEN',
    });
  }

  public async create(input: CreateTicketInputDTO, currentUser: CurrentUserDTO) {
    const createdAt = this.now();
    const ticket = this.ticketsRepository.create({
      createdByUsername: currentUser.username,
      assignedToUsername: null,
      resolvedByUsername: null,
      subject: input.subject,
      category: input.category ?? null,
      priority: input.priority ?? EVtxTicketPriority.MEDIUM,
      status: EVtxTicketStatus.OPEN,
      resolvedAt: null,
      closedAt: null,
      lastMessageAt: createdAt,
    });

    const savedTicket = await this.ticketsRepository.save(ticket);

    const message = this.messagesRepository.create({
      ticketId: savedTicket.id,
      ticket: savedTicket,
      authorUsername: currentUser.username,
      authorRole: EVtxTicketAuthorRole.USER,
      body: input.message,
    });
    await this.messagesRepository.save(message);

    return SuccessResponse.toJson({
      code: 'TICKET_CREATED',
      message: 'Ticket created successfully',
      path: '/tickets',
      data: { id: savedTicket.id },
      successCode: HttpStatus.CREATED,
    });
  }

  public async listMyTickets(currentUser: CurrentUserDTO) {
    const tickets = await this.ticketsRepository.find({
      where: { createdByUsername: currentUser.username },
      order: { lastMessageAt: 'DESC' },
    });

    return SuccessResponse.toJson({
      code: 'MY_TICKETS_SUCCESS',
      message: 'Tickets retrieved successfully',
      path: '/tickets/my',
      data: tickets.map((t) => this.sanitizeTicket(t)),
      successCode: HttpStatus.OK,
    });
  }

  public async getMyTicket(id: string, currentUser: CurrentUserDTO) {
    const ticket = await this.ticketsRepository.findOne({ where: { id } });
    if (!ticket) this.notFound();
    if (ticket.createdByUsername !== currentUser.username) this.forbidden();

    const messages = await this.messagesRepository.find({
      where: { ticketId: ticket.id },
      order: { createdAt: 'ASC' },
    });

    return SuccessResponse.toJson({
      code: 'TICKET_GET_SUCCESS',
      message: 'Ticket retrieved successfully',
      path: `/tickets/${id}`,
      data: { ...this.sanitizeTicket(ticket), messages },
      successCode: HttpStatus.OK,
    });
  }

  public async addUserMessage(id: string, input: AddTicketMessageInputDTO, currentUser: CurrentUserDTO) {
    const ticket = await this.ticketsRepository.findOne({ where: { id } });
    if (!ticket) this.notFound();
    if (ticket.createdByUsername !== currentUser.username) this.forbidden();

    if (ticket.status === EVtxTicketStatus.CLOSED) {
      throw ErrorResponse.toHttpException({
        message: 'Ticket is closed',
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'TICKET_CLOSED',
      });
    }

    const msg = this.messagesRepository.create({
      ticketId: ticket.id,
      ticket,
      authorUsername: currentUser.username,
      authorRole: EVtxTicketAuthorRole.USER,
      body: input.message,
    });
    await this.messagesRepository.save(msg);

    await this.ticketsRepository.update(
      { id: ticket.id },
      { lastMessageAt: this.now(), status: ticket.status === EVtxTicketStatus.RESOLVED ? EVtxTicketStatus.IN_PROGRESS : ticket.status },
    );

    return SuccessResponse.toJson({
      code: 'TICKET_MESSAGE_ADDED',
      message: 'Message added successfully',
      path: `/tickets/${id}/messages`,
      successCode: HttpStatus.CREATED,
    });
  }

  public async closeByUser(id: string, currentUser: CurrentUserDTO) {
    const ticket = await this.ticketsRepository.findOne({ where: { id } });
    if (!ticket) this.notFound();
    if (ticket.createdByUsername !== currentUser.username) this.forbidden();

    if (ticket.status === EVtxTicketStatus.CLOSED) {
      return SuccessResponse.toJson({
        code: 'TICKET_ALREADY_CLOSED',
        message: 'Ticket already closed',
        path: `/tickets/${id}/close`,
        successCode: HttpStatus.OK,
      });
    }

    const closedAt = this.now();
    await this.ticketsRepository.update(
      { id: ticket.id },
      { status: EVtxTicketStatus.CLOSED, closedAt, lastMessageAt: closedAt },
    );

    return SuccessResponse.toJson({
      code: 'TICKET_CLOSED',
      message: 'Ticket closed successfully',
      path: `/tickets/${id}/close`,
      successCode: HttpStatus.OK,
    });
  }

  // --- Admin ---

  public async listAll(currentUser: CurrentUserDTO) {
    const tickets = await this.ticketsRepository.find({
      order: { lastMessageAt: 'DESC' },
    });

    return SuccessResponse.toJson({
      code: 'TICKETS_LIST_SUCCESS',
      message: 'Tickets retrieved successfully',
      path: '/admin/tickets',
      data: tickets.map((t) => this.sanitizeTicket(t)),
      successCode: HttpStatus.OK,
    });
  }

  public async getByAdmin(id: string, currentUser: CurrentUserDTO) {
    const ticket = await this.ticketsRepository.findOne({ where: { id } });
    if (!ticket) this.notFound();

    const messages = await this.messagesRepository.find({
      where: { ticketId: ticket.id },
      order: { createdAt: 'ASC' },
    });

    return SuccessResponse.toJson({
      code: 'TICKET_GET_SUCCESS',
      message: 'Ticket retrieved successfully',
      path: `/admin/tickets/${id}`,
      data: { ...this.sanitizeTicket(ticket), messages },
      successCode: HttpStatus.OK,
    });
  }

  public async addAdminMessage(id: string, input: AddTicketMessageInputDTO, currentUser: CurrentUserDTO) {
    const ticket = await this.ticketsRepository.findOne({ where: { id } });
    if (!ticket) this.notFound();

    if (ticket.status === EVtxTicketStatus.CLOSED) {
      throw ErrorResponse.toHttpException({
        message: 'Ticket is closed',
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'TICKET_CLOSED',
      });
    }

    const msg = this.messagesRepository.create({
      ticketId: ticket.id,
      ticket,
      authorUsername: currentUser.username,
      authorRole: EVtxTicketAuthorRole.ADMIN,
      body: input.message,
    });
    await this.messagesRepository.save(msg);

    const updatedAt = this.now();
    const status = ticket.status === EVtxTicketStatus.OPEN ? EVtxTicketStatus.IN_PROGRESS : ticket.status;
    await this.ticketsRepository.update({ id: ticket.id }, { lastMessageAt: updatedAt, status, assignedToUsername: ticket.assignedToUsername ?? currentUser.username });

    return SuccessResponse.toJson({
      code: 'TICKET_MESSAGE_ADDED',
      message: 'Message added successfully',
      path: `/admin/tickets/${id}/messages`,
      successCode: HttpStatus.CREATED,
    });
  }

  public async resolve(id: string, input: ResolveTicketInputDTO, currentUser: CurrentUserDTO) {
    const ticket = await this.ticketsRepository.findOne({ where: { id } });
    if (!ticket) this.notFound();

    const resolvedAt = this.now();
    await this.ticketsRepository.update(
      { id: ticket.id },
      {
        status: EVtxTicketStatus.RESOLVED,
        resolvedAt,
        resolvedByUsername: currentUser.username,
        assignedToUsername: ticket.assignedToUsername ?? currentUser.username,
        lastMessageAt: resolvedAt,
      },
    );

    const resolutionBody = input.message?.trim();
    const shouldWrite = typeof resolutionBody === 'string' && resolutionBody.length > 0;

    if (shouldWrite) {
      const msg = this.messagesRepository.create({
        ticketId: ticket.id,
        ticket,
        authorUsername: currentUser.username,
        authorRole: EVtxTicketAuthorRole.ADMIN,
        body: resolutionBody,
      });
      await this.messagesRepository.save(msg);
    }

    return SuccessResponse.toJson({
      code: 'TICKET_RESOLVED',
      message: 'Ticket resolved successfully',
      path: `/admin/tickets/${id}/resolve`,
      successCode: HttpStatus.OK,
    });
  }
}

