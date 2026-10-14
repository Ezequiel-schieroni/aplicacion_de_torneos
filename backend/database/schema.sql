CREATE DATABASE IF NOT EXISTS nexus_tournaments
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE nexus_tournaments;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS esport_tournaments (
  id VARCHAR(36) PRIMARY KEY,
  game VARCHAR(120) NOT NULL,
  name VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  colors JSON NOT NULL,
  owner_id VARCHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_esport_tournaments_owner
    FOREIGN KEY (owner_id) REFERENCES users(id)
    ON DELETE SET NULL,
  INDEX idx_esport_tournaments_owner_id (owner_id),
  INDEX idx_esport_tournaments_created_at (created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS esport_tournament_registrations (
  user_id VARCHAR(36) NOT NULL,
  tournament_id VARCHAR(36) NOT NULL,
  registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, tournament_id),
  CONSTRAINT fk_esport_registrations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_esport_registrations_tournament FOREIGN KEY (tournament_id) REFERENCES esport_tournaments(id) ON DELETE CASCADE,
  INDEX idx_esport_registrations_tournament_id (tournament_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sports_events (
  id VARCHAR(36) PRIMARY KEY,
  kind VARCHAR(20) NOT NULL,
  name VARCHAR(180) NOT NULL,
  sport VARCHAR(80) NOT NULL,
  venue VARCHAR(180) NOT NULL,
  event_date VARCHAR(120) NOT NULL,
  event_time VARCHAR(20) NOT NULL,
  event_format VARCHAR(80) NOT NULL,
  teams VARCHAR(255) NULL,
  description TEXT NOT NULL,
  owner_id VARCHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sports_events_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_sports_events_owner_id (owner_id),
  INDEX idx_sports_events_created_at (created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sports_event_registrations (
  user_id VARCHAR(36) NOT NULL,
  event_id VARCHAR(36) NOT NULL,
  registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, event_id),
  CONSTRAINT fk_sports_event_registrations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_sports_event_registrations_event FOREIGN KEY (event_id) REFERENCES sports_events(id) ON DELETE CASCADE,
  INDEX idx_sports_event_registrations_event_id (event_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sports_court_registrations (
  user_id VARCHAR(36) NOT NULL,
  court_id VARCHAR(60) NOT NULL,
  entered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, court_id),
  CONSTRAINT fk_sports_court_registrations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- El backend crea el usuario demo con un hash seguro al iniciar.
-- Usuario de prueba: username=demo, email=demo@nexus.local, password=demo

INSERT IGNORE INTO esport_tournaments (id, game, name, description, colors, owner_id)
VALUES
  ('default-1', 'Valorant', 'CLUTCH MASTERS', 'Torneo competitivo de Valorant.', JSON_ARRAY('#E44A61', '#7D334A'), NULL),
  ('default-2', 'League of Legends', 'LA GRIETA INVOCADA', 'Torneo de eSports 5v5 con premios.', JSON_ARRAY('#B98B43', '#4F9FB9'), NULL),
  ('default-3', 'Rocket League', 'BOOSTED CUP', 'Torneo para equipos.', JSON_ARRAY('#5D8FDC', '#D7E8FF'), NULL);
