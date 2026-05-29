/* ===== Supabase init ===== */
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ===== State ===== */
let allCromos  = [];
let currentView = 'inicio';
let searchTerm  = '';
let equipoFilter = '';
let gruposMap     = {};   // { equipo: grupo }
let equiposReg    = [];   // [{ equipo, siglas, grupo, color }]
let teamColorsDB  = {};   // { equipo: '#rrggbb' } — colores guardados por el usuario

/* ===== Team color map ===== */
const TEAM_COLORS = {
  'FWC':               { bg: '#f0a500', banner: 'linear-gradient(90deg, #032979 50%, #f0a500 50%)' },
  'MEXICO':            { bg: '#006847', banner: 'linear-gradient(90deg, #006847 33.3%, #ffffff 33.3%, #ffffff 66.6%, #ce1126 66.6%)' },
  'BRASIL':            { bg: '#009c3b', banner: 'linear-gradient(90deg, #009c3b 25%, #ffdf00 25%, #ffdf00 75%, #009c3b 75%)' },
  'SUIZA':             { bg: '#ff0000', banner: 'linear-gradient(90deg, #ff0000 35%, #ffffff 35%, #ffffff 65%, #ff0000 65%)' },
  'QATAR':             { bg: '#8d153a', banner: 'linear-gradient(90deg, #8d153a 65%, #ffffff 65%)' },
  'CANADÁ':            { bg: '#ff0000', banner: 'linear-gradient(90deg, #ff0000 25%, #ffffff 25%, #ffffff 75%, #ff0000 75%)' },
  'BOSNIA-HERZEGOVINA':{ bg: '#003da5', banner: 'linear-gradient(90deg, #003da5 60%, #ffcc00 60%)' },
  'COREA DEL SUR':     { bg: '#c60c30', banner: 'linear-gradient(90deg, #ffffff 20%, #c60c30 20%, #c60c30 55%, #003478 55%, #ffffff 80%)' },
  'REPÚBLICA CHECA':   { bg: '#d7141a', banner: 'linear-gradient(90deg, #ffffff 33%, #d7141a 33%, #d7141a 66%, #11457e 66%)' },
  'SUDÁFRICA':         { bg: '#007a4d', banner: 'linear-gradient(90deg, #007a4d 20%, #000000 20%, #000000 35%, #ffb612 35%, #ffb612 65%, #de3831 65%, #de3831 80%, #002395 80%)' },
  'ALEMANIA':          { bg: '#dd0000', banner: 'linear-gradient(90deg, #000000 33%, #dd0000 33%, #dd0000 66%, #ffce00 66%)' },
  'ARABIA SAUDITA':    { bg: '#006c35', banner: 'linear-gradient(90deg, #006c35 70%, #ffffff 70%)' },
  'ARGELIA':           { bg: '#006233', banner: 'linear-gradient(90deg, #006233 50%, #ffffff 50%)' },
  'ARGENTINA':         { bg: '#74acdf', banner: 'linear-gradient(90deg, #74acdf 25%, #ffffff 25%, #ffffff 75%, #74acdf 75%)' },
  'AUSTRALIA':         { bg: '#00008b', banner: 'linear-gradient(90deg, #00008b 55%, #cc0000 55%, #cc0000 65%, #ffffff 65%)' },
  'AUSTRIA':           { bg: '#ed2939', banner: 'linear-gradient(90deg, #ed2939 33%, #ffffff 33%, #ffffff 66%, #ed2939 66%)' },
  'BÉLGICA':           { bg: '#fdda25', banner: 'linear-gradient(90deg, #000000 33%, #fdda25 33%, #fdda25 66%, #ef3340 66%)' },
  'CABO VERDE':        { bg: '#003893', banner: 'linear-gradient(90deg, #003893 55%, #cf2027 55%, #cf2027 62%, #f4f4f4 62%, #f4f4f4 69%, #cf2027 69%)' },
  'COCA-COLA':         { bg: '#f40009', banner: 'linear-gradient(90deg, #f40009 60%, #ffffff 60%)' },
  'COLOMBIA':          { bg: '#fcd116', banner: 'linear-gradient(90deg, #fcd116 40%, #003087 40%, #003087 66%, #ce1126 66%)' },
  'CONGO':             { bg: '#009543', banner: 'linear-gradient(135deg, #009543 40%, #fbde4a 40%, #fbde4a 60%, #dc241f 60%)' },
  'COSTA DE MARFIL':   { bg: '#f77f00', banner: 'linear-gradient(90deg, #f77f00 33%, #ffffff 33%, #ffffff 66%, #009a44 66%)' },
  'CROACIA':           { bg: '#ff0000', banner: 'linear-gradient(90deg, #ff0000 33%, #ffffff 33%, #ffffff 66%, #0032a0 66%)' },
  'CURAZAO':           { bg: '#002b7f', banner: 'linear-gradient(90deg, #002b7f 65%, #f9e814 65%, #f9e814 78%, #002b7f 78%)' },
  'ECUADOR':           { bg: '#ffd100', banner: 'linear-gradient(90deg, #ffd100 40%, #003087 40%, #003087 66%, #ef3340 66%)' },
  'EGIPTO':            { bg: '#ce1126', banner: 'linear-gradient(90deg, #ce1126 33%, #ffffff 33%, #ffffff 66%, #000000 66%)' },
  'ESCOCIA':           { bg: '#003078', banner: 'linear-gradient(135deg, #003078 45%, #ffffff 45%, #ffffff 55%, #003078 55%)' },
  'ESPAÑA':            { bg: '#c60b1e', banner: 'linear-gradient(90deg, #c60b1e 25%, #ffc400 25%, #ffc400 75%, #c60b1e 75%)' },
  'FRANCIA':           { bg: '#002395', banner: 'linear-gradient(90deg, #002395 33%, #ffffff 33%, #ffffff 66%, #ed2939 66%)' },
  'GHANA':             { bg: '#006b3f', banner: 'linear-gradient(90deg, #ce1126 33%, #fcd116 33%, #fcd116 66%, #006b3f 66%)' },
  'HAITÍ':             { bg: '#00209f', banner: 'linear-gradient(90deg, #00209f 50%, #d21034 50%)' },
  'INGLATERRA':        { bg: '#cf142b', banner: 'linear-gradient(90deg, #ffffff 35%, #cf142b 35%, #cf142b 65%, #ffffff 65%)' },
  'IRAK':              { bg: '#ce1126', banner: 'linear-gradient(90deg, #ce1126 33%, #ffffff 33%, #ffffff 66%, #000000 66%)' },
  'IRÁN':              { bg: '#239f40', banner: 'linear-gradient(90deg, #239f40 33%, #ffffff 33%, #ffffff 66%, #da0000 66%)' },
  'JAPON':             { bg: '#bc002d', banner: 'linear-gradient(90deg, #ffffff 30%, #bc002d 30%, #bc002d 70%, #ffffff 70%)' },
  'JORDANIA':          { bg: '#007a3d', banner: 'linear-gradient(90deg, #ce1126 20%, #000000 20%, #000000 53%, #ffffff 53%, #ffffff 77%, #007a3d 77%)' },
  'MARRUECOS':         { bg: '#c1272d', banner: 'linear-gradient(90deg, #c1272d 45%, #006233 45%, #006233 55%, #c1272d 55%)' },
  'NORUEGA':           { bg: '#ef2b2d', banner: 'linear-gradient(90deg, #ef2b2d 35%, #ffffff 35%, #ffffff 45%, #002868 45%, #002868 55%, #ffffff 55%, #ffffff 65%, #ef2b2d 65%)' },
  'NUEVA ZELANDA':     { bg: '#00247d', banner: 'linear-gradient(90deg, #00247d 60%, #cc0000 60%)' },
  'PAÍSES BAJOS':      { bg: '#ae1c28', banner: 'linear-gradient(90deg, #ae1c28 33%, #ffffff 33%, #ffffff 66%, #21468b 66%)' },
  'PANAMA':            { bg: '#db0000', banner: 'linear-gradient(90deg, #ffffff 25%, #005293 25%, #005293 50%, #ffffff 50%, #ffffff 75%, #db0000 75%)' },
  'PARAGUAY':          { bg: '#d52b1e', banner: 'linear-gradient(90deg, #d52b1e 33%, #ffffff 33%, #ffffff 66%, #0038a8 66%)' },
  'PORTUGAL':          { bg: '#006600', banner: 'linear-gradient(90deg, #006600 38%, #ff0000 38%)' },
  'SENEGAL':           { bg: '#00853f', banner: 'linear-gradient(90deg, #00853f 33%, #fdef42 33%, #fdef42 66%, #e31b23 66%)' },
  'SUECIA':            { bg: '#006aa7', banner: 'linear-gradient(90deg, #006aa7 35%, #fecc02 35%, #fecc02 48%, #006aa7 48%, #006aa7 52%, #fecc02 52%, #fecc02 65%, #006aa7 65%)' },
  'TÚNEZ':             { bg: '#e70013', banner: 'linear-gradient(90deg, #e70013 40%, #ffffff 40%, #ffffff 60%, #e70013 60%)' },
  'TURQUIA':           { bg: '#e30a17', banner: 'linear-gradient(90deg, #e30a17 55%, #ffffff 55%, #ffffff 68%, #e30a17 68%)' },
  'URUGUAY':           { bg: '#0038a8', banner: 'linear-gradient(90deg, #ffffff 25%, #0038a8 25%, #0038a8 50%, #ffffff 50%, #ffffff 75%, #0038a8 75%)' },
  'USA':               { bg: '#3c3b6e', banner: 'linear-gradient(90deg, #3c3b6e 35%, #ffffff 35%, #ffffff 65%, #b22234 65%)' },
  'UZBEKISTAN':        { bg: '#009fca', banner: 'linear-gradient(90deg, #009fca 33%, #ffffff 33%, #ffffff 66%, #1eb53a 66%)' },
};

function teamColor(equipo) {
  const base = TEAM_COLORS[equipo] || {};
  const bg   = teamColorsDB[equipo] || base.bg || '#0d6b36';
  return { bg, banner: base.banner };
}
function teamColorHex(equipo) {
  if (teamColorsDB[equipo]) return teamColorsDB[equipo];
  const tc = TEAM_COLORS[equipo];
  return tc ? tc.bg : '#0d6b36';
}

/* ===== Grupos predefinidos ===== */
const PREDEFINED_GROUPS = [
  'GRUPO A','GRUPO B','GRUPO C','GRUPO D',
  'GRUPO E','GRUPO F','GRUPO G','GRUPO H',
  'GRUPO I','GRUPO J','GRUPO K','GRUPO L',
  'ESPECIALES'
];

/* ===== Grupos & equipos — Supabase ===== */
async function loadGruposYEquipos() {
  const [gRes, eRes] = await Promise.all([
    db.from('grupos').select('*'),
    db.from('equipos_reg').select('*')
  ]);
  gruposMap    = {};
  teamColorsDB = {};
  equiposReg   = eRes.data || [];
  equiposReg.forEach(r => {
    if (r.grupo)  gruposMap[r.equipo]    = r.grupo;
    if (r.color)  teamColorsDB[r.equipo] = r.color;
  });
  // La tabla grupos tiene prioridad (más actualizada)
  if (gRes.data) gRes.data.forEach(r => { gruposMap[r.equipo] = r.grupo; });
}

async function migrateLocalStorage() {
  // Limpiar siempre los datos legacy de localStorage
  const clearLegacy = () => {
    localStorage.removeItem('grupos_map');
    localStorage.removeItem('equipos_reg');
    localStorage.removeItem('grupos_list');
  };
  if (localStorage.getItem('sb_migrated')) { clearLegacy(); return; }
  try {
    const localMap   = JSON.parse(localStorage.getItem('grupos_map')  || '{}');
    const localTeams = JSON.parse(localStorage.getItem('equipos_reg') || '[]');
    if (Object.keys(localMap).length === 0 && localTeams.length === 0) {
      localStorage.setItem('sb_migrated', '1');
      return;
    }
    // Si Supabase ya tiene datos, no reinsertamos
    const { data: existing } = await db.from('equipos_reg').select('equipo').limit(1);
    if (existing && existing.length > 0) { clearLegacy(); localStorage.setItem('sb_migrated', '1'); return; }
    const gruposRows = Object.entries(localMap).map(([equipo, grupo]) => ({ equipo, grupo }));
    if (gruposRows.length) await db.from('grupos').insert(gruposRows);
    if (localTeams.length) await db.from('equipos_reg').insert(localTeams);
    clearLegacy();
    localStorage.setItem('sb_migrated', '1');
  } catch (e) { console.warn('Migration:', e); }
}

async function saveEquipoGrupo(equipo, grupo) {
  gruposMap[equipo] = grupo;
  const { error: e1 } = await db.from('equipos_reg').upsert({ equipo, siglas: equiposReg.find(t => t.equipo === equipo)?.siglas || '', grupo });
  const { error: e2 } = await db.from('grupos').upsert({ equipo, grupo });
  if (e1 || e2) showToast('Error guardando grupo: ' + (e1 || e2).message, 'red');
}
async function removeEquipoGrupo(equipo) {
  delete gruposMap[equipo];
  const reg = equiposReg.find(t => t.equipo === equipo);
  if (reg) reg.grupo = '';
  const r1 = await db.from('grupos').delete().eq('equipo', equipo);
  const r2 = await db.from('equipos_reg').update({ grupo: '' }).eq('equipo', equipo);

  if (r1.error || r2.error) showToast('Error quitando grupo: ' + (r1.error || r2.error).message, 'red');
}
async function saveRegisteredTeam(equipo, siglas, grupo, color) {
  equiposReg = equiposReg.filter(t => t.equipo !== equipo);
  const entry = { equipo, siglas: siglas || '', grupo: grupo || '', color: color || '' };
  equiposReg.push(entry);
  if (color) teamColorsDB[equipo] = color;
  const res = await db.from('equipos_reg').upsert(entry);
  if (res.error) { showToast('Error registrando equipo: ' + res.error.message, 'red'); return; }
  if (grupo) await saveEquipoGrupo(equipo, grupo);
}

async function saveEquipoColor(equipo, color) {
  teamColorsDB[equipo] = color;
  const existing = equiposReg.find(t => t.equipo === equipo);
  if (existing) {
    existing.color = color;
    await db.from('equipos_reg').update({ color }).eq('equipo', equipo);
  } else {
    const entry = { equipo, siglas: '', grupo: gruposMap[equipo] || '', color };
    equiposReg.push(entry);
    await db.from('equipos_reg').upsert(entry);
  }
}
async function removeRegisteredTeam(equipo) {
  equiposReg = equiposReg.filter(t => t.equipo !== equipo);
  const res = await db.from('equipos_reg').delete().eq('equipo', equipo);

  if (res.error) showToast('Error borrando equipo: ' + res.error.message, 'red');
}
function populateGruposDatalist() {
  const dl = document.getElementById('grupos-datalist');
  if (!dl) return;
  const grupos = [...new Set(Object.values(gruposMap))].sort();
  dl.innerHTML = grupos.map(g => `<option value="${g}">`).join('');
}

/* ===== Entry point ===== */
document.addEventListener('DOMContentLoaded', async () => {
  if (SUPABASE_URL === 'TU_SUPABASE_URL') {
    showConfigError();
    return;
  }
  bindNav();
  bindSearch();
  bindModal();
  bindGrupoModal();
  bindEquipoModal();
  bindBorrarModal();
  bindEditarModal();
  bindSobreModal();
  await loadCromos();
});

/* ===== Data loading ===== */
async function loadCromos() {
  showLoading();
  await migrateLocalStorage();
  const [{ data, error }] = await Promise.all([
    db.from('cromos').select('*').order('equipo').order('numero'),
    loadGruposYEquipos()
  ]);
  if (error) { showDBError(error); return; }
  allCromos = data;
  populateEquipoSelect();
  updateHeaderStats();
  renderCurrentView();
}

/* ===== Header stats ===== */
function updateHeaderStats() {
  const total   = allCromos.length;
  const tengo   = allCromos.filter(c => c.obtenido).length;
  const faltan  = total - tengo;
  const pct     = total > 0 ? Math.round(tengo / total * 100) : 0;

  document.getElementById('stat-num-obtenidos').textContent = tengo;
  document.getElementById('stat-num-faltan').textContent    = faltan;
  document.getElementById('stat-pct').textContent           = pct + '%';
}

/* ===== Navigation ===== */
function bindNav() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentView = btn.dataset.view;
      searchTerm  = '';
      equipoFilter = '';
      document.getElementById('search-input').value = '';
      document.getElementById('equipo-select').value = '';
      document.getElementById('search-container').style.display =
        ['todos', 'faltan', 'repetidos'].includes(currentView) ? '' : 'none';
      document.getElementById('equipo-select-container').style.display =
        ['equipos', 'faltan'].includes(currentView) ? '' : 'none';
      renderCurrentView();
    });
  });

  document.getElementById('header-title').addEventListener('click', () => {
    document.querySelector('[data-view="inicio"]').click();
  });
}

/* ===== Search ===== */
function bindSearch() {
  const input = document.getElementById('search-input');
  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      searchTerm = input.value.trim().toLowerCase();
      renderCurrentView();
    }, 250);
  });
}

/* ===== Equipo selector ===== */
function populateEquipoSelect() {
  const sel = document.getElementById('equipo-select');
  const equipos = [...new Set(allCromos.map(c => c.equipo))].sort();
  sel.innerHTML = '<option value="">Todos los equipos</option>' +
    equipos.map(e => `<option value="${e}">${e}</option>`).join('');
  sel.onchange = () => { equipoFilter = sel.value; renderCurrentView(); };

  // Actualiza el select del modal con todos los equipos conocidos
  const allTeamsModal = [...new Set([...equipos, ...equiposReg.map(t => t.equipo)])].sort();
  const modalSel = document.getElementById('modal-equipo');
  if (modalSel) {
    const prev = modalSel.value;
    modalSel.innerHTML = '<option value="">— Selecciona un equipo —</option>' +
      allTeamsModal.map(e => `<option value="${e}">${e}</option>`).join('');
    if (prev) modalSel.value = prev;
  }
}

/* ===== Render dispatcher ===== */
function renderCurrentView() {
  const content = document.getElementById('main-content');
  switch (currentView) {
    case 'inicio':    renderInicio(content); break;
    case 'todos':     renderGrid(content, applySearch(allCromos), 'Todos los cromos'); break;
    case 'equipos':   renderEquipos(content); break;
    case 'faltan': {
      let list = allCromos.filter(c => !c.obtenido);
      if (equipoFilter) list = list.filter(c => c.equipo === equipoFilter);
      renderGrid(content, applySearch(list), 'Sin obtener');
      break;
    }
    case 'repetidos': renderGrid(content, applySearch(allCromos.filter(c => c.cd_repetidos > 0)), 'Repetidos'); break;
    case 'stats':     renderStats(content); break;
  }
}

const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function applySearch(list) {
  if (!searchTerm) return list;
  const q = norm(searchTerm);
  return list.filter(c =>
    norm(c.nombre_jugador).includes(q) ||
    norm(c.equipo).includes(q) ||
    (c.siglas && norm(c.siglas).includes(q))
  );
}

/* ===== Grid view ===== */
function renderGrid(container, cromos, title) {
  if (cromos.length === 0) {
    container.innerHTML = emptyState(
      currentView === 'repetidos' ? '📦' : '🔍',
      currentView === 'repetidos' ? 'No tienes repetidos' : 'Sin resultados',
      currentView === 'repetidos' ? 'Cuando tengas cromos repetidos aparecerán aquí.' : 'Prueba con otro término de búsqueda.'
    );
    return;
  }
  container.innerHTML = `
    <div class="section-title">
      ${title}
      <span class="section-count">${cromos.length}</span>
    </div>
    <div class="cromos-grid">
      ${cromos.map(cromoCard).join('')}
    </div>`;
  bindCardEvents(container);
}

/* ===== Equipos view ===== */
function renderEquipos(container) {
  const regTeams  = equiposReg;
  const filter    = equipoFilter;

  const teamsFromDB = [...new Set(allCromos.map(c => c.equipo))];
  const allTeams    = [...new Set([...teamsFromDB, ...regTeams.map(t => t.equipo)])].sort();

  const groups = {};
  allTeams.forEach(eq => {
    const g = gruposMap[eq] || 'Sin grupo';
    if (!groups[g]) groups[g] = [];
    groups[g].push(eq);
  });

  // Mostrar siempre los grupos predefinidos + los custom
  const extraGroups = Object.keys(groups).filter(g => !PREDEFINED_GROUPS.includes(g) && g !== 'Sin grupo').sort();
  const sortedGroups = [...PREDEFINED_GROUPS, ...extraGroups, ...(groups['Sin grupo'] ? ['Sin grupo'] : [])];

  const header = `
    <div class="equipos-header">
      <span class="section-title" style="margin-bottom:0">
        Equipos <span class="section-count">${allTeams.length}</span>
      </span>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn-nuevo-equipo" id="btn-anadir-jugadores">+ Añadir jugador</button>
        <button class="btn-nuevo-equipo" id="btn-nuevo-equipo">+ Añadir equipo</button>
        <button class="btn-nuevo-equipo btn-nuevo-equipo-danger" id="btn-borrar-equipo">Borrar equipo</button>
      </div>
    </div>`;

  const content = sortedGroups.map(grupo => {
    const equiposGrupo = filter
      ? (groups[grupo] || []).filter(e => e === filter)
      : (groups[grupo] || []);
    if (filter && equiposGrupo.length === 0) return '';

    const sections = equiposGrupo.map(eq => {
      const cromos = allCromos.filter(c => c.equipo === eq);
      const tengo  = cromos.filter(c => c.obtenido).length;
      const total  = cromos.length;
      const pct    = total > 0 ? Math.round(tengo / total * 100) : 0;
      const enGrupo = grupo !== 'Sin grupo';
      return `
        <div class="team-section collapsed" data-equipo="${eq}">
          <div class="team-header team-toggle">
            <input type="color" class="team-color-input" data-equipo="${eq}" value="${teamColorHex(eq)}" title="Cambiar color">
            <span class="team-name">${eq}</span>
            <div class="team-progress-wrap">
              <div class="team-progress-bar">
                <div class="team-progress-fill" style="width:${pct}%"></div>
              </div>
              <div class="team-pct">${tengo}/${total}</div>
            </div>
            <span style="color:var(--gold);font-weight:700">${pct}%</span>
            <span class="team-chevron">▼</span>
          </div>
          ${total > 0
            ? `<div class="cromos-grid">${cromos.map(cromoCard).join('')}</div>`
            : `<div class="team-no-cromos">Sin cromos todavía — pulsa "Nuevo equipo" para añadir</div>`
          }
        </div>`;
    }).join('');

    return `
      <div class="group-section collapsed" data-grupo="${grupo}">
        <div class="group-header group-toggle">
          <span><span class="group-chevron">▼</span>${grupo}</span>
          <div class="group-header-btns">
            <button class="btn-add-equipo-grupo btn-add-equipo-only" data-grupo="${grupo}">Añadir</button>
            <button class="btn-add-equipo-grupo btn-borrar-grupo" data-grupo="${grupo}">Quitar</button>
          </div>
        </div>
        ${sections}
      </div>`;
  }).join('');

  const expanded = new Set(
    [...container.querySelectorAll('.team-section:not(.collapsed)')]
      .map(s => s.dataset.equipo)
  );
  const expandedGroups = new Set(
    [...container.querySelectorAll('.group-section:not(.collapsed)')]
      .map(s => s.dataset.grupo)
  );

  container.innerHTML = header + content;

  container.querySelectorAll('.team-section').forEach(s => {
    if (expanded.has(s.dataset.equipo)) s.classList.remove('collapsed');
  });
  container.querySelectorAll('.group-section').forEach(s => {
    if (expandedGroups.has(s.dataset.grupo)) s.classList.remove('collapsed');
  });

  bindCardEvents(container);
  container.querySelectorAll('.team-toggle').forEach(header => {
    header.addEventListener('click', e => {
      if (e.target.closest('.group-header-btns')) return;
      if (e.target.classList.contains('team-color-input')) return;
      header.closest('.team-section').classList.toggle('collapsed');
    });
  });
  container.querySelectorAll('.team-color-input').forEach(input => {
    input.addEventListener('click', e => e.stopPropagation());
    input.addEventListener('change', async e => {
      e.stopPropagation();
      await saveEquipoColor(input.dataset.equipo, input.value);
      renderCurrentView();
    });
  });
  container.querySelectorAll('.group-toggle').forEach(header => {
    header.addEventListener('click', () => {
      header.closest('.group-section').classList.toggle('collapsed');
    });
  });
  document.getElementById('btn-anadir-jugadores')?.addEventListener('click', openModal);
  document.getElementById('btn-nuevo-equipo')?.addEventListener('click', () => openEquipoModal());
  document.getElementById('btn-borrar-equipo')?.addEventListener('click', () => openBorrarModal());
  container.querySelectorAll('.btn-add-equipo-only').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); openBorrarModal(btn.dataset.grupo, 'asignar'); });
  });
  container.querySelectorAll('.btn-borrar-grupo').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); openBorrarModal(btn.dataset.grupo, 'quitar'); });
  });
  container.querySelectorAll('.btn-quitar-grupo').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      await removeEquipoGrupo(btn.dataset.equipo);
      renderCurrentView();
    });
  });
}

/* ===== Circular progress SVG ===== */
function circularProgress(pct) {
  const r    = 42;
  const circ = +(2 * Math.PI * r).toFixed(2);
  const off  = +(circ * (1 - pct / 100)).toFixed(2);
  return `
    <svg class="donut-svg" viewBox="0 0 100 100" width="148" height="148">
      <circle cx="50" cy="50" r="${r}" fill="none" stroke="rgba(255,255,255,.15)" stroke-width="9"/>
      <circle cx="50" cy="50" r="${r}" fill="none" stroke="var(--gold)" stroke-width="9"
        stroke-dasharray="${circ}" stroke-dashoffset="${off}"
        stroke-linecap="round" transform="rotate(-90 50 50)"
        style="transition:stroke-dashoffset .9s ease"/>
      <text x="50" y="46" text-anchor="middle" fill="white"
        font-size="19" font-weight="800"
        font-family="system-ui,-apple-system,sans-serif">${pct}%</text>
      <text x="50" y="62" text-anchor="middle" fill="rgba(255,255,255,.65)"
        font-size="8.5"
        font-family="system-ui,-apple-system,sans-serif">completado</text>
    </svg>`;
}

/* ===== Inicio view ===== */
function renderInicio(container) {
  const total     = allCromos.length;
  const tengo     = allCromos.filter(c => c.obtenido).length;
  const faltan    = total - tengo;
  const pct       = total > 0 ? Math.round(tengo / total * 100) : 0;
  const repetidos = allCromos.filter(c => c.cd_repetidos > 0).length;
  const sobres    = Math.floor(tengo / 5);

  const equipos = [...new Set(allCromos.map(c => c.equipo))].sort();
  const teamRows = equipos.map(eq => {
    const cr  = allCromos.filter(c => c.equipo === eq);
    const t   = cr.filter(c => c.obtenido).length;
    const p   = Math.round(t / cr.length * 100);
    const col = teamColor(eq);
    return `
      <div class="inicio-team-row">
        <div class="inicio-team-dot" style="background:${col.bg}"></div>
        <span class="inicio-team-name">${eq}</span>
        <div class="inicio-team-bar">
          <div class="inicio-team-fill" style="width:${p}%;background:${col.bg}"></div>
        </div>
        <span class="inicio-team-nums">${t}/${cr.length}</span>
      </div>`;
  }).join('');

  container.innerHTML = `
    <div class="inicio-page">
      <div class="inicio-hero">
        <div class="inicio-hero-info">
          <div class="inicio-pct">${pct}<span class="inicio-pct-sign">%</span></div>
          <div class="inicio-pct-label">del álbum completado</div>
          <div class="inicio-hero-bar-wrap">
            <div class="inicio-hero-bar" style="width:${pct}%"></div>
          </div>
          <div class="inicio-hero-count">${tengo} de ${total} cromos</div>
        </div>
        <img src="icons/copa2026.png" class="inicio-copa" alt="">
      </div>
      <div class="inicio-stats-row">
        <div class="inicio-stat">
          <div class="inicio-stat-num green">${tengo}</div>
          <div class="inicio-stat-label">Obtenidos</div>
        </div>
        <div class="inicio-stat">
          <div class="inicio-stat-num red">${faltan}</div>
          <div class="inicio-stat-label">Sin obtener</div>
        </div>
        <div class="inicio-stat">
          <div class="inicio-stat-num gold">${repetidos}</div>
          <div class="inicio-stat-label">Repetidos</div>
        </div>
        <div class="inicio-stat" id="stat-sobres" style="cursor:pointer" title="Pulsa para ver el gasto estimado">
          <div class="inicio-stat-num purple">${sobres}</div>
          <div class="inicio-stat-label">Sobres 💶</div>
        </div>
      </div>
      <button class="btn-abrir-sobre" id="btn-abrir-sobre">
        <img src="images/cromos.png" class="btn-sobre-img" alt=""> Abrir sobre
      </button>
      <div class="section-title">Equipos</div>
      <div class="inicio-teams-list">
        ${teamRows}
      </div>
    </div>`;
  document.getElementById('btn-abrir-sobre').addEventListener('click', openSobreModal);
  document.getElementById('stat-sobres').addEventListener('click', () => {
    const precio = 1.50;
    const total  = Math.floor(allCromos.filter(c => c.obtenido).length / 5) * precio;
    showToast(`~${total.toFixed(2).replace('.', ',')}€ gastados (${Math.floor(allCromos.filter(c => c.obtenido).length / 5)} sobres × ${precio.toFixed(2).replace('.', ',')}€)`, 'green', 4000);
  });
}

/* ===== Stats view ===== */
function renderStats(container) {
  const total  = allCromos.length;
  const tengo  = allCromos.filter(c => c.obtenido).length;
  const faltan = total - tengo;
  const pct    = total > 0 ? Math.round(tengo / total * 100) : 0;

  const equipos  = [...new Set(allCromos.map(c => c.equipo))].sort();
  const teamRows = equipos.map(eq => {
    const cr = allCromos.filter(c => c.equipo === eq);
    const t  = cr.filter(c => c.obtenido).length;
    const p  = Math.round(t / cr.length * 100);
    const col = teamColor(eq);
    return `
      <div class="stats-team-row">
        <span class="stats-team-name">${eq}</span>
        <div class="stats-team-bar">
          <div class="stats-team-fill" style="width:${p}%;background:${col.bg}"></div>
        </div>
        <span class="stats-team-nums">${t}/${cr.length}</span>
      </div>`;
  }).join('');

  container.innerHTML = `
    <div class="stats-page">
      <div class="stats-hero">
        ${circularProgress(pct)}
        <div class="stats-hero-sub">
          <span>🏆 ${tengo} obtenidos</span>
          <span>❌ ${faltan} faltan</span>
        </div>
      </div>
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-card-num">${total}</div>
          <div class="stat-card-label">Total</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-num">${tengo}</div>
          <div class="stat-card-label">Obtenido</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-num red">${faltan}</div>
          <div class="stat-card-label">Faltan</div>
        </div>
      </div>
      <div class="stats-teams">
        <div class="stats-teams-title">Por equipo</div>
        ${teamRows}
      </div>
    </div>`;
}


const POS_ABBR = { 'Portero': 'POR', 'Defensa': 'DEF', 'Medio': 'MED', 'Delantero': 'DEL', 'Escudo': 'ESC', 'Equipo': 'EQ', 'FWC': 'FWC', 'Coke': 'COKE' };

function posicionEfectiva(c) {
  if (c.posicion) return c.posicion;
  const n = (c.nombre_jugador || '').toUpperCase().trim();
  if (n === 'ESCUDO') return 'Escudo';
  if (n === 'EQUIPO') return 'Equipo';
  if (n.includes('FWC')) return 'FWC';
  if (n.includes('COKE') || n.includes('COCA')) return 'Coke';
  return null;
}

/* ===== Cromo card HTML ===== */
function cromoCard(c) {
  const col           = teamColor(c.equipo);
  const tag           = c.siglas || c.equipo.substring(0, 3);
  const circleStyle   = c.obtenido ? '' : `border-color:${col.bg};color:${col.bg}`;
  const circleContent = c.obtenido ? '✓' : c.numero;
  const pos           = posicionEfectiva(c);
  const posBadge      = pos ? `<span class="pos-badge pos-${pos.toLowerCase()}">${POS_ABBR[pos] || pos}</span>` : '';

  return `
    <div class="cromo-card ${c.obtenido ? 'obtenido' : ''}"
         style="--tc:${col.bg}"
         data-id="${c.id}" data-obtenido="${c.obtenido}" data-rep="${c.cd_repetidos}">
      <div class="cromo-banner" style="background-image:linear-gradient(rgba(0,0,0,.28),rgba(0,0,0,.28)),${col.banner || 'linear-gradient(90deg,'+col.bg+','+col.bg+')'}">
        <span class="cromo-tag">${tag}</span>
        <span class="cromo-num-badge">#${c.numero}</span>
      </div>
      <div class="cromo-visual">
        <div class="cromo-circle" style="${circleStyle}">${circleContent}</div>
      </div>
      <div class="cromo-info">
        <div class="cromo-nombre">${c.nombre_jugador}</div>
        ${posBadge}
      </div>
      <div class="cromo-footer">
        <button class="btn-editar-cromo" data-id="${c.id}" title="Editar">✏</button>
        <span class="obtenido-badge">${c.obtenido ? '✓ Obtenido' : '○ Sin obtener'}</span>
        <div class="rep-control" title="Repetidos">
          <button class="rep-btn rep-minus" data-id="${c.id}">−</button>
          <span class="rep-num">${c.cd_repetidos}</span>
          <button class="rep-btn rep-plus" data-id="${c.id}">+</button>
        </div>
      </div>
    </div>`;
}

/* ===== Card events ===== */
function bindCardEvents(container) {
  // Animación de entrada escalonada
  container.querySelectorAll('.cromo-card').forEach((card, i) => {
    card.style.setProperty('--delay', `${Math.min(i * 35, 400)}ms`);
  });

  container.querySelectorAll('.btn-editar-cromo').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openEditarModal(Number(btn.dataset.id));
    });
  });

  container.querySelectorAll('.cromo-card').forEach(card => {
    card.addEventListener('click', async (e) => {
      if (e.target.classList.contains('rep-btn')) return;
      if (e.target.classList.contains('btn-editar-cromo')) return;
      const id       = Number(card.dataset.id);
      const current  = card.dataset.obtenido === 'true';
      await toggleObtenido(id, current, card);
    });
  });

  container.querySelectorAll('.rep-plus').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id   = Number(btn.dataset.id);
      const cromo = allCromos.find(c => c.id === id);
      await updateRepetidos(id, cromo.cd_repetidos + 1, btn);
    });
  });

  container.querySelectorAll('.rep-minus').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id    = Number(btn.dataset.id);
      const cromo = allCromos.find(c => c.id === id);
      if (cromo.cd_repetidos <= 0) return;
      await updateRepetidos(id, cromo.cd_repetidos - 1, btn);
    });
  });
}

/* ===== Supabase operations ===== */
async function toggleObtenido(id, current, cardEl) {
  const newVal = !current;
  const { error } = await db
    .from('cromos')
    .update({ obtenido: newVal })
    .eq('id', id);

  if (error) { showToast('Error al actualizar :(', 'red'); return; }

  const cromo = allCromos.find(c => c.id === id);
  cromo.obtenido = newVal;

  cardEl.dataset.obtenido = newVal;
  cardEl.classList.toggle('obtenido', newVal);
  cardEl.querySelector('.obtenido-badge').textContent = newVal ? '✓ Obtenido' : '○ Sin obtener';

  // Actualiza el círculo central
  const circle = cardEl.querySelector('.cromo-circle');
  if (circle) {
    const col = teamColor(cromo.equipo);
    if (newVal) {
      circle.style.cssText = '';
      circle.textContent   = '✓';
    } else {
      circle.style.cssText = `border-color:${col.bg};color:${col.bg}`;
      circle.textContent   = cromo.numero;
    }
  }

  // Animación pop
  cardEl.classList.remove('pop');
  void cardEl.offsetWidth;
  cardEl.classList.add('pop');
  cardEl.addEventListener('animationend', () => cardEl.classList.remove('pop'), { once: true });

  updateHeaderStats();
  showToast(newVal ? '✓ Cromo marcado como obtenido' : '○ Marcado como faltante', newVal ? 'green' : '');
  if (newVal) {
    const equipoCromos = allCromos.filter(c => c.equipo === cromo.equipo);
    if (equipoCromos.length > 0 && equipoCromos.every(c => c.obtenido)) celebrateTeam(cromo.equipo);
  }

  if (currentView === 'faltan' || currentView === 'repetidos') {
    setTimeout(() => renderCurrentView(), 600);
  }
}

async function updateRepetidos(id, newVal, btnEl) {
  const { error } = await db
    .from('cromos')
    .update({ cd_repetidos: newVal })
    .eq('id', id);

  if (error) { showToast('Error al actualizar :(', 'red'); return; }

  const cromo = allCromos.find(c => c.id === id);
  cromo.cd_repetidos = newVal;

  const card = btnEl.closest('.cromo-card');
  card.dataset.rep = newVal;
  card.querySelector('.rep-num').textContent = newVal;
}

/* ===== UI helpers ===== */
function showLoading() {
  document.getElementById('main-content').innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Cargando álbum...</p>
    </div>`;
}

function showConfigError() {
  document.getElementById('main-content').innerHTML = `
    <div class="config-error">
      <h2>⚙️ Configuración pendiente</h2>
      <p>Abre <code>js/config.js</code> y rellena <code>SUPABASE_URL</code> y <code>SUPABASE_ANON_KEY</code> con los datos de tu proyecto.</p>
      <p style="margin-top:10px;font-size:.85rem;color:#777">Los encontrarás en Supabase → Settings → API</p>
    </div>`;
  document.getElementById('loading').style.display = 'none';
}

function showDBError(error) {
  document.getElementById('main-content').innerHTML = `
    <div class="config-error">
      <h2>⚠️ Error de conexión</h2>
      <p>${error.message}</p>
      <p style="margin-top:8px;font-size:.85rem;color:#777">Verifica que las credenciales en <code>js/config.js</code> sean correctas y que la tabla <code>cromos</code> exista.</p>
    </div>`;
}

function emptyState(icon, title, desc) {
  return `<div class="empty"><div class="empty-icon">${icon}</div><h3>${title}</h3><p>${desc}</p></div>`;
}

let toastTimer;
function showToast(msg, type = '', ms = 2200) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show' + (type ? ' ' + type : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), ms);
}

/* ===== Modal: añadir jugadores (FAB) ===== */
function bindModal() {
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  document.getElementById('modal-equipo').addEventListener('change', onModalEquipoChange);
  document.getElementById('modal-jugadores').addEventListener('input', updateModalPreview);
  document.getElementById('modal-desde').addEventListener('input', updateModalPreview);
  document.getElementById('modal-submit').addEventListener('click', submitModal);
}

const DEFAULT_JUGADORES = 'ESCUDO\n\n\n\n\n\n\n\n\n\n\n\nEQUIPO';

function openModal() {
  populateEquipoSelect();
  document.getElementById('modal-overlay').classList.add('open');
  document.getElementById('modal-equipo').value     = '';
  document.getElementById('modal-siglas').value     = '';
  document.getElementById('modal-desde').value      = '1';
  document.getElementById('modal-jugadores').value  = DEFAULT_JUGADORES;
  document.getElementById('modal-preview').innerHTML = '';
  updateModalPreview();
  setTimeout(() => document.getElementById('modal-equipo').focus(), 80);
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

function onModalEquipoChange() {
  const equipo = this.value;
  const siglasInput = document.getElementById('modal-siglas');
  const reg = equiposReg.find(t => t.equipo === equipo);
  const existentes = allCromos.filter(c => c.equipo === equipo);
  siglasInput.value = reg?.siglas || existentes.find(c => c.siglas)?.siglas || '';
  document.getElementById('modal-desde').value = '1';
  updateModalPreview();
}

function getAllModalLines() {
  return document.getElementById('modal-jugadores').value
    .split('\n').map(l => l.trim().toUpperCase());
}

function getJugadoresLines() {
  return getAllModalLines().filter(l => l.length > 0);
}

function updateModalPreview() {
  const allLines = getAllModalLines();
  const nonEmpty = allLines.filter(l => l.length > 0);
  const desde    = parseInt(document.getElementById('modal-desde').value) || 1;
  const wrap     = document.getElementById('modal-preview');
  if (nonEmpty.length === 0) { wrap.innerHTML = ''; updateSubmitBtn(); return; }
  wrap.innerHTML = `
    <div class="preview-wrap">
      <div class="preview-header">${nonEmpty.length} cromo${nonEmpty.length !== 1 ? 's' : ''} a añadir</div>
      <div class="preview-list">
        ${allLines.map((nombre, i) => nombre ? `
          <div class="preview-item">
            <span class="preview-num">#${desde + i}</span>
            <span class="preview-nombre">${nombre}</span>
          </div>` : '').join('')}
      </div>
    </div>`;
  updateSubmitBtn();
}

function updateSubmitBtn() {
  const btn   = document.getElementById('modal-submit');
  const lines = getJugadoresLines();
  if (lines.length === 0) {
    btn.textContent = 'Añadir cromos'; btn.disabled = true;
  } else {
    btn.textContent = `Añadir ${lines.length} cromo${lines.length !== 1 ? 's' : ''}`;
    btn.disabled = false;
  }
}

/* ===== Modal: nuevo grupo ===== */
function bindGrupoModal() {
  document.getElementById('modal-grupo-close').addEventListener('click', closeGrupoModal);
  document.getElementById('modal-grupo-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeGrupoModal();
  });
  document.getElementById('input-nuevo-grupo').addEventListener('input', function () {
    document.getElementById('btn-submit-grupo').disabled = !this.value.trim();
  });
  document.getElementById('btn-submit-grupo').addEventListener('click', submitGrupoModal);
}

function openGrupoModal() {
  document.getElementById('modal-grupo-overlay').classList.add('open');
  document.getElementById('input-nuevo-grupo').value = '';
  document.getElementById('btn-submit-grupo').disabled = true;
  setTimeout(() => document.getElementById('input-nuevo-grupo').focus(), 80);
}

function closeGrupoModal() {
  document.getElementById('modal-grupo-overlay').classList.remove('open');
}

function submitGrupoModal() {
  const nombre = document.getElementById('input-nuevo-grupo').value.trim().toUpperCase();
  if (!nombre) return;
  closeGrupoModal();
  showToast(`✓ Grupo "${nombre}" creado`, 'green');
  if (currentView === 'equipos') renderCurrentView();
}

/* ===== Modal: nuevo equipo ===== */
function bindEquipoModal() {
  document.getElementById('modal-equipo-close').addEventListener('click', closeEquipoModal);
  document.getElementById('modal-equipo-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeEquipoModal();
  });
  document.getElementById('equipo-grupo-select').addEventListener('change', checkEquipoSubmit);
  document.getElementById('nuevo-equipo-nombre').addEventListener('input', checkEquipoSubmit);
  document.getElementById('btn-submit-equipo').addEventListener('click', submitEquipoModal);
}

function openEquipoModal(preselectedGrupo = '') {
  document.getElementById('modal-equipo-overlay').classList.add('open');
  document.getElementById('nuevo-equipo-nombre').value  = '';
  document.getElementById('nuevo-equipo-siglas').value  = '';
  document.getElementById('btn-submit-equipo').disabled = true;
  const sel = document.getElementById('equipo-grupo-select');
  const grupos = getAllGrupos();
  sel.innerHTML = '<option value="">— Selecciona un grupo —</option>' +
    grupos.map(g => `<option value="${g}" ${g === preselectedGrupo ? 'selected' : ''}>${g}</option>`).join('');
  checkEquipoSubmit();
  const focusEl = preselectedGrupo
    ? document.getElementById('nuevo-equipo-nombre')
    : document.getElementById('equipo-grupo-select');
  setTimeout(() => focusEl.focus(), 80);
}

function closeEquipoModal() {
  document.getElementById('modal-equipo-overlay').classList.remove('open');
}

function getAllGrupos() {
  const extra = [...new Set(Object.values(gruposMap))].filter(g => !PREDEFINED_GROUPS.includes(g)).sort();
  return [...PREDEFINED_GROUPS, ...extra];
}

function checkEquipoSubmit() {
  const grupo  = document.getElementById('equipo-grupo-select').value.trim();
  const nombre = document.getElementById('nuevo-equipo-nombre').value.trim();
  document.getElementById('btn-submit-equipo').disabled = !(grupo && nombre);
}

/* ===== Modal: borrar / quitar equipo ===== */
let borrarModalMode = 'borrar'; // 'borrar' | 'quitar'

function bindBorrarModal() {
  document.getElementById('modal-borrar-close').addEventListener('click', closeBorrarModal);
  document.getElementById('modal-borrar-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeBorrarModal();
  });
  document.getElementById('borrar-equipo-select').addEventListener('change', function () {
    document.getElementById('btn-submit-borrar').disabled = !this.value;
  });
  document.getElementById('btn-submit-borrar').addEventListener('click', async () => {
    const equipo = document.getElementById('borrar-equipo-select').value;
    if (!equipo) return;
    if (borrarModalMode === 'quitar') {
      closeBorrarModal();
      await removeEquipoGrupo(equipo);
      showToast(`"${equipo}" quitado del grupo`, 'green');
      renderCurrentView();
    } else if (borrarModalMode === 'asignar') {
      const grupo = document.getElementById('btn-submit-borrar').dataset.grupo;
      closeBorrarModal();
      await saveEquipoGrupo(equipo, grupo);
      showToast(`"${equipo}" añadido a ${grupo}`, 'green');
      renderCurrentView();
    } else {
      if (!confirm(`¿Borrar "${equipo}" y todos sus cromos? Esta acción no se puede deshacer.`)) return;
      closeBorrarModal();
      await deleteEquipo(equipo);
    }
  });
}

function openBorrarModal(grupo = null, mode = 'borrar') {
  borrarModalMode = mode;
  let teams = [...new Set([
    ...allCromos.map(c => c.equipo),
    ...equiposReg.map(t => t.equipo)
  ])];
  if (mode === 'asignar') {
    teams = teams.filter(eq => (gruposMap[eq] || '') !== grupo);
  } else if (mode === 'quitar' && grupo) {
    teams = teams.filter(eq => (gruposMap[eq] || 'Sin grupo') === grupo);
  }
  teams.sort();
  const sel = document.getElementById('borrar-equipo-select');
  sel.innerHTML = '<option value="">— Selecciona un equipo —</option>' +
    teams.map(e => `<option value="${e}">${e}</option>`).join('');
  const title = document.querySelector('#modal-borrar-overlay .modal-title');
  const btn   = document.getElementById('btn-submit-borrar');
  if (mode === 'quitar') {
    if (title) title.textContent = 'Quitar del grupo';
    btn.textContent = 'Quitar del grupo';
    btn.style.background = 'var(--green)';
    btn.dataset.grupo = '';
  } else if (mode === 'asignar') {
    if (title) title.textContent = `Añadir a ${grupo}`;
    btn.textContent = 'Añadir al grupo';
    btn.style.background = 'var(--green)';
    btn.dataset.grupo = grupo;
  } else {
    if (title) title.textContent = 'Borrar equipo';
    btn.textContent = 'Borrar equipo';
    btn.style.background = '';
    btn.dataset.grupo = '';
  }
  btn.disabled = true;
  document.getElementById('modal-borrar-overlay').classList.add('open');
  setTimeout(() => sel.focus(), 80);
}

function closeBorrarModal() {
  document.getElementById('modal-borrar-overlay').classList.remove('open');
}

async function deleteEquipo(equipo) {

  const res1 = await db.from('cromos').delete().eq('equipo', equipo);

  if (res1.error) { showToast('Error al borrar: ' + res1.error.message, 'red'); return; }

  allCromos = allCromos.filter(c => c.equipo !== equipo);

  await removeEquipoGrupo(equipo);
  await removeRegisteredTeam(equipo);

  populateEquipoSelect();
  updateHeaderStats();
  showToast(`"${equipo}" borrado`, 'red');
  renderCurrentView();
}

async function submitEquipoModal() {
  const grupo  = document.getElementById('equipo-grupo-select').value.trim().toUpperCase();
  const equipo = document.getElementById('nuevo-equipo-nombre').value.trim().toUpperCase();
  const siglas = document.getElementById('nuevo-equipo-siglas').value.trim().toUpperCase();
  const color  = document.getElementById('nuevo-equipo-color').value;
  if (!grupo || !equipo) return;
  document.getElementById('btn-submit-equipo').disabled = true;
  await saveRegisteredTeam(equipo, siglas, grupo, color);
  closeEquipoModal();
  showToast(`✓ ${equipo} registrado en ${grupo}`, 'green');
  document.querySelector('[data-view="equipos"]').click();
}

async function submitModal() {
  const equipo   = document.getElementById('modal-equipo').value;
  const siglas   = document.getElementById('modal-siglas').value.trim().toUpperCase();
  const desde    = parseInt(document.getElementById('modal-desde').value) || 1;
  const allLines = getAllModalLines();
  const nonEmpty = allLines.filter(l => l.length > 0);

  if (!equipo || nonEmpty.length === 0) return;

  const btn = document.getElementById('modal-submit');
  btn.disabled = true;
  btn.textContent = 'Guardando...';

  const nuevos = allLines
    .map((nombre, i) => nombre ? {
      equipo,
      numero: desde + i,
      nombre_jugador: nombre,
      siglas,
      cd_repetidos: 0,
      obtenido: false,
    } : null)
    .filter(Boolean);

  const { data, error } = await db.from('cromos').insert(nuevos).select();

  if (error) {
    showToast('Error: ' + (error.message || 'no se pudo guardar'), 'red');
    updateSubmitBtn();
    return;
  }

  allCromos.push(...data);
  allCromos.sort((a, b) => a.equipo.localeCompare(b.equipo, 'es') || a.numero - b.numero);

  populateEquipoSelect();
  updateHeaderStats();
  closeModal();
  showToast(`✓ ${data.length} cromo${data.length !== 1 ? 's' : ''} añadido${data.length !== 1 ? 's' : ''}`, 'green');

  document.querySelector('[data-view="equipos"]').click();
  const sel = document.getElementById('equipo-select');
  sel.value = equipo;
  equipoFilter = equipo;
  renderCurrentView();
}

/* ===== Modal: editar cromo ===== */
let editarCromoId = null;

function bindEditarModal() {
  document.getElementById('modal-editar-close').addEventListener('click', closeEditarModal);
  document.getElementById('modal-editar-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeEditarModal();
  });
  document.getElementById('btn-submit-editar').addEventListener('click', submitEditarModal);
  document.getElementById('btn-delete-cromo').addEventListener('click', async () => {
    const cromo = allCromos.find(c => c.id === editarCromoId);
    if (!cromo) return;
    if (!confirm(`¿Borrar el cromo #${cromo.numero} ${cromo.nombre_jugador}? Esta acción no se puede deshacer.`)) return;
    const { error } = await db.from('cromos').delete().eq('id', editarCromoId);
    if (error) { showToast('Error al borrar: ' + error.message, 'red'); return; }
    allCromos = allCromos.filter(c => c.id !== editarCromoId);
    closeEditarModal();
    updateHeaderStats();
    populateEquipoSelect();
    showToast('Cromo borrado', 'red');
    renderCurrentView();
  });
}

function openEditarModal(id) {
  const cromo = allCromos.find(c => c.id === id);
  if (!cromo) return;
  editarCromoId = id;
  document.getElementById('editar-info').textContent = `${cromo.equipo} · #${cromo.numero}`;
  document.getElementById('editar-nombre').value   = cromo.nombre_jugador || '';
  document.getElementById('editar-posicion').value = cromo.posicion || '';
  document.getElementById('modal-editar-overlay').classList.add('open');
  setTimeout(() => document.getElementById('editar-nombre').focus(), 80);
}

function closeEditarModal() {
  document.getElementById('modal-editar-overlay').classList.remove('open');
  editarCromoId = null;
}

async function submitEditarModal() {
  const nombre   = document.getElementById('editar-nombre').value.trim().toUpperCase();
  const posicion = document.getElementById('editar-posicion').value;
  if (!nombre) return;
  const { error } = await db.from('cromos').update({ nombre_jugador: nombre, posicion }).eq('id', editarCromoId);
  if (error) { showToast('Error al guardar: ' + error.message, 'red'); return; }
  const cromo = allCromos.find(c => c.id === editarCromoId);
  cromo.nombre_jugador = nombre;
  cromo.posicion = posicion;
  closeEditarModal();
  showToast('✓ Cromo actualizado', 'green');
  renderCurrentView();
}

/* ===== Celebración equipo completo ===== */
function celebrateTeam(equipo) {
  showToast(`🏆 ¡${equipo} completado!`, 'green');
  const colors = ['#f0a500','#0d6b36','#e63946','#2563eb','#7c3aed','#f97316','#ec4899'];
  for (let i = 0; i < 50; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `left:${Math.random()*100}vw;background:${colors[Math.floor(Math.random()*colors.length)]};animation-delay:${(Math.random()*0.6).toFixed(2)}s;animation-duration:${(0.9+Math.random()*0.8).toFixed(2)}s`;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

/* ===== Modal apertura de sobre ===== */
let sobreCount = 0;

function openSobreModal() {
  sobreCount = 0;
  document.getElementById('sobre-count').textContent = '0';
  document.getElementById('sobre-search').value = '';
  document.getElementById('sobre-results').innerHTML = '<p class="form-hint">Escribe para buscar cromos sin obtener</p>';
  document.getElementById('modal-sobre-overlay').classList.add('open');
  setTimeout(() => document.getElementById('sobre-search').focus(), 80);
}

function closeSobreModal() {
  document.getElementById('modal-sobre-overlay').classList.remove('open');
  if (sobreCount > 0) {
    updateHeaderStats();
    renderCurrentView();
  }
}

function bindSobreModal() {
  document.getElementById('modal-sobre-close').addEventListener('click', closeSobreModal);
  document.getElementById('modal-sobre-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeSobreModal();
  });
  const input = document.getElementById('sobre-search');
  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => renderSobreResults(input.value.trim()), 150);
  });
}

function renderSobreResults(query) {
  const container = document.getElementById('sobre-results');
  if (!query) {
    container.innerHTML = '<p class="form-hint">Escribe para buscar cromos sin obtener</p>';
    return;
  }
  const q = norm(query);
  const matches = allCromos
    .filter(c => !c.obtenido && (norm(c.nombre_jugador).includes(q) || norm(c.equipo).includes(q) || (c.siglas && norm(c.siglas).includes(q))))
    .slice(0, 8);
  if (matches.length === 0) {
    container.innerHTML = '<p class="form-hint">Sin resultados</p>';
    return;
  }
  container.innerHTML = matches.map(c => `
    <button class="sobre-result-btn" data-id="${c.id}">
      <span class="sobre-result-num">#${c.numero}</span>
      <span class="sobre-result-info">
        <span class="sobre-result-name">${c.nombre_jugador || '—'}</span>
        <span class="sobre-result-equipo">${c.equipo}</span>
      </span>
      <span class="sobre-result-check">+</span>
    </button>`).join('');
  container.querySelectorAll('.sobre-result-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      const cromo = allCromos.find(c => c.id === id);
      if (!cromo || cromo.obtenido) return;
      btn.disabled = true;
      btn.querySelector('.sobre-result-check').textContent = '✓';
      const { error } = await db.from('cromos').update({ obtenido: true }).eq('id', id);
      if (error) { btn.disabled = false; btn.querySelector('.sobre-result-check').textContent = '+'; showToast('Error al guardar', 'red'); return; }
      cromo.obtenido = true;
      sobreCount++;
      document.getElementById('sobre-count').textContent = sobreCount;
      const equipoCromos = allCromos.filter(c => c.equipo === cromo.equipo);
      if (equipoCromos.length > 0 && equipoCromos.every(c => c.obtenido)) celebrateTeam(cromo.equipo);
      setTimeout(() => {
        btn.remove();
        if (!container.querySelector('.sobre-result-btn')) renderSobreResults(document.getElementById('sobre-search').value.trim());
      }, 500);
    });
  });
}
