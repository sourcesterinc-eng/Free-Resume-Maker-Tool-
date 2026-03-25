/* ════════════════════════════════════════
   RESUME FORGE — script.js
   All application logic for the resume builder
════════════════════════════════════════ */

// ────────────────────────────────────────
// STATE
// ────────────────────────────────────────
let state = {
  tpl:      'exec',
  name:     '', title:    '', email:    '',
  phone:    '', location: '', linkedin: '',
  summary:  '', photo:    '',
  exp:      [{ id: 1, jobtitle: '', company: '', dates: '', desc: '' }],
  edu:      [{ id: 1, degree: '', school: '', year: '' }],
  skills:   []
};

let expIdCounter = 10;
let eduIdCounter = 10;
let renderTimer  = null;
let toastTimer   = null;

// ────────────────────────────────────────
// INIT
// ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  renderExpEntries();
  renderEduEntries();
  renderSkillChips();
  openAllSections();
  bindPhotoUpload();
  bindSkillInput();
  bindTemplateCards();
  bindActionButtons();
  liveRender();
  updateProgress();
});

function openAllSections() {
  document.querySelectorAll('.acc-section').forEach(s => {
    s.classList.add('open');
    s.querySelector('.acc-content').style.height = 'auto';
  });
}

// ────────────────────────────────────────
// ACCORDION
// ────────────────────────────────────────
function toggleSection(id) {
  const sec     = document.getElementById('sec-' + id);
  const content = sec.querySelector('.acc-content');
  const isOpen  = sec.classList.contains('open');

  if (isOpen) {
    content.style.height = content.scrollHeight + 'px';
    requestAnimationFrame(() => { content.style.height = '0'; });
    sec.classList.remove('open');
  } else {
    content.style.height = '0';
    sec.classList.add('open');
    content.style.height = content.scrollHeight + 'px';
    setTimeout(() => { content.style.height = 'auto'; }, 300);
  }
}

// ────────────────────────────────────────
// TEMPLATE CARDS
// ────────────────────────────────────────
function bindTemplateCards() {
  document.querySelectorAll('.tpl-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.tpl-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      state.tpl = card.dataset.tpl;
      saveState();
      liveRender();
    });
  });
}

// ────────────────────────────────────────
// PHOTO UPLOAD
// ────────────────────────────────────────
function bindPhotoUpload() {
  const inp  = document.getElementById('photoInput');
  const pz   = document.getElementById('photoZone');
  const prev = document.getElementById('photoPreviewImg');

  inp.addEventListener('change', () => {
    const file = inp.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      state.photo = e.target.result;
      prev.src    = e.target.result;
      prev.style.display = 'block';
      pz.querySelector('i').style.display = 'none';
      pz.querySelector('p').style.display = 'none';
      liveRender();
      saveState();
    };
    reader.readAsDataURL(file);
  });
}

// ────────────────────────────────────────
// SKILL TAG INPUT
// ────────────────────────────────────────
function bindSkillInput() {
  const inp = document.getElementById('skillInput');

  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = inp.value.replace(',', '').trim();
      if (val && !state.skills.includes(val)) {
        state.skills.push(val);
        renderSkillChips();
        liveRender();
        saveState();
      }
      inp.value = '';
    } else if (e.key === 'Backspace' && !inp.value && state.skills.length) {
      state.skills.pop();
      renderSkillChips();
      liveRender();
      saveState();
    }
  });
}

function renderSkillChips() {
  const container = document.getElementById('skillTags');
  container.querySelectorAll('.skill-tag-chip').forEach(c => c.remove());
  const inp = document.getElementById('skillInput');

  state.skills.forEach((sk, i) => {
    const chip = document.createElement('div');
    chip.className = 'skill-tag-chip';
    chip.innerHTML = `${sk}<button onclick="removeSkill(${i})">&times;</button>`;
    container.insertBefore(chip, inp);
  });
}

function removeSkill(i) {
  state.skills.splice(i, 1);
  renderSkillChips();
  liveRender();
  saveState();
}

// ────────────────────────────────────────
// EXPERIENCE / EDUCATION ENTRIES
// ────────────────────────────────────────
function addEntry(type) {
  if (type === 'exp') {
    state.exp.push({ id: ++expIdCounter, jobtitle: '', company: '', dates: '', desc: '' });
    renderExpEntries();
  } else {
    state.edu.push({ id: ++eduIdCounter, degree: '', school: '', year: '' });
    renderEduEntries();
  }
}

function removeEntry(type, id) {
  if (type === 'exp') { state.exp = state.exp.filter(e => e.id !== id); renderExpEntries(); }
  else                { state.edu = state.edu.filter(e => e.id !== id); renderEduEntries(); }
  liveRender();
  saveState();
}

function renderExpEntries() {
  const container = document.getElementById('exp-entries');
  container.innerHTML = '';

  state.exp.forEach(e => {
    const card = document.createElement('div');
    card.className = 'entry-card';
    card.id = 'exp-card-' + e.id;
    card.innerHTML = `
      <button class="entry-remove" onclick="removeEntry('exp', ${e.id})" title="Remove">
        <i class="fas fa-xmark"></i>
      </button>
      <div class="field-row">
        <div class="field">
          <label>Job Title</label>
          <input type="text" value="${esc(e.jobtitle)}" placeholder="Senior Designer"
            oninput="expChange(${e.id}, 'jobtitle', this.value)">
        </div>
        <div class="field">
          <label>Company</label>
          <input type="text" value="${esc(e.company)}" placeholder="Acme Corp"
            oninput="expChange(${e.id}, 'company', this.value)">
        </div>
      </div>
      <div class="field">
        <label>Dates</label>
        <input type="text" value="${esc(e.dates)}" placeholder="Jan 2021 — Present"
          oninput="expChange(${e.id}, 'dates', this.value)">
      </div>
      <div class="field">
        <label>Description</label>
        <textarea placeholder="Key responsibilities and achievements…"
          oninput="expChange(${e.id}, 'desc', this.value)">${esc(e.desc)}</textarea>
      </div>`;
    container.appendChild(card);
  });
}

function renderEduEntries() {
  const container = document.getElementById('edu-entries');
  container.innerHTML = '';

  state.edu.forEach(e => {
    const card = document.createElement('div');
    card.className = 'entry-card';
    card.innerHTML = `
      <button class="entry-remove" onclick="removeEntry('edu', ${e.id})" title="Remove">
        <i class="fas fa-xmark"></i>
      </button>
      <div class="field">
        <label>Degree / Qualification</label>
        <input type="text" value="${esc(e.degree)}" placeholder="B.Sc. Computer Science"
          oninput="eduChange(${e.id}, 'degree', this.value)">
      </div>
      <div class="field-row">
        <div class="field">
          <label>Institution</label>
          <input type="text" value="${esc(e.school)}" placeholder="MIT"
            oninput="eduChange(${e.id}, 'school', this.value)">
        </div>
        <div class="field">
          <label>Year</label>
          <input type="text" value="${esc(e.year)}" placeholder="2019"
            oninput="eduChange(${e.id}, 'year', this.value)">
        </div>
      </div>`;
    container.appendChild(card);
  });
}

function expChange(id, field, val) {
  const entry = state.exp.find(x => x.id === id);
  if (entry) entry[field] = val;
  liveRender();
  saveState();
  updateProgress();
}

function eduChange(id, field, val) {
  const entry = state.edu.find(x => x.id === id);
  if (entry) entry[field] = val;
  liveRender();
  saveState();
}

// ────────────────────────────────────────
// COLLECT PERSONAL FIELDS
// ────────────────────────────────────────
function collectPersonal() {
  ['name', 'title', 'email', 'phone', 'location', 'linkedin', 'summary'].forEach(key => {
    const el = document.getElementById('f-' + key);
    if (el) state[key] = el.value;
  });
}

// ────────────────────────────────────────
// LIVE RENDER  (debounced)
// ────────────────────────────────────────
function liveRender() {
  collectPersonal();
  updateProgress();
  saveState();
  clearTimeout(renderTimer);
  renderTimer = setTimeout(doRender, 80);
}

function doRender() {
  const sheet = document.getElementById('resumeSheet');

  if (!hasContent()) {
    sheet.innerHTML = `
      <div class="empty-state" id="emptyState">
        <i class="fas fa-file-alt"></i>
        <h3>Your resume appears here</h3>
        <p>Start filling in your details on the left — it updates live as you type.</p>
      </div>`;
    return;
  }

  sheet.className = 'resume-sheet';
  sheet.innerHTML  = buildTemplate(state.tpl);
}

function hasContent() {
  return state.name || state.title || state.email || state.summary
    || state.exp.some(e => e.jobtitle)
    || state.edu.some(e => e.degree)
    || state.skills.length;
}

// ────────────────────────────────────────
// TEMPLATE BUILDERS
// ────────────────────────────────────────
function buildTemplate(tpl) {
  const map = { exec: buildExec, modern: buildModern, minimal: buildMinimal, creative: buildCreative };
  return (map[tpl] || buildExec)();
}

/* ── Executive ── */
function buildExec() {
  const s           = state;
  const expFiltered = s.exp.filter(e => e.jobtitle || e.company);
  const eduFiltered = s.edu.filter(e => e.degree);

  return `<div class="tpl-exec">
    <div class="r-header">
      ${s.photo ? `<img src="${s.photo}" class="r-photo">` : ''}
      <div class="r-name">${s.name || 'Your Name'}</div>
      ${s.title ? `<div class="r-jobtitle">${s.title}</div>` : ''}
      <div class="r-contact">
        ${s.email    ? `<span><i class="fas fa-envelope"></i>${s.email}</span>`        : ''}
        ${s.phone    ? `<span><i class="fas fa-phone"></i>${s.phone}</span>`           : ''}
        ${s.location ? `<span><i class="fas fa-location-dot"></i>${s.location}</span>` : ''}
        ${s.linkedin ? `<span><i class="fab fa-linkedin"></i>${s.linkedin}</span>`     : ''}
      </div>
    </div>
    <div class="r-body">
      <div class="r-main">
        ${s.summary ? `
          <div class="r-section">
            <div class="r-section-title">Summary</div>
            <p class="r-summary">${s.summary}</p>
          </div>` : ''}
        ${expFiltered.length ? `
          <div class="r-section">
            <div class="r-section-title">Experience</div>
            ${expFiltered.map(e => `
              <div class="r-job">
                <div class="r-job-title">${e.jobtitle}</div>
                <div class="r-job-meta">
                  ${e.company ? `<span>${e.company}</span>` : ''}
                  ${e.dates   ? `<span>${e.dates}</span>`   : ''}
                </div>
                ${e.desc ? `<div class="r-job-desc">${e.desc}</div>` : ''}
              </div>`).join('')}
          </div>` : ''}
      </div>
      <div class="r-side">
        ${eduFiltered.length ? `
          <div class="r-section">
            <div class="r-section-title">Education</div>
            ${eduFiltered.map(e => `
              <div class="r-edu">
                <div class="r-edu-deg">${e.degree}</div>
                <div class="r-edu-school">${e.school}${e.year ? ' · ' + e.year : ''}</div>
              </div>`).join('')}
          </div>` : ''}
        ${s.skills.length ? `
          <div class="r-section">
            <div class="r-section-title">Skills</div>
            <div class="r-skill">
              ${s.skills.map(sk => `<span class="r-skill-tag">${sk}</span>`).join('')}
            </div>
          </div>` : ''}
      </div>
    </div>
  </div>`;
}

/* ── Modern ── */
function buildModern() {
  const s           = state;
  const expFiltered = s.exp.filter(e => e.jobtitle || e.company);
  const eduFiltered = s.edu.filter(e => e.degree);

  return `<div class="tpl-modern">
    <div class="r-sidebar">
      ${s.photo ? `<img src="${s.photo}" class="r-photo">` : ''}
      <div class="r-name">${s.name || 'Your Name'}</div>
      ${s.title ? `<div class="r-jobtitle">${s.title}</div>` : ''}
      <div class="r-s-section">
        <div class="r-s-title">Contact</div>
        ${s.email    ? `<div class="r-contact-item"><i class="fas fa-envelope" style="margin-top:2px"></i>${s.email}</div>`        : ''}
        ${s.phone    ? `<div class="r-contact-item"><i class="fas fa-phone" style="margin-top:2px"></i>${s.phone}</div>`           : ''}
        ${s.location ? `<div class="r-contact-item"><i class="fas fa-location-dot" style="margin-top:2px"></i>${s.location}</div>` : ''}
        ${s.linkedin ? `<div class="r-contact-item"><i class="fab fa-linkedin" style="margin-top:2px"></i>${s.linkedin}</div>`     : ''}
      </div>
      ${s.skills.length ? `
        <div class="r-s-section">
          <div class="r-s-title">Skills</div>
          ${s.skills.map(sk => `
            <div class="r-skill-bar">
              <div class="r-skill-name">${sk}</div>
              <div class="r-skill-track"><div class="r-skill-fill"></div></div>
            </div>`).join('')}
        </div>` : ''}
    </div>
    <div class="r-main">
      ${s.summary ? `
        <div class="r-section">
          <div class="r-section-title">About Me</div>
          <p class="r-summary">${s.summary}</p>
        </div>` : ''}
      ${expFiltered.length ? `
        <div class="r-section">
          <div class="r-section-title">Experience</div>
          ${expFiltered.map(e => `
            <div class="r-job">
              <div class="r-job-title">${e.jobtitle}</div>
              <div class="r-job-meta">${e.company || ''}${e.dates ? ' · ' + e.dates : ''}</div>
              ${e.desc ? `<div class="r-job-desc">${e.desc}</div>` : ''}
            </div>`).join('')}
        </div>` : ''}
      ${eduFiltered.length ? `
        <div class="r-section">
          <div class="r-section-title">Education</div>
          ${eduFiltered.map(e => `
            <div class="r-edu">
              <div class="r-edu-deg">${e.degree}</div>
              <div class="r-edu-school">${e.school}${e.year ? ' · ' + e.year : ''}</div>
            </div>`).join('')}
        </div>` : ''}
    </div>
  </div>`;
}

/* ── Minimal ── */
function buildMinimal() {
  const s           = state;
  const expFiltered = s.exp.filter(e => e.jobtitle || e.company);
  const eduFiltered = s.edu.filter(e => e.degree);

  return `<div class="tpl-minimal">
    <div class="r-header">
      ${s.photo ? `<img src="${s.photo}" class="r-photo">` : ''}
      <div class="r-name">${s.name || 'Your Name'}</div>
      ${s.title ? `<div class="r-jobtitle">${s.title}</div>` : ''}
      <div class="r-contact">
        ${s.email    ? `<span><i class="fas fa-envelope"></i>${s.email}</span>`        : ''}
        ${s.phone    ? `<span><i class="fas fa-phone"></i>${s.phone}</span>`           : ''}
        ${s.location ? `<span><i class="fas fa-location-dot"></i>${s.location}</span>` : ''}
        ${s.linkedin ? `<span><i class="fab fa-linkedin"></i>${s.linkedin}</span>`     : ''}
      </div>
    </div>
    <hr class="r-divider">
    ${s.summary ? `
      <div class="r-section">
        <div class="r-section-title">Profile</div>
        <p class="r-summary">${s.summary}</p>
      </div>
      <hr class="r-divider">` : ''}
    ${expFiltered.length ? `
      <div class="r-section">
        <div class="r-section-title">Experience</div>
        ${expFiltered.map(e => `
          <div class="r-job">
            <div class="r-job-dates">${e.dates || ''}</div>
            <div>
              <div class="r-job-title">${e.jobtitle}</div>
              <div class="r-job-co">${e.company || ''}</div>
              ${e.desc ? `<div class="r-job-desc">${e.desc}</div>` : ''}
            </div>
          </div>`).join('')}
      </div>
      <hr class="r-divider">` : ''}
    ${eduFiltered.length ? `
      <div class="r-section">
        <div class="r-section-title">Education</div>
        ${eduFiltered.map(e => `
          <div class="r-edu">
            <div class="r-edu-year">${e.year || ''}</div>
            <div>
              <div class="r-edu-deg">${e.degree}</div>
              <div class="r-edu-school">${e.school || ''}</div>
            </div>
          </div>`).join('')}
      </div>
      <hr class="r-divider">` : ''}
    ${s.skills.length ? `
      <div class="r-section">
        <div class="r-section-title">Skills</div>
        <div class="r-skill">
          ${s.skills.map(sk => `<span class="r-skill-tag">${sk}</span>`).join('')}
        </div>
      </div>` : ''}
  </div>`;
}

/* ── Creative ── */
function buildCreative() {
  const s           = state;
  const expFiltered = s.exp.filter(e => e.jobtitle || e.company);
  const eduFiltered = s.edu.filter(e => e.degree);

  return `<div class="tpl-creative">
    <div class="r-header">
      ${s.photo ? `<img src="${s.photo}" class="r-photo">` : ''}
      <div class="r-name">${s.name || 'Your Name'}</div>
      ${s.title ? `<div class="r-jobtitle">${s.title}</div>` : ''}
      <div class="r-contact">
        ${s.email    ? `<span><i class="fas fa-envelope"></i>${s.email}</span>`        : ''}
        ${s.phone    ? `<span><i class="fas fa-phone"></i>${s.phone}</span>`           : ''}
        ${s.location ? `<span><i class="fas fa-location-dot"></i>${s.location}</span>` : ''}
        ${s.linkedin ? `<span><i class="fab fa-linkedin"></i>${s.linkedin}</span>`     : ''}
      </div>
    </div>
    <div class="r-body">
      ${s.summary ? `
        <div class="r-section">
          <div class="r-section-title">About Me</div>
          <p class="r-summary">${s.summary}</p>
        </div>` : ''}
      ${expFiltered.length ? `
        <div class="r-section">
          <div class="r-section-title">Work Experience</div>
          ${expFiltered.map(e => `
            <div class="r-job">
              <div class="r-job-title">${e.jobtitle}</div>
              <div class="r-job-meta">${e.company || ''}${e.dates ? ' · ' + e.dates : ''}</div>
              ${e.desc ? `<div class="r-job-desc">${e.desc}</div>` : ''}
            </div>`).join('')}
        </div>` : ''}
      ${eduFiltered.length ? `
        <div class="r-section">
          <div class="r-section-title">Education</div>
          ${eduFiltered.map(e => `
            <div class="r-edu">
              <div class="r-edu-icon"><i class="fas fa-graduation-cap"></i></div>
              <div>
                <div class="r-edu-deg">${e.degree}</div>
                <div class="r-edu-school">${e.school}${e.year ? ' · ' + e.year : ''}</div>
              </div>
            </div>`).join('')}
        </div>` : ''}
      ${s.skills.length ? `
        <div class="r-section">
          <div class="r-section-title">Skills &amp; Tools</div>
          <div class="r-skill">
            ${s.skills.map(sk => `<span class="r-skill-tag">${sk}</span>`).join('')}
          </div>
        </div>` : ''}
    </div>
  </div>`;
}

// ────────────────────────────────────────
// PROGRESS BAR
// ────────────────────────────────────────
function updateProgress() {
  let score = 0;
  const max = 8;
  if (state.name)                          score++;
  if (state.title)                         score++;
  if (state.email || state.phone)          score++;
  if (state.summary)                       score++;
  if (state.exp.some(e => e.jobtitle))     score++;
  if (state.edu.some(e => e.degree))       score++;
  if (state.skills.length)                 score++;
  if (state.photo)                         score++;

  const pct = Math.round((score / max) * 100);
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressPct').textContent  = pct + '%';
}

// ────────────────────────────────────────
// ACTION BUTTONS
// ────────────────────────────────────────
function bindActionButtons() {
  // Download PDF
  document.getElementById('downloadBtn').addEventListener('click', () => {
    const el = document.getElementById('resumeSheet');
    if (!hasContent()) { showToast('Please fill in some details first', 'error'); return; }
    showToast('Preparing your PDF…');
    const opt = {
      margin:     [0, 0, 0, 0],
      filename:   (state.name || 'resume').replace(/\s+/g, '_') + '_resume.pdf',
      image:      { type: 'jpeg', quality: .99 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF:      { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    setTimeout(() => {
      html2pdf().set(opt).from(el).save().then(() => showToast('PDF downloaded! 🎉'));
    }, 200);
  });

  // Reset / Clear
  document.getElementById('clearBtn').addEventListener('click', () => {
    if (!confirm('Reset everything and start fresh?')) return;
    localStorage.removeItem('resumeForgeState');

    state = {
      tpl: 'exec', name: '', title: '', email: '',
      phone: '', location: '', linkedin: '', summary: '', photo: '',
      exp:  [{ id: 1, jobtitle: '', company: '', dates: '', desc: '' }],
      edu:  [{ id: 1, degree: '', school: '', year: '' }],
      skills: []
    };

    ['name','title','email','phone','location','linkedin','summary'].forEach(k => {
      const el = document.getElementById('f-' + k);
      if (el) el.value = '';
    });

    const prev = document.getElementById('photoPreviewImg');
    const pz   = document.getElementById('photoZone');
    prev.style.display                           = 'none';
    pz.querySelector('i').style.display          = 'block';
    pz.querySelector('p').style.display          = 'block';

    document.querySelectorAll('.tpl-card').forEach(c => c.classList.remove('active'));
    document.querySelector('[data-tpl="exec"]').classList.add('active');

    renderExpEntries();
    renderEduEntries();
    renderSkillChips();
    doRender();
    updateProgress();
    showToast('Cleared! Fresh start.');
  });
}

// ────────────────────────────────────────
// PERSIST STATE  (localStorage)
// ────────────────────────────────────────
function saveState() {
  try { localStorage.setItem('resumeForgeState', JSON.stringify(state)); } catch (e) {}
}

function loadState() {
  try {
    const raw = localStorage.getItem('resumeForgeState');
    if (!raw) return;
    const saved = JSON.parse(raw);
    Object.assign(state, saved);

    ['name','title','email','phone','location','linkedin','summary'].forEach(k => {
      const el = document.getElementById('f-' + k);
      if (el) el.value = state[k] || '';
    });

    if (state.photo) {
      const prev = document.getElementById('photoPreviewImg');
      const pz   = document.getElementById('photoZone');
      prev.src                            = state.photo;
      prev.style.display                  = 'block';
      pz.querySelector('i').style.display = 'none';
      pz.querySelector('p').style.display = 'none';
    }

    // Restore active template card
    document.querySelectorAll('.tpl-card').forEach(c => c.classList.remove('active'));
    const tc = document.querySelector(`[data-tpl="${state.tpl}"]`);
    if (tc) tc.classList.add('active');

  } catch (e) {}
}

// ────────────────────────────────────────
// TOAST NOTIFICATION
// ────────────────────────────────────────
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className   = 'toast' + (type === 'error' ? ' error' : '');
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ────────────────────────────────────────
// UTILITY
// ────────────────────────────────────────
function esc(str) {
  return (str || '')
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;');
}
<script>
  atOptions = {
    'key' : 'c8ae7e72d7b7d4f21d4fee9ade8a0488',
    'format' : 'iframe',
    'height' : 600,
    'width' : 160,
    'params' : {}
  };
</script>
<script src="https://www.highperformanceformat.com/c8ae7e72d7b7d4f21d4fee9ade8a0488/invoke.js"></script>
