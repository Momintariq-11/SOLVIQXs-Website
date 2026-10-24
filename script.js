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
  const hero = document.querySelector('.hero-center');
  const cards = [...document.querySelectorAll('.tile, .case-stack li')];
  const wraps = pages.filter((p) => p.classList.contains('sheet')).map((p) => [p, p.firstElementChild, !p.classList.contains('plain')]);
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
      top += parseFloat(getComputedStyle(el).marginTop) || 0;   // each panel overlaps the bottom of the one above
      const i = pages.indexOf(el);
      if (i > -1 && top <= line) active = i;
      top += el.offsetHeight;
    });
    if (!noMotion) {
      const vh = innerHeight, clamp = (v) => Math.min(Math.max(v, 0), 1);
      // first page: drifts up as it leaves, and only fades once it is mostly gone
      if (hero) { const H = hero.parentElement.offsetHeight, k = clamp(y / H); hero.style.transform = `translateY(${-80 * k}px)`; hero.style.opacity = 1 - clamp((k - 0.35) / 0.5); }
      // pages fly up: start 120px low and smaller, reach full size once their top is 40% down the screen
      wraps.forEach(([p, w, panel]) => {
        const t = clamp((vh - p.getBoundingClientRect().top) / (vh * 0.6));
        w.style.transform = `translateY(${(1 - t) * 120}px)` + (panel ? ` scale(${0.9 + 0.1 * t})` : '');
        w.style.opacity = 0.35 + 0.65 * clamp(t / 0.85);
      });
      // cards settle into place one after another as they come up
      cards.forEach((c, i) => {
        const shift = +c.dataset.ty || 0, from = 60 + (i % 4) * 22;
        const t = clamp((vh - (c.getBoundingClientRect().top - shift)) / (vh * 0.45));
        const ty = (1 - t) * from;
        c.dataset.ty = ty;
        c.style.transform = `translateY(${ty}px) scale(${0.93 + 0.07 * t})`;
        c.style.opacity = clamp(t / 0.85);
      });
    }
    // every page on screen animates in as soon as it peeks up, and resets once it has mostly left
    pages.forEach((p) => { const r = p.getBoundingClientRect(); p.classList.toggle('in-view', r.top < innerHeight * 0.9 && r.bottom > innerHeight * 0.2); });
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

// Smooth, gliding scroll; skipped for reduced motion or if the library did not load
const lenis = !reduceMotion && window.Lenis ? new Lenis({ duration: 1.1, smoothWheel: true }) : null;
if (lenis) {
  const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
  if (document.getElementById('intro')) lenis.stop();   // no scrolling while the welcome screen shows
}

// Hero: the last word is typed out, deleted, and replaced by the next one
const typed = document.getElementById('typed');
if (typed && !reduceMotion) {
  const words = ['software.', 'web apps.', 'SaaS products.', 'mobile apps.', 'AI automation.', 'dashboards.', 'websites.', 'systems.'];
  typed.classList.add('typing');
  (async () => {
    await wait(4200);
    let i = 0;
    for (;;) {
      while (typed.textContent) { typed.textContent = typed.textContent.slice(0, -1); await wait(35); }
      await wait(250);
      for (const ch of words[++i % words.length]) { typed.textContent += ch; await wait(75); }
      await wait(2200);
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

// Opening screen: "Welcome" / "to SOLVIQX" types out, then the screen fades and the hero starts.
const intro = document.getElementById('intro');
if (intro && !reduceMotion) {
  const type = async (el, text) => { for (const ch of text) { el.textContent += ch; await wait(40); } };
  (async () => {
    await wait(250);
    await type(document.getElementById('iw1'), 'Welcome');
    await wait(120);
    await type(document.getElementById('iw2a'), 'to ');
    await type(document.getElementById('iw2b'), 'SOLVIQX');
    await wait(450);
    intro.classList.add('is-open');
    document.documentElement.classList.add('intro-open');
    if (lenis) lenis.start();
    await wait(900);
    intro.remove();
  })();
} else {
  if (intro) intro.remove();
  document.documentElement.classList.add('intro-open');
}

// The scroll hint hops until the visitor scrolls, and starts again when they are back at the top.
const markScrolled = () => document.documentElement.classList.toggle('is-scrolled', window.scrollY > 8);
window.addEventListener('scroll', markScrolled, { passive: true });
markScrolled();

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
    if (lenis) lenis.scrollTo(Math.max(top - 76, 0)); else window.scrollTo({ top: Math.max(top - 76, 0), behavior: reduceMotion ? 'auto' : 'smooth' });
    history.replaceState(null, '', hash);
  });
});
