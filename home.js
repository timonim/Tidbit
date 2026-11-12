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
  // The TidBit's corner radius and its 6.4mm depth, in design pixels (match home.css).
  const TB_R = 48;
  const TB_DEPTH = 33;

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
    // Long straight sides go in a few pieces, so Chrome sorts them cleanly against
    // the TidBit standing on the back; few planes keeps the turn smooth.
    const segs = [];
    points.forEach(([x1, y1], i) => {
      const [x2, y2] = points[(i + 1) % points.length];
      const n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 240));
      for (let s = 0; s < n; s++) {
        segs.push([x1 + ((x2 - x1) * s) / n, y1 + ((y2 - y1) * s) / n, x1 + ((x2 - x1) * (s + 1)) / n, y1 + ((y2 - y1) * (s + 1)) / n]);
      }
    });
    segs.forEach(([x1, y1, x2, y2]) => {
      const len = Math.hypot(x2 - x1, y2 - y1);
      if (len < 0.01) return;
      const angle = Math.atan2(y2 - y1, x2 - x1);
      // Light comes from the upper left; shade each facet by its outward normal.
      const lit = 0.5 + 0.5 * Math.cos(angle - Math.PI / 2 + (Math.PI * 3) / 4);
      const rgb = dark.map((d, k) => Math.round(lerp(d, light[k], lit)));
      const el = document.createElement('div');
      el.className = 'phone__edge';
      el.style.cssText =
        // A hair short of the faces, so Chrome never has to sort a strip against them.
        `width:${len + 1}px;height:${PHONE.depth - 1.5}px;` +
        `left:${-(len + 1) / 2}px;top:${-(PHONE.depth - 1.5) / 2}px;` +
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
      $('meta[name="theme-color"]')?.setAttribute('content', ({ paper: '#ebe6de', sky: '#c9dde3', sand: '#e6dfd6' })[theme] || '#1e1613');
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

  // The TidBit's 6.4mm side: slices from the glass up to the face, then a chamfer.
  // The TidBit's 6.4mm side: a ring of strips around its outline, each shaded by
  // which way it faces, dark at the glass and catching light at a polished chamfer.
  // A ring is a few dozen thin planes, so the turn stays smooth.
  function buildTbSide() {
    const host = $('#phoneTbSide');
    if (!host) return;
    host.textContent = '';
    const { w, h } = puck;
    const r = Math.min(TB_R, w / 2, h / 2);
    const d = TB_DEPTH;
    const corners = [
      [w - r, r, -90],
      [w - r, h - r, 0],
      [r, h - r, 90],
      [r, r, 180],
    ];
    const points = [];
    for (const [cx, cy, start] of corners) {
      for (let i = 0; i <= 5; i++) {
        const a = ((start + (90 * i) / 5) * Math.PI) / 180;
        points.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
      }
    }
    const frag = document.createDocumentFragment();
    points.forEach(([x1, y1], i) => {
      const [x2, y2] = points[(i + 1) % points.length];
      const len = Math.hypot(x2 - x1, y2 - y1);
      if (len < 0.01) return;
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const lit = 0.5 + 0.5 * Math.cos(angle - Math.PI / 2 + (Math.PI * 3) / 4);
      const el = document.createElement('div');
      el.className = 'phone__tbstrip';
      el.style.cssText =
        `width:${len + 1}px;height:${d}px;left:${-(len + 1) / 2}px;top:${-d / 2}px;` +
        `--lit:${lit.toFixed(3)};` +
        `transform:translate3d(${(x1 + x2) / 2}px,${(y1 + y2) / 2}px,${d / 2}px) rotateZ(${angle}rad) rotateX(90deg);`;
      frag.appendChild(el);
    });
    host.appendChild(frag);
  }

  function placeTb() {
    phone.style.setProperty('--tb-x', puck.x + 'px');
    phone.style.setProperty('--tb-y', puck.y + 'px');
    phone.style.setProperty('--tb-w', puck.w + 'px');
    phone.style.setProperty('--tb-h', puck.h + 'px');
    buildTbSide();
  }

  // Swap the screen's poster for the live screen with an e-paper refresh; during the
  // entrance, wait until the phone has landed so the flash is seen.
  let tbAwake = false;
  function wakeTb() {
    if (tbAwake) return;
    tbAwake = true;
    const face = $('.phone__tbface');
    if (reduceMotion) { face.classList.add('is-live'); return; }
    const wait = root.classList.contains('intro') ? Math.max(0, 1700 - performance.now()) : 0;
    setTimeout(() => {
      face.classList.add('is-refresh');
      setTimeout(() => face.classList.add('is-live'), 110);
    }, wait);
  }

  function onDemoReady() {
    try {
      demoWin = demo.contentWindow;
      const el = demo.contentDocument.querySelector('.magsafe-container');
      if (el) {
        const r = el.getBoundingClientRect();
        // Measured in the demo's own page, which is the phone's back at design size.
        if (r.width > 100) puck = { x: r.left, y: r.top, w: r.width, h: r.height };
        placeTb();
        wakeTb();
      }
    } catch (err) {
      demoWin = null;
      wakeTb();
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
      $$('.how__art .draw', step).forEach((el, i) => {
        el.style.setProperty('--i', i);
        if (el.getTotalLength) el.style.setProperty('--len', (el.getTotalLength() + 1).toFixed(1));
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

  /* ---------- A calm field behind the phone ----------
     Raked-sand lines around the phone, like a stone in a Zen garden, that
     widen and settle once every ten seconds: a slow breath. */

  function wireCalmField() {
    const canvas = document.createElement('canvas');
    canvas.className = 'stage__field';
    canvas.setAttribute('aria-hidden', 'true');
    const field = $('.turn__field');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const BREATH = 10000; // ms for one in-and-out
    let W = 0;
    let H = 0;
    let visible = true;
    let last = 0;
    let calm = 1; // eases to a low value while the phone's noisy front faces you
    let held = 0; // the breath, frozen where it was when the calm left

    // Wide screens: behind the whole first screen. Phones: inside the stage at the top.
    let host = null;
    function size() {
      const want = desktop.matches && field ? field : stage;
      if (host !== want) { host = want; host.prepend(canvas); }
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = host.clientWidth;
      H = host.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function ring(x, y, w, h, r) {
      r = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
      ctx.stroke();
    }

    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      const s = canvas.getBoundingClientRect();
      const p = phone.getBoundingClientRect();
      const cx = p.left + p.width / 2 - s.left;
      const cy = p.top + p.height / 2 - s.top;
      const ink = turn.dataset.theme === 'ink';

      // 0 → 1 → 0 over one breath, eased like air in and out. It holds while
      // the phone shows its front, and the lines fade back.
      calm += ((phone.classList.contains('is-front') ? 0.3 : 1) - calm) * 0.08;
      const live = reduceMotion ? 0.5 : (1 - Math.cos((t / BREATH) * Math.PI * 2)) / 2;
      if (calm > 0.95) held = live;
      const breath = calm > 0.95 ? live : held;
      const hw = p.width / 2;
      const hh = p.height / 2;
      const gap = 30 + breath * 6;
      ctx.lineWidth = 1;
      const rgb = ink ? '242, 235, 228' : '36, 27, 23';
      const peak = ink ? 0.08 : 0.065;
      const reach = Math.max(W, H) * 0.75; // fades out before it reaches the words
      for (let off = 26 + breath * 12; off < reach; off += gap) {
        const a = peak * calm * Math.pow(1 - off / reach, 1.6);
        if (a < 0.004) break;
        ctx.strokeStyle = `rgba(${rgb}, ${a.toFixed(3)})`;
        ring(cx - hw - off, cy - hh - off, (hw + off) * 2, (hh + off) * 2, Math.min(hw, hh) * 0.35 + off * 0.9);
      }
    }

    function frame(t) {
      requestAnimationFrame(frame);
      if (!visible || document.hidden || t - last < 33) return; // ~30fps is plenty for a breath
      last = t;
      draw(t);
    }

    size();
    addEventListener('resize', size);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(turn);
    }
    if (reduceMotion) {
      // Still, but kept in step with the phone as it turns.
      const still = () => { if (visible) draw(0); };
      addEventListener('scroll', () => requestAnimationFrame(still), { passive: true });
      addEventListener('resize', still);
      still();
    } else {
      requestAnimationFrame(frame);
    }
  }

  /* ---------- Held: choose who gets through ----------
     Each source is a switch. The screen redraws the way the panel would:
     a short flash, then the new picture, holding still after. */

  function flashTb(tb, swap) {
    if (reduceMotion) { swap(); return; }
    tb.classList.remove('is-refreshing');
    void tb.offsetWidth;
    tb.classList.add('is-refreshing');
    setTimeout(swap, 115);
  }

  function wireHeld() {
    const bins = $('#heldList');
    if (!bins) return;
    const sec = bins.closest('section');
    const tb = $('.tb', sec);
    const lists = { true: $('[data-bin="true"]', bins), false: $('[data-bin="false"]', bins) };
    const num = $('[data-held="num"]', sec);
    const notes = $('[data-held="list"]', sec);
    const count = $('[data-held="count"]', sec);
    const nThrough = $('[data-held="n-through"]', sec);
    const nHeld = $('[data-held="n-held"]', sec);
    const badge = $('.tb__nav b', sec);
    const chips = $$('.chip', bins);
    const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    const on = (c) => c.getAttribute('aria-pressed') === 'true';

    function render() {
      const through = chips.filter(on).sort((a, b) => a.dataset.i - b.dataset.i);
      const held = chips.filter((c) => !on(c)).reduce((n, c) => n + Number(c.dataset.count), 0);
      num.textContent = String(through.length).padStart(2, '0');
      nThrough.textContent = through.length;
      nHeld.textContent = held;
      badge.textContent = through.length;
      badge.hidden = !through.length;
      notes.innerHTML = through.length
        ? through.slice(0, 3).map((c) => `<div class="tb__note"><i class="fas ${esc(c.dataset.icon)}"></i><span>${esc(c.dataset.name)}: ${esc(c.dataset.msg)}<small>${esc(c.dataset.ago)}</small></span></div>`).join('')
          + (through.length > 3 ? `<p class="tb__empty">+${through.length - 3} more from people you chose</p>` : '')
        : '<p class="tb__empty">Nothing gets through. Enjoy the quiet.</p>';
      count.textContent = held ? `${held} more held for later` : 'Nothing held. Everything gets through.';
    }

    chips.forEach((c) => c.addEventListener('click', () => {
      const to = !on(c);
      c.setAttribute('aria-pressed', String(to));
      const list = lists[to];
      const li = c.parentElement;
      const after = [...list.children].find((x) => Number($('.chip', x).dataset.i) > Number(c.dataset.i));
      list.insertBefore(li, after || null);
      c.classList.remove('is-new');
      void c.offsetWidth;
      c.classList.add('is-new');
      c.focus();
      flashTb(tb, render);
    }));
    render();
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

  /* ---------- A day with TidBit, as a dial ----------
     Tap a moment on the ring, or use the arrows. The sun travels round to it,
     the lit arc follows, and the TidBit redraws. The first time the dial comes
     into view the day plays through once on its own, until you touch it. */

  function wireDay() {
    const day = $('.day');
    if (!day) return;
    const steps = $$('.day__step', day);
    const marks = $$('.dial__mark', day);
    const views = $$('.tb__view', day);
    const tb = $('.tb', day);
    const clock = $('.tb__clock', day);
    const nav = $('.tb__nav', day);
    const sun = $('.dial__sun', day);
    const sunIcon = $('.dial__sun i', day);
    const lit = $('.dial__lit', day);
    let current = 0;
    let swapTimer = 0;
    let angle = 0;

    // The 6.4mm side, as stacked slices under the face, plus a polished chamfer.
    const shot = $('.tb3d', day);
    const SLICES = 16;
    const layers = document.createDocumentFragment();
    for (let k = 0; k <= SLICES; k++) {
      const el = document.createElement('div');
      el.className = 'tb__layer' + (k === SLICES ? ' tb__layer--chamfer' : '');
      el.style.setProperty('--k', k === SLICES ? SLICES - 0.25 : k);
      el.style.setProperty('--t', (k / SLICES).toFixed(3));
      layers.appendChild(el);
    }
    shot.insertBefore(layers, tb);
    // Each moment turns the device a touch, like picking it up through the day.
    const TILTS = [[16, 22], [12, 14], [18, 8], [12, 18], [20, 26]];
    const tilt = (i) => {
      shot.style.setProperty('--tilt-x', TILTS[i][0] + 'deg');
      shot.style.setProperty('--tilt-y', TILTS[i][1] + 'deg');
    };

    // Hours to degrees round the dial, from midnight at the bottom, clockwise.
    const deg = (i) => {
      const [h, m] = steps[i].dataset.time.split(':').map(Number);
      return ((h + m / 60) / 24) * 360;
    };
    const FIRST = deg(0);

    function place(i, dir) {
      // Turn the short way round, or always forward/back when stepping.
      const base = deg(i);
      let target = base + 360 * Math.round((angle - base) / 360);
      if (dir > 0 && target <= angle) target += 360;
      if (dir < 0 && target >= angle) target -= 360;
      if (!dir && Math.abs(target - angle) > 180) target += target < angle ? 360 : -360;
      angle = target;
      sun.style.setProperty('--a', angle + 'deg');
      sunIcon.className = 'fas ' + (steps[i].dataset.tab === 'none' ? 'fa-moon' : 'fa-sun');
      const reach = Math.max(0, base - FIRST);
      lit.style.strokeDasharray = `${reach} 360`;
      lit.style.strokeDashoffset = String(-FIRST);
    }

    function draw(i) {
      views.forEach((v, k) => v.classList.toggle('is-on', k === i));
      clock.textContent = steps[i].dataset.screenTime || steps[i].dataset.time;
      if (nav) nav.dataset.tab = steps[i].dataset.tab;
      tb.classList.toggle('is-night', steps[i].dataset.tab === 'none');
    }

    function show(i, dir = 0) {
      if (i === current) return;
      current = i;
      steps.forEach((s, k) => s.classList.toggle('is-on', k === i));
      marks.forEach((m, k) => {
        m.setAttribute('aria-pressed', String(k === i));
        m.tabIndex = k === i ? 0 : -1;
      });
      tilt(i);
      place(i, dir);
      clearTimeout(swapTimer);
      if (reduceMotion) return draw(i);
      tb.classList.remove('is-refreshing');
      void tb.offsetWidth; // restart the flash
      tb.classList.add('is-refreshing');
      swapTimer = setTimeout(() => draw(current), 115); // on the white frame
    }

    // Plays the day once, then hands it over.
    let playing = 0;
    const stop = () => { clearInterval(playing); playing = 0; };
    function play() {
      if (reduceMotion) return;
      playing = setInterval(() => {
        if (current >= steps.length - 1) return stop();
        show(current + 1, 1);
      }, 2600);
    }

    const go = (d) => show((current + d + steps.length) % steps.length, d);
    marks.forEach((m, k) => {
      m.addEventListener('click', () => { stop(); show(k); });
      m.addEventListener('keydown', (e) => {
        const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        stop();
        go(d);
        marks[current].focus();
      });
    });
    $$('.day__btn', day).forEach((b) => b.addEventListener('click', () => { stop(); go(Number(b.dataset.go)); }));
    day.addEventListener('pointerdown', stop);

    tb.addEventListener('animationend', () => tb.classList.remove('is-refreshing'));
    day.classList.add('day--ready');
    tilt(0);
    angle = FIRST;
    place(0, 0);
    marks.forEach((m, k) => { m.tabIndex = k === 0 ? 0 : -1; });

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        setTimeout(() => { if (current === 0) play(); }, 1400);
      }, { threshold: 0.55 });
      io.observe($('.dial', day));
    }
  }

  /* ---------- Go ---------- */

  // The scrollbar's width, so full-bleed parts line up with the centred column.
  const sbw = () => root.style.setProperty('--sbw', (innerWidth - document.documentElement.clientWidth) + 'px');
  sbw();
  addEventListener('resize', sbw);

  buildEdges();
  buildTbSide();
  tickClock();
  setInterval(tickClock, 20000);
  wireSignup();
  wireHowItWorks();
  wireDay();
  wireHeld();
  wireDrawing();
  wireCalmField();

  // The entrance runs on CSS alone; take the class off once it has played, so
  // nothing of it lingers (a hash link or a reload mid-page skips it in the head).
  if (root.classList.contains('intro')) {
    if (scrollY > 40) root.classList.remove('intro');
    else setTimeout(() => root.classList.remove('intro'), 3000);
  }

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
