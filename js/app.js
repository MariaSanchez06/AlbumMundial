/* ===== Supabase init ===== */
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ===== State ===== */
let allCromos = [];
let currentView = 'todos';
let searchTerm  = '';
let equipoFilter = '';

/* ===== Team color map ===== */
const TEAM_COLORS = {
  'FWC':                 { bg: '#f0a500', fg: '#1a1a1a' },
  'MEXICO':              { bg: '#006847', fg: '#ffffff' },
  'BRASIL':              { bg: '#009c3b', fg: '#ffffff' },
  'SUIZA':               { bg: '#ff0000', fg: '#ffffff' },
  'QATAR':               { bg: '#8d153a', fg: '#ffffff' },
  'CANADÁ':              { bg: '#ff0000', fg: '#ffffff' },
  'BOSNIA-HERZEGOVINA':  { bg: '#003da5', fg: '#ffffff' },
  'COREA DEL SUR':       { bg: '#003da5', fg: '#ffffff' },
  'REPÚBLICA CHECA':     { bg: '#d7141a', fg: '#ffffff' },
  'SUDÁFRICA':           { bg: '#007a4d', fg: '#ffffff' },
};

function teamColor(equipo) {
  return TEAM_COLORS[equipo] || { bg: '#0d6b36', fg: '#ffffff' };
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
  await loadCromos();
});

/* ===== Data loading ===== */
async function loadCromos() {
  showLoading();
  const { data, error } = await db
    .from('cromos')
    .select('*')
    .order('equipo')
    .order('numero');

  if (error) {
    showDBError(error);
    return;
  }
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
      document.getElementById('search-input').value = '';
      document.getElementById('search-container').style.display =
        ['todos', 'faltan', 'repetidos'].includes(currentView) ? '' : 'none';
      document.getElementById('equipo-select-container').style.display =
        currentView === 'equipos' ? '' : 'none';
      renderCurrentView();
    });
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

  // Actualiza el datalist del modal con todos los equipos conocidos
  const dl = document.getElementById('equipos-datalist');
  if (dl) dl.innerHTML = equipos.map(e => `<option value="${e}">`).join('');
}

/* ===== Render dispatcher ===== */
function renderCurrentView() {
  const content = document.getElementById('main-content');
  switch (currentView) {
    case 'todos':     renderGrid(content, applySearch(allCromos), 'Todos los cromos'); break;
    case 'equipos':   renderEquipos(content); break;
    case 'faltan':    renderGrid(content, applySearch(allCromos.filter(c => !c.obtenido)), 'Me faltan'); break;
    case 'repetidos': renderGrid(content, applySearch(allCromos.filter(c => c.cd_repetidos > 0)), 'Repetidos'); break;
    case 'stats':     renderStats(content); break;
  }
}

function applySearch(list) {
  if (!searchTerm) return list;
  return list.filter(c =>
    c.nombre_jugador.toLowerCase().includes(searchTerm) ||
    c.equipo.toLowerCase().includes(searchTerm) ||
    (c.siglas && c.siglas.toLowerCase().includes(searchTerm))
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
  const equipos = [...new Set(allCromos.map(c => c.equipo))].sort();
  const filter  = equipoFilter;
  const list    = filter ? equipos.filter(e => e === filter) : equipos;

  container.innerHTML = list.map(eq => {
    const cromos  = allCromos.filter(c => c.equipo === eq);
    const tengo   = cromos.filter(c => c.obtenido).length;
    const pct     = Math.round(tengo / cromos.length * 100);
    return `
      <div class="team-section" data-equipo="${eq}">
        <div class="team-header">
          <span class="team-name">${eq}</span>
          <div class="team-progress-wrap">
            <div class="team-progress-bar">
              <div class="team-progress-fill" style="width:${pct}%"></div>
            </div>
            <div class="team-pct">${tengo}/${cromos.length}</div>
          </div>
          <span style="color:var(--green);font-weight:700">${pct}%</span>
        </div>
        <div class="cromos-grid">
          ${cromos.map(cromoCard).join('')}
        </div>
      </div>`;
  }).join('');
  bindCardEvents(container);
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
          <div class="stat-card-label">Tengo</div>
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

/* ===== Cromo card HTML ===== */
function cromoCard(c) {
  const col     = teamColor(c.equipo);
  const tag     = c.siglas || c.equipo.substring(0, 3);
  const circleStyle = c.obtenido
    ? ''
    : `border-color:${col.bg};color:${col.bg}`;
  const circleContent = c.obtenido ? '✓' : c.numero;

  return `
    <div class="cromo-card ${c.obtenido ? 'obtenido' : ''}"
         style="--tc:${col.bg}"
         data-id="${c.id}" data-obtenido="${c.obtenido}" data-rep="${c.cd_repetidos}">
      <div class="cromo-banner">
        <span class="cromo-tag">${tag}</span>
        <span class="cromo-num-badge">#${c.numero}</span>
      </div>
      <div class="cromo-visual">
        <div class="cromo-circle" style="${circleStyle}">${circleContent}</div>
      </div>
      <div class="cromo-info">
        <div class="cromo-nombre">${c.nombre_jugador}</div>
      </div>
      <div class="cromo-footer">
        <span class="obtenido-badge">${c.obtenido ? '✓ Tengo' : '○ Falta'}</span>
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
  container.querySelectorAll('.cromo-card').forEach(card => {
    card.addEventListener('click', async (e) => {
      if (e.target.classList.contains('rep-btn')) return;
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
  cardEl.querySelector('.obtenido-badge').textContent = newVal ? '✓ Tengo' : '○ Falta';

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
function showToast(msg, type = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show' + (type ? ' ' + type : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

/* ===== Modal — añadir jugadores ===== */
function bindModal() {
  document.getElementById('fab-add').addEventListener('click', openModal);
  document.getElementById('modal-close').addEventListener('click', closeModal);

  // Cerrar al pulsar fuera del panel
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });

  // Cerrar con Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  document.getElementById('modal-equipo').addEventListener('input', onModalEquipoChange);
  document.getElementById('modal-jugadores').addEventListener('input', updateModalPreview);
  document.getElementById('modal-desde').addEventListener('input', updateModalPreview);
  document.getElementById('modal-submit').addEventListener('click', submitModal);
}

function openModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.add('open');
  document.getElementById('modal-equipo').value    = '';
  document.getElementById('modal-siglas').value    = '';
  document.getElementById('modal-desde').value     = '1';
  document.getElementById('modal-jugadores').value = '';
  document.getElementById('modal-preview').innerHTML = '';
  updateSubmitBtn(0);
  setTimeout(() => document.getElementById('modal-equipo').focus(), 80);
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

function onModalEquipoChange() {
  const equipo = this.value.trim().toUpperCase();
  const existentes = allCromos.filter(c => c.equipo === equipo);

  if (existentes.length > 0) {
    const siglasInput = document.getElementById('modal-siglas');
    if (!siglasInput.value.trim()) {
      siglasInput.value = existentes.find(c => c.siglas)?.siglas || '';
    }
    const maxNum = Math.max(...existentes.map(c => c.numero));
    document.getElementById('modal-desde').value = maxNum + 1;
  } else {
    document.getElementById('modal-desde').value = '1';
  }
  updateModalPreview();
}

function getJugadoresLines() {
  return document.getElementById('modal-jugadores').value
    .split('\n')
    .map(l => l.trim().toUpperCase())
    .filter(l => l.length > 0);
}

function updateModalPreview() {
  const lines = getJugadoresLines();
  const desde = parseInt(document.getElementById('modal-desde').value) || 1;
  const wrap  = document.getElementById('modal-preview');

  if (lines.length === 0) {
    wrap.innerHTML = '';
    updateSubmitBtn(0);
    return;
  }

  wrap.innerHTML = `
    <div class="preview-wrap">
      <div class="preview-header">${lines.length} cromo${lines.length !== 1 ? 's' : ''} a añadir</div>
      <div class="preview-list">
        ${lines.map((nombre, i) => `
          <div class="preview-item">
            <span class="preview-num">#${desde + i}</span>
            <span class="preview-nombre">${nombre}</span>
          </div>`).join('')}
      </div>
    </div>`;
  updateSubmitBtn(lines.length);
}

function updateSubmitBtn(count) {
  const btn = document.getElementById('modal-submit');
  if (count > 0) {
    btn.textContent = `Añadir ${count} cromo${count !== 1 ? 's' : ''}`;
    btn.disabled = false;
  } else {
    btn.textContent = 'Añadir cromos';
    btn.disabled = true;
  }
}

async function submitModal() {
  const equipo = document.getElementById('modal-equipo').value.trim().toUpperCase();
  const siglas = document.getElementById('modal-siglas').value.trim().toUpperCase();
  const desde  = parseInt(document.getElementById('modal-desde').value) || 1;
  const lines  = getJugadoresLines();

  if (!equipo || lines.length === 0) return;

  const btn = document.getElementById('modal-submit');
  btn.disabled = true;
  btn.textContent = 'Guardando...';

  const nuevos = lines.map((nombre, i) => ({
    equipo,
    numero: desde + i,
    nombre_jugador: nombre,
    siglas,
    cd_repetidos: 0,
    obtenido: false,
  }));

  const { data, error } = await db.from('cromos').insert(nuevos).select();

  if (error) {
    showToast('Error: ' + (error.message || 'no se pudo guardar'), 'red');
    updateSubmitBtn(lines.length);
    return;
  }

  // Actualiza estado local
  allCromos.push(...data);
  allCromos.sort((a, b) => a.equipo.localeCompare(b.equipo, 'es') || a.numero - b.numero);

  populateEquipoSelect();
  updateHeaderStats();
  closeModal();
  showToast(`✓ ${data.length} cromo${data.length !== 1 ? 's' : ''} añadido${data.length !== 1 ? 's' : ''}`, 'green');

  // Navega a la vista Equipos con el equipo recién añadido seleccionado
  document.querySelector('[data-view="equipos"]').click();
  const sel = document.getElementById('equipo-select');
  sel.value = equipo;
  equipoFilter = equipo;
  renderCurrentView();
}
