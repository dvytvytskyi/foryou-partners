import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CreateTicketMessageDto } from './dto/create-ticket-message.dto';

@Injectable()
export class SupportService {
  constructor(private prisma: PrismaService) {}

  async createTicket(userId: string, partnerId: string | null, dto: CreateTicketDto) {
    if (!partnerId) {
      throw new ForbiddenException('User is not associated with a partner');
    }

    const ticket = await this.prisma.ticket.create({
      data: {
        partnerId,
        subject: dto.subject,
        status: 'OPEN',
        messages: {
          create: {
            senderId: userId,
            message: dto.message,
          },
        },
      },
      include: {
        messages: true,
      },
    });

    return {
      ...ticket,
      messages: ticket.messages.map(msg => ({
        ...msg,
        id: msg.id.toString(),
      })),
    };
  }

  async getTickets(partnerId?: string) {
    const whereClause = partnerId ? { partnerId } : {};

    const tickets = await this.prisma.ticket.findMany({
      where: whereClause,
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        partner: {
          select: { name: true },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1, // Include just the last message for the list view
        },
      },
    });

    return tickets.map(ticket => ({
      ...ticket,
      messages: ticket.messages.map(msg => ({
        ...msg,
        id: msg.id.toString(),
      })),
    }));
  }

  async getTicket(id: string, partnerId?: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            sender: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        },
        partner: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (partnerId && ticket.partnerId !== partnerId) {
      throw new ForbiddenException('You do not have access to this ticket');
    }

    // Convert BigInt IDs to string for JSON serialization
    return {
      ...ticket,
      messages: ticket.messages.map(msg => ({
        ...msg,
        id: msg.id.toString(),
      })),
    };
  }

  async addMessage(id: string, userId: string, partnerId: string | null, dto: CreateTicketMessageDto) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (partnerId && ticket.partnerId !== partnerId) {
      throw new ForbiddenException('You do not have access to this ticket');
    }

    if (ticket.status === 'CLOSED') {
      throw new ForbiddenException('Cannot reply to a closed ticket');
    }

    // Determine what status to set based on who replies
    // If partner replies, set to OPEN (if not already)
    // If admin replies, we could leave it as is or change it
    // For now, if a partner replies and it was RESOLVED/CLOSED, reopen it.
    let updateStatus = {};
    if (partnerId && ticket.status === 'RESOLVED') {
      updateStatus = { status: 'OPEN' };
    }

    const [, newMessage] = await this.prisma.$transaction([
      this.prisma.ticket.update({
        where: { id },
        data: {
          updatedAt: new Date(),
          ...updateStatus,
        },
      }),
      this.prisma.ticketMessage.create({
        data: {
          ticketId: id,
          senderId: userId,
          message: dto.message,
        },
        include: {
          sender: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      }),
    ]);

    // Create a notification for the other party
    if (partnerId) {
      // Sent by partner, notify admins
      const admins = await this.prisma.user.findMany({ where: { role: 'admin' } });
      if (admins.length > 0) {
        await this.prisma.notification.createMany({
          data: admins.map(admin => ({
            userId: admin.id,
            type: 'SUPPORT_TICKET',
            title: 'Новое сообщение в тикете',
            message: `Новое сообщение в тикете: ${ticket.subject}`,
            link: `/support/${id}`,
          })),
        });
      }
    } else {
      // Sent by admin, notify the partner
      const partnerUser = await this.prisma.user.findFirst({
        where: { partnerId: ticket.partnerId },
      });
      if (partnerUser) {
        await this.prisma.notification.create({
          data: {
            userId: partnerUser.id,
            type: 'SUPPORT_TICKET',
            title: 'Ответ от поддержки',
            message: `Новое сообщение в тикете: ${ticket.subject}`,
            link: `/support/${id}`,
          },
        });
      }
    }

    return {
      ...newMessage,
      id: newMessage.id.toString(),
    };
  }

  async closeTicket(id: string) {
    const ticket = await this.prisma.ticket.update({
      where: { id },
      data: { status: 'CLOSED' },
    });
    return ticket;
  }

  async updateTicketStatus(id: string, status: any) {
    const ticket = await this.prisma.ticket.update({
      where: { id },
      data: { status, updatedAt: new Date() },
    });
    return ticket;
  }
}

