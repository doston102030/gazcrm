/* ===================================================
   GAZ BALON BOSHQARUV TIZIMI — app.js
   Full application logic: state, CRUD, 45-day timers,
   search, file upload (base64), LocalStorage
   =================================================== */

'use strict';

// ──────────────────────────────────────────────
// STATE
// ──────────────────────────────────────────────
let state = {
  mijozlar: [],   // { id, ism, familya, telefon, sana, manzil, izoh, rasm (base64), pdf (base64), pdfName }
  braqlar:  []    // { id, ism, familya, telefon, sana, sabab, rasm (base64) }
};

const LIMIT_DAYS = 45;
const WARN_DAYS  = 7;

// ──────────────────────────────────────────────
// PERSISTENCE
// ──────────────────────────────────────────────
function saveState() {
  try {
    localStorage.setItem('gaz_state', JSON.stringify(state));
  } catch (e) {
    showToast('Xotira to\'lib qoldi! Ba\'zi ma\'lumotlar saqlanmadi.', 'error');
  }
}
function loadState() {
  const raw = localStorage.getItem('gaz_state');
  if (raw) {
    try { state = JSON.parse(raw); } catch (e) {}
  }
}

// ──────────────────────────────────────────────
// HELPERS — dates & status
// ──────────────────────────────────────────────
function today() {
  // Use local date from reliable system time
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function daysDiff(dateStr) {
  // positive = days since that date; negative = days until
  const d = new Date(dateStr);
  const t = today();
  return Math.floor((t - d) / 86400000);
}

function daysLeft(dateStr) {
  // how many days left until 45-day limit
  return LIMIT_DAYS - daysDiff(dateStr);
}

function getStatus(m) {
  const left = daysLeft(m.sana);
  if (left < 0) return 'overdue';
  if (left <= WARN_DAYS) return 'soon';
  return 'ok';
}

function statusLabel(m) {
  const left = daysLeft(m.sana);
  if (left < 0) return `🚨 ${Math.abs(left)} kun o'tib ketdi`;
  if (left === 0) return `⚠️ Bugun tugaydi!`;
  if (left <= WARN_DAYS) return `⚠️ ${left} kun qoldi`;
  return `✅ ${left} kun qoldi`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('uz', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function initials(ism, familya) {
  return ((ism[0] || '') + (familya[0] || '')).toUpperCase();
}

// ──────────────────────────────────────────────
// TOAST
// ──────────────────────────────────────────────
function showToast(msg, type = 'info') {
  const icon = { success: '✅', error: '❌', info: 'ℹ️' };
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span>${icon[type]}</span><span>${msg}</span>`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// ──────────────────────────────────────────────
// NAVIGATION / PAGES
// ──────────────────────────────────────────────
let currentPage = 'dashboard';

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`page-${name}`).classList.remove('hidden');
  const navEl = document.getElementById(`nav-${name}`);
  if (navEl) navEl.classList.add('active');
  currentPage = name;
  // close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('open');
  // refresh
  if (name === 'dashboard')  renderDashboard();
  if (name === 'mijozlar')   renderMijozlar();
  if (name === 'qidirish')   { document.getElementById('search-results').innerHTML = ''; document.getElementById('search-empty').style.display = 'none'; document.getElementById('global-search').value = ''; document.getElementById('global-search').focus(); }
  if (name === 'braq')       renderBraq();
  if (name === 'muddatlar')  renderTimeline();
}

// ──────────────────────────────────────────────
// CLOCK
// ──────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString('uz', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  const el = document.getElementById('current-time');
  if (el) el.innerHTML = `${timeStr}<br><small>${dateStr}</small>`;
}

// ──────────────────────────────────────────────
// DASHBOARD
// ──────────────────────────────────────────────
function renderDashboard() {
  const total   = state.mijozlar.length;
  const overdue = state.mijozlar.filter(m => getStatus(m) === 'overdue');
  const soon    = state.mijozlar.filter(m => getStatus(m) === 'soon');
  const ok      = state.mijozlar.filter(m => getStatus(m) === 'ok');

  document.getElementById('stat-total').textContent   = total;
  document.getElementById('stat-active').textContent  = ok.length;
  document.getElementById('stat-overdue').textContent = overdue.length;
  document.getElementById('stat-soon').textContent    = soon.length;
  document.getElementById('stat-braq').textContent    = state.braqlar.length;

  // overdue badge in sidebar
  const badge = document.getElementById('overdue-badge');
  if (overdue.length > 0) {
    badge.textContent = overdue.length;
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }

  // Overdue list
  const ol = document.getElementById('overdue-list');
  if (overdue.length === 0) {
    ol.innerHTML = '<div class="empty-state">Hali muddati o\'tgan mijoz yo\'q 🎉</div>';
  } else {
    ol.innerHTML = overdue
      .sort((a, b) => daysDiff(a.sana) - daysDiff(b.sana))
      .map(m => `
        <div class="panel-row" onclick="openDetail('${m.id}')">
          <div>
            <div class="panel-row-name">${m.familya} ${m.ism}</div>
            <div class="panel-row-phone">${m.telefon}</div>
          </div>
          <div class="panel-row-days" style="color:var(--red)">${Math.abs(daysLeft(m.sana))} kun o'tdi</div>
        </div>
      `).join('');
  }

  // Soon list
  const sl = document.getElementById('soon-list');
  if (soon.length === 0) {
    sl.innerHTML = '<div class="empty-state">Yaqin muddatli mijoz yo\'q</div>';
  } else {
    sl.innerHTML = soon
      .sort((a, b) => daysLeft(a.sana) - daysLeft(b.sana))
      .map(m => `
        <div class="panel-row" onclick="openDetail('${m.id}')">
          <div>
            <div class="panel-row-name">${m.familya} ${m.ism}</div>
            <div class="panel-row-phone">${m.telefon}</div>
          </div>
          <div class="panel-row-days" style="color:var(--yellow)">${daysLeft(m.sana)} kun qoldi</div>
        </div>
      `).join('');
  }
}

// ──────────────────────────────────────────────
// MIJOZLAR — render cards
// ──────────────────────────────────────────────
let activeFilter   = 'all';
let mijozSearchVal = '';

function renderMijozlar() {
  let list = [...state.mijozlar];

  // filter
  if (activeFilter !== 'all') {
    list = list.filter(m => getStatus(m) === activeFilter);
  }
  // search
  if (mijozSearchVal.trim()) {
    const q = mijozSearchVal.toLowerCase();
    list = list.filter(m =>
      m.ism.toLowerCase().includes(q) ||
      m.familya.toLowerCase().includes(q) ||
      m.telefon.includes(q)
    );
  }

  // Sort: overdue first, then soon, then ok; within each group by days
  list.sort((a, b) => {
    const order = { overdue: 0, soon: 1, ok: 2 };
    const diff = order[getStatus(a)] - order[getStatus(b)];
    if (diff !== 0) return diff;
    return daysDiff(b.sana) - daysDiff(a.sana);
  });

  const container = document.getElementById('mijozlar-list');
  if (list.length === 0) {
    container.innerHTML = '<div class="empty-state" style="grid-column:1/-1">Hech qanday mijoz topilmadi</div>';
    return;
  }
  container.innerHTML = list.map(m => mijozCard(m)).join('');
}

function mijozCard(m) {
  const st = getStatus(m);
  const left = daysLeft(m.sana);
  const pct = Math.min(100, Math.max(0, (daysDiff(m.sana) / LIMIT_DAYS) * 100));
  const barColor = st === 'overdue' ? 'var(--red)' : st === 'soon' ? 'var(--yellow)' : 'var(--green)';
  const avatar = m.rasm
    ? `<img class="card-avatar" src="${m.rasm}" alt="${m.ism}" />`
    : `<div class="card-avatar-placeholder">${initials(m.ism, m.familya)}</div>`;
  const pdfBtn = m.pdf
    ? `<button class="card-btn card-btn-pdf" onclick="event.stopPropagation(); downloadFile('${m.id}')">📄 PDF</button>`
    : '';
  return `
    <div class="mijoz-card ${st}" onclick="openDetail('${m.id}')" id="card-${m.id}">
      <div class="card-status-bar ${st}"></div>
      <div class="card-body">
        ${avatar}
        <div class="card-name">${m.familya} ${m.ism}</div>
        <div class="card-phone">📞 ${m.telefon}</div>
        <div class="card-info-row"><span>📅</span><span>Balon olgan: ${formatDate(m.sana)}</span></div>
        ${m.manzil ? `<div class="card-info-row"><span>📍</span><span>${m.manzil}</span></div>` : ''}
        <div class="card-badge badge-${st}">${statusLabel(m)}</div>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill" style="width:${pct}%;background:${barColor}"></div>
        </div>
      </div>
      <div class="card-actions">
        <button class="card-btn card-btn-edit" onclick="event.stopPropagation(); editMijoz('${m.id}')">✏️ Tahrirlash</button>
        ${pdfBtn}
        <button class="card-btn card-btn-del" onclick="event.stopPropagation(); confirmDelete('mijoz','${m.id}')">🗑️</button>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────────
// DETAIL MODAL
// ──────────────────────────────────────────────
function openDetail(id) {
  const m = state.mijozlar.find(x => x.id === id);
  if (!m) return;
  const st = getStatus(m);
  const left = daysLeft(m.sana);
  const color = st === 'overdue' ? 'var(--red)' : st === 'soon' ? 'var(--yellow)' : 'var(--green)';
  const avatar = m.rasm
    ? `<img class="detail-photo" src="${m.rasm}" alt="${m.ism}" />`
    : `<div class="detail-photo-placeholder">${initials(m.ism, m.familya)}</div>`;

  document.getElementById('detail-name').textContent = `${m.familya} ${m.ism}`;
  document.getElementById('detail-body').innerHTML = `
    <div class="detail-grid">
      <div>${avatar}</div>
      <div class="detail-rows">
        <div class="detail-row">
          <div class="detail-row-label">Ism va Familya</div>
          <div class="detail-row-value">${m.familya} ${m.ism}</div>
        </div>
        <div class="detail-row">
          <div class="detail-row-label">Telefon raqam</div>
          <div class="detail-row-value">📞 ${m.telefon}</div>
        </div>
        <div class="detail-row">
          <div class="detail-row-label">Balon olgan sana</div>
          <div class="detail-row-value">📅 ${formatDate(m.sana)}</div>
        </div>
        <div class="detail-row">
          <div class="detail-row-label">45-kun muddati</div>
          <div class="detail-row-value" style="color:${color}">${statusLabel(m)}</div>
        </div>
        ${m.manzil ? `<div class="detail-row"><div class="detail-row-label">Manzil</div><div class="detail-row-value">📍 ${m.manzil}</div></div>` : ''}
        ${m.izoh ? `<div class="detail-row"><div class="detail-row-label">Izoh</div><div class="detail-row-value" style="font-weight:400;color:var(--text2)">${m.izoh}</div></div>` : ''}
        ${m.pdf ? `<div class="detail-row"><div class="detail-row-label">Hujjat</div><button class="detail-pdf-btn" onclick="downloadFile('${m.id}')">📄 PDF yuklab olish — ${m.pdfName || 'hujjat.pdf'}</button></div>` : ''}
        <div class="detail-row" style="margin-top:8px">
          <button class="btn btn-primary" onclick="closeModal('modal-detail'); editMijoz('${m.id}')">✏️ Tahrirlash</button>
        </div>
      </div>
    </div>
  `;
  openModal('modal-detail');
}

// ──────────────────────────────────────────────
// MODAL HELPERS
// ──────────────────────────────────────────────
function openModal(id) {
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  // faqat boshqa ochiq modal bo'lmasa scrollni qaytaramiz
  const stillOpen = document.querySelectorAll('.modal-overlay.open').length;
  if (stillOpen === 0) document.body.style.overflow = '';
}

// close on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});
// close buttons
document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.dataset.close));
});

// ──────────────────────────────────────────────
// MIJOZ FORM
// ──────────────────────────────────────────────
let tempImg = null;   // base64
let tempPdf = null;   // base64
let tempPdfName = null;

function resetMijozForm() {
  document.getElementById('form-mijoz').reset();
  document.getElementById('mijoz-id').value = '';
  document.getElementById('modal-mijoz-title').textContent = 'Yangi Mijoz Qo\'shish';
  tempImg = null; tempPdf = null; tempPdfName = null;
  document.getElementById('img-preview').classList.add('hidden');
  document.getElementById('img-label').classList.remove('hidden');
  document.getElementById('pdf-preview').classList.add('hidden');
  document.getElementById('pdf-label').classList.remove('hidden');
  // set today as default date
  const d = new Date();
  const iso = d.toISOString().slice(0, 10);
  document.getElementById('f-sana').value = iso;
}

document.getElementById('btn-add-mijoz').addEventListener('click', () => {
  resetMijozForm();
  openModal('modal-mijoz');
});

function editMijoz(id) {
  const m = state.mijozlar.find(x => x.id === id);
  if (!m) return;
  resetMijozForm();
  document.getElementById('mijoz-id').value = m.id;
  document.getElementById('f-ism').value     = m.ism;
  document.getElementById('f-familya').value = m.familya;
  document.getElementById('f-telefon').value = m.telefon;
  document.getElementById('f-sana').value    = m.sana;
  document.getElementById('f-manzil').value  = m.manzil || '';
  document.getElementById('f-izoh').value    = m.izoh || '';
  document.getElementById('modal-mijoz-title').textContent = 'Mijozni Tahrirlash';
  if (m.rasm) {
    tempImg = m.rasm;
    const prev = document.getElementById('img-preview');
    prev.src = m.rasm;
    prev.classList.remove('hidden');
    document.getElementById('img-label').classList.add('hidden');
  }
  if (m.pdf) {
    tempPdf = m.pdf;
    tempPdfName = m.pdfName;
    document.getElementById('pdf-name-display').textContent = m.pdfName || 'hujjat.pdf';
    document.getElementById('pdf-preview').classList.remove('hidden');
    document.getElementById('pdf-label').classList.add('hidden');
  }
  openModal('modal-mijoz');
}

// File inputs
document.getElementById('f-rasm').addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    tempImg = e.target.result;
    const prev = document.getElementById('img-preview');
    prev.src = tempImg;
    prev.classList.remove('hidden');
    document.getElementById('img-label').classList.add('hidden');
  };
  reader.readAsDataURL(file);
});

document.getElementById('f-pdf').addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    tempPdf = e.target.result;
    tempPdfName = file.name;
    document.getElementById('pdf-name-display').textContent = file.name;
    document.getElementById('pdf-preview').classList.remove('hidden');
    document.getElementById('pdf-label').classList.add('hidden');
  };
  reader.readAsDataURL(file);
});

// Submit mijoz form
document.getElementById('form-mijoz').addEventListener('submit', function (e) {
  e.preventDefault();
  const id = document.getElementById('mijoz-id').value;
  const obj = {
    id: id || uid(),
    ism:     document.getElementById('f-ism').value.trim(),
    familya: document.getElementById('f-familya').value.trim(),
    telefon: document.getElementById('f-telefon').value.trim(),
    sana:    document.getElementById('f-sana').value,
    manzil:  document.getElementById('f-manzil').value.trim(),
    izoh:    document.getElementById('f-izoh').value.trim(),
    rasm:    tempImg,
    pdf:     tempPdf,
    pdfName: tempPdfName
  };
  if (!obj.ism || !obj.familya || !obj.telefon || !obj.sana) {
    showToast('Iltimos, majburiy maydonlarni to\'ldiring!', 'error');
    return;
  }
  if (id) {
    const idx = state.mijozlar.findIndex(x => x.id === id);
    state.mijozlar[idx] = obj;
    showToast('Mijoz muvaffaqiyatli yangilandi!', 'success');
  } else {
    state.mijozlar.push(obj);
    showToast('Yangi mijoz qo\'shildi!', 'success');
  }
  saveState();
  closeModal('modal-mijoz');
  renderMijozlar();
  renderDashboard();
});

// ──────────────────────────────────────────────
// DELETE (confirm modal)
// ──────────────────────────────────────────────
let pendingDelete = null;

function confirmDelete(type, id) {
  pendingDelete = { type, id };
  const msg = type === 'mijoz' ? 'Bu mijozni o\'chirishni tasdiqlaysizmi?' : 'Bu braq balonni o\'chirishni tasdiqlaysizmi?';
  document.getElementById('confirm-msg').textContent = msg;
  openModal('modal-confirm');
}

document.getElementById('confirm-ok-btn').addEventListener('click', () => {
  if (!pendingDelete) return;
  const { type, id } = pendingDelete;
  if (type === 'mijoz') {
    state.mijozlar = state.mijozlar.filter(x => x.id !== id);
    showToast('Mijoz o\'chirildi.', 'info');
    renderMijozlar();
    renderDashboard();
  } else {
    state.braqlar = state.braqlar.filter(x => x.id !== id);
    showToast('Braq balon o\'chirildi.', 'info');
    renderBraq();
    renderDashboard();
  }
  saveState();
  closeModal('modal-confirm');
  pendingDelete = null;
});

// ──────────────────────────────────────────────
// PDF DOWNLOAD
// ──────────────────────────────────────────────
function downloadFile(id) {
  const m = state.mijozlar.find(x => x.id === id);
  if (!m || !m.pdf) return;
  const a = document.createElement('a');
  a.href = m.pdf;
  a.download = m.pdfName || `${m.familya}_${m.ism}.pdf`;
  a.click();
}

// ──────────────────────────────────────────────
// SEARCH (Mijozlar page inline)
// ──────────────────────────────────────────────
document.getElementById('mijoz-search').addEventListener('input', function () {
  mijozSearchVal = this.value;
  renderMijozlar();
});

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    activeFilter = this.dataset.filter;
    renderMijozlar();
  });
});

// ──────────────────────────────────────────────
// GLOBAL SEARCH page
// ──────────────────────────────────────────────
document.getElementById('global-search').addEventListener('input', function () {
  const q = this.value.toLowerCase().trim();
  const resultsEl = document.getElementById('search-results');
  const emptyEl   = document.getElementById('search-empty');
  if (!q) {
    resultsEl.innerHTML = '';
    emptyEl.style.display = 'none';
    return;
  }
  const hits = state.mijozlar.filter(m =>
    m.ism.toLowerCase().includes(q) ||
    m.familya.toLowerCase().includes(q) ||
    m.telefon.includes(q) ||
    (m.manzil && m.manzil.toLowerCase().includes(q)) ||
    m.sana.includes(q)
  );
  if (hits.length === 0) {
    resultsEl.innerHTML = '';
    emptyEl.style.display = 'block';
  } else {
    emptyEl.style.display = 'none';
    resultsEl.innerHTML = hits.map(m => mijozCard(m)).join('');
  }
});

// ──────────────────────────────────────────────
// BRAQ BALONLAR
// ──────────────────────────────────────────────
let tempBraqImg = null;

function resetBraqForm() {
  document.getElementById('form-braq').reset();
  document.getElementById('braq-id').value = '';
  document.getElementById('modal-braq-title').textContent = 'Braq Balon Qo\'shish';
  tempBraqImg = null;
  document.getElementById('braq-img-preview').classList.add('hidden');
  document.getElementById('braq-img-label').classList.remove('hidden');
  const d = new Date();
  document.getElementById('b-sana').value = d.toISOString().slice(0, 10);
  
  // Clear checkboxes and textarea
  document.querySelectorAll('.q-opt').forEach(opt => opt.checked = false);
  document.getElementById('b-sabab').value = '';
}

function updateBraqSabab() {
  const selected = [];
  document.querySelectorAll('.q-opt:checked').forEach(opt => {
    selected.push(opt.dataset.text);
  });
  document.getElementById('b-sabab').value = selected.join('\n');
}

document.getElementById('btn-add-braq').addEventListener('click', () => {
  resetBraqForm();
  openModal('modal-braq');
  // Sabab matnini avtomatik tanlash (highlight)
  setTimeout(() => {
    const sabab = document.getElementById('b-sabab');
    sabab.focus();
    sabab.select();
  }, 80);
});

document.getElementById('b-rasm').addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    tempBraqImg = e.target.result;
    const prev = document.getElementById('braq-img-preview');
    prev.src = tempBraqImg;
    prev.classList.remove('hidden');
    document.getElementById('braq-img-label').classList.add('hidden');
  };
  reader.readAsDataURL(file);
});

document.getElementById('form-braq').addEventListener('submit', function (e) {
  e.preventDefault();
  const id = document.getElementById('braq-id').value;
  const obj = {
    id: id || uid(),
    ism:     document.getElementById('b-ism').value.trim(),
    familya: document.getElementById('b-familya').value.trim(),
    telefon: document.getElementById('b-telefon').value.trim(),
    sana:    document.getElementById('b-sana').value,
    sabab:   document.getElementById('b-sabab').value.trim(),
    rasm:    tempBraqImg
  };
  if (!obj.ism || !obj.familya || !obj.telefon || !obj.sana) {
    showToast('Iltimos, majburiy maydonlarni to\'ldiring!', 'error');
    return;
  }
  if (id) {
    const idx = state.braqlar.findIndex(x => x.id === id);
    state.braqlar[idx] = obj;
    showToast('Braq balon yangilandi!', 'success');
  } else {
    state.braqlar.push(obj);
    showToast('Braq balon qo\'shildi!', 'success');
  }
  saveState();
  closeModal('modal-braq');
  renderBraq();
  renderDashboard();
});

function renderBraq() {
  const q = document.getElementById('braq-search').value.toLowerCase().trim();
  let list = [...state.braqlar].sort((a, b) => new Date(b.sana) - new Date(a.sana));
  if (q) {
    list = list.filter(b =>
      b.ism.toLowerCase().includes(q) ||
      b.familya.toLowerCase().includes(q) ||
      b.telefon.includes(q)
    );
  }
  const container = document.getElementById('braq-list');
  if (list.length === 0) {
    container.innerHTML = '<div class="empty-state" style="grid-column:1/-1">Hali braq balon yozilmagan</div>';
    return;
  }
  container.innerHTML = list.map(b => `
    <div class="braq-card">
      ${b.rasm ? `<img class="braq-card-img" src="${b.rasm}" alt="braq" />` : ''}
      <div class="braq-card-name">${b.familya} ${b.ism}</div>
      <div class="braq-card-phone">📞 ${b.telefon}</div>
      <div class="braq-card-date">🔧 Almashtirilgan: ${formatDate(b.sana)}</div>
      ${b.sabab ? `<div class="braq-card-sabab">💬 ${b.sabab}</div>` : ''}
      <div class="braq-card-actions">
        <button class="card-btn card-btn-edit" onclick="editBraq('${b.id}')">✏️ Tahrirlash</button>
        <button class="card-btn card-btn-del" onclick="confirmDelete('braq','${b.id}')">🗑️ O'chirish</button>
      </div>
    </div>
  `).join('');
}

document.getElementById('braq-search').addEventListener('input', () => renderBraq());

function editBraq(id) {
  const b = state.braqlar.find(x => x.id === id);
  if (!b) return;
  resetBraqForm();
  document.getElementById('braq-id').value = b.id;
  document.getElementById('b-ism').value     = b.ism;
  document.getElementById('b-familya').value = b.familya;
  document.getElementById('b-telefon').value = b.telefon;
  document.getElementById('b-sana').value    = b.sana;
  document.getElementById('b-sabab').value   = b.sabab || '';
  document.getElementById('modal-braq-title').textContent = 'Braq Balonni Tahrirlash';
  if (b.rasm) {
    tempBraqImg = b.rasm;
    const prev = document.getElementById('braq-img-preview');
    prev.src = b.rasm;
    prev.classList.remove('hidden');
    document.getElementById('braq-img-label').classList.add('hidden');
  }
  openModal('modal-braq');
}

// ──────────────────────────────────────────────
// TIMELINE / MUDDATLAR
// ──────────────────────────────────────────────
function renderTimeline() {
  const container = document.getElementById('timeline-container');
  const list = [...state.mijozlar].sort((a, b) => daysLeft(a.sana) - daysLeft(b.sana));
  if (list.length === 0) {
    container.innerHTML = '<div class="empty-state">Hali mijoz yo\'q</div>';
    return;
  }
  container.innerHTML = list.map(m => {
    const st    = getStatus(m);
    const left  = daysLeft(m.sana);
    const color = st === 'overdue' ? 'var(--red)' : st === 'soon' ? 'var(--yellow)' : 'var(--green)';
    const dotCls = `dot-${st === 'ok' ? 'green' : st === 'soon' ? 'yellow' : 'red'}`;
    const deadline = new Date(m.sana);
    deadline.setDate(deadline.getDate() + LIMIT_DAYS);
    return `
      <div class="timeline-item" onclick="openDetail('${m.id}')">
        <div class="timeline-dot ${dotCls}"></div>
        <div class="timeline-content">
          <div class="timeline-name">${m.familya} ${m.ism}</div>
          <div class="timeline-meta">📞 ${m.telefon} &nbsp;|&nbsp; 📅 Balon olgan: ${formatDate(m.sana)} &nbsp;|&nbsp; ⏰ Muddat: ${formatDate(deadline.toISOString().slice(0,10))}</div>
        </div>
        <div class="timeline-days" style="color:${color}">${statusLabel(m)}</div>
      </div>
    `;
  }).join('');
}

// ──────────────────────────────────────────────
// NAV LISTENERS
// ──────────────────────────────────────────────
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    showPage(item.dataset.page);
  });
});

// Mobile menu
document.getElementById('menu-btn').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebar-overlay').classList.toggle('open');
});
document.getElementById('sidebar-overlay').addEventListener('click', () => {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('open');
});

// Escape key closes modals
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
    document.body.style.overflow = '';
  }
});

// ──────────────────────────────────────────────
// Make functions globally accessible for inline onclick
// ──────────────────────────────────────────────
window.openDetail     = openDetail;
window.editMijoz      = editMijoz;
window.editBraq       = editBraq;
window.confirmDelete  = confirmDelete;
window.downloadFile   = downloadFile;
window.closeModal     = closeModal;

// Initializing the checkboxes listeners
function initBraqQuickPick() {
  document.querySelectorAll('.q-opt').forEach(opt => {
    opt.addEventListener('change', updateBraqSabab);
  });
}

// ──────────────────────────────────────────────
// INIT
// ──────────────────────────────────────────────
(function init() {
  loadState();
  renderDashboard();
  renderMijozlar();
  updateClock();
  initBraqQuickPick();
  setInterval(updateClock, 1000);
  // Auto-refresh dashboard every 60s (in case day changes)
  setInterval(() => {
    if (currentPage === 'dashboard') renderDashboard();
  }, 60000);
})();
