PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS entradas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo TEXT NOT NULL CHECK(tipo IN ('persona', 'organizacion')),
  nombre TEXT NOT NULL,
  campana TEXT,
  descripcion_es TEXT,
  descripcion_en TEXT,
  verificacion_url TEXT,
  estado_ve TEXT,
  ciudad_ve TEXT,
  activo INTEGER DEFAULT 1,
  destacado INTEGER DEFAULT 0,
  creado_en TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS metodos_pago (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entrada_id INTEGER REFERENCES entradas(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  pais TEXT,
  detalle TEXT NOT NULL,
  moneda TEXT
);

CREATE TABLE IF NOT EXISTS solicitudes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  campana TEXT,
  tipo TEXT NOT NULL,
  descripcion TEXT,
  verificacion_url TEXT,
  contacto TEXT,
  estado TEXT DEFAULT 'pendiente' CHECK(estado IN ('pendiente','aprobado','rechazado')),
  creado_en TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS metodos_contacto (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entrada_id INTEGER REFERENCES entradas(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK(tipo IN ('whatsapp', 'instagram', 'x', 'web')),
  label TEXT,
  detalle TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_metodos_entrada ON metodos_pago(entrada_id);
CREATE INDEX IF NOT EXISTS idx_contactos_entrada ON metodos_contacto(entrada_id);
CREATE INDEX IF NOT EXISTS idx_entradas_activo ON entradas(activo);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON solicitudes(estado);
