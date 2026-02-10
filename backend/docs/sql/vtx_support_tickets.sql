-- Vortex support tickets (safe: new tables only)
-- Database: use the same DB configured in backend/.env (DB_DATABASE)

CREATE TABLE IF NOT EXISTS `vtx_support_tickets` (
  `id` CHAR(36) NOT NULL,
  `createdByUsername` VARCHAR(32) NOT NULL,
  `assignedToUsername` VARCHAR(32) NULL,
  `resolvedByUsername` VARCHAR(32) NULL,
  `subject` VARCHAR(140) NOT NULL,
  `category` VARCHAR(32) NULL,
  `priority` ENUM('LOW','MEDIUM','HIGH','URGENT') NOT NULL DEFAULT 'MEDIUM',
  `status` ENUM('OPEN','IN_PROGRESS','RESOLVED','CLOSED') NOT NULL DEFAULT 'OPEN',
  `resolvedAt` DATETIME(3) NULL,
  `closedAt` DATETIME(3) NULL,
  `lastMessageAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `IDX_vtx_tickets_createdBy` (`createdByUsername`),
  KEY `IDX_vtx_tickets_assignedTo` (`assignedToUsername`),
  KEY `IDX_vtx_tickets_resolvedBy` (`resolvedByUsername`),
  KEY `IDX_vtx_tickets_priority` (`priority`),
  KEY `IDX_vtx_tickets_status` (`status`),
  KEY `IDX_vtx_tickets_lastMessageAt` (`lastMessageAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `vtx_support_ticket_messages` (
  `id` CHAR(36) NOT NULL,
  `ticketId` CHAR(36) NOT NULL,
  `authorUsername` VARCHAR(32) NULL,
  `authorRole` ENUM('USER','ADMIN','SYSTEM') NOT NULL,
  `body` TEXT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `IDX_vtx_ticket_messages_ticketId` (`ticketId`),
  KEY `IDX_vtx_ticket_messages_authorUsername` (`authorUsername`),
  CONSTRAINT `FK_vtx_ticket_messages_ticket` FOREIGN KEY (`ticketId`)
    REFERENCES `vtx_support_tickets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

