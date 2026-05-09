# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Local development

No build step. Serve the project root over HTTP (required for the service worker):

```bash
python3 -m http.server 9000
# → http://localhost:9000
```

To regenerate `supabase/data.sql` after editing `MUNDIAL ALBUM.xlsm`:

```bash
"/mnt/c/Program Files/PostgreSQL/12/pgAdmin 4/python/python.exe" scripts/generar_sql.py
```

Deploy: `git add . && git commit -m "..." && git push` → GitHub Pages auto-publishes at `https://mariasanchez06.github.io/AlbumMundial`.

## Architecture

**Static PWA + Supabase backend.** No framework, no bundler.

| File | Role |
|---|---|
| `index.html` | Shell. Loads `js/supabase.min.js` (local copy of SDK), `js/config.js`, `js/app.js`. Registers `sw.js`. |
| `js/config.js` | `SUPABASE_URL` + `SUPABASE_ANON_KEY` — the only config. |
| `js/app.js` | All logic: state, views, Supabase calls. |
| `css/style.css` | All styles. Uses CSS custom property `--tc` (team color) set inline per card. |
| `sw.js` | Service worker: cache-first for static assets, network-first for Supabase API. |
| `supabase/schema.sql` | Table DDL + RLS policies (run once in Supabase SQL Editor). |
| `supabase/data.sql` | 199 `INSERT` statements generated from the Excel. Re-runnable (`ON CONFLICT DO UPDATE`). |
| `scripts/generar_sql.py` | Reads `MUNDIAL ALBUM.xlsm` with openpyxl, writes `supabase/data.sql`. |

## Data model

Single table `cromos(id, equipo, numero, nombre_jugador, siglas, cd_repetidos, obtenido)`. Unique constraint on `(equipo, numero)`. RLS allows public SELECT, UPDATE, INSERT (no auth).

## app.js patterns

- **`allCromos`** is the single source of truth, loaded once at startup and mutated in place after each Supabase UPDATE/INSERT.
- **`db`** is the Supabase client (`window.supabase` is the SDK namespace — the local variable must not be named `supabase` to avoid collision).
- Views (`todos`, `equipos`, `faltan`, `repetidos`, `stats`) are fully re-rendered on every navigation; only `toggleObtenido` and `updateRepetidos` do partial DOM updates.
- **`cromoImageKey(c)`** → `"MEX_1"` → `images/players/MEX_1.jpg`. When the image loads, `applyFoto(img)` sets it as `card.style.backgroundImage` and adds class `has-foto`; when it fails, the img element is removed and the circle fallback shows.

## Adding a new team

1. Add an entry to `TEAM_COLORS` in `app.js` (needs `bg` hex and `banner` CSS gradient).
2. Use the `+` FAB in the app to insert stickers via the modal (calls `db.from('cromos').insert()`).
3. Player images go in `images/players/` named `{SIGLAS}_{NUMERO}.jpg`.

## Known data issue

The `BRASIL` section in `MUNDIAL ALBUM.xlsm` (rows 191–210) contains Swiss player names copied by mistake. Correct those rows in the Excel and re-run `generar_sql.py` before re-importing.
