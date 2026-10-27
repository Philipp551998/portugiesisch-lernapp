/* Bica – App-Logik. Keine Abhängigkeiten, alles lokal im Browser (localStorage). */
'use strict';

/* ---------- Helfer ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const view = $('#view');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const dayKey = (d = new Date()) => d.toLocaleDateString('sv-SE');
const vocabById = id => VOCAB.find(v => v.id === id);
const unitById = id => UNITS.find(u => u.id === id);

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ---------- Speicher ---------- */
const KEY = 'bica.v1';
const DEFAULTS = { name: '', xp: 0, streak: 0, best: 0, lastDay: '', days: {}, goal: 20, done: {}, cards: {}, rate: 0.85 };
let S = load();
function load() {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return { ...DEFAULTS }; }
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* Speicher voll oder gesperrt */ } }

function addXP(n) {
  const today = dayKey();
  if (S.lastDay !== today) {
    const y = new Date(); y.setDate(y.getDate() - 1);
    S.streak = S.lastDay === dayKey(y) ? S.streak + 1 : 1;
    S.best = Math.max(S.best, S.streak);
    S.lastDay = today;
  }
  S.xp += n;
  S.days[today] = (S.days[today] || 0) + n;
  save();
}
function currentStreak() {
  const y = new Date(); y.setDate(y.getDate() - 1);
  return S.lastDay === dayKey() || S.lastDay === dayKey(y) ? S.streak : 0;
}
const todayXP = () => S.days[dayKey()] || 0;

/* ---------- Spaced Repetition (vereinfachtes SM-2) ---------- */
const DAY = 864e5;
function nextState(c, q) {
  c = { ease: 2.5, int: 0, reps: 0, lapses: 0, due: 0, ...c };
  const now = Date.now();
  if (q === 0) { c.lapses++; c.reps = 0; c.int = 0; c.ease = Math.max(1.3, c.ease - 0.2); c.due = now + 10 * 60e3; return c; }
  if (c.int === 0) c.int = q === 3 ? 3 : 1;
  else c.int = Math.round(c.int * (q === 1 ? 1.2 : q === 2 ? c.ease : c.ease * 1.3));
  if (q === 1) c.ease = Math.max(1.3, c.ease - 0.15);
  if (q === 3) c.ease += 0.15;
  c.int = Math.max(1, c.int); c.reps++; c.due = now + c.int * DAY;
  return c;
}
function review(id, q) { S.cards[id] = nextState(S.cards[id], q); save(); }
function previewLabel(id, q) {
  const n = nextState(S.cards[id], q);
  if (q === 0) return '10 Min.';
  return n.int === 1 ? '1 Tag' : n.int + ' Tage';
}
const dueIds = () => Object.keys(S.cards).filter(id => S.cards[id].due <= Date.now() && vocabById(id));
function status(id) {
  const c = S.cards[id];
  if (!c) return { k: 'new', cls: '', label: 'Neu' };
  if (c.int >= 21) return { k: 'mastered', cls: 's3', label: 'Gefestigt' };
  if (c.int >= 4) return { k: 'learning', cls: 's2', label: 'Wird sicher' };
  return { k: 'learning', cls: 's1', label: 'Lernen' };
}

/* ---------- Aussprache (Web Speech API des Geräts, ohne externe Dienste) ---------- */
const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
function ptVoice() {
  if (!synth) return null;
  const vs = synth.getVoices();
  return vs.find(v => /^pt[-_]PT$/i.test(v.lang)) || null; // bewusst KEIN pt-BR
}
function speak(text, rate) {
  if (!synth) { toast('Dieses Gerät unterstützt keine Sprachausgabe.'); return; }
  const clean = String(text).split('/')[0].replace(/…/g, '').replace(/—/g, '').trim();
  synth.cancel();
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = 'pt-PT';
  const v = ptVoice(); if (v) u.voice = v;
  u.rate = rate || S.rate;
  synth.speak(u);
}
if (synth) synth.onvoiceschanged = () => { };

/* ---------- Router ---------- */
const routes = {
  home: renderHome, course: renderCourse, vocab: renderVocab, profile: renderProfile,
  lesson: id => startLesson(id), practice: () => startPractice(), dialog: id => renderDialog(id),
};
function route() {
  const [name, arg] = (location.hash.replace(/^#\/?/, '') || 'home').split('/');
  const fn = routes[name] || renderHome;
  document.body.classList.toggle('focus-mode', name === 'lesson' || name === 'practice');
  $$('#tabbar a').forEach(a => a.classList.toggle('active', a.dataset.tab === (name === 'dialog' ? 'course' : name)));
  fn(arg);
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);
const go = h => { location.hash = h; };

/* ---------- Startseite / Dashboard ---------- */
function nextUnit() {
  return UNITS.find(u => !u.soon && !S.done[u.id] && (!u.needs || S.done[u.needs]));
}
function renderHome() {
  const goal = S.goal, tx = todayXP(), pct = Math.min(100, Math.round(tx / goal * 100));
  const nu = nextUnit(), due = dueIds().length;
  const learned = Object.keys(S.cards).length;
  const doneUnits = Object.keys(S.done).length;
  const bars = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const x = S.days[dayKey(d)] || 0;
    bars.push(`<div class="bar ${i === 0 ? 'today' : ''} ${x >= goal ? 'hit' : ''}"><i style="height:${Math.max(4, Math.min(100, x / goal * 100))}%"></i><span>${d.toLocaleDateString('de-DE', { weekday: 'short' }).slice(0, 2)}</span></div>`);
  }
  const hello = S.name ? `Olá, ${esc(S.name)}!` : 'Olá!';
  view.innerHTML = `
    <div class="topbar">
      <div class="brand"><img src="icons/icon.svg" alt="">Bica</div>
      <div class="chips"><span class="chip fire">🔥 ${currentStreak()}</span><span class="chip xp">⚡ ${S.xp} XP</span></div>
    </div>
    <section class="hero">
      <div class="eyebrow">Português de Portugal</div>
      <h1>${hello}</h1>
      <div class="goal">
        <div class="ring" style="--p:${pct}"><span>${pct}%</span></div>
        <div><b>Tagesziel: ${tx} / ${goal} XP</b><p style="margin:2px 0 0">${pct >= 100 ? 'Geschafft – stark! 🎉' : 'Noch ' + (goal - tx) + ' XP bis zur Serie.'}</p></div>
      </div>
      <div style="margin-top:16px">
        ${nu ? `<a class="btn white block" href="#/lesson/${nu.id}">${S.done['a1-u1'] || Object.keys(S.done).length ? 'Weiter lernen' : 'Lektion 1 starten'} →</a>`
             : `<a class="btn white block" href="#/course">Alle Kurse ansehen</a>`}
      </div>
    </section>

    <h2>Heute</h2>
    <div class="stack">
      <a class="card action-card" href="#/practice">
        <div class="emoji" style="background:var(--terra-soft)">🃏</div>
        <div class="grow"><h3>Vokabeln wiederholen</h3><div class="muted small">${due ? due + ' Karten fällig' : learned ? 'Alles erledigt – später wieder da' : 'Starte erst eine Lektion'}</div></div>
        <span class="chev">›</span>
      </a>
      <a class="card action-card" href="#/dialog/alltag">
        <div class="emoji" style="background:var(--blue-soft)">💬</div>
        <div class="grow"><h3>Dialog hören</h3><div class="muted small">Alltag: Erstes Treffen</div></div>
        <span class="chev">›</span>
      </a>
    </div>

    <h2>Diese Woche</h2>
    <div class="card"><div class="bars">${bars.join('')}</div></div>

    <h2>Fortschritt</h2>
    <div class="grid2">
      <div class="card stat"><div class="v">${learned}</div><div class="l">Wörter gestartet</div></div>
      <div class="card stat"><div class="v">${doneUnits}</div><div class="l">Lektionen fertig</div></div>
      <div class="card stat"><div class="v">${S.best}</div><div class="l">Längste Serie (Tage)</div></div>
      <div class="card stat"><div class="v">A1</div><div class="l">Aktuelles Niveau</div></div>
    </div>`;
}

/* ---------- Kurse ---------- */
function renderCourse() {
  const html = LEVELS.map(lv => {
    const units = UNITS.filter(u => u.level === lv.id);
    const done = units.filter(u => S.done[u.id]).length;
    const body = lv.open ? units.map(u => {
      const locked = u.soon || (u.needs && !S.done[u.needs]);
      const d = !!S.done[u.id];
      const tag = d ? '<span class="pill green">Fertig ✓</span>' : u.soon ? '<span class="pill">Bald</span>' : locked ? '<span class="pill">🔒</span>' : '<span class="pill blue">Start</span>';
      return `<a class="unit ${d ? 'done' : ''} ${locked ? 'locked' : ''}" ${locked ? '' : `href="#/lesson/${u.id}"`}>
        <div class="node">${d ? '✓' : u.icon}</div>
        <div style="flex:1;min-width:0"><h3>${esc(u.title)}</h3><div class="muted small">${esc(u.desc)}</div></div>${tag}</a>`;
    }).join('') : `<div class="card muted">Dieses Niveau wird freigeschaltet, sobald A1 fertig ist. Die Struktur steht – Inhalte folgen.</div>`;
    return `<section class="level ${lv.open ? '' : 'locked'}">
      <div class="level-head"><div class="level-badge">${lv.id}</div>
        <div style="flex:1"><h3>${lv.title}</h3>${lv.open ? `<div class="progress"><i style="width:${units.length ? done / units.length * 100 : 0}%"></i></div>` : '<div class="muted small">Demnächst</div>'}</div></div>
      ${body}</section>`;
  }).join('');
  const scenes = SCENES.map(s => `<a class="card action-card ${s.soon ? 'locked' : ''}" ${s.soon ? 'style="opacity:.55"' : 'href="#/dialog/' + s.id + '"'}>
      <div class="emoji" style="background:var(--surface-2)">${s.icon}</div>
      <div class="grow"><h3>${s.title}</h3></div>${s.soon ? '<span class="pill">Bald</span>' : '<span class="chev">›</span>'}</a>`).join('');
  view.innerHTML = `<h1>Kurse</h1><p class="muted" style="margin:0 0 4px">Von A1 bis B2 – Schritt für Schritt.</p>${html}
    <h2>Dialogübungen</h2><div class="stack">${scenes}</div>`;
}

/* ---------- Vokabeln ---------- */
let vfilter = 'all';
function renderVocab() {
  const due = dueIds().length;
  const counts = { new: 0, learning: 0, mastered: 0 };
  VOCAB.forEach(v => counts[status(v.id).k]++);
  const list = VOCAB.filter(v => vfilter === 'all' || status(v.id).k === vfilter);
  view.innerHTML = `
    <h1>Vokabeln</h1>
    <div class="card" style="margin:10px 0 14px">
      <div class="grid2" style="margin-bottom:14px">
        <div class="stat"><div class="v">${due}</div><div class="l">fällig</div></div>
        <div class="stat"><div class="v">${Object.keys(S.cards).length}</div><div class="l">in Wiederholung</div></div>
      </div>
      <a class="btn terra block" href="#/practice">Jetzt üben</a>
    </div>
    <div class="seg" role="tablist">
      ${[['all', 'Alle'], ['new', 'Neu ' + counts.new], ['learning', 'Lernen ' + counts.learning], ['mastered', 'Fest ' + counts.mastered]]
        .map(([k, l]) => `<button data-f="${k}" class="${vfilter === k ? 'on' : ''}">${l}</button>`).join('')}
    </div>
    <div class="card" style="margin-top:14px;padding:6px 16px">
      <ul class="vlist">${list.map(v => `<li><span class="dot ${status(v.id).cls}"></span>
        <div class="grow"><div class="pt">${esc(v.pt)}</div><div class="muted small">${esc(v.de)}</div></div>
        <button class="iconbtn" data-say="${esc(v.pt)}" aria-label="Anhören">🔊</button></li>`).join('') || '<li class="muted">Keine Wörter in dieser Ansicht.</li>'}</ul>
    </div>`;
  $$('.seg button').forEach(b => b.onclick = () => { vfilter = b.dataset.f; renderVocab(); });
  $$('[data-say]').forEach(b => b.onclick = () => speak(b.dataset.say));
}

/* Karteikarten-Training */
let P = null;
function startPractice() {
  let ids = dueIds();
  if (!ids.length) {
    ids = Object.keys(S.cards).filter(id => vocabById(id)).sort((a, b) => S.cards[a].due - S.cards[b].due).slice(0, 10);
    if (!ids.length) {
      view.innerHTML = `<div class="celebrate"><div class="medal">🌱</div><h1>Noch keine Karten</h1>
        <p class="muted">Neue Wörter landen automatisch hier, sobald du sie in einer Lektion kennengelernt hast.</p>
        <a class="btn block" href="#/lesson/a1-u1">Zur ersten Lektion</a></div>`;
      return;
    }
    toast('Nichts fällig – freies Üben der nächsten Karten.');
  }
  P = { queue: shuffle(ids).slice(0, 15), total: Math.min(ids.length, 15), done: 0, flipped: false, again: 0 };
  practiceStep();
}
function practiceStep() {
  if (!P.queue.length) return practiceDone();
  const id = P.queue[0], v = vocabById(id);
  view.innerHTML = `
    <div class="lesson-top"><button class="iconbtn plain" id="quit" aria-label="Beenden">✕</button>
      <div class="progress"><i style="width:${P.done / P.total * 100}%"></i></div><span class="muted small">${P.done}/${P.total}</span></div>
    <div class="flash ${P.flipped ? 'flipped' : ''}" id="flash">
      <div class="flash-inner">
        <div class="face"><span class="pill blue cat">${esc(v.cat)}</span><div class="big">${esc(v.pt)}</div>
          <button class="iconbtn big" id="say" style="margin-top:22px" aria-label="Anhören">🔊</button><div class="hint">Tippen zum Umdrehen</div></div>
        <div class="face back"><div class="big">${esc(v.de)}</div>
          <div style="margin-top:22px"><div class="pt">${esc(v.ex)}</div><div class="muted">${esc(v.exde)}</div></div></div>
      </div>
    </div>
    <div id="rate">${P.flipped
      ? `<div class="rate">${[['Nochmal', 0], ['Schwer', 1], ['Gut', 2], ['Leicht', 3]].map(([l, q]) => `<button class="r${q}" data-q="${q}">${l}<small>${previewLabel(id, q)}</small></button>`).join('')}</div>`
      : `<button class="btn block" id="flip">Antwort zeigen</button>`}</div>`;
  $('#quit').onclick = () => go('#/vocab');
  const flip = () => { P.flipped = true; practiceStep(); speak(v.pt); };
  $('#flash').onclick = e => { if (e.target.closest('#say')) return; if (!P.flipped) flip(); };
  $('#say').onclick = e => { e.stopPropagation(); speak(v.pt); };
  const fb = $('#flip'); if (fb) fb.onclick = flip;
  $$('.rate button').forEach(b => b.onclick = () => {
    const q = +b.dataset.q; review(id, q); P.queue.shift();
    if (q === 0) { P.queue.push(id); P.again++; } else { P.done++; addXP(q >= 2 ? 2 : 1); }
    P.flipped = false; practiceStep();
  });
  if (!P.flipped) speak(v.pt);
}
function practiceDone() {
  view.innerHTML = `<div class="celebrate"><div class="medal">🎯</div><h1>Wiederholung fertig!</h1>
    <p class="muted">${P.total} Karten geübt${P.again ? ', ' + P.again + 'x „Nochmal“' : ''}. Bis morgen!</p>
    <a class="btn block" href="#/home">Zum Dashboard</a></div>`;
}

/* ---------- Dialoge ---------- */
function renderDialog(id) {
  const lines = UNITS.flatMap(u => u.exercises.filter(e => e.t === 'dialog'));
  const d = lines[0];
  if (id !== 'alltag' || !d) { go('#/course'); return; }
  view.innerHTML = `<div class="lesson-top"><a class="iconbtn plain" href="#/course" aria-label="Zurück">←</a><h1 style="margin:0;font-size:22px">${esc(d.title)}</h1></div>
    <div class="dialog">${d.lines.map((l, i) => `<div class="bubble ${l.who === 'Du' ? 'me' : 'them'}">
      <div class="who">${esc(l.who)}</div><div><b>${esc(l.pt)}</b><button data-i="${i}" aria-label="Anhören">🔊</button></div><div class="de">${esc(l.de)}</div></div>`).join('')}</div>
    <button class="btn block" id="all" style="margin-top:22px">▶ Ganzen Dialog anhören</button>`;
  $$('.bubble button').forEach(b => b.onclick = () => speak(d.lines[+b.dataset.i].pt));
  $('#all').onclick = () => playSeq(d.lines.map(l => l.pt));
}
function playSeq(arr) {
  if (!synth) return toast('Keine Sprachausgabe verfügbar.');
  synth.cancel();
  arr.forEach(t => {
    const u = new SpeechSynthesisUtterance(t); u.lang = 'pt-PT'; const v = ptVoice(); if (v) u.voice = v; u.rate = S.rate;
    synth.speak(u);
  });
}

/* ---------- Lektionen ---------- */
let L = null, cur = null;
function startLesson(id) {
  const u = unitById(id);
  if (!u || u.soon || !u.exercises.length) { go('#/course'); return; }
  L = { u, queue: u.exercises.map(e => ({ ...e })), done: 0, total: u.exercises.length, gained: 0, wrong: 0, graded: 0 };
  lessonStep();
}
function lessonStep() {
  if (!L.queue.length) return lessonDone();
  const ex = L.queue[0];
  cur = { ready: false, check: null, plain: false };
  view.innerHTML = `
    <div class="lesson-top"><button class="iconbtn plain" id="quit" aria-label="Lektion beenden">✕</button>
      <div class="progress"><i style="width:${L.done / L.total * 100}%"></i></div></div>
    <div id="stage"></div><div class="spacer-footer"></div>
    <div class="footer-bar" id="fb"><div class="inner" id="fbi"></div></div>`;
  $('#quit').onclick = () => go('#/course');
  RENDER[ex.t](ex, $('#stage'));
  footer();
}
function footer() {
  const fbi = $('#fbi'); if (!fbi) return;
  const label = cur.plain ? 'Weiter' : 'Prüfen';
  fbi.innerHTML = `<button class="btn block" id="go" ${cur.ready || cur.plain ? '' : 'disabled'}>${label}</button>`;
  $('#go').onclick = () => {
    if (cur.plain) return advance(true, false);
    const r = cur.check();
    showResult(r.ok, r.msg);
  };
}
function setReady(b) { cur.ready = b; const g = $('#go'); if (g) g.disabled = !b; }
function showResult(ok, msg) {
  const fb = $('#fb'); fb.className = 'footer-bar ' + (ok ? 'ok' : 'bad');
  $('#fbi').innerHTML = `<div class="fb-title">${ok ? ['Richtig! 🎉', 'Muito bem! 👏', 'Perfeito! ✨'][Math.random() * 3 | 0] : 'Nicht ganz.'}</div>
    <div class="fb-text">${msg || ''}</div><button class="btn block ${ok ? 'green' : 'red'}" id="go">Weiter</button>`;
  if (!ok) $('#stage').classList.add('shake');
  $$('#stage button, #stage input').forEach(b => b.disabled = true);
  $('#go').onclick = () => advance(ok, true);
  $('#go').focus();
}
function advance(ok, graded) {
  const ex = L.queue[0];
  if (ex.t === 'teach' && !S.cards[ex.v]) { S.cards[ex.v] = { ease: 2.5, int: 0, reps: 0, lapses: 0, due: Date.now() + 10 * 60e3 }; save(); }
  if (ok) {
    L.queue.shift(); L.done++;
    if (graded) { addXP(2); L.gained += 2; if (!ex.retry) L.graded++; }
  } else {
    L.wrong++; L.queue.push({ ...L.queue.shift(), retry: true });
  }
  lessonStep();
}
function lessonDone() {
  const u = L.u, first = !S.done[u.id];
  S.done[u.id] = true; save();
  const bonus = first ? u.xp : Math.round(u.xp / 4);
  addXP(bonus);
  const total = L.gained + bonus;
  const acc = Math.max(0, Math.round((L.graded) / Math.max(1, L.graded + L.wrong) * 100));
  const next = nextUnit();
  view.innerHTML = `<div class="celebrate"><div class="medal">🏆</div><h1>Lektion geschafft!</h1>
    <p class="muted">${esc(u.title)}</p>
    <div class="grid2" style="margin:22px 0;text-align:left">
      <div class="card stat"><div class="v">+${total}</div><div class="l">XP verdient</div></div>
      <div class="card stat"><div class="v">${acc}%</div><div class="l">Treffsicherheit</div></div>
      <div class="card stat"><div class="v">🔥 ${currentStreak()}</div><div class="l">Tage in Folge</div></div>
      <div class="card stat"><div class="v">${u.vocab.length}</div><div class="l">neue Wörter</div></div>
    </div>
    <div class="stack">
      <a class="btn terra block" href="#/practice">Karten gleich üben</a>
      ${next ? `<a class="btn block" href="#/lesson/${next.id}">Nächste Lektion</a>` : ''}
      <a class="btn ghost block" href="#/home">Zum Dashboard</a>
    </div></div>`;
}

/* Text-Normalisierung für Tippaufgaben */
const stripPunct = s => s.toLowerCase().replace(/[.,!?;:¡¿"„“”]/g, '').replace(/\s+/g, ' ').trim();
const stripAccents = s => stripPunct(s).normalize('NFD').replace(/[̀-ͯ]/g, '');

/* Auswahl-Helfer für choose / listen / gap */
function optionsUI(ex, stage, idxKey) {
  const opts = shuffle(ex.options.map((t, i) => ({ t, ok: i === ex.a })));
  let pick = -1;
  const box = document.createElement('div'); box.className = 'options';
  box.innerHTML = opts.map((o, i) => `<button class="opt" data-i="${i}">${esc(o.t)}</button>`).join('');
  stage.appendChild(box);
  $$('.opt', box).forEach(b => b.onclick = () => {
    pick = +b.dataset.i; $$('.opt', box).forEach(x => x.classList.toggle('sel', x === b));
    if (idxKey) idxKey(opts[pick].t); setReady(true);
  });
  cur.check = () => {
    $$('.opt', box).forEach((b, i) => { if (opts[i].ok) b.classList.add('right'); else if (i === pick) b.classList.add('wrong'); b.classList.remove('sel'); });
    const right = opts.find(o => o.ok).t;
    return { ok: opts[pick].ok, msg: opts[pick].ok ? '' : `Richtig wäre: <b>${esc(right)}</b>` };
  };
}

/* Übungstypen */
const RENDER = {
  teach(ex, stage) {
    const v = vocabById(ex.v); cur.plain = true;
    stage.innerHTML = `<div class="kicker">Neues Wort</div>
      <div class="card teach"><button class="iconbtn big" id="say" aria-label="Anhören">🔊</button>
        <div class="word">${esc(v.pt)}</div><div class="de">${esc(v.de)}</div>
        <div class="ex"><div class="pt">${esc(v.ex)}</div><div class="muted">${esc(v.exde)}</div></div></div>`;
    $('#say').onclick = () => speak(v.pt);
    setTimeout(() => speak(v.pt), 250);
  },
  choose(ex, stage) {
    stage.innerHTML = `<div class="kicker">Auswählen</div><div class="prompt">${esc(ex.q)}</div>`;
    optionsUI(ex, stage);
  },
  listen(ex, stage) {
    stage.innerHTML = `<div class="kicker">Hörverstehen</div><div class="prompt">Was hörst du?</div>
      <div class="listen-box"><button class="iconbtn big" id="say" aria-label="Abspielen">🔊</button>
      <button class="iconbtn big" id="slow" aria-label="Langsam abspielen">🐢</button></div>`;
    $('#say').onclick = () => speak(ex.say);
    $('#slow').onclick = () => speak(ex.say, 0.55);
    optionsUI(ex, stage);
    setTimeout(() => speak(ex.say), 300);
  },
  gap(ex, stage) {
    stage.innerHTML = `<div class="kicker">Lücke füllen</div><div class="prompt">Welches Wort passt?</div>
      <div class="card sentence">${esc(ex.before)}<span class="gap" id="gap">&nbsp;&nbsp;&nbsp;</span>${esc(ex.after)}</div>
      ${ex.hint ? `<p class="muted small" style="margin:8px 4px 16px">Tipp: ${esc(ex.hint)}</p>` : '<div style="height:16px"></div>'}`;
    optionsUI(ex, stage, t => { $('#gap').textContent = t; });
  },
  build(ex, stage) {
    stage.innerHTML = `<div class="kicker">Satz bauen</div><div class="prompt">${esc(ex.de)}</div>
      <div class="answer-line" id="line"></div><div class="bank" id="bank"></div>`;
    const words = shuffle(ex.words), chosen = [];
    const line = $('#line'), bank = $('#bank');
    const draw = () => {
      line.innerHTML = chosen.map((w, i) => `<button class="tile" data-c="${i}">${esc(words[w])}</button>`).join('');
      bank.innerHTML = words.map((w, i) => `<button class="tile ${chosen.includes(i) ? 'used' : ''}" data-b="${i}">${esc(w)}</button>`).join('');
      $$('[data-c]', line).forEach(b => b.onclick = () => { chosen.splice(+b.dataset.c, 1); draw(); });
      $$('[data-b]', bank).forEach(b => b.onclick = () => { chosen.push(+b.dataset.b); speak(words[+b.dataset.b]); draw(); });
      setReady(chosen.length > 0);
    };
    draw();
    cur.check = () => {
      const ans = chosen.map(i => words[i]);
      const ok = ans.join(' ') === ex.answer.join(' ');
      return { ok, msg: ok ? `<span class="muted">${esc(ex.answer.join(' '))}</span>` : `Richtig wäre: <b>${esc(ex.answer.join(' '))}</b>` };
    };
  },
  type(ex, stage) {
    stage.innerHTML = `<div class="kicker">Übersetzen</div><div class="prompt">${esc(ex.q)}</div>
      <input class="text-input" id="inp" type="text" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" placeholder="Auf Portugiesisch …">
      <div class="accent-keys">${['á', 'à', 'â', 'ã', 'ç', 'é', 'ê', 'í', 'ó', 'ô', 'õ', 'ú'].map(c => `<button type="button">${c}</button>`).join('')}</div>`;
    const inp = $('#inp');
    inp.oninput = () => setReady(inp.value.trim().length > 0);
    inp.onkeydown = e => { if (e.key === 'Enter' && cur.ready) $('#go').click(); };
    $$('.accent-keys button').forEach(b => b.onclick = () => { inp.value += b.textContent; inp.focus(); inp.oninput(); });
    cur.check = () => {
      const val = inp.value, strict = ex.accept.map(stripPunct), loose = ex.accept.map(stripAccents);
      const best = ex.accept[0];
      if (strict.includes(stripPunct(val))) return { ok: true, msg: '' };
      if (loose.includes(stripAccents(val))) return { ok: true, msg: `Fast perfekt – achte auf die Akzente: <b>${esc(best)}</b>` };
      return { ok: false, msg: `Richtig wäre: <b>${esc(best)}</b>` };
    };
    setTimeout(() => inp.focus(), 100);
  },
  match(ex, stage) {
    stage.innerHTML = `<div class="kicker">Zuordnen</div><div class="prompt">Finde die Paare</div><div class="match" id="m"></div>`;
    const left = shuffle(ex.pairs.map((p, i) => ({ t: p[0], i }))), right = shuffle(ex.pairs.map((p, i) => ({ t: p[1], i })));
    const m = $('#m'); let a = null, left_ = ex.pairs.length, mistakes = 0;
    m.innerHTML = left.map((x, k) => `<button class="opt" data-s="l" data-i="${x.i}">${esc(x.t)}</button><button class="opt" data-s="r" data-i="${right[k].i}">${esc(right[k].t)}</button>`).join('');
    $$('.opt', m).forEach(b => b.onclick = () => {
      if (b.classList.contains('gone')) return;
      if (b.dataset.s === 'l') speak(b.textContent);
      if (a && a.dataset.s === b.dataset.s) { a.classList.remove('sel'); a = b; b.classList.add('sel'); return; }
      if (!a) { a = b; b.classList.add('sel'); return; }
      if (a.dataset.i === b.dataset.i) {
        a.classList.replace('sel', 'right'); b.classList.add('right');
        const x = a, y = b; a = null;
        setTimeout(() => { x.classList.add('gone'); y.classList.add('gone'); }, 350);
        if (--left_ === 0) setTimeout(() => { showResult(mistakes === 0, mistakes ? `${mistakes} Fehlversuch${mistakes > 1 ? 'e' : ''} – übe diese Paare nochmal.` : ''); if (mistakes) cur.softPass = true; }, 500);
      } else {
        mistakes++; a.classList.replace('sel', 'wrong'); b.classList.add('wrong');
        const x = a, y = b; a = null;
        setTimeout(() => { x.classList.remove('wrong'); y.classList.remove('wrong'); }, 450);
      }
    });
  },
  tip(ex, stage) {
    cur.plain = true;
    stage.innerHTML = `<div class="kicker">Grammatik</div><div class="card tip"><h3>${esc(ex.title)}</h3>${ex.html}</div>`;
  },
  dialog(ex, stage) {
    cur.plain = true;
    stage.innerHTML = `<div class="kicker">Mini-Dialog</div><h2 style="margin-top:6px">${esc(ex.title)}</h2>
      <div class="dialog">${ex.lines.map((l, i) => `<div class="bubble ${l.who === 'Du' ? 'me' : 'them'}"><div class="who">${esc(l.who)}</div>
        <div><b>${esc(l.pt)}</b><button data-i="${i}" aria-label="Anhören">🔊</button></div><div class="de">${esc(l.de)}</div></div>`).join('')}</div>
      <button class="btn ghost block" id="all" style="margin-top:16px">▶ Alles anhören</button>`;
    $$('.bubble button', stage).forEach(b => b.onclick = () => speak(ex.lines[+b.dataset.i].pt));
    $('#all').onclick = () => playSeq(ex.lines.map(l => l.pt));
  },
};

/* ---------- Profil ---------- */
let confirmReset = false;
function renderProfile() {
  const hasVoice = !!ptVoice();
  view.innerHTML = `<h1>Profil</h1>
    <div class="grid2" style="margin:12px 0">
      <div class="card stat"><div class="v">⚡ ${S.xp}</div><div class="l">XP gesamt</div></div>
      <div class="card stat"><div class="v">🔥 ${currentStreak()}</div><div class="l">Serie (Best: ${S.best})</div></div>
    </div>
    <div class="card">
      <div class="row"><b>Dein Name</b><input type="text" id="name" value="${esc(S.name)}" placeholder="Optional" maxlength="20"></div>
      <div class="row"><b>Tagesziel</b><select id="goal">${[10, 20, 30, 50].map(g => `<option value="${g}" ${S.goal === g ? 'selected' : ''}>${g} XP</option>`).join('')}</select></div>
      <div class="row"><b>Sprechtempo</b><input type="range" id="rate" min="0.5" max="1.1" step="0.05" value="${S.rate}"></div>
      <div class="row"><b>Test</b><button class="iconbtn" id="test" aria-label="Test">🔊</button></div>
    </div>
    <h2>Portugiesische Stimme</h2>
    <div class="card ${hasVoice ? '' : 'tip'}">${hasVoice
      ? '✅ Eine Stimme für <b>europäisches Portugiesisch (pt-PT)</b> wurde gefunden.'
      : `⚠️ Keine pt-PT-Stimme erkannt. Auf dem iPhone: <b>Einstellungen → Bedienungshilfen → Gesprochene Inhalte → Stimmen → Portugiesisch → Portugal → „Joana“</b> laden. Danach die App neu öffnen. Die App nutzt bewusst keine brasilianischen Stimmen.`}</div>
    <h2>Daten</h2>
    <div class="card"><p class="muted small" style="margin-top:0">Dein Fortschritt liegt nur auf diesem Gerät (im Browser-Speicher). Es gibt kein Konto und keinen Server.</p>
      <button class="btn ghost block" id="reset">${confirmReset ? 'Wirklich alles löschen? Nochmal tippen' : 'Fortschritt zurücksetzen'}</button></div>
    <p class="muted small" style="text-align:center;margin-top:20px">Bica v0.1 · Português de Portugal</p>`;
  $('#name').oninput = e => { S.name = e.target.value.trim(); save(); };
  $('#goal').onchange = e => { S.goal = +e.target.value; save(); };
  $('#rate').oninput = e => { S.rate = +e.target.value; save(); };
  $('#test').onclick = () => speak('Olá, bom dia! Como estás?');
  $('#reset').onclick = () => {
    if (!confirmReset) { confirmReset = true; renderProfile(); setTimeout(() => { confirmReset = false; }, 4000); return; }
    confirmReset = false; S = { ...DEFAULTS, days: {}, done: {}, cards: {} }; save(); toast('Fortschritt zurückgesetzt.'); renderProfile();
  };
}

/* ---------- Start ---------- */
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { }));
}
route();
