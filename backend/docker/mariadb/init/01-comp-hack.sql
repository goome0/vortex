-- Executado automaticamente no primeiro boot (volume vazio).
-- Cria o banco + usuário necessários pro "comp_hack".

CREATE DATABASE IF NOT EXISTS comp_hack
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'comp'@'%' IDENTIFIED BY 'F9vK3mQ7Zx2Nw8Tg6Rj1Hp4S';

GRANT ALL PRIVILEGES ON comp_hack.* TO 'comp'@'%';

FLUSH PRIVILEGES;

