CREATE TABLE IF NOT EXISTS counters (
  name TEXT PRIMARY KEY CHECK (name IN ('visits', 'downloads')),
  value INTEGER NOT NULL CHECK (value >= 0)
);

-- Totais acumulados informados pela equipe antes de ativar a contagem pública.
INSERT OR IGNORE INTO counters (name, value) VALUES
  ('visits', 12342),
  ('downloads', 7231);
