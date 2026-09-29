/* NeuroVance Synthara — Living Legacy PRO immersive engine */
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover: none)').matches;
const hasGSAP = typeof window.gsap !== 'undefined';
const hasST = typeof window.ScrollTrigger !== 'undefined';
if (hasGSAP && hasST) gsap.registerPlugin(ScrollTrigger);

/* ---------- header + progress ---------- */
const header = document.getElementById('siteHeader');
const progress = document.querySelector('.scroll-progress');
let lastY = 0;
function onScrollBase() {
  const y = window.scrollY;
  const h = document.documentElement.scrollHeight - window.innerHeight;
  if (progress) progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
  if (header) {
    header.classList.toggle('scrolled', y > 24);
    if (!prefersReduced && y > 500 && y > lastY + 4) header.classList.add('hide');
    else if (y < lastY - 4) header.classList.remove('hide');
    lastY = y;
  }
}
window.addEventListener('scroll', () => requestAnimationFrame(onScrollBase), { passive: true });

/* ---------- mobile menu ---------- */
const burger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
if (burger && mobileMenu) {
  burger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mobileMenu.classList.remove('open'); burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }));
}

/* ---------- smooth anchors (Lenis-aware) ---------- */
let lenis = null;
if (!prefersReduced && typeof window.Lenis !== 'undefined') {
  try {
    lenis = new Lenis({ duration: 1.25, smoothWheel: true });
    if (hasGSAP) {
      lenis.on('scroll', () => { if (hasST) ScrollTrigger.update(); });
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })(performance.now());
    }
  } catch (e) { lenis = null; }
}
function scrollToTarget(sel) {
  const target = document.querySelector(sel);
  if (!target) return;
  if (lenis) lenis.scrollTo(target, { offset: -70, duration: 1.4 });
  else target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
}
document.querySelectorAll('a[href^="#"], [data-scroll-to]').forEach(el => {
  el.addEventListener('click', e => {
    const sel = el.getAttribute('data-scroll-to') || el.getAttribute('href');
    if (!sel || sel === '#') return;
    if (!document.querySelector(sel)) return;
    e.preventDefault();
    mobileMenu?.classList.remove('open'); burger?.classList.remove('open');
    scrollToTarget(sel);
  });
});
document.getElementById('toTop')?.addEventListener('click', () => {
  if (lenis) lenis.scrollTo(0, { duration: 1.4 });
  else window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
});

/* ---------- neural 2D layer (cheap) ---------- */
(function neural() {
  const canvas = document.getElementById('neural-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, nodes = [], raf;
  const COLORS = ['34,211,238', '139,92,246', '244,114,182'];
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    w = canvas.clientWidth || window.innerWidth;
    h = canvas.clientHeight || window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = prefersReduced ? 0 : Math.min(55, Math.floor((w * h) / 28000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.4 + 0.5, c: COLORS[Math.floor(Math.random() * 3)]
    }));
  }
  function step() {
    ctx.clearRect(0, 0, w, h);
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${n.c},.7)`; ctx.fill();
    }
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
      const d = Math.hypot(dx, dy);
      if (d < 120) {
        ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.strokeStyle = `rgba(139,162,255,${(1 - d / 120) * 0.28})`; ctx.lineWidth = 1; ctx.stroke();
      }
    }
    raf = requestAnimationFrame(step);
  }
  resize(); window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else if (!prefersReduced && nodes.length) raf = requestAnimationFrame(step);
  });
  if (!prefersReduced && nodes.length) raf = requestAnimationFrame(step);
})();

/* ---------- tilt + spotlight + magnetic + cursor ---------- */
if (!isTouch && !prefersReduced) {
  document.querySelectorAll('[data-tilt]').forEach(card => {
    let rAF = null;
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      if (rAF) cancelAnimationFrame(rAF);
      rAF = requestAnimationFrame(() => {
        card.style.transform = `perspective(1000px) rotateX(${-py * 10}deg) rotateY(${px * 12}deg) translateZ(6px)`;
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
    card.addEventListener('mouseleave', () => {
      if (rAF) cancelAnimationFrame(rAF);
      card.style.transform = '';
    });
  });
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.12;
      const y = (e.clientY - r.top - r.height / 2) * 0.16;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
  // cursor
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    if (dot) dot.style.transform = `translate(${mx - 3}px,${my - 3}px)`;
  }, { passive: true });
  (function cur() {
    rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
    if (ring) ring.style.transform = `translate(${rx - 18}px,${ry - 18}px)`;
    requestAnimationFrame(cur);
  })();
  document.querySelectorAll('a,button,.tech-card,.vpoint,.donate-card').forEach(el => {
    el.addEventListener('mouseenter', () => ring?.classList.add('hovering'));
    el.addEventListener('mouseleave', () => ring?.classList.remove('hovering'));
  });
}

/* ---------- founder modal ---------- */
const NOTE_SPEED = 13;
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
  let delay = 450;
  texts.forEach((text, i) => {
    const el = els[i]; if (!el) return;
    noteTimers.push(setTimeout(() => {
      el.classList.add('typing'); let c = 0;
      (function tick() {
        if (!modal.classList.contains('open')) return;
        el.textContent = text.slice(0, ++c);
        if (c < text.length) noteTimers.push(setTimeout(tick, NOTE_SPEED));
        else {
          el.classList.remove('typing'); bars[i]?.classList.add('done');
          if (i === texts.length - 1) {
            const lang = document.documentElement.lang === 'es' ? 'es' : 'en';
            if (cite) cite.textContent = translations[lang].testimonialCite;
          }
        }
      })();
    }, delay));
    delay += text.length * NOTE_SPEED + 420;
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
  modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (lenis) lenis.stop();
  document.getElementById('mobileMenu')?.classList.remove('open');
  document.getElementById('hamburger')?.classList.remove('open');
  playNote();
  modal.querySelector('.note-close')?.focus();
}
function closeNote() {
  const modal = document.getElementById('noteModal');
  if (!modal) return;
  clearNoteTimers(); modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lenis) lenis.start();
  if (noteOpener && noteOpener.focus) noteOpener.focus();
}
document.querySelectorAll('[data-open-note]').forEach(b => b.addEventListener('click', () => openNote(b)));
document.querySelectorAll('[data-close-note]').forEach(b => b.addEventListener('click', closeNote));
document.getElementById('noteReplay')?.addEventListener('click', playNote);
document.getElementById('noteSkip')?.addEventListener('click', skipNote);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && document.getElementById('noteModal')?.classList.contains('open')) closeNote();
});

/* ---------- FAQ ---------- */
document.querySelectorAll('.acc-item').forEach(item => {
  const btn = item.querySelector('.acc-btn');
  btn?.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.acc-item.open').forEach(o => {
      o.classList.remove('open'); o.querySelector('.acc-btn')?.setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) { item.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
  });
});

/* ---------- i18n ---------- */
const translations = {
  en: {
    pageTitle: 'Living Legacy — Immersive Parenthood Experience | NeuroVance Synthara',
    metaDescription: 'An immersive experience to feel the parenthood that never was, using XR, emotional AI, advanced haptics, and BCI',
    metaKeywords: 'extended reality, XR, virtual parenthood, emotional AI, immersive technology, BCI, haptics, NeuroVance',
    skipLink: 'Skip to content',
    navVision: 'Vision', navTech: 'Tech', navFaq: 'FAQ', navDonate: 'Donate',
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
    storyRole: 'Founder — NeuroVance Synthara Technologies',
    storyQ1: '"I\u2019ve learned that even amidst uncertainty, there\u2019s always room for hope. This idea I share with you stems from an intimate truth: the deep longing to experience, even if only in memory and feeling, what life didn\u2019t allow me to experience naturally.',
    storyQ2: 'Being able to approach — even through an idea or a simulation — what it means to be a biological parent, is a powerful possibility. Not just for me, but for so many people who, for various reasons, couldn\u2019t experience that in a traditional way.',
    storyQ3: 'What you are about to see is not just a project; it\u2019s a bridge to a universal emotion. Thank you for lending your gaze and sensibility."',
    testimonialCite: '— URCG, Founder',
    faqEyebrow: 'Questions · 04', faqTitle: 'Frequently Asked Questions',
    faqQ1: 'What is Living Legacy exactly?', faqA1: 'Living Legacy is a conceptual project that aims to create an immersive simulation of parenthood for those who could not have children. It uses a combination of XR, emotional AI, haptics, and BCI to create a deeply personal and emotional journey.',
    faqQ2: 'Is this a real product?', faqA2: 'Currently, Living Legacy is a conceptual vision. The technologies involved are on the cutting edge, and this project serves as a north star for what could be possible in the future of human-computer interaction and emotional simulation.',
    faqQ3: 'How can I support this vision?', faqA3: 'You can support the research and development behind this vision by contributing through the donation options below. Every bit of support helps us explore these groundbreaking technologies.',
    faqQ4: 'Who is behind this project?', faqA4: 'This conceptual project is led by U.R.C.G under the banner of NeuroVance Synthara Technologies, focusing on the intersection of neuroscience, AI, and immersive experiences.',
    supportEyebrow: 'Join us · 05', supportTitle: 'Support the Project',
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
    navVision: 'Visión', navTech: 'Tech', navFaq: 'FAQ', navDonate: 'Donar',
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
    storyRole: 'Fundador — NeuroVance Synthara Technologies',
    storyQ1: '"He aprendido que, incluso en medio de lo incierto, siempre hay espacio para la esperanza. Esta idea que comparto contigo nace de una verdad íntima: el anhelo profundo de vivir, aunque sea en memoria y sentimiento, lo que la vida no me permitió experimentar de forma natural.',
    storyQ2: 'Poder acercarme —aunque sea a través de una idea o una simulación— a lo que significa ser padre biológico, es una posibilidad poderosa. No solo para mí, sino para tantas personas que, por diferentes razones, no pudieron conocer esa vivencia de forma tradicional.',
    storyQ3: 'Lo que estás por ver no es solo un proyecto; es un puente hacia una emoción universal. Gracias por prestarle tu mirada y tu sensibilidad."',
    testimonialCite: '— URCG, Fundador',
    faqEyebrow: 'Preguntas · 04', faqTitle: 'Preguntas Frecuentes',
    faqQ1: '¿Qué es Legado Vivo exactamente?', faqA1: 'Legado Vivo es un proyecto conceptual que busca crear una simulación inmersiva de la paternidad para aquellos que no pudieron tener hijos. Utiliza una combinación de XR, IA emocional, háptica y BCI para crear un viaje profundamente personal y emotivo.',
    faqQ2: '¿Es este un producto real?', faqA2: 'Actualmente, Legado Vivo es una visión conceptual. Las tecnologías involucradas están a la vanguardia, y este proyecto sirve como una estrella polar para lo que podría ser posible en el futuro de la interacción humano-computadora y la simulación emocional.',
    faqQ3: '¿Cómo puedo apoyar esta visión?', faqA3: 'Puedes apoyar la investigación y el desarrollo detrás de esta visión contribuyendo a través de las opciones de donación a continuación. Cada gramo de apoyo nos ayuda a explorar estas tecnologías innovadoras.',
    faqQ4: '¿Quién está detrás de este proyecto?', faqA4: 'Este proyecto conceptual está liderado por U.R.C.G bajo el estandarte de NeuroVance Synthara Technologies, centrándose en la intersección de la neurociencia, la IA y las experiencias inmersivas.',
    supportEyebrow: 'Únete · 05', supportTitle: 'Apoya el Proyecto',
    supportSubtitle: 'Tu contribución ayuda a construir el futuro de la experiencia humana. Por favor, elige tu método de donación preferido a continuación.',
    cryptoTitle: 'Cripto', cryptoDesc: 'BTC · ETH · USDC vía Coinbase Commerce', cryptoButton: 'Donar con Cripto',
    paypalTitle: 'Tarjeta y PayPal', paypalDesc: 'Débito, crédito o saldo PayPal', paypalButton: 'PayPal/Débito/Crédito',
    trust1: 'Fondos destinados a I+D', trust2: 'Pasarelas de pago seguras', trust3: 'Etapa conceptual, roadmap honesto',
    footerText1: 'Proyecto conceptual de U.R.C.G — NeuroVance Synthara Technologies',
    footerText2: '© 2025 Legado Vivo. Todos los derechos reservados.'
  }
};

function splitHero(text) {
  const h = document.getElementById('heroTitle');
  if (!h) return;
  h.innerHTML = '';
  text.split(' ').forEach((word, wi, arr) => {
    const w = document.createElement('span'); w.className = 'word';
    [...word].forEach(ch => {
      const c = document.createElement('span'); c.className = 'char'; c.textContent = ch;
      w.appendChild(c);
    });
    h.appendChild(w);
    if (wi < arr.length - 1) h.appendChild(document.createTextNode(' '));
  });
}
function setLanguage(lang) {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-lang-key]').forEach(el => {
    const key = el.getAttribute('data-lang-key');
    const val = translations[lang]?.[key];
    if (!val) return;
    if (el.tagName === 'META') el.setAttribute('content', val);
    else if (el.tagName === 'TITLE') document.title = val;
    else if (key === 'heroTitle') splitHero(val);
    else if (key === 'heroSubtitle') { const s = document.getElementById('heroSubtitle'); if (s) s.textContent = val; }
    else if (key === 'exploreButton' || key === 'watchButton') {
      const icon = el.querySelector('i')?.outerHTML || '';
      el.innerHTML = val + (icon ? ' ' + icon : '');
    }
    else el.textContent = val;
  });
  try { localStorage.setItem('selectedLanguage', lang); } catch (e) {}
  if (document.getElementById('noteModal')?.classList.contains('open')) playNote();
  if (hasGSAP && !prefersReduced) {
    gsap.fromTo('#heroTitle .char', { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .7, stagger: .02, ease: 'power3.out', overwrite: true });
  } else {
    document.querySelectorAll('#heroTitle .char').forEach(c => { c.style.transform = 'none'; c.style.opacity = '1'; });
  }
}

/* ---------- PRO intro + scroll choreography ---------- */
function initProMotion() {
  const pre = document.getElementById('preloader');
  const num = document.getElementById('preNum');
  const bar = document.getElementById('preBar');
  splitHero((translations[document.documentElement.lang]?.heroTitle) || 'LIVING LEGACY');

  if (prefersReduced || !hasGSAP) {
    pre?.classList.add('done');
    document.querySelectorAll('#heroTitle .char').forEach(c => { c.style.transform = 'none'; c.style.opacity = '1'; });
    document.querySelectorAll('[data-immersive]').forEach(s => s.classList.add('in-view'));
    return;
  }

  if (lenis) lenis.stop();
  let p = 0;
  const tick = setInterval(() => {
    p = Math.min(100, p + Math.random() * 14 + 4);
    if (num) num.textContent = String(Math.floor(p)).padStart(2, '0');
    if (bar) bar.style.width = p + '%';
    if (p >= 100) {
      clearInterval(tick);
      setTimeout(revealSite, 350);
    }
  }, 120);

  function revealSite() {
    pre?.classList.add('done');
    if (lenis) lenis.start();
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.from('.site-header', { y: -70, opacity: 0, duration: 1 }, 0.5)
      .to('#heroTitle .char', { y: 0, yPercent: 0, opacity: 1, rotate: 0, duration: 1.1, stagger: 0.035,
        onStart: () => gsap.set('#heroTitle .char', { yPercent: 110 }),
        startAt: { yPercent: 110 } }, 0.55)
      .from('.hero-subtitle', { y: 26, opacity: 0, duration: .9 }, 1.0)
      .from('.hero-ctas .btn', { y: 22, opacity: 0, duration: .7, stagger: .1 }, 1.1)
      .from('.hero-stats > div', { y: 18, opacity: 0, duration: .6, stagger: .08 }, 1.2)
      .from('.hero-core', { scale: .7, opacity: 0, duration: 1.4, ease: 'expo.out' }, 0.7)
      .from('.orbit-chip', { scale: 0, opacity: 0, duration: .7, stagger: .09, ease: 'back.out(1.7)' }, 1.15)
      .from('.hero-bg-word', { opacity: 0, scale: 1.15, duration: 1.6 }, 0.6)
      .from('.journey-rail', { x: 30, opacity: 0, duration: .8 }, 1.3);
  }

  // scroll-driven sections
  gsap.utils.toArray('[data-immersive]').forEach(sec => {
    if (sec.id === 'top') return;
    gsap.fromTo(sec,
      { y: 90, opacity: 0, scale: .97, filter: 'blur(8px)' },
      { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: sec, start: 'top 82%', toggleActions: 'play none none reverse' } });
  });
  gsap.utils.toArray('.sec-line span').forEach(line => {
    gsap.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'expo.out',
      scrollTrigger: { trigger: line, start: 'top 88%' } });
  });
  gsap.utils.toArray('.tech-card,.vpoint,.donate-card').forEach((card, i) => {
    gsap.from(card, { y: 50, opacity: 0, duration: .9, ease: 'power3.out', delay: (i % 4) * 0.06,
      scrollTrigger: { trigger: card, start: 'top 90%' } });
  });
  // hero scroll out + bg word drift
  gsap.to('.hero-copy', { yPercent: -12, opacity: .25, ease: 'none',
    scrollTrigger: { trigger: '#top', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('#heroVisual', { yPercent: 14, rotateY: 8, ease: 'none',
    scrollTrigger: { trigger: '#top', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero-bg-word', { yPercent: 40, ease: 'none',
    scrollTrigger: { trigger: '#top', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.video-shell', { scale: 1.02, ease: 'none',
    scrollTrigger: { trigger: '#film', start: 'top bottom', end: 'center center', scrub: true } });
  gsap.to('.giant-cta', { yPercent: -18, ease: 'none',
    scrollTrigger: { trigger: '.giant-cta', start: 'top bottom', end: 'bottom top', scrub: true } });

  // hero mouse 3D
  if (!isTouch) {
    const copy = document.querySelector('.hero-copy');
    const vis = document.getElementById('heroVisual');
    let tx = 0, ty = 0, cx = 0, cy = 0;
    window.addEventListener('mousemove', e => {
      tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5;
    }, { passive: true });
    gsap.ticker.add(() => {
      cx += (tx - cx) * .055; cy += (ty - cy) * .055;
      if (copy) copy.style.transform = `translate3d(${cx * 16}px,${cy * 12}px,0) rotateY(${cx * 5}deg)`;
      if (vis) vis.style.transform = `rotateY(${cx * 12}deg) rotateX(${-cy * 10}deg)`;
      const core = document.querySelector('.hero-core');
      if (core) core.style.transform = `translate3d(${cx * 22}px,${cy * 18}px,0)`;
    });
  }

  // rail + timeline + counters
  const dots = [...document.querySelectorAll('.jr-dot')];
  ['top', 'film', 'vision', 'technologies', 'faq', 'support'].forEach(id => {
    const el = document.getElementById(id); if (!el) return;
    ScrollTrigger.create({ trigger: el, start: 'top center', end: 'bottom center',
      onToggle: s => { if (s.isActive) dots.forEach(d => d.classList.toggle('is-active', d.dataset.jr === id)); } });
  });
  const tlFill = document.getElementById('tlFill'), tlHead = document.getElementById('tlHead');
  const steps = [...document.querySelectorAll('.tl-step')];
  ScrollTrigger.create({ trigger: '#vision', start: 'top 70%', end: 'bottom 40%', scrub: .6,
    onUpdate: self => {
      const pr = self.progress;
      if (tlFill) tlFill.style.width = (8 + pr * 92) + '%';
      if (tlHead) tlHead.style.left = (8 + pr * 92) + '%';
      steps.forEach((s, i) => s.classList.toggle('lit', i <= Math.floor(pr * 5)));
    } });
  document.querySelectorAll('[data-count]').forEach(el => {
    const end = parseInt(el.dataset.count, 10);
    ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true,
      onEnter: () => gsap.fromTo(el, { innerText: 0 }, { innerText: end, duration: 1.4, snap: { innerText: 1 }, ease: 'power2.out' }) });
  });
}

/* ---------- PRO WebGL: particle tunnel + core ---------- */
(function webglPro() {
  const canvas = document.getElementById('webgl-immersive');
  if (!canvas || prefersReduced || !window.THREE) return;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch (e) { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.6));
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x04050c, 0.028);
  const camera = new THREE.PerspectiveCamera(68, 1, 0.1, 300);
  camera.position.set(0, 0, 26);

  const THEMES = {
    cyan: new THREE.Color(0x22d3ee), violet: new THREE.Color(0x8b5cf6),
    magenta: new THREE.Color(0xf472b6), white: new THREE.Color(0xeef2ff)
  };
  let targetColor = THEMES.cyan.clone(), curColor = THEMES.cyan.clone();

  // tunnel
  const TUN = isTouch ? 1400 : 2600;
  const tp = new Float32Array(TUN * 3), tc = new Float32Array(TUN * 3);
  for (let i = 0; i < TUN; i++) {
    const r = 9 + Math.random() * 26;
    const a = Math.random() * Math.PI * 2;
    tp[i * 3] = Math.cos(a) * r;
    tp[i * 3 + 1] = (Math.random() - .5) * 70;
    tp[i * 3 + 2] = (Math.random() - .5) * 120 - 20;
    const m = Math.random();
    const c = m < .4 ? [0.13, 0.83, 0.93] : m < .75 ? [0.55, 0.36, 0.96] : [0.96, 0.45, 0.71];
    tc[i * 3] = c[0]; tc[i * 3 + 1] = c[1]; tc[i * 3 + 2] = c[2];
  }
  const tunGeo = new THREE.BufferGeometry();
  tunGeo.setAttribute('position', new THREE.BufferAttribute(tp, 3));
  tunGeo.setAttribute('color', new THREE.BufferAttribute(tc, 3));
  const tunnel = new THREE.Points(tunGeo, new THREE.PointsMaterial({ size: .28, vertexColors: true, transparent: true, opacity: .85, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(tunnel);

  // dust
  const DST = isTouch ? 300 : 700;
  const dp = new Float32Array(DST * 3);
  for (let i = 0; i < DST; i++) { dp[i * 3] = (Math.random() - .5) * 60; dp[i * 3 + 1] = (Math.random() - .5) * 40; dp[i * 3 + 2] = (Math.random() - .5) * 50; }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ size: .14, color: 0x9aa8cc, transparent: true, opacity: .5, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(dust);

  // cores
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(5, 1), new THREE.MeshBasicMaterial({ color: 0x22d3ee, wireframe: true, transparent: true, opacity: .12 }));
  core.position.set(11, 3, -12); scene.add(core);
  const core2 = new THREE.Mesh(new THREE.TorusKnotGeometry(4.2, 1, 120, 14), new THREE.MeshBasicMaterial({ color: 0x8b5cf6, wireframe: true, transparent: true, opacity: .09 }));
  core2.position.set(-12, -4, -16); scene.add(core2);
  const glow = new THREE.Mesh(new THREE.SphereGeometry(2.4, 24, 24), new THREE.MeshBasicMaterial({ color: 0xf472b6, transparent: true, opacity: .06, blending: THREE.AdditiveBlending, depthWrite: false }));
  glow.position.set(0, 0, -30); scene.add(glow);

  // theme per section
  if (hasST && !prefersReduced) {
    document.querySelectorAll('[data-theme]').forEach(sec => {
      ScrollTrigger.create({ trigger: sec, start: 'top center', end: 'bottom center',
        onToggle: s => { if (s.isActive && THEMES[sec.dataset.theme]) targetColor.copy(THEMES[sec.dataset.theme]); } });
    });
  }

  let mx = 0, my = 0, vel = 0, lastScroll = scrollY;
  addEventListener('mousemove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });
  function resize() {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize); resize();

  let running = true;
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) requestAnimationFrame(loop); });
  const clock = new THREE.Clock();
  function loop() {
    if (!running) return;
    const t = clock.getElapsedTime();
    const sy = scrollY;
    vel += ((sy - lastScroll) - vel) * .08; lastScroll = sy;
    curColor.lerp(targetColor, .04);
    core.material.color.copy(curColor); glow.material.color.copy(curColor);
    tunnel.rotation.y = t * .018 + mx * .25;
    tunnel.rotation.x = my * .12;
    tunnel.position.y = (sy * .004) % 8;
    dust.rotation.y = -t * .012;
    dust.position.y = Math.sin(t * .3) * 1.2;
    core.rotation.x = t * .1; core.rotation.y = t * .14;
    core2.rotation.x = -t * .07; core2.rotation.y = t * .1;
    glow.scale.setScalar(1 + Math.sin(t * 1.4) * .12);
    const speed = Math.min(Math.abs(vel) * .004, 2.2);
    tunnel.position.z = (tunnel.position.z || 0) + speed;
    camera.position.z = 26 - Math.min(sy * .007, 12);
    camera.position.x += ((mx * 4) - camera.position.x) * .035;
    camera.position.y += ((-my * 2.4) - camera.position.y) * .035;
    camera.lookAt(0, 0, -10);
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();

/* ---------- boot ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const sel = document.getElementById('languageSelector');
  let saved = 'en';
  try { saved = localStorage.getItem('selectedLanguage') || 'en'; } catch (e) {}
  document.documentElement.lang = saved;
  if (sel) {
    sel.value = saved;
    sel.addEventListener('change', e => setLanguage(e.target.value));
  }
  // apply saved language without animation first
  document.querySelectorAll('[data-lang-key]').forEach(el => {
    const key = el.getAttribute('data-lang-key');
    const val = translations[saved]?.[key];
    if (!val) return;
    if (el.tagName === 'META') el.setAttribute('content', val);
    else if (el.tagName === 'TITLE') document.title = val;
    else if (key === 'heroTitle') splitHero(val);
    else if (key === 'heroSubtitle') el.textContent = val;
    else if (key === 'exploreButton' || key === 'watchButton') {
      const icon = el.querySelector('i')?.outerHTML || '';
      el.innerHTML = val + (icon ? ' ' + icon : '');
    }
    else el.textContent = val;
  });
  const year = new Date().getFullYear();
  const foot = document.querySelector('[data-lang-key="footerText2"]');
  if (foot && year !== 2025) foot.textContent = foot.textContent.replace('2025', String(year));
  initProMotion();
  if (hasST) setTimeout(() => ScrollTrigger.refresh(), 1200);
});
