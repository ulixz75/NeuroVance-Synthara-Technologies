/* NeuroVance Synthara — Living Legacy UX overhaul (vanilla) */
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover: none)').matches;

/* ---------- Scroll progress + header shrink (rAF throttle) ---------- */
const header = document.getElementById('siteHeader');
const progress = document.querySelector('.scroll-progress');
let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const y = window.scrollY;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    if (header) header.classList.toggle('scrolled', y > 24);
    ticking = false;
  });
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- Mobile menu (hamburger morph) ---------- */
const burger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
if (burger && mobileMenu) {
  burger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }));
}

/* ---------- Smooth anchor with header offset ---------- */
document.querySelectorAll('a[href^="#"], [data-scroll-to]').forEach(el => {
  el.addEventListener('click', e => {
    const sel = el.getAttribute('data-scroll-to') || el.getAttribute('href');
    if (!sel || sel === '#') return;
    const target = document.querySelector(sel);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
  });
});
document.getElementById('toTop')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' }));

/* ---------- Scroll reveal with stagger ---------- */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach((el, i) => {
  const group = el.parentElement?.querySelectorAll('.reveal');
  if (group && group.length > 1) {
    const idx = Array.from(group).indexOf(el);
    el.style.setProperty('--d', Math.min(idx * 0.08, 0.4) + 's');
  } else if (i % 4 === 0) { el.style.setProperty('--d', '0s'); }
  revealObserver.observe(el);
});

/* ---------- Neural particle canvas (single, GPU-cheap) ---------- */
(function neural() {
  const canvas = document.getElementById('neural-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, nodes = [], raf;
  const COLORS = ['34,211,238', '139,92,246', '244,114,182'];

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth || window.innerWidth;
    h = canvas.clientHeight || window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = prefersReduced ? 0 : Math.min(90, Math.floor((w * h) / 18000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.6, c: COLORS[Math.floor(Math.random() * 3)]
    }));
  }
  function step() {
    ctx.clearRect(0, 0, w, h);
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${n.c},.8)`;
      ctx.fill();
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        const d = Math.hypot(dx, dy);
        if (d < 130) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(139,162,255,${(1 - d / 130) * 0.35})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    raf = requestAnimationFrame(step);
  }
  resize();
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else if (!prefersReduced && nodes.length) raf = requestAnimationFrame(step);
  });
  if (!prefersReduced && nodes.length) raf = requestAnimationFrame(step);
})();

/* ---------- Hover 3D tilt + spotlight + magnetic ---------- */
if (!isTouch && !prefersReduced) {
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--ry', (px * 10) + 'deg');
      card.style.setProperty('--rx', (-py * 10) + 'deg');
    });
    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
  document.querySelectorAll('.spot, .tech-card, .vpoint').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.08;
      const y = (e.clientY - r.top - r.height / 2) * 0.12;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

/* ---------- Founder note modal + sequential typewriter ---------- */
const NOTE_SPEED = 14; // ms per char — readable, unhurried
let noteTimers = [], noteOpener = null;
function noteParagraphs() {
  const lang = document.documentElement.lang === 'es' ? 'es' : 'en';
  const d = translations[lang] || translations.en;
  return [d.storyQ1, d.storyQ2, d.storyQ3];
}
function clearNoteTimers() { noteTimers.forEach(clearTimeout); noteTimers = []; }
function playNote() {
  const modal = document.getElementById('noteModal');
  if (!modal) return;
  clearNoteTimers();
  const texts = noteParagraphs();
  const els = [document.getElementById('noteP1'), document.getElementById('noteP2'), document.getElementById('noteP3')];
  const cite = document.getElementById('noteCite');
  const bars = [...modal.querySelectorAll('.note-progress span')];
  els.forEach(el => { if (el) { el.textContent = ''; el.classList.remove('typing'); } });
  bars.forEach(b => b.classList.remove('done'));
  if (cite) cite.textContent = '';
  if (prefersReduced) {
    els.forEach((el, i) => { if (el) el.textContent = texts[i]; });
    bars.forEach(b => b.classList.add('done'));
    const lang = document.documentElement.lang === 'es' ? 'es' : 'en';
    if (cite) cite.textContent = translations[lang].testimonialCite;
    return;
  }
  let delay = 500;
  texts.forEach((text, i) => {
    const el = els[i];
    if (!el) return;
    noteTimers.push(setTimeout(() => {
      el.classList.add('typing');
      let c = 0;
      (function tick() {
        if (!modal.classList.contains('open')) return;
        el.textContent = text.slice(0, ++c);
        if (c < text.length) noteTimers.push(setTimeout(tick, NOTE_SPEED));
        else {
          el.classList.remove('typing');
          bars[i]?.classList.add('done');
          if (i === texts.length - 1) {
            const lang = document.documentElement.lang === 'es' ? 'es' : 'en';
            if (cite) cite.textContent = translations[lang].testimonialCite;
          }
        }
      })();
    }, delay));
    delay += text.length * NOTE_SPEED + 450;
  });
}
function skipNote() {
  clearNoteTimers();
  const modal = document.getElementById('noteModal');
  const texts = noteParagraphs();
  [document.getElementById('noteP1'), document.getElementById('noteP2'), document.getElementById('noteP3')]
    .forEach((el, i) => { if (el) { el.textContent = texts[i]; el.classList.remove('typing'); } });
  modal?.querySelectorAll('.note-progress span').forEach(b => b.classList.add('done'));
  const lang = document.documentElement.lang === 'es' ? 'es' : 'en';
  const cite = document.getElementById('noteCite');
  if (cite) cite.textContent = translations[lang].testimonialCite;
}
function openNote(opener) {
  const modal = document.getElementById('noteModal');
  if (!modal) return;
  noteOpener = opener || document.activeElement;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  document.getElementById('mobileMenu')?.classList.remove('open');
  document.getElementById('hamburger')?.classList.remove('open');
  playNote();
  modal.querySelector('.note-close')?.focus();
}
function closeNote() {
  const modal = document.getElementById('noteModal');
  if (!modal) return;
  clearNoteTimers();
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (noteOpener && noteOpener.focus) noteOpener.focus();
}
document.querySelectorAll('[data-open-note]').forEach(b => b.addEventListener('click', () => openNote(b)));
document.querySelectorAll('[data-close-note]').forEach(b => b.addEventListener('click', closeNote));
document.getElementById('noteReplay')?.addEventListener('click', playNote);
document.getElementById('noteSkip')?.addEventListener('click', skipNote);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (document.getElementById('noteModal')?.classList.contains('open')) closeNote();
  }
});

/* ---------- Concept Lab: viewer + HUD + captions + filmstrip + lightbox ---------- */
var labGo = null, labRender = null;
(function gallery() {
  const slider = document.getElementById('gallerySlider');
  if (!slider) return;
  const slides = [...slider.children];
  const dotsWrap = document.getElementById('galleryDots');
  const counter = document.getElementById('galleryCounter');
  const prev = document.querySelector('.prev-btn');
  const next = document.querySelector('.next-btn');
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbCap = document.getElementById('lbCap');
  const hudCode = document.getElementById('hudCode');
  const hudTag = document.getElementById('hudTag');
  const labSeq = document.getElementById('labSeq');
  const labTitle = document.getElementById('labTitle');
  const labDesc = document.getElementById('labDesc');
  const labProgress = document.getElementById('labProgress');
  const strip = document.getElementById('filmstrip');
  const lang = () => document.documentElement.lang === 'es' ? 'es' : 'en';
  let idx = 0, timer;

  slides.forEach((s, i) => {
    const d = document.createElement('button');
    d.setAttribute('role', 'tab');
    d.setAttribute('aria-label', 'Go to render ' + (i + 1));
    d.addEventListener('click', () => go(i, true));
    dotsWrap?.appendChild(d);
    if (strip) {
      const img = s.querySelector('img');
      const t = document.createElement('button');
      t.setAttribute('role', 'tab');
      t.setAttribute('aria-label', 'Thumbnail ' + (i + 1) + ': ' + (img?.alt || ''));
      if (img) { const th = document.createElement('img'); th.src = img.src; th.alt = ''; th.loading = 'lazy'; t.appendChild(th); }
      t.addEventListener('click', () => go(i, true));
      strip.appendChild(t);
    }
  });
  const dots = dotsWrap ? [...dotsWrap.children] : [];
  const thumbs = strip ? [...strip.children] : [];
  function caption(s) {
    const dict = translations[lang()] || translations.en;
    return { t: dict[s.dataset.tkey] || '', d: dict[s.dataset.dkey] || '' };
  }
  function render() {
    const s = slides[idx];
    const c = caption(s);
    const tag = s.dataset.tag || '';
    slider.style.transform = `translateX(-${idx * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    thumbs.forEach((t, i) => {
      t.classList.toggle('active', i === idx);
      if (i === idx) t.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: prefersReduced ? 'auto' : 'smooth' });
    });
    const n = slides.length;
    const code = 'SEQ-' + String(idx + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0');
    if (counter) counter.textContent = String(idx + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0');
    if (hudCode) hudCode.textContent = code;
    if (hudTag) hudTag.textContent = tag;
    if (labSeq) labSeq.textContent = (lang() === 'es' ? 'SECUENCIA ' : 'SEQUENCE ') + String(idx + 1).padStart(2, '0');
    if (labTitle) labTitle.textContent = c.t;
    if (labDesc) labDesc.textContent = c.d;
    if (labProgress) labProgress.style.width = ((idx + 1) / n * 100) + '%';
    dots.forEach((d, i) => d.setAttribute('aria-selected', String(i === idx)));
  }
  function go(i, manual) {
    idx = (i + slides.length) % slides.length;
    render();
    if (manual) restart();
  }
  function restart() {
    clearInterval(timer);
    if (!prefersReduced) timer = setInterval(() => go(idx + 1), 7000);
  }
  labGo = go; labRender = render;
  prev?.addEventListener('click', () => go(idx - 1, true));
  next?.addEventListener('click', () => go(idx + 1, true));
  document.querySelector('.lab-shell')?.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') go(idx - 1, true);
    if (e.key === 'ArrowRight') go(idx + 1, true);
  });
  document.querySelector('.lab-shell')?.addEventListener('mouseenter', () => clearInterval(timer));
  document.querySelector('.lab-shell')?.addEventListener('mouseleave', () => restart());
  let tx = 0;
  slider.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1), true);
  }, { passive: true });

  slides.forEach(s => s.addEventListener('click', () => {
    const img = s.querySelector('img');
    if (!img || !lightbox || !lbImg) return;
    const c = caption(s);
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    if (lbCap) lbCap.textContent = c.t + ' — ' + c.d;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.getElementById('lbClose')?.focus();
  }));
  function closeLb() {
    lightbox?.classList.remove('open');
    lightbox?.setAttribute('aria-hidden', 'true');
  }
  document.getElementById('lbClose')?.addEventListener('click', closeLb);
  lightbox?.addEventListener('click', e => { if (e.target === lightbox) closeLb(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });

  render();
  restart();
})();

/* ---------- FAQ accordion (single-open, accessible) ---------- */
document.querySelectorAll('.acc-item').forEach(item => {
  const btn = item.querySelector('.acc-btn');
  btn?.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.acc-item.open').forEach(o => {
      o.classList.remove('open');
      o.querySelector('.acc-btn')?.setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

/* ---------- Typewriter for hero subtitle ---------- */
function typeWriter(el, text, speed = 26) {
  if (prefersReduced || !el) { if (el) el.textContent = text; return; }
  let i = 0;
  el.textContent = '';
  (function type() {
    if (i <= text.length) {
      el.textContent = text.slice(0, i++);
      setTimeout(type, speed);
    }
  })();
}

/* ---------- i18n (EN/ES) ---------- */
const translations = {
  en: {
    pageTitle: 'Living Legacy — Immersive Parenthood Experience | NeuroVance Synthara',
    metaDescription: 'An immersive experience to feel the parenthood that never was, using XR, emotional AI, advanced haptics, and BCI',
    metaKeywords: 'extended reality, XR, virtual parenthood, emotional AI, immersive technology, BCI, haptics, NeuroVance',
    skipLink: 'Skip to content',
    navVision: 'Vision', navTech: 'Tech', navStory: 'Story', navGallery: 'Gallery', navFaq: 'FAQ', navDonate: 'Donate',
    navNote: "Founder's note", noteTitle: "Founder's note", noteReplay: 'Replay', noteSkip: 'Skip',
    heroBadge: 'Concept · XR · Emotional AI · BCI',
    heroTitle: 'LIVING LEGACY',
    heroSubtitle: 'An immersive experience to feel the parenthood that never was.',
    exploreButton: 'Explore Vision', watchButton: 'Watch the film',
    chipHaptics: 'Haptics',
    filmEyebrow: 'The film · 01', filmTitle: 'Discover the future of human experience',
    filmMeta: 'Official spot · coming soon',
    visionEyebrow: 'The vision · 02', visionTitle: 'The Vision',
    visionParagraph1: "For those who couldn't have children, we offer a way to explore what could have been. A multi-sensory simulation from birth to 18 years, where the most advanced technology meets the deepest emotionality.",
    visionParagraph2: "Living Legacy is not just a simulation; it's a bridge to understanding parenthood, human connection, and the meaning of leaving a mark on a life.",
    vp1t: 'Multi-sensory', vp1d: 'Sight, sound, touch and emotion synchronized in one coherent world.',
    vp2t: 'Birth to 18', vp2d: 'A continuous arc — first steps, first words, growing up together.',
    vp3t: 'Emotional bridge', vp3d: 'Technology in service of empathy, memory and hope.',
    techEyebrow: 'Deep tech stack · 03', techTitle: 'Revolutionary Technologies',
    techSub: 'Four systems. One living world that listens, feels and remembers.',
    tagFlagship: 'Flagship',
    techXRTitle: 'Extended Reality (XR)', techXRDesc: 'Immersive environments combining virtual, augmented, and mixed reality to create completely convincing visual and spatial experiences.',
    techHapticTitle: 'Emotional Haptics', techHapticDesc: 'Advanced tactile technology that simulates real physical sensations, from the first hug to the most intimate moments of connection.',
    techBCITitle: 'Brain-Computer Interface (BCI)', techBCIDesc: 'Direct connection between thoughts and experience, allowing authentic and natural emotional responses.',
    techAITitle: 'Adaptive Emotional AI', techAIDesc: 'Artificial intelligence systems that evolve and learn, creating unique personalities and genuine relationships.',
    storyEyebrow: 'Founder transmission · 04', storyTitle: 'A note from the founder',
    storySub: 'The intimate truth this entire project is built on — in the founder\u2019s own words.',
    storyRole: 'Founder — NeuroVance Synthara Technologies',
    storySignal: 'Signal · neuroscience × AI × XR',
    storyP1: 'Room for hope, even amidst uncertainty',
    storyP2: 'Memory and feeling as a place to meet',
    storyP3: 'A bridge to a universal emotion',
    storyQ1: '"I\u2019ve learned that even amidst uncertainty, there\u2019s always room for hope. This idea I share with you stems from an intimate truth: the deep longing to experience, even if only in memory and feeling, what life didn\u2019t allow me to experience naturally.',
    storyQ2: 'Being able to approach — even through an idea or a simulation — what it means to be a biological parent, is a powerful possibility. Not just for me, but for so many people who, for various reasons, couldn\u2019t experience that in a traditional way.',
    storyQ3: 'What you are about to see is not just a project; it\u2019s a bridge to a universal emotion. Thank you for lending your gaze and sensibility."',
    testimonialCite: '— URCG, Founder',
    galleryEyebrow: 'Concept lab · 05', galleryTitle: 'Visual Archive',
    gallerySubtitle: 'Nine renders, one journey — from longing to legacy. Browse the sequence like a lab timeline.',
    g1t: 'Genesis', g1d: 'Where the question begins: what if parenthood could be remembered forward?',
    g2t: 'Presence', g2d: 'Stepping inside: a world that surrounds you and responds to your gaze.',
    g3t: 'First contact', g3d: 'Touch becomes language — the weight and warmth of a first embrace.',
    g4t: 'Sync', g4d: 'Mind meets world: thoughts and feelings flowing into the experience.',
    g5t: 'Becoming', g5d: 'A personality awakens — learning, evolving, becoming someone.',
    g6t: 'Growing years', g6d: 'Time, held with care: first steps, first words, growing up together.',
    g7t: 'The bond', g7d: 'Connection as interface — the quiet moments that become memory.',
    g8t: 'Reflection', g8d: 'Looking back at what was lived: meaning settling into place.',
    g9t: 'Legacy', g9d: 'A mark on a life — the emotion that remains beyond the simulation.',
    faqEyebrow: 'Questions · 06', faqTitle: 'Frequently Asked Questions',
    faqQ1: 'What is Living Legacy exactly?', faqA1: 'Living Legacy is a conceptual project that aims to create an immersive simulation of parenthood for those who could not have children. It uses a combination of XR, emotional AI, haptics, and BCI to create a deeply personal and emotional journey.',
    faqQ2: 'Is this a real product?', faqA2: 'Currently, Living Legacy is a conceptual vision. The technologies involved are on the cutting edge, and this project serves as a north star for what could be possible in the future of human-computer interaction and emotional simulation.',
    faqQ3: 'How can I support this vision?', faqA3: 'You can support the research and development behind this vision by contributing through the donation options below. Every bit of support helps us explore these groundbreaking technologies.',
    faqQ4: 'Who is behind this project?', faqA4: 'This conceptual project is led by U.R.C.G under the banner of NeuroVance Synthara Technologies, focusing on the intersection of neuroscience, AI, and immersive experiences.',
    supportEyebrow: 'Join us · 07', supportTitle: 'Support the Project',
    supportSubtitle: 'Your contribution helps build the future of human experience. Please choose your preferred donation method below.',
    cryptoTitle: 'Crypto', cryptoDesc: 'BTC · ETH · USDC via Coinbase Commerce', cryptoButton: 'Donate with Crypto',
    paypalTitle: 'Card & PayPal', paypalDesc: 'Debit, credit or PayPal balance', paypalButton: 'PayPal/Debit/Credit',
    trust1: 'Funds go to R&D exploration', trust2: 'Secure checkout providers', trust3: 'Concept-stage, honest roadmap',
    footerText1: 'Conceptual project by U.R.C.G — NeuroVance Synthara Technologies',
    footerText2: '© 2025 Living Legacy. All rights reserved.'
  },
  es: {
    pageTitle: 'Legado Vivo — Experiencia Inmersiva de Paternidad | NeuroVance Synthara',
    metaDescription: 'Una experiencia inmersiva para sentir la paternidad que nunca fue vivida usando XR, IA emocional, háptica avanzada y BCI',
    metaKeywords: 'realidad extendida, XR, paternidad virtual, IA emocional, tecnología inmersiva, BCI, háptica, NeuroVance',
    skipLink: 'Saltar al contenido',
    navVision: 'Visión', navTech: 'Tech', navStory: 'Historia', navGallery: 'Galería', navFaq: 'FAQ', navDonate: 'Donar',
    navNote: 'Nota del fundador', noteTitle: 'Nota del fundador', noteReplay: 'Repetir', noteSkip: 'Omitir',
    heroBadge: 'Concepto · XR · IA Emocional · BCI',
    heroTitle: 'LEGADO VIVO',
    heroSubtitle: 'Una experiencia inmersiva para sentir la paternidad que nunca fue vivida.',
    exploreButton: 'Explorar Visión', watchButton: 'Ver el video',
    chipHaptics: 'Háptica',
    filmEyebrow: 'El video · 01', filmTitle: 'Descubre el futuro de la experiencia humana',
    filmMeta: 'Spot oficial · próximamente',
    visionEyebrow: 'La visión · 02', visionTitle: 'La Visión',
    visionParagraph1: 'Para quienes no pudieron tener hijos, ofrecemos una forma de explorar lo que pudo haber sido. Una simulación multisensorial desde el nacimiento hasta los 18 años, donde la tecnología más avanzada se encuentra con la emotividad más profunda.',
    visionParagraph2: 'Legado Vivo no es solo una simulación, es un puente hacia la comprensión de la paternidad, la conexión humana y el significado de dejar huella en una vida.',
    vp1t: 'Multisensorial', vp1d: 'Vista, sonido, tacto y emoción sincronizados en un mundo coherente.',
    vp2t: 'Nacer hasta los 18', vp2d: 'Un arco continuo — primeros pasos, primeras palabras, crecer juntos.',
    vp3t: 'Puente emocional', vp3d: 'Tecnología al servicio de la empatía, la memoria y la esperanza.',
    techEyebrow: 'Stack deep-tech · 03', techTitle: 'Tecnologías Revolucionarias',
    techSub: 'Cuatro sistemas. Un mundo vivo que escucha, siente y recuerda.',
    tagFlagship: 'Insignea',
    techXRTitle: 'Realidad Extendida (XR)', techXRDesc: 'Entornos inmersivos que combinan realidad virtual, aumentada y mixta para crear experiencias visuales y espaciales completamente convincentes.',
    techHapticTitle: 'Háptica Emocional', techHapticDesc: 'Tecnología táctil avanzada que simula sensaciones físicas reales, desde el primer abrazo hasta los momentos más íntimos de conexión.',
    techBCITitle: 'Interfaz Cerebro-Computadora (BCI)', techBCIDesc: 'Conexión directa entre pensamientos y experiencia, permitiendo respuestas emocionales auténticas y naturales.',
    techAITitle: 'IA Emocional Adaptativa', techAIDesc: 'Sistemas de inteligencia artificial que evolucionan y aprenden, creando personalidades únicas y relaciones genuinas.',
    storyEyebrow: 'Transmisión del fundador · 04', storyTitle: 'Una nota del fundador',
    storySub: 'La verdad íntima sobre la que se construye todo este proyecto — en palabras del fundador.',
    storyRole: 'Fundador — NeuroVance Synthara Technologies',
    storySignal: 'Señal · neurociencia × IA × XR',
    storyP1: 'Espacio para la esperanza, incluso en la incertidumbre',
    storyP2: 'La memoria y el sentimiento como lugar de encuentro',
    storyP3: 'Un puente hacia una emoción universal',
    storyQ1: '"He aprendido que, incluso en medio de lo incierto, siempre hay espacio para la esperanza. Esta idea que comparto contigo nace de una verdad íntima: el anhelo profundo de vivir, aunque sea en memoria y sentimiento, lo que la vida no me permitió experimentar de forma natural.',
    storyQ2: 'Poder acercarme —aunque sea a través de una idea o una simulación— a lo que significa ser padre biológico, es una posibilidad poderosa. No solo para mí, sino para tantas personas que, por diferentes razones, no pudieron conocer esa vivencia de forma tradicional.',
    storyQ3: 'Lo que estás por ver no es solo un proyecto; es un puente hacia una emoción universal. Gracias por prestarle tu mirada y tu sensibilidad."',
    testimonialCite: '— URCG, Fundador',
    galleryEyebrow: 'Laboratorio conceptual · 05', galleryTitle: 'Archivo Visual',
    gallerySubtitle: 'Nueve renders, un viaje — del anhelo al legado. Recorre la secuencia como una línea de laboratorio.',
    g1t: 'Génesis', g1d: 'Donde empieza la pregunta: ¿y si la paternidad pudiera recordarse hacia adelante?',
    g2t: 'Presencia', g2d: 'Entrar al mundo: un entorno que te rodea y responde a tu mirada.',
    g3t: 'Primer contacto', g3d: 'El tacto se vuelve lenguaje — el peso y la calidez de un primer abrazo.',
    g4t: 'Sincronía', g4d: 'La mente se une al mundo: pensamientos y sentimientos fluyendo en la experiencia.',
    g5t: 'Devenir', g5d: 'Una personalidad despierta — aprendiendo, evolucionando, volviéndose alguien.',
    g6t: 'Años de crecimiento', g6d: 'El tiempo, cuidado con amor: primeros pasos, primeras palabras, crecer juntos.',
    g7t: 'El vínculo', g7d: 'La conexión como interfaz — los momentos quietos que se vuelven memoria.',
    g8t: 'Reflexión', g8d: 'Mirar atrás lo vivido: el significado ocupando su lugar.',
    g9t: 'Legado', g9d: 'Una huella en una vida — la emoción que permanece más allá de la simulación.',
    faqEyebrow: 'Preguntas · 06', faqTitle: 'Preguntas Frecuentes',
    faqQ1: '¿Qué es Legado Vivo exactamente?', faqA1: 'Legado Vivo es un proyecto conceptual que busca crear una simulación inmersiva de la paternidad para aquellos que no pudieron tener hijos. Utiliza una combinación de XR, IA emocional, háptica y BCI para crear un viaje profundamente personal y emotivo.',
    faqQ2: '¿Es este un producto real?', faqA2: 'Actualmente, Legado Vivo es una visión conceptual. Las tecnologías involucradas están a la vanguardia, y este proyecto sirve como una estrella polar para lo que podría ser posible en el futuro de la interacción humano-computadora y la simulación emocional.',
    faqQ3: '¿Cómo puedo apoyar esta visión?', faqA3: 'Puedes apoyar la investigación y el desarrollo detrás de esta visión contribuyendo a través de las opciones de donación a continuación. Cada gramo de apoyo nos ayuda a explorar estas tecnologías innovadoras.',
    faqQ4: '¿Quién está detrás de este proyecto?', faqA4: 'Este proyecto conceptual está liderado por U.R.C.G bajo el estandarte de NeuroVance Synthara Technologies, centrándose en la intersección de la neurociencia, la IA y las experiencias inmersivas.',
    supportEyebrow: 'Únete · 07', supportTitle: 'Apoya el Proyecto',
    supportSubtitle: 'Tu contribución ayuda a construir el futuro de la experiencia humana. Por favor, elige tu método de donación preferido a continuación.',
    cryptoTitle: 'Cripto', cryptoDesc: 'BTC · ETH · USDC vía Coinbase Commerce', cryptoButton: 'Donar con Cripto',
    paypalTitle: 'Tarjeta y PayPal', paypalDesc: 'Débito, crédito o saldo PayPal', paypalButton: 'PayPal/Débito/Crédito',
    trust1: 'Fondos destinados a I+D', trust2: 'Pasarelas de pago seguras', trust3: 'Etapa conceptual, roadmap honesto',
    footerText1: 'Proyecto conceptual de U.R.C.G — NeuroVance Synthara Technologies',
    footerText2: '© 2025 Legado Vivo. Todos los derechos reservados.'
  }
};

function setLanguage(lang) {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-lang-key]').forEach(el => {
    const key = el.getAttribute('data-lang-key');
    const val = translations[lang]?.[key];
    if (!val) return;
    if (el.tagName === 'META') el.setAttribute('content', val);
    else if (el.tagName === 'TITLE') document.title = val;
    else if (key === 'heroSubtitle') { /* typed below */ }
    else if (key === 'exploreButton' || key === 'watchButton') {
      const icon = el.querySelector('i')?.outerHTML || '';
      el.innerHTML = val + (icon ? ' ' + icon : '');
    }
    else el.textContent = val;
  });
  try { localStorage.setItem('selectedLanguage', lang); } catch (e) { /* private mode */ }
  const sub = document.getElementById('heroSubtitle');
  if (sub) typeWriter(sub, translations[lang].heroSubtitle, 26);
  if (typeof labRender === 'function') labRender();
  if (document.getElementById('noteModal')?.classList.contains('open')) playNote();
}

document.addEventListener('DOMContentLoaded', () => {
  const sel = document.getElementById('languageSelector');
  let saved = 'en';
  try { saved = localStorage.getItem('selectedLanguage') || 'en'; } catch (e) { /* ignore */ }
  if (sel) {
    sel.value = saved;
    sel.addEventListener('change', e => setLanguage(e.target.value));
  }
  setLanguage(saved);
  const year = new Date().getFullYear();
  const foot = document.querySelector('[data-lang-key="footerText2"]');
  if (foot && year !== 2025) foot.textContent = foot.textContent.replace('2025', String(year));
});
