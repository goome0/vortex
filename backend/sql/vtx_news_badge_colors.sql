-- Add per-news badge colors to vtx_news
-- Run: mysql -h HOST -u USER -p comp_hack < sql/vtx_news_badge_colors.sql
-- Or execute in your DB client (DBeaver, HeidiSQL, etc.)

USE comp_hack;

ALTER TABLE `vtx_news`
  ADD COLUMN `badgeColor` VARCHAR(128) NULL AFTER `badgeVariant`,
  ADD COLUMN `badgeTextColor` VARCHAR(128) NULL AFTER `badgeColor`;

