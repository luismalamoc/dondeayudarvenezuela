PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS publicaciones (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo      TEXT NOT NULL DEFAULT 'persona' CHECK(tipo IN ('persona', 'organizacion')),
  titulo    TEXT NOT NULL,
  info      TEXT NOT NULL,
  pais      TEXT,
  estado_ve TEXT,
  ciudad    TEXT,
  activo    INTEGER DEFAULT 1,
  creado_en TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contactos (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  publicacion_id  INTEGER NOT NULL REFERENCES publicaciones(id) ON DELETE CASCADE,
  tipo            TEXT NOT NULL CHECK(tipo IN ('instagram', 'twitter_x', 'whatsapp')),
  valor           TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_contactos_publicacion ON contactos(publicacion_id);
CREATE INDEX IF NOT EXISTS idx_publicaciones_activo ON publicaciones(activo);
CREATE INDEX IF NOT EXISTS idx_publicaciones_tipo ON publicaciones(tipo);
CREATE INDEX IF NOT EXISTS idx_publicaciones_pais ON publicaciones(pais);
CREATE INDEX IF NOT EXISTS idx_publicaciones_estado ON publicaciones(estado_ve);
