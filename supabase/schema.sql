-- Álbum Mundial Panini 2026
-- Ejecutar este archivo en el SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS cromos (
  id SERIAL PRIMARY KEY,
  equipo TEXT NOT NULL,
  numero INTEGER NOT NULL,
  nombre_jugador TEXT NOT NULL DEFAULT '',
  siglas TEXT DEFAULT '',
  posicion TEXT DEFAULT '',
  cd_repetidos INTEGER DEFAULT 0 CHECK (cd_repetidos >= 0),
  obtenido BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (equipo, numero)
);

-- Añade posicion si la tabla ya existe y no tiene la columna
ALTER TABLE cromos ADD COLUMN IF NOT EXISTS posicion TEXT DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_cromos_equipo ON cromos(equipo);
CREATE INDEX IF NOT EXISTS idx_cromos_obtenido ON cromos(obtenido);
CREATE INDEX IF NOT EXISTS idx_cromos_nombre ON cromos(nombre_jugador);

ALTER TABLE cromos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON cromos
  FOR SELECT USING (true);

CREATE POLICY "Public update" ON cromos
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Public insert" ON cromos
  FOR INSERT WITH CHECK (true);

-- -------------------------------------------------------
-- Tabla: equipos_reg  (equipos registrados con siglas y grupo)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS equipos_reg (
  equipo TEXT PRIMARY KEY,
  siglas TEXT DEFAULT '',
  grupo  TEXT DEFAULT ''
);

ALTER TABLE equipos_reg ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read"   ON equipos_reg FOR SELECT USING (true);
CREATE POLICY "Public insert" ON equipos_reg FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON equipos_reg FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete" ON equipos_reg FOR DELETE USING (true);

-- -------------------------------------------------------
-- Tabla: grupos  (asignación equipo → grupo, sobrescribe equipos_reg.grupo)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS grupos (
  equipo TEXT PRIMARY KEY,
  grupo  TEXT NOT NULL
);

ALTER TABLE grupos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read"   ON grupos FOR SELECT USING (true);
CREATE POLICY "Public insert" ON grupos FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON grupos FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete" ON grupos FOR DELETE USING (true);
