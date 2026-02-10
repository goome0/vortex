import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VtxSupportTicketEntity } from '@/database/entities/vtx-support-ticket.entity';
import { VtxSupportTicketMessageEntity } from '@/database/entities/vtx-support-ticket-message.entity';
import { TicketsController } from './tickets.controller';
import { AdminTicketsController } from './admin-tickets.controller';
import { TicketsService } from './tickets.service';

@Module({
  imports: [TypeOrmModule.forFeature([VtxSupportTicketEntity, VtxSupportTicketMessageEntity])],
  controllers: [TicketsController, AdminTicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}

