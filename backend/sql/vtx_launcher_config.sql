-- Create vtx_launcher_config table (launcher hero + background config)
-- Run: mysql -h HOST -u USER -p comp_hack < sql/vtx_launcher_config.sql
-- Or execute in your DB client (DBeaver, HeidiSQL, etc.)

USE comp_hack;

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
