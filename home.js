// TidBit home page: one phone, turned over by scrolling.
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = matchMedia('(min-width: 900px)');

  const nav = $('#nav');
  const turn = $('.turn');
  const stage = $('#stage');
  const phone = $('#phone');
  const phoneScale = $('#phoneScale');
  const phoneShadow = $('#phoneShadow');
  const demo = $('#demo');
  const refresh = $('#refresh');

  // iPhone 18 Pro at 375px = 71.85mm: 150.01mm tall, R11.81mm corners, 8.75mm thick.
  const PHONE = { w: 375, h: 783, r: 62, depth: 46 };
  const NAV_H = 64;
  // Where the TidBit sits inside the phone, in design pixels. Re-measured once the demo loads.
  let puck = { x: 17.5, y: 263, w: 340, h: 508 };

  const steps = $$('.step').map((el) => ({
    el,
    ry: Number(el.dataset.ry),
    rx: Number(el.dataset.rx),
    focus: Number(el.dataset.focus || 0),
    view: Number(el.dataset.view || 0),
    centre: 0,
  }));

  const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => t * t * (3 - 2 * t);

  /* ---------- Phone edges: an extruded rounded rectangle ---------- */

  function buildEdges() {
    const host = $('#phoneEdges');
    const hw = PHONE.w / 2;
    const hh = PHONE.h / 2;
    const r = PHONE.r;
    const corners = [
      [hw - r, -hh + r, -90],
      [hw - r, hh - r, 0],
      [-hw + r, hh - r, 90],
      [-hw + r, -hh + r, 180],
    ];
    const points = [];
    const arcSteps = 6;
    for (const [cx, cy, start] of corners) {
      for (let i = 0; i <= arcSteps; i++) {
        const a = ((start + (90 * i) / arcSteps) * Math.PI) / 180;
        points.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
      }
    }
    const rgb = (name, fallback) => {
      const hex = getComputedStyle(root).getPropertyValue(name).trim().replace('#', '');
      return hex.length === 6 ? [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) : fallback;
    };
    const dark = rgb('--phone-frame-dark', [108, 125, 149]);
    const light = rgb('--phone-frame-light', [223, 231, 242]);
    const frag = document.createDocumentFragment();
    points.forEach(([x1, y1], i) => {
      const [x2, y2] = points[(i + 1) % points.length];
      const len = Math.hypot(x2 - x1, y2 - y1);
      if (len < 0.01) return;
      const angle = Math.atan2(y2 - y1, x2 - x1);
      // Light comes from the upper left; shade each facet by its outward normal.
      const lit = 0.5 + 0.5 * Math.cos(angle - Math.PI / 2 + (Math.PI * 3) / 4);
      const rgb = dark.map((d, k) => Math.round(lerp(d, light[k], lit)));
      const el = document.createElement('div');
      el.className = 'phone__edge';
      el.style.cssText =
        `width:${len + 1}px;height:${PHONE.depth}px;` +
        `left:${-(len + 1) / 2}px;top:${-PHONE.depth / 2}px;` +
        `background:rgb(${rgb});` +
        `transform:translate3d(${(x1 + x2) / 2}px,${(y1 + y2) / 2}px,0) rotateZ(${angle}rad) rotateX(90deg);`;
      frag.appendChild(el);
    });
    host.appendChild(frag);
  }

  /* ---------- Layout metrics ---------- */

  let scalePhone = 0.4;
  let scalePuck = 0.6;
  let focusLine = 0;
  let stageH = 0;

  function measure() {
    const rect = stage.getBoundingClientRect();
    stageH = rect.height;
    const availH = stageH - NAV_H - 24;
    const availW = rect.width;
    scalePhone = Math.min((availH * 0.94) / PHONE.h, (availW * 0.8) / PHONE.w, 1.02);
    scalePuck = Math.min((availH * 0.96) / puck.h, (availW * 0.86) / puck.w, 1.3);
    scalePuck = Math.max(scalePuck, scalePhone);

    // The line a step has to cross to become the current one.
    focusLine = desktop.matches ? innerHeight / 2 : stageH + (innerHeight - stageH) / 2;

    const scrollY = window.scrollY;
    for (const step of steps) {
      const r = step.el.getBoundingClientRect();
      step.centre = r.top + scrollY + r.height / 2;
    }
    // On phones the hero copy sits right under the stage; treat that as its resting point.
    if (!desktop.matches) steps[0].centre = Math.min(steps[0].centre, focusLine);
  }

  /* ---------- Themes ---------- */

  let lastFlash = 0;

  function setTurnTheme(theme, animate) {
    if (turn.dataset.theme === theme) return;
    turn.dataset.theme = theme;
    if (!animate || reduceMotion) return;
    const now = performance.now();
    if (now - lastFlash < 900) return; // never strobe when someone scrubs back and forth
    lastFlash = now;
    refresh.className = 'refresh';
    void refresh.offsetWidth;
    refresh.classList.add(theme === 'paper' ? 'to-paper' : 'to-ink');
  }

  const themed = $$('main > [data-theme], .footer');

  function syncNav() {
    let theme = 'ink';
    for (const el of themed) {
      const r = el.getBoundingClientRect();
      if (r.top <= NAV_H / 2 && r.bottom > NAV_H / 2) {
        theme = el.dataset.theme;
        break;
      }
    }
    if (root.dataset.theme !== theme) {
      root.dataset.theme = theme;
      $('meta[name="theme-color"]')?.setAttribute('content', theme === 'paper' ? '#e9e7de' : '#1b1510');
    }
    nav.classList.toggle('nav--solid', window.scrollY > 24);
  }

  /* ---------- The demo living on the back of the phone ---------- */

  let demoWin = null;
  let currentView = 0;

  function showView(index) {
    if (index === currentView) return;
    currentView = index;
    try {
      demoWin?.navigateToView?.(index);
      demoWin?.simulateEinkRefresh?.();
    } catch (err) {
      /* the demo is still usable by hand */
    }
  }

  function onDemoReady() {
    try {
      demoWin = demo.contentWindow;
      const el = demo.contentDocument.querySelector('.magsafe-container');
      if (el) {
        const r = el.getBoundingClientRect();
        if (r.width > 100) puck = { x: r.left, y: r.top, w: r.width, h: r.height };
      }
    } catch (err) {
      demoWin = null;
    }
    measure();
    update(false);
  }

  /* ---------- Scroll → pose ---------- */

  let firstUpdate = true;
  let facingFront = false;

  function update(animate = true) {
    const y = window.scrollY + focusLine;
    let i = 0;
    while (i < steps.length - 1 && y >= steps[i + 1].centre) i++;
    const a = steps[i];
    const b = steps[Math.min(i + 1, steps.length - 1)];
    const span = b.centre - a.centre;
    const raw = span > 0 ? clamp((y - a.centre) / span) : 0;
    // Rest on each step, travel between them.
    let t = smooth(clamp((raw - 0.18) / 0.64));
    if (reduceMotion) t = raw < 0.5 ? 0 : 1;

    const ry = lerp(a.ry, b.ry, t);
    const rx = lerp(a.rx, b.rx, t);
    const focus = lerp(a.focus, b.focus, t);
    const scale = lerp(scalePhone, scalePuck, focus);
    const puckOffset = puck.y + puck.h / 2 - PHONE.h / 2;
    const shift = NAV_H / 2 - puckOffset * scale * focus;

    phone.style.setProperty('--ry', ry.toFixed(2));
    phone.style.setProperty('--rx', rx.toFixed(2));
    phoneScale.style.setProperty('--s', scale.toFixed(4));
    phoneScale.style.setProperty('--shift', `${shift.toFixed(1)}px`);
    stage.style.setProperty('--s', scale.toFixed(4));

    const cos = Math.cos((ry * Math.PI) / 180);
    phoneShadow.style.setProperty('--shadow-w', (0.25 + 0.75 * Math.abs(cos)).toFixed(3));
    phoneShadow.style.setProperty('--shadow-o', (ry > 262 ? 1 - focus : 0).toFixed(2));

    phone.classList.toggle('is-flat', focus > 0.01);

    const front = cos < 0;
    if (front !== facingFront) {
      facingFront = front;
      phone.classList.toggle('is-front', front);
      front ? noise.start() : noise.stop();
    }

    // The world becomes paper as the phone passes edge-on on its way round to the back.
    setTurnTheme(ry > 262 ? 'paper' : 'ink', animate && !firstUpdate);

    const current = raw < 0.5 ? a : b;
    showView(current.view);
    syncNav();
    firstUpdate = false;
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      update();
    });
  }

  /* ---------- The front: notifications that never stop ---------- */

  const noise = (() => {
    const stack = $('#lockStack');
    const more = $('#lockMore');
    const lock = $('#lock');
    const counter = $('#noiseCount');
    const feed = [
      ['Chat', '#34c759', 'C', 'Maya: are you seeing this??'],
      ['Mail', '#0a84ff', 'M', 'Your order has shipped'],
      ['Social', '#ff2d55', 'S', '14 people liked your photo'],
      ['News', '#ff453a', 'N', 'Breaking: you will not believe what happened'],
      ['Shop', '#ff9f0a', '%', 'Flash sale ends in 2 hours'],
      ['Video', '#bf5af2', 'V', 'New from a channel you watched once'],
      ['Game', '#30b0c7', 'G', 'Your energy is full! Come back and play'],
      ['Chat', '#34c759', 'C', 'Group chat: 23 new messages'],
      ['Mail', '#0a84ff', 'M', 'Re: Re: Re: quick question'],
      ['Social', '#ff2d55', 'S', 'Someone you may know just joined'],
    ];
    const MAX = 5;
    let count = 0;
    let next = 0;
    let timer = null;

    function push() {
      const [app, colour, glyph, text] = feed[next++ % feed.length];
      const li = document.createElement('li');
      li.className = 'note';
      li.style.setProperty('--c', colour);
      li.innerHTML =
        `<span class="note__icon">${glyph}</span>` +
        `<span><span class="note__top"><span>${app}</span><span>now</span></span>` +
        `<span class="note__text">${text}</span></span>`;
      stack.prepend(li);
      while (stack.children.length > MAX) stack.lastElementChild.remove();
      count++;
      counter.textContent = count;
      more.textContent = count > MAX ? `+${count - MAX} more` : '';
      if (!reduceMotion) {
        lock.classList.remove('is-buzzing');
        void lock.offsetWidth;
        lock.classList.add('is-buzzing');
      }
    }

    return {
      start() {
        if (timer) return;
        push();
        timer = setInterval(() => {
          if (!document.hidden) push();
        }, 1150);
      },
      stop() {
        clearInterval(timer);
        timer = null;
      },
    };
  })();

  function tickClock() {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M$/i, '');
    const date = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
    $$('[data-clock]').forEach((el) => (el.textContent = time));
    $$('[data-date]').forEach((el) => (el.textContent = date));
  }

  /* ---------- Sign-up (concept demo: nothing is sent anywhere) ---------- */

  function wireSignup() {
    const form = $('#signup');
    const input = $('#email');
    const note = $('#signupNote');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      note.classList.remove('is-done', 'is-error');
      if (!input.value.trim() || !input.checkValidity()) {
        note.textContent = 'That email address doesn’t look complete. Check it and try again.';
        note.classList.add('is-error');
        input.focus();
        return;
      }
      note.textContent =
        'Thanks for your interest. TidBit is a concept demonstration, so the waitlist isn’t open yet and your email wasn’t saved.';
      note.classList.add('is-done');
      input.value = '';
    });

    $$('[data-focus-email]').forEach((link) =>
      link.addEventListener('click', () => {
        setTimeout(() => input.focus({ preventScroll: true }), reduceMotion ? 0 : 700);
      })
    );
  }

  /* ---------- Snap, Pair, Glance: one by one ---------- */

  function wireHowItWorks() {
    const how = $('.how');
    if (!how || reduceMotion || !('IntersectionObserver' in window)) return;
    const steps = $$('.how__step', how);
    steps.forEach((step) => {
      $$('.how__art > *', step).forEach((el, i) => {
        el.style.setProperty('--i', i);
        if (!el.classList.contains('dash') && el.getTotalLength) {
          el.style.setProperty('--len', (el.getTotalLength() + 1).toFixed(1));
        }
      });
    });
    how.classList.add('how--ready');

    // Steps that come into view together play in order; on a phone, where
    // they are stacked, each plays as it is reached.
    const io = new IntersectionObserver(
      (entries) => {
        const arriving = entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target)
          .sort((a, b) => steps.indexOf(a) - steps.indexOf(b));
        arriving.forEach((step, k) => {
          step.style.setProperty('--delay', k * 0.9 + 's');
          step.classList.add('is-play');
          io.unobserve(step);
        });
      },
      { threshold: 0.45 }
    );
    steps.forEach((step) => io.observe(step));
  }

  /* ---------- Dimensional drawing: drawn in, line by line ----------
     Outlines trace themselves in document order (front, side, back, notes);
     fills, dimensions and lettering follow just behind the pen. */

  function wireDrawing() {
    const fig = $('.drawing');
    const svg = $('.drawing__svg');
    if (!fig || !svg || reduceMotion || !('IntersectionObserver' in window)) return;
    const items = [...svg.children].filter((el) => !/^(defs|title|desc)$/.test(el.tagName));
    items.forEach((el, k) => {
      const t = k * 0.018;
      const drawn = el.matches('.dw-line, .dw-thin') && el.getTotalLength && !el.matches('.dw-sheet:not(.dw-line)');
      el.dataset.k = drawn ? 'draw' : 'fade';
      if (drawn) el.style.setProperty('--len', (el.getTotalLength() + 1).toFixed(1));
      el.style.setProperty('--d', t.toFixed(3) + 's');
      el.style.setProperty('--df', (t + (drawn ? 0.55 : 0.35)).toFixed(3) + 's');
    });
    fig.classList.add('drawing--ready');
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      fig.classList.add('is-play');
      io.disconnect();
    }, { threshold: 0.3 });
    io.observe(fig);
  }

  /* ---------- A day with TidBit ----------
     The step at the middle of the screen picks the picture. On phones the
     section is one sticky scene, so progress through it picks instead. */

  function wireDay() {
    const day = $('.day');
    if (!day) return;
    const steps = $$('.day__step', day);
    const views = $$('.tb__view', day);
    const ticks = $$('.day__rail span', day);
    const tb = $('.tb', day);
    const clock = $('.tb__clock', day);
    const phone = matchMedia('(max-width: 799px)');
    let current = 0;
    let swapTimer = 0;
    let queued = false;

    day.classList.add('day--ready');

    function draw(i) {
      views.forEach((v, k) => v.classList.toggle('is-on', k === i));
      clock.textContent = steps[i].dataset.time;
    }

    function show(i) {
      if (i === current) return;
      current = i;
      steps.forEach((s, k) => s.classList.toggle('is-on', k === i));
      ticks.forEach((t, k) => t.classList.toggle('is-on', k === i));
      clearTimeout(swapTimer);
      if (reduceMotion) return draw(i);
      tb.classList.remove('is-refreshing');
      void tb.offsetWidth; // restart the flash
      tb.classList.add('is-refreshing');
      swapTimer = setTimeout(() => draw(current), 115); // on the white frame
    }

    function pick() {
      queued = false;
      let i = 0;
      if (phone.matches) {
        const r = day.getBoundingClientRect();
        const p = -r.top / Math.max(1, r.height - innerHeight);
        i = Math.min(steps.length - 1, Math.max(0, Math.floor(p * steps.length)));
      } else {
        const mid = innerHeight / 2;
        steps.forEach((s, k) => { if (s.getBoundingClientRect().top < mid) i = k; });
      }
      show(i);
    }

    tb.addEventListener('animationend', () => tb.classList.remove('is-refreshing'));
    addEventListener('scroll', () => {
      if (!queued) { queued = true; requestAnimationFrame(pick); }
    }, { passive: true });
    addEventListener('resize', pick);
    pick();
  }

  /* ---------- Go ---------- */

  buildEdges();
  tickClock();
  setInterval(tickClock, 20000);
  wireSignup();
  wireHowItWorks();
  wireDay();
  wireDrawing();

  demo.addEventListener('load', onDemoReady);
  if (demo.contentDocument?.readyState === 'complete') onDemoReady();

  measure();
  update(false);
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => {
    measure();
    update(false);
  });
  document.fonts?.ready.then(() => {
    measure();
    update(false);
  });
})();
