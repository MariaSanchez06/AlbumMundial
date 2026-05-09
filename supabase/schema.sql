-- Álbum Mundial Panini 2026
-- Ejecutar este archivo en el SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS cromos (
  id SERIAL PRIMARY KEY,
  equipo TEXT NOT NULL,
  numero INTEGER NOT NULL,
  nombre_jugador TEXT NOT NULL DEFAULT '',
  siglas TEXT DEFAULT '',
  cd_repetidos INTEGER DEFAULT 0 CHECK (cd_repetidos >= 0),
  obtenido BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (equipo, numero)
);

CREATE INDEX IF NOT EXISTS idx_cromos_equipo ON cromos(equipo);
CREATE INDEX IF NOT EXISTS idx_cromos_obtenido ON cromos(obtenido);
CREATE INDEX IF NOT EXISTS idx_cromos_nombre ON cromos(nombre_jugador);

ALTER TABLE cromos ENABLE ROW LEVEL SECURITY;

-- Lectura pública (cualquiera puede ver el álbum)
CREATE POLICY "Public read" ON cromos
  FOR SELECT USING (true);

-- Actualización pública (uso personal, sin auth)
CREATE POLICY "Public update" ON cromos
  FOR UPDATE USING (true) WITH CHECK (true);

-- Inserción pública (para añadir nuevos equipos/jugadores desde la app)
CREATE POLICY "Public insert" ON cromos
  FOR INSERT WITH CHECK (true);
