-- Add UI color fields to vtx_launcher_config
-- Run: mysql -h HOST -u USER -p comp_hack < sql/vtx_launcher_config_ui_colors.sql
-- Or execute in your DB client (DBeaver, HeidiSQL, etc.)

USE comp_hack;

ALTER TABLE `vtx_launcher_config`
  ADD COLUMN `heroSubtitleColor` VARCHAR(128) NULL AFTER `heroSubtitle`,
  ADD COLUMN `playButtonBackground` VARCHAR(128) NULL AFTER `heroDescription`,
  ADD COLUMN `playButtonHoverBackground` VARCHAR(128) NULL AFTER `playButtonBackground`,
  ADD COLUMN `playButtonTextColor` VARCHAR(128) NULL AFTER `playButtonHoverBackground`;

