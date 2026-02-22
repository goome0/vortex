-- Vortex Admin tables (bundles, scheduled CP, news)
-- Runs after 01-comp-hack.sql
-- Safe to run multiple times: uses IF NOT EXISTS guards.

USE comp_hack;

CREATE TABLE IF NOT EXISTS `vtx_item_bundles` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(64) NOT NULL,
  `description` TEXT NULL,
  `cpCost` INT NOT NULL DEFAULT 0,
  `products` TEXT NOT NULL,
  `createdByUsername` VARCHAR(32) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_vtx_item_bundles_name` (`name`),
  KEY `IDX_vtx_item_bundles_createdByUsername` (`createdByUsername`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `vtx_item_bundle_send_batches` (
  `id` CHAR(36) NOT NULL,
  `bundleId` CHAR(36) NOT NULL,
  `bundleName` VARCHAR(64) NOT NULL,
  `cpCost` INT NOT NULL DEFAULT 0,
  `products` TEXT NOT NULL,
  `reason` VARCHAR(140) NULL,
  `createdByUsername` VARCHAR(32) NOT NULL,
  `status` ENUM('PENDING','PROCESSING','COMPLETED','FAILED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `scheduledAt` DATETIME(3) NOT NULL,
  `completedAt` DATETIME(3) NULL,
  `totalRecipients` INT NOT NULL DEFAULT 0,
  `processedCount` INT NOT NULL DEFAULT 0,
  `successCount` INT NOT NULL DEFAULT 0,
  `failureCount` INT NOT NULL DEFAULT 0,
  `lastError` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `IDX_vtx_item_bundle_send_batches_bundleId` (`bundleId`),
  KEY `IDX_vtx_item_bundle_send_batches_createdByUsername` (`createdByUsername`),
  KEY `IDX_vtx_item_bundle_send_batches_status` (`status`),
  KEY `IDX_vtx_item_bundle_send_batches_scheduledAt` (`scheduledAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `vtx_item_bundle_send_recipients` (
  `id` CHAR(36) NOT NULL,
  `batchId` CHAR(36) NOT NULL,
  `username` VARCHAR(32) NOT NULL,
  `status` ENUM('PENDING','SENT','FAILED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `attempts` INT NOT NULL DEFAULT 0,
  `lastError` TEXT NULL,
  `sentAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `IDX_vtx_item_bundle_send_recipients_batchId` (`batchId`),
  KEY `IDX_vtx_item_bundle_send_recipients_username` (`username`),
  KEY `IDX_vtx_item_bundle_send_recipients_status` (`status`),
  CONSTRAINT `FK_vtx_item_bundle_send_recipients_batchId`
    FOREIGN KEY (`batchId`) REFERENCES `vtx_item_bundle_send_batches` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `vtx_scheduled_cp_grants` (
  `id` CHAR(36) NOT NULL,
  `username` VARCHAR(32) NOT NULL,
  `amount` INT NOT NULL,
  `reason` VARCHAR(140) NULL,
  `createdByUsername` VARCHAR(32) NOT NULL,
  `status` ENUM('PENDING','PROCESSING','COMPLETED','FAILED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `scheduledAt` DATETIME(3) NOT NULL,
  `processedAt` DATETIME(3) NULL,
  `previousCp` INT NULL,
  `newCp` INT NULL,
  `attempts` INT NOT NULL DEFAULT 0,
  `lastError` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `IDX_vtx_scheduled_cp_grants_username` (`username`),
  KEY `IDX_vtx_scheduled_cp_grants_createdByUsername` (`createdByUsername`),
  KEY `IDX_vtx_scheduled_cp_grants_status` (`status`),
  KEY `IDX_vtx_scheduled_cp_grants_scheduledAt` (`scheduledAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `vtx_news` (
  `id` CHAR(36) NOT NULL,
  `slug` VARCHAR(96) NOT NULL,
  `title` VARCHAR(180) NOT NULL,
  `excerpt` VARCHAR(320) NULL,
  `content` TEXT NULL,
  `category` VARCHAR(48) NULL,
  `badgeVariant` ENUM('default','info','warning','danger') NOT NULL DEFAULT 'default',
  `featured` TINYINT(1) NOT NULL DEFAULT 0,
  `readTime` VARCHAR(16) NULL,
  `imageUrl` VARCHAR(2048) NULL,
  `isPublished` TINYINT(1) NOT NULL DEFAULT 0,
  `publishedAt` DATETIME(3) NULL,
  `createdByUsername` VARCHAR(32) NULL,
  `updatedByUsername` VARCHAR(32) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_vtx_news_slug` (`slug`),
  KEY `IDX_vtx_news_title` (`title`),
  KEY `IDX_vtx_news_category` (`category`),
  KEY `IDX_vtx_news_featured` (`featured`),
  KEY `IDX_vtx_news_isPublished` (`isPublished`),
  KEY `IDX_vtx_news_publishedAt` (`publishedAt`),
  KEY `IDX_vtx_news_createdByUsername` (`createdByUsername`),
  KEY `IDX_vtx_news_updatedByUsername` (`updatedByUsername`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `vtx_launcher_config` (
  `id` INT NOT NULL DEFAULT 1,
  `heroSubtitle` VARCHAR(128) NULL,
  `heroTitle` VARCHAR(256) NULL,
  `heroDescription` TEXT NULL,
  `backgroundUrl` VARCHAR(2048) NULL,
  `backgroundAlt` VARCHAR(256) NULL,
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
