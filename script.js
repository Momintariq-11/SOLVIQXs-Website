// SOLVIQX — small enhancements. The site works without this file.

// Page reveals: the page currently on screen gets .in-view; its content animates in.
// Leaving a page resets it, so the animations replay when scrolling down AND back up.
// Workflow steps: when the Workflow page arrives, the four steps appear automatically one after another.
(() => {
  const main = document.querySelector('main');
  const pages = [...document.querySelectorAll('main > .page')];
  const stepsWrap = document.getElementById('stepsWrap');
  const items = stepsWrap ? [...stepsWrap.querySelectorAll('.steps li')] : [];
  const noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let ticking = false, autoTimer = 0, autoActive = false;

  const showSteps = (n) => {
    if (!stepsWrap) return;
    stepsWrap.dataset.step = n;
    items.forEach((li, i) => li.classList.toggle('on', i < n));
    stepsWrap.style.setProperty('--f', n <= 1 ? 0 : (n - 1) / 3);
  };
  const playAuto = () => {
    if (autoActive) return;
    autoActive = true;
    let n = 0;
    clearInterval(autoTimer);
    showSteps(0);
    autoTimer = setInterval(() => { showSteps(++n); if (n >= 4) clearInterval(autoTimer); }, 550);
  };
  const stopAuto = () => { autoActive = false; clearInterval(autoTimer); showSteps(0); };

  const update = () => {
    ticking = false;
    const y = window.scrollY, line = y + window.innerHeight * 0.55;
    let top = 0, active = 0;
    [...main.children].forEach((el) => {
      top += parseFloat(getComputedStyle(el).marginTop) || 0;   // sheets overlap the page above on phones
      const i = pages.indexOf(el);
      if (i > -1 && top <= line) active = i;
      top += el.offsetHeight;
    });
    pages.forEach((p, i) => p.classList.toggle('in-view', i === active));
    const id = pages[active].id;
    document.querySelectorAll('.nav-links a').forEach((a) =>
      a.classList.toggle('active', (a.dataset.pages || '').split(' ').includes(id)));

    if (!stepsWrap) return;
    if (noMotion) { showSteps(4); return; }
    if (id !== 'process') { stopAuto(); return; }
    playAuto();   // steps appear one by one on their own, on every screen size
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Hero: the last word swaps — the old word vanishes upward, the new one bounces in
const typed = document.getElementById('typed');
if (typed && !reduceMotion) {
  const words = ['software.', 'web apps.', 'mobile apps.', 'dashboards.', 'websites.', 'systems.'];
  (async () => {
    await wait(7200);
    let i = 0;
    for (;;) {
      typed.classList.remove('swap-in');
      typed.classList.add('swap-out');
      await wait(420);
      typed.textContent = words[++i % words.length];
      typed.classList.remove('swap-out');
      void typed.offsetWidth; // restart the animation
      typed.classList.add('swap-in');
      await wait(2600);
    }
  })();
}

// Hero: build log that runs on a loop
const term = document.getElementById('term');
if (term) {
  const steps = [
    ['Mapping requirements', 'done'],
    ['Designing the interface', 'done'],
    ['Building backend & API', 'done'],
    ['Testing on mobile & desktop', 'done'],
    ['Setting up dashboard', 'done']
  ];
  const cmd = term.innerHTML;
  const render = (count, finished) => {
    term.innerHTML = cmd + steps.slice(0, count).map(([t, s]) =>
      `<div class="t-line"><span>› ${t}</span><span class="ok">✓ ${s}</span></div>`).join('') +
      (finished ? '<div class="t-done">✓ Ready to launch</div>' : '');
  };
  if (reduceMotion) {
    render(steps.length, true);
  } else {
    (async () => {
      await wait(3400);
      for (;;) {
        for (let n = 1; n <= steps.length; n++) { render(n, false); await wait(650); }
        render(steps.length, true);
        await wait(3200);
        render(0, false);
        await wait(700);
      }
    })();
  }
}

// Remove the intro layer once it has played so it never blocks anything.
const intro = document.getElementById('intro');
if (intro && !reduceMotion) {
  const fill = document.getElementById('introFill');
  const pct = document.getElementById('introPct');
  const msg = document.getElementById('introMsg');
  const steps = [
    [0, 'Getting things ready'],
    [20, 'Designing the UI around you'],
    [45, 'Connecting your systems'],
    [70, 'Polishing the details'],
    [88, 'Almost ready'],
    [100, 'Ready']
  ];
  // Status text "decodes" into place: characters cycle through code-like glyphs, then resolve left to right
  const glyphs = '01<>/{}[]#=+*ABCDEFXQ';
  let shown = '', scrambleTimer = 0;
  const setMsg = (text) => {
    if (text === shown) return;
    shown = text;
    const hasLogo = text.includes('SOLVIQX');
    const plain = hasLogo ? text.replace('SOLVIQX', '').trim() : text;
    const logo = hasLogo ? ' <img class="msg-logo" src="assets/wordmark.png" alt="SOLVIQX">' : '';
    cancelAnimationFrame(scrambleTimer);
    const t0 = performance.now(), dur = 420;
    const step = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const done = Math.floor(p * plain.length);
      let out = plain.slice(0, done);
      for (let k = done; k < plain.length; k++) out += plain[k] === ' ' ? ' ' : glyphs[(Math.random() * glyphs.length) | 0];
      msg.innerHTML = out.replace(/&/g, '&amp;').replace(/</g, '&lt;') + (p === 1 ? logo : '');
      if (p < 1) scrambleTimer = requestAnimationFrame(step);
    };
    scrambleTimer = requestAnimationFrame(step);
  };
  const duration = 2600, start = performance.now() + 500;
  const ease = (t) => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const tick = (now) => {
    const t = Math.min(Math.max((now - start) / duration, 0), 1);
    const v = Math.round(ease(t) * 100);
    fill.style.width = `${v}%`;
    pct.textContent = String(v).padStart(3, '0');
    setMsg(steps.filter(([at]) => v >= at).pop()[1]);
    if (t < 1) { requestAnimationFrame(tick); return; }
    intro.classList.add('is-welcome');
    setTimeout(() => { intro.classList.add('is-open'); document.documentElement.classList.add('intro-open'); }, 700);
    setTimeout(() => intro.remove(), 1700);
  };
  requestAnimationFrame(tick);
} else {
  if (intro) intro.remove();
  document.documentElement.classList.add('intro-open');
}

// Inquiry form: until a form service is connected, open the visitor's email app with the details filled in.
const form = document.getElementById('inquiry');
if (form) {
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const d = new FormData(form);
    const subject = `Project inquiry — ${d.get('business') || d.get('name')}`;
    const body = [
      `Name: ${d.get('name')}`,
      `Business: ${d.get('business')}`,
      `Contact: ${d.get('contact')}`,
      `Services: ${d.getAll('service').join(', ') || 'Not specified'}`,
      '',
      d.get('message') || ''
    ].join('\n');
    window.location.href = `mailto:connect@solviqx.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// FAQ: only one answer open at a time (for browsers without <details name> support)
document.querySelectorAll('.faq details').forEach((d, _, all) => {
  d.addEventListener('toggle', () => {
    if (d.open) all.forEach((o) => { if (o !== d) o.open = false; });
  });
});

// Headings: split into words that rise in one after another when the page arrives
(() => {
  const heads = document.querySelectorAll('.split-words');
  let i = 0;
  const wrap = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          const w = document.createElement('span');
          w.className = 'w'; w.style.setProperty('--i', i++); w.textContent = part;
          frag.appendChild(w);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        wrap(child);
      }
    });
  };
  heads.forEach((h) => { i = 0; h.setAttribute('aria-label', h.textContent.trim()); wrap(h); });

})();

// Service chips: "Complete package" covers everything, so it clears the others (and vice versa)
const chips = document.querySelectorAll('.chips input');
chips.forEach((c) => c.addEventListener('change', () => {
  if (!c.checked) return;
  const all = c.value === 'Complete package';
  chips.forEach((o) => { if (o !== c && (all || o.value === 'Complete package')) o.checked = false; });
}));

// In-page links (nav, buttons, footer): the pages are stacked on top of each other, so the browser
// can think an earlier page is "already on screen". Work out each page's real position and scroll there.
document.querySelectorAll('a[href^="#"], a[href^="/#"]').forEach((link) => {
  link.addEventListener('click', (ev) => {
    const hash = link.getAttribute('href').replace(/^\//, '');
    const target = hash.length > 1 && document.getElementById(hash.slice(1));
    if (!target) return;
    const page = target.closest('main > .page') || target;
    let top = 0;
    for (const el of document.querySelector('main').children) {
      top += parseFloat(getComputedStyle(el).marginTop) || 0;
      if (el === page) break;
      top += el.offsetHeight;
    }
    ev.preventDefault();
    window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
    history.replaceState(null, '', hash);
  });
});
