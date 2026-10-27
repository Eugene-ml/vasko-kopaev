// Memes for the temple of Vasko: six meme slots, timed pop-ins and the credits list.
// Owner: memes agent. Writes only into .meme-slot divs and #meme-popups.
(function () {
  'use strict';

  const IMG = 'img/memes/';
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- helpers ----------
  function el(tag, cls, html) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (html != null) node.innerHTML = html;
    return node;
  }

  function onVisible(node, callback, threshold) {
    if (!('IntersectionObserver' in window)) { callback(); return; }
    const io = new IntersectionObserver(function (entries) {
      for (const entry of entries) {
        if (entry.isIntersecting) { io.disconnect(); callback(); return; }
      }
    }, { threshold: threshold || 0.4 });
    io.observe(node);
  }

  function celebrate(event) {
    if (typeof window.templeCelebrate === 'function' && event) {
      try { window.templeCelebrate(event.clientX, event.clientY); } catch (e) { /* not ours */ }
    }
  }

  // One AudioContext for the whole page, created on the first click.
  let audioCtx = null;
  function getAudio() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  let noiseBuf = null;
  function getNoise(ctx) {
    if (noiseBuf) return noiseBuf;
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return noiseBuf;
  }

  function distortionCurve(amount) {
    const n = 1024;
    const curve = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = (i * 2) / n - 1;
      curve[i] = ((3 + amount) * x * 20 * (Math.PI / 180)) / (Math.PI + amount * Math.abs(x));
    }
    return curve;
  }

  // The "vine boom": a deep sine drop with a distorted click on top.
  function vineBoom() {
    const ctx = getAudio();
    if (!ctx) return;
    const t = ctx.currentTime + 0.01;
    const out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(0.45, t + 0.01);
    out.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    const shaper = ctx.createWaveShaper();
    shaper.curve = distortionCurve(40);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 900;
    shaper.connect(lp).connect(out).connect(ctx.destination);
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(42, t + 0.5);
    const sub = ctx.createOscillator();
    sub.type = 'triangle';
    sub.frequency.setValueAtTime(80, t);
    sub.frequency.exponentialRampToValueAtTime(30, t + 0.6);
    osc.connect(shaper);
    sub.connect(shaper);
    osc.start(t); sub.start(t);
    osc.stop(t + 1.2); sub.stop(t + 1.2);
    const click = ctx.createBufferSource();
    click.buffer = getNoise(ctx);
    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.5, t);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    click.connect(clickGain).connect(lp);
    click.start(t); click.stop(t + 0.06);
  }

  // A short stadium roar: band-passed noise that swells and fades.
  function crowdRoar() {
    const ctx = getAudio();
    if (!ctx) return;
    const t = ctx.currentTime + 0.01;
    const src = ctx.createBufferSource();
    src.buffer = getNoise(ctx);
    src.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 0.8;
    bp.frequency.setValueAtTime(500, t);
    bp.frequency.linearRampToValueAtTime(1100, t + 0.5);
    bp.frequency.linearRampToValueAtTime(700, t + 2);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.2, t + 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
    src.connect(bp).connect(g).connect(ctx.destination);
    src.start(t); src.stop(t + 2.3);
  }

  // ---------- slot 1: Ronaldo SIUUU ----------
  function buildSiu(slot) {
    const wrap = el('div', 'm-wrap');
    wrap.innerHTML =
      '<p class="m-kicker">Реликвия №1 · Спортивное чудо</p>' +
      '<figure class="m-relic" style="margin:1.2rem auto 0">' +
      '  <div class="m-img-box" role="button" tabindex="0" aria-label="Повторить SIUUU">' +
      '    <img src="' + IMG + 'ronaldo-siuuu.jpg" loading="lazy" decoding="async" width="640" height="569" alt="Криштиану Роналду в прыжке празднует гол">' +
      '    <span class="m-impact m-cap m-cap-top">Роналду, узнав,</span>' +
      '    <span class="m-impact m-cap m-cap-bottom">что Васко сдал домашку</span>' +
      '    <div class="m-siu-burst" aria-hidden="true"></div>' +
      '  </div>' +
      '  <figcaption class="m-plaque">Даже легенды празднуют, когда Васко скидывает домашку</figcaption>' +
      '</figure>' +
      '<div class="m-btn-row"><button type="button" class="m-btn">⚽ SIUUU ещё раз</button></div>';
    slot.appendChild(wrap);

    const box = wrap.querySelector('.m-img-box');
    const burst = wrap.querySelector('.m-siu-burst');
    const relic = wrap.querySelector('.m-relic');
    let timer = 0;

    function explode(withSound) {
      burst.innerHTML = '';
      const word = 'SIUUUUU!';
      for (let i = 0; i < word.length; i++) {
        const s = el('span', 'm-siu-letter', word[i]);
        s.style.setProperty('--i', String(i));
        burst.appendChild(s);
      }
      if (!reduceMotion) {
        burst.appendChild(el('span', 'm-siu-ring'));
        relic.classList.remove('m-siu-flash');
        void relic.offsetWidth;
        relic.classList.add('m-siu-flash');
      }
      if (withSound) crowdRoar();
      clearTimeout(timer);
      timer = setTimeout(function () { burst.innerHTML = ''; }, 2900);
    }

    function onClick(event) { explode(true); celebrate(event); }
    box.addEventListener('click', onClick);
    box.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); explode(true); } });
    wrap.querySelector('.m-btn').addEventListener('click', onClick);
    onVisible(box, function () { explode(false); }, 0.6);
  }

  // ---------- slot 2: the Rock's eyebrow ----------
  function buildRock(slot) {
    const wrap = el('div', 'm-wrap');
    wrap.innerHTML =
      '<div class="m-break">' +
      '  <p class="m-break-text"><b>Препод:</b> «Ну и кто сделал домашку по научной студии?»<br>' +
      '  <b>Вся группа:</b> *молча поворачивается к Васко*<br><b>Скала, наблюдая за этим:</b></p>' +
      '  <div class="m-img-box" role="button" tabindex="0" aria-label="Приблизить бровь (со звуком)">' +
      '    <img class="m-rock-img" src="' + IMG + 'rock-eyebrow.jpg" loading="lazy" decoding="async" width="600" height="775" alt="Дуэйн «Скала» Джонсон с поднятой бровью">' +
      '    <div class="m-vignette"></div>' +
      '    <span class="m-eyebrow-emoji" aria-hidden="true">🤨</span>' +
      '    <span class="m-hint">🔊 нажми на бровь</span>' +
      '  </div>' +
      '  <div class="m-break-foot">реакция одобрена Советом бровей</div>' +
      '</div>';
    slot.appendChild(wrap);

    const box = wrap.querySelector('.m-img-box');
    const card = wrap.querySelector('.m-break');
    function toggle() {
      const zoomed = card.classList.toggle('m-rock-zoom');
      if (zoomed) vineBoom();
    }
    box.addEventListener('click', toggle);
    box.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  }

  // ---------- slot 3: hippo rave with a synthesized dubstep loop ----------
  const HIPPO_SVG =
    '<svg class="m-hippo-svg" viewBox="0 0 320 300" role="img" aria-label="Бегемот в тёмных очках и наушниках танцует под дабстеп">' +
    '<defs>' +
    '  <linearGradient id="m-lens" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a0b4a"/><stop offset=".55" stop-color="#0b0b12"/><stop offset="1" stop-color="#0d4f5c"/></linearGradient>' +
    '</defs>' +
    '<ellipse class="m-shadow" cx="160" cy="288" rx="90" ry="10" fill="#000" opacity=".45"/>' +
    '<g class="m-hippo">' +
    '  <rect x="112" y="238" width="38" height="48" rx="16" fill="#8f84b8"/>' +
    '  <rect x="170" y="238" width="38" height="48" rx="16" fill="#8f84b8"/>' +
    '  <ellipse cx="122" cy="282" rx="5" ry="3" fill="#d9d2ee"/><ellipse cx="139" cy="282" rx="5" ry="3" fill="#d9d2ee"/>' +
    '  <ellipse cx="181" cy="282" rx="5" ry="3" fill="#d9d2ee"/><ellipse cx="198" cy="282" rx="5" ry="3" fill="#d9d2ee"/>' +
    '  <ellipse cx="160" cy="200" rx="86" ry="70" fill="#8f84b8"/>' +
    '  <ellipse cx="160" cy="214" rx="56" ry="46" fill="#b9b0d8"/>' +
    '  <g class="m-arm-l">' +
    '    <line x1="98" y1="168" x2="56" y2="118" stroke="#8f84b8" stroke-width="28" stroke-linecap="round"/>' +
    '    <circle cx="52" cy="112" r="16" fill="#9f95c6"/>' +
    '  </g>' +
    '  <g class="m-arm-r">' +
    '    <line x1="222" y1="168" x2="264" y2="118" stroke="#8f84b8" stroke-width="28" stroke-linecap="round"/>' +
    '    <rect class="m-glowstick" x="262" y="70" width="9" height="48" rx="4" fill="#7dff6a" transform="rotate(18 266 100)"/>' +
    '    <circle cx="268" cy="112" r="16" fill="#9f95c6"/>' +
    '  </g>' +
    '  <path d="M112 150 Q160 200 208 150" fill="none" stroke="#f5c542" stroke-width="5" stroke-linecap="round"/>' +
    '  <circle cx="160" cy="176" r="14" fill="#f5c542" stroke="#8a6414" stroke-width="2"/>' +
    '  <text x="160" y="182" text-anchor="middle" font-family="Russo One, Arial, sans-serif" font-size="16" fill="#5a3a06">В</text>' +
    '  <g class="m-head">' +
    '    <ellipse cx="108" cy="44" rx="13" ry="17" fill="#8f84b8"/><ellipse cx="108" cy="46" rx="6" ry="9" fill="#e7a3c0"/>' +
    '    <ellipse cx="212" cy="44" rx="13" ry="17" fill="#8f84b8"/><ellipse cx="212" cy="46" rx="6" ry="9" fill="#e7a3c0"/>' +
    '    <ellipse cx="160" cy="84" rx="70" ry="54" fill="#8f84b8"/>' +
    '    <ellipse cx="160" cy="124" rx="80" ry="42" fill="#a99fd0"/>' +
    '    <ellipse cx="136" cy="110" rx="7" ry="4.5" fill="#4b3f6b"/><ellipse cx="184" cy="110" rx="7" ry="4.5" fill="#4b3f6b"/>' +
    '    <circle cx="108" cy="132" r="10" fill="#ff8fb8" opacity=".45"/><circle cx="212" cy="132" r="10" fill="#ff8fb8" opacity=".45"/>' +
    '    <path d="M118 138 Q160 166 202 138" fill="#5a2340" stroke="#4b3f6b" stroke-width="4" stroke-linecap="round"/>' +
    '    <rect x="140" y="140" width="11" height="10" rx="2" fill="#fff"/><rect x="169" y="140" width="11" height="10" rx="2" fill="#fff"/>' +
    '    <path d="M92 76 Q160 -6 228 76" fill="none" stroke="#1b1b22" stroke-width="10" stroke-linecap="round"/>' +
    '    <rect x="78" y="60" width="24" height="42" rx="9" fill="#e0245e" stroke="#ff7fb0" stroke-width="2"/>' +
    '    <rect x="218" y="60" width="24" height="42" rx="9" fill="#e0245e" stroke="#ff7fb0" stroke-width="2"/>' +
    '    <rect x="104" y="64" width="50" height="26" rx="6" fill="url(#m-lens)" stroke="#000" stroke-width="3"/>' +
    '    <rect x="166" y="64" width="50" height="26" rx="6" fill="url(#m-lens)" stroke="#000" stroke-width="3"/>' +
    '    <rect x="150" y="69" width="20" height="6" fill="#000"/>' +
    '    <g class="m-shades-shine" fill="#fff"><rect x="112" y="68" width="14" height="4" rx="2"/><rect x="174" y="68" width="14" height="4" rx="2"/></g>' +
    '  </g>' +
    '</g>' +
    '</svg>';

  // A tiny step sequencer for the wobble-bass loop at 140 BPM.
  function makeDubstep(onKick, onSnare, onWub) {
    const BPM = 140;
    const STEP = 60 / BPM / 4; // one sixteenth note
    // Wobbles per second for each half bar: quarter, eighth, triplet, half, eighth, sixteenth, quarter, triplet.
    const BEAT_HZ = BPM / 60;
    const RATES = [BEAT_HZ, BEAT_HZ * 2, BEAT_HZ * 3, BEAT_HZ / 2, BEAT_HZ * 2, BEAT_HZ * 4, BEAT_HZ, BEAT_HZ * 3];
    // Bass notes (Hz) for each half bar: F1, F1, Ab1, Eb1, F1, C2, Db2, C2.
    const NOTES = [43.65, 43.65, 51.91, 38.89, 43.65, 65.41, 69.3, 65.41];
    const BUILD_STEPS = 16; // one bar of build-up before the drop
    const LOOP_STEPS = 64; // four bars

    let ctx = null;
    let master = null;
    let timer = 0;
    let step = 0;
    let nextTime = 0;
    const visualTimers = [];

    function at(time, fn) {
      const delay = Math.max(0, (time - ctx.currentTime) * 1000);
      visualTimers.push(setTimeout(fn, delay));
      if (visualTimers.length > 64) visualTimers.shift();
    }

    function kick(t) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.setValueAtTime(150, t);
      o.frequency.exponentialRampToValueAtTime(42, t + 0.14);
      g.gain.setValueAtTime(1, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
      o.connect(g).connect(master);
      o.start(t); o.stop(t + 0.4);
    }

    function snare(t, vol) {
      const n = ctx.createBufferSource();
      n.buffer = getNoise(ctx);
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 1400;
      const g = ctx.createGain();
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      n.connect(hp).connect(g).connect(master);
      n.start(t); n.stop(t + 0.25);
      const body = ctx.createOscillator();
      body.type = 'triangle';
      body.frequency.setValueAtTime(220, t);
      body.frequency.exponentialRampToValueAtTime(140, t + 0.1);
      const bg = ctx.createGain();
      bg.gain.setValueAtTime(vol * 0.6, t);
      bg.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      body.connect(bg).connect(master);
      body.start(t); body.stop(t + 0.13);
    }

    function hat(t) {
      const n = ctx.createBufferSource();
      n.buffer = getNoise(ctx);
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 7500;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.12, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      n.connect(hp).connect(g).connect(master);
      n.start(t); n.stop(t + 0.06);
    }

    function riser(t) {
      const n = ctx.createBufferSource();
      n.buffer = getNoise(ctx);
      n.loop = true;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.Q.value = 3;
      bp.frequency.setValueAtTime(300, t);
      bp.frequency.exponentialRampToValueAtTime(6000, t + STEP * 16);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.02, t);
      g.gain.exponentialRampToValueAtTime(0.25, t + STEP * 16);
      g.gain.exponentialRampToValueAtTime(0.001, t + STEP * 16 + 0.05);
      n.connect(bp).connect(g).connect(master);
      n.start(t); n.stop(t + STEP * 16 + 0.06);
    }

    // One half bar of wobble bass: detuned saws and a sub through a resonant lowpass driven by an LFO.
    function wobble(t, freq, rate) {
      const dur = STEP * 8;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.Q.value = 11;
      filter.frequency.value = 520;
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = rate;
      const depth = ctx.createGain();
      depth.gain.value = 480;
      lfo.connect(depth).connect(filter.frequency);
      const shaper = ctx.createWaveShaper();
      shaper.curve = distortionCurve(18);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.32, t + 0.02);
      g.gain.setValueAtTime(0.32, t + dur - 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      filter.connect(shaper).connect(g).connect(master);
      const oscs = [];
      for (const detune of [-14, 0, 13]) {
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = freq * 2;
        o.detune.value = detune;
        o.connect(filter);
        oscs.push(o);
      }
      const sub = ctx.createOscillator();
      sub.type = 'sine';
      sub.frequency.value = freq;
      const subGain = ctx.createGain();
      subGain.gain.value = 0.5;
      sub.connect(subGain).connect(g);
      oscs.push(sub, lfo);
      for (const o of oscs) { o.start(t); o.stop(t + dur + 0.01); }
    }

    function schedule(t, s) {
      if (s < BUILD_STEPS) {
        // Build-up: a riser and a snare roll that gets denser and louder.
        if (s === 0) riser(t);
        const every = s < 8 ? 2 : 1;
        if (s % every === 0) { snare(t, 0.15 + s * 0.03); at(t, onSnare); }
        return;
      }
      const loopStep = (s - BUILD_STEPS) % LOOP_STEPS;
      const inBar = loopStep % 16;
      const bar = Math.floor(loopStep / 16);
      if (inBar === 0 || inBar === 10 || (bar === 3 && inBar === 6)) { kick(t); at(t, onKick); }
      if (inBar === 8) { snare(t, 0.7); at(t, onSnare); }
      if (bar === 3 && inBar >= 12) { snare(t, 0.35 + (inBar - 12) * 0.1); at(t, onSnare); }
      if (inBar % 2 === 1) hat(t);
      if (inBar % 8 === 0) {
        const half = loopStep / 8;
        wobble(t, NOTES[half], RATES[half]);
        at(t, function () { onWub(RATES[half] / BEAT_HZ); });
      }
    }

    function tick() {
      while (nextTime < ctx.currentTime + 0.15) {
        schedule(nextTime, step);
        nextTime += STEP;
        step++;
      }
    }

    return {
      start: function () {
        ctx = getAudio();
        if (!ctx) return false;
        // Gentle volume: fade in from silence over 1 s, then hold at 0.25.
        master = ctx.createGain();
        master.gain.setValueAtTime(0, ctx.currentTime);
        master.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 1);
        const comp = ctx.createDynamicsCompressor();
        master.connect(comp).connect(ctx.destination);
        step = 0;
        nextTime = ctx.currentTime + 0.08;
        tick();
        timer = setInterval(tick, 25);
        return true;
      },
      stop: function () {
        clearInterval(timer);
        while (visualTimers.length) clearTimeout(visualTimers.pop());
        if (master && ctx) {
          const old = master;
          old.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
          setTimeout(function () { try { old.disconnect(); } catch (e) { /* already gone */ } }, 400);
        }
        master = null;
      }
    };
  }

  function buildRave(slot) {
    const wrap = el('div', 'm-wrap');
    wrap.innerHTML =
      '<p class="m-kicker">Тем временем в общаге</p>' +
      '<div class="m-rave">' +
      '  <div class="m-rave-ticker" aria-hidden="true"><span>🎧 Сейчас играет: «Домашка сдана (Wobble Remix)» — DJ Бегемот feat. Васко Копаев · 140 BPM · дедлайн побеждён · 🎧</span></div>' +
      '  <div class="m-stage">' +
      '    <div class="m-beams"></div><div class="m-floor"></div>' + HIPPO_SVG +
      '  </div>' +
      '  <div class="m-rave-cap">' +
      '    <span class="m-impact">Группа после сдачи домашки, 3:00 ночи</span>' +
      '    <small>Звук синтезируется прямо в браузере. Соседей предупредите заранее.</small>' +
      '    <div class="m-btn-row"><button type="button" class="m-btn" aria-pressed="false">▶ ВКЛЮЧИТЬ ДАБСТЕП</button></div>' +
      '  </div>' +
      '</div>';
    slot.appendChild(wrap);

    const rave = wrap.querySelector('.m-rave');
    const stage = wrap.querySelector('.m-stage');
    const btn = wrap.querySelector('.m-btn');
    const popups = document.getElementById('meme-popups');
    let strobe = null;
    const COLORS = ['#ff00c8', '#00f0ff', '#7dff6a', '#f5c542', '#8a5cff'];
    let colorIndex = 0;
    let playing = false;

    function shake() {
      if (reduceMotion) return;
      rave.classList.remove('m-kick');
      void rave.offsetWidth;
      rave.classList.add('m-kick');
    }
    // At most ~3 colour changes per second, to stay well below photosensitivity flash limits.
    let lastFlash = 0;
    function flash() {
      const now = Date.now();
      if (now - lastFlash < 340) return;
      lastFlash = now;
      colorIndex = (colorIndex + 1) % COLORS.length;
      stage.style.background = 'radial-gradient(circle at 50% 30%, ' + COLORS[colorIndex] + '44, transparent 70%)';
      if (strobe) strobe.style.backgroundColor = COLORS[colorIndex];
    }
    function wub(speed) {
      if (reduceMotion) return;
      const words = speed >= 3 ? 'WUBWUBWUB' : speed >= 2 ? 'WUB WUB' : speed < 1 ? 'WOOOOB' : 'WUB';
      const w = el('span', 'm-wub', words);
      w.style.left = (10 + Math.random() * 55) + '%';
      w.style.top = (8 + Math.random() * 40) + '%';
      w.style.setProperty('--r', (Math.random() * 30 - 15).toFixed(0) + 'deg');
      stage.appendChild(w);
      setTimeout(function () { w.remove(); }, 1000);
    }

    const engine = makeDubstep(shake, flash, wub);

    function stop() {
      if (!playing) return;
      playing = false;
      engine.stop();
      rave.classList.remove('m-playing');
      stage.style.background = '';
      btn.textContent = '▶ ВКЛЮЧИТЬ ДАБСТЕП';
      btn.setAttribute('aria-pressed', 'false');
      if (strobe) { strobe.remove(); strobe = null; }
    }
    function start() {
      if (!engine.start()) { btn.textContent = 'Браузер не умеет в звук 😢'; return; }
      playing = true;
      rave.classList.add('m-playing');
      btn.textContent = '■ ВЫКЛЮЧИТЬ (соседи стучат)';
      btn.setAttribute('aria-pressed', 'true');
      if (!reduceMotion && popups) {
        strobe = el('div', 'm-strobe m-on');
        strobe.setAttribute('aria-hidden', 'true');
        popups.appendChild(strobe);
      }
    }
    btn.addEventListener('click', function (e) {
      if (playing) stop(); else { start(); celebrate(e); }
    });
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); });
    // Stop the party when the stage scrolls far out of view.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) stop();
      }, { rootMargin: '200px 0px' }).observe(rave);
    }
  }

  // ---------- slot 4: cat council ----------
  const CATS = [
    { file: 'cat-glasses.jpg', pos: '50% 50%', alt: 'Кот в круглых очках', top: 'Васко-кот', bottom: 'решил всё ещё вчера' },
    { file: 'cat-shocked.jpg', pos: '50% 40%', alt: 'Кот с огромными испуганными глазами', top: '', bottom: 'когда понял, что дедлайн сегодня' },
    { file: 'cat-praying.jpg', pos: '50% 20%', alt: 'Кот смотрит вверх, будто в небо', top: '', bottom: 'молюсь на Васко' },
    { file: 'cat-laptop.jpg', pos: '70% 50%', alt: 'Кот сидит перед ноутбуком', top: '', bottom: 'делаю вид, что тоже помогал' },
    { file: 'cat-scream.jpg', pos: '50% 45%', alt: 'Чёрный кот широко открыл рот', top: '', bottom: 'ААА ВАСКО СКИНУЛ' },
    { file: 'cat-blanket.jpg', pos: '50% 22%', alt: 'Кот прячется под одеялом', top: '', bottom: 'когда препод спросил, кто ещё не сдал' }
  ];
  const MEOWS = ['мяу', 'МЯУ!!', 'мур 🙏', 'слава Васко', 'мяу (одобряю)', 'фыр-фыр', 'мррр… дедлайн', 'кто тут хороший? Васко'];

  function buildCats(slot) {
    const wrap = el('div', 'm-wrap');
    let cards = '';
    CATS.forEach(function (c, i) {
      cards +=
        '<figure class="m-cat" tabindex="0">' +
        '  <span class="m-cat-badge">ЧЛЕН СОВЕТА №' + (i + 1) + '</span>' +
        '  <img src="' + IMG + c.file + '" loading="lazy" decoding="async" alt="' + c.alt + '" style="object-position:' + c.pos + '">' +
        (c.top ? '<span class="m-impact m-cap m-cap-top">' + c.top + '</span>' : '') +
        '  <figcaption class="m-impact m-cap m-cap-bottom">' + c.bottom + '</figcaption>' +
        '</figure>';
    });
    wrap.innerHTML =
      '<p class="m-kicker">Внеочередное заседание</p>' +
      '<h2 class="m-title">Совет котиков</h2>' +
      '<p class="m-sub">Повестка: «Кто спас группу?» Голосование единогласное. Нажми на члена совета, чтобы выслушать его мнение.</p>' +
      '<div class="m-cats">' + cards + '</div>' +
      '<span class="m-stamp">ПОСТАНОВЛЕНО: ВАСКО — ЛЕГЕНДА 🐾</span>';
    slot.appendChild(wrap);

    wrap.querySelectorAll('.m-cat').forEach(function (card) {
      function meow() {
        const old = card.querySelector('.m-meow');
        if (old) old.remove();
        const b = el('span', 'm-meow', MEOWS[Math.floor(Math.random() * MEOWS.length)]);
        card.appendChild(b);
        setTimeout(function () { b.remove(); }, 1700);
      }
      card.addEventListener('click', meow);
      card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); meow(); } });
    });
    const stamp = wrap.querySelector('.m-stamp');
    onVisible(stamp, function () { stamp.classList.add('m-in'); }, 0.9);
  }

  // ---------- slot 5: the group chat ----------
  const PEOPLE = {
    anya: { name: 'Аня', color: '#e17076' },
    dima: { name: 'Дима', color: '#7bc862' },
    lesha: { name: 'Лёша', color: '#65aadd' },
    katya: { name: 'Катя', color: '#a695e7' },
    head: { name: 'Староста', color: '#ee7aae' },
    misha: { name: 'Миша', color: '#6ec9cb' },
    vasko: { name: 'Васко Копаев', color: '#f5c542' }
  };
  // Each line: [who, text, delay before it in ms]. who 'typing' shows "печатает…", 'service' shows a grey notice.
  const CHAT = [
    ['anya', 'Кто-нибудь сделал научную студию?? 😭', 300],
    ['dima', 'сдавать через 2 часа', 900],
    ['lesha', 'я только тему открыл', 900],
    ['katya', 'всё, отчисляемся. было приятно учиться с вами', 1100],
    ['head', 'у кого есть ХОТЬ ЧТО-НИБУДЬ, скиньте пж', 1000],
    ['service', 'тишина 3 минуты', 1200],
    ['typing', 'Васко Копаев', 600],
    ['vasko', 'FILE', 2200],
    ['vasko', 'скинул', 600],
    ['anya', 'ВАСКО ТЫ БОГ', 700],
    ['dima', 'ВАСКО ТЫ БОГ', 250], ['lesha', 'ВАСКО ТЫ БОГ', 220], ['katya', 'ВАСКО ТЫ БОГ', 200],
    ['head', 'ВАСКО ТЫ БОГ', 190], ['misha', 'ВАСКО ТЫ БОГ', 180], ['anya', 'ВАСКО ТЫ БОГ', 170],
    ['dima', 'ВАСКО ТЫ БОГ', 160], ['lesha', 'ВАСКО ТЫ БОГ', 150], ['katya', 'ВАСКО ТЫ БОГ', 140],
    ['misha', 'ВАСКО ТЫ БОГ', 130], ['head', 'ВАСКО ТЫ БОГ', 120], ['anya', 'ВАСКО ТЫ БОГ', 110],
    ['dima', 'ВАСКО ТЫ БОГ', 100], ['katya', 'ВАСКО ТЫ БОГ', 100],
    ['misha', 'я назову в его честь кота', 900],
    ['service', 'Староста закрепил(а) сообщение «скинул»', 800],
    ['vasko', 'да ладно, пустяки 🙂', 1100],
    ['lesha', 'ПУСТЯКИ ГОВОРИТ', 600],
    ['head', 'Предлагаю построить ему храм', 900],
    ['service', 'Вы находитесь в этом храме 🛐', 900]
  ];

  function buildChat(slot) {
    const wrap = el('div', 'm-wrap');
    wrap.innerHTML =
      '<p class="m-kicker">Священное писание · найдено в телефоне старосты</p>' +
      '<div class="m-phone"><div class="m-chat">' +
      '  <div class="m-chat-head"><div class="m-chat-ava">НС</div><div>' +
      '    <div class="m-chat-title">Научная студия 🧪</div>' +
      '    <div class="m-chat-meta">27 участников, 26 в панике</div>' +
      '  </div></div>' +
      '  <div class="m-chat-body" aria-live="off"></div>' +
      '</div></div>' +
      '<div class="m-chat-foot"><button type="button" class="m-btn">↻ Перечитать священную переписку</button></div>';
    slot.appendChild(wrap);
    const body = wrap.querySelector('.m-chat-body');
    let runId = 0;
    let godCount = 0;

    function avatar(who) {
      if (who === 'vasko') {
        const img = el('img', 'm-msg-ava');
        img.src = 'img/vasko.png';
        img.alt = 'Васко Копаев';
        img.loading = 'lazy';
        return img;
      }
      const a = el('span', 'm-msg-ava', PEOPLE[who].name[0]);
      a.style.background = PEOPLE[who].color;
      return a;
    }

    function stamp(i) {
      const minute = 47 + Math.floor(i / 3);
      return minute < 60 ? '22:' + minute : '23:0' + (minute - 60);
    }

    function render(line, i) {
      const who = line[0];
      const text = line[1];
      const typing = body.querySelector('.m-typing');
      if (typing) typing.remove();
      if (who === 'service') {
        body.appendChild(el('div', 'm-service', text));
      } else if (who === 'typing') {
        body.appendChild(el('div', 'm-typing', text + ' печатает<i>.</i><i>.</i><i>.</i>'));
      } else {
        const msg = el('div', 'm-msg' + (who === 'vasko' ? ' m-msg-vasko' : ''));
        const bubble = el('div', 'm-bubble');
        const name = el('b', null, PEOPLE[who].name);
        name.style.color = PEOPLE[who].color;
        bubble.appendChild(name);
        if (text === 'FILE') {
          bubble.appendChild(el('div', 'm-file',
            '<span class="m-file-ico">📄</span><span>nauchnaya_studia_FINAL_v3_tochno_final.pdf<small>2,4 МБ · вся группа скачала за 4 секунды</small></span>'));
        } else {
          bubble.appendChild(document.createTextNode(text));
        }
        if (text === 'ВАСКО ТЫ БОГ') {
          godCount++;
          msg.classList.add('m-god');
          bubble.style.fontSize = Math.min(0.9 + godCount * 0.035, 1.35).toFixed(2) + 'rem';
        }
        bubble.appendChild(el('span', 'm-time', stamp(i)));
        msg.appendChild(avatar(who));
        msg.appendChild(bubble);
        body.appendChild(msg);
      }
      body.scrollTop = body.scrollHeight;
    }

    function play() {
      runId++;
      const myRun = runId;
      body.innerHTML = '';
      godCount = 0;
      if (reduceMotion) { CHAT.forEach(render); return; }
      let i = 0;
      function next() {
        if (myRun !== runId || i >= CHAT.length) return;
        const line = CHAT[i];
        setTimeout(function () {
          if (myRun !== runId) return;
          render(line, i);
          i++;
          next();
        }, line[2]);
      }
      next();
    }

    wrap.querySelector('.m-btn').addEventListener('click', play);
    onVisible(body, play, 0.5);
  }

  // ---------- slot 6: gallery of saints with "deal with it" glasses ----------
  // Pixel-art sunglasses, drawn on a 26x6 grid.
  const SHADES_SVG =
    '<svg class="m-shades m-hidden" viewBox="0 0 26 6" shape-rendering="crispEdges" aria-hidden="true">' +
    '<rect x="0" y="0" width="26" height="1" fill="#000"/>' +
    '<rect x="2" y="1" width="9" height="2" fill="#000"/><rect x="3" y="3" width="7" height="1" fill="#000"/><rect x="4" y="4" width="5" height="1" fill="#000"/>' +
    '<rect x="15" y="1" width="9" height="2" fill="#000"/><rect x="16" y="3" width="7" height="1" fill="#000"/><rect x="17" y="4" width="5" height="1" fill="#000"/>' +
    '<rect x="11" y="1" width="4" height="1" fill="#000"/>' +
    '<rect x="4" y="1" width="1" height="1" fill="#fff"/><rect x="5" y="2" width="1" height="1" fill="#fff"/>' +
    '<rect x="17" y="1" width="1" height="1" fill="#fff"/><rect x="18" y="2" width="1" height="1" fill="#fff"/>' +
    '</svg>';

  const CREDITS = [
    ['ronaldo-siuuu.jpg, ronaldo-face.jpg', 'Cristiano Ronaldo 0876.jpg', 'https://commons.wikimedia.org/wiki/File:Cristiano_Ronaldo_0876.jpg', 'YantsImages', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'],
    ['rock-eyebrow.jpg, rock-peek.jpg', 'The Rock 2023.jpg', 'https://commons.wikimedia.org/wiki/File:The_Rock_2023.jpg', 'U.S. Army photo by Sgt. Deonte Rowell', 'Public domain', ''],
    ['cat-glasses.jpg', 'Tinsel the cat, wearing glasses.jpg', 'https://commons.wikimedia.org/wiki/File:Tinsel_the_cat,_wearing_glasses.jpg', 'Cardiffchestnut', 'CC BY-SA 3.0', 'https://creativecommons.org/licenses/by-sa/3.0/'],
    ['cat-shocked.jpg', 'Surprised look Cat (2015 photo; cropped 2022).jpg', 'https://commons.wikimedia.org/wiki/File:Surprised_look_Cat_(2015_photo;_cropped_2022).jpg', 'KKPCW', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'],
    ['cat-praying.jpg', 'Surprised Cat.jpg', 'https://commons.wikimedia.org/wiki/File:Surprised_Cat.jpg', 'Rudi Riet', 'CC BY-SA 2.0', 'https://creativecommons.org/licenses/by-sa/2.0/'],
    ['cat-laptop.jpg', 'Cat on laptop - Just Browsing.jpg', 'https://commons.wikimedia.org/wiki/File:Cat_on_laptop_-_Just_Browsing.jpg', 'Wilson Afonso from Sydney, Australia', 'CC BY 2.0', 'https://creativecommons.org/licenses/by/2.0/'],
    ['cat-scream.jpg', 'Cat Yawning 2.jpg', 'https://commons.wikimedia.org/wiki/File:Cat_Yawning_2.jpg', 'Akira 001', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'],
    ['cat-blanket.jpg', 'Cat hiding under a blanket.jpg', 'https://commons.wikimedia.org/wiki/File:Cat_hiding_under_a_blanket.jpg', 'MisterDesgraciao', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'],
    ['cat-sunglasses.jpg', 'Cat wearing sunglasses.jpg', 'https://commons.wikimedia.org/wiki/File:Cat_wearing_sunglasses.jpg', 'Smirkybec', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/']
  ];

  function buildGallery(slot) {
    const wrap = el('div', 'm-wrap');
    let credits = '';
    for (const c of CREDITS) {
      const license = c[5] ? '<a href="' + c[5] + '" rel="license noopener" target="_blank">' + c[4] + '</a>' : c[4];
      credits += '<li>«<a href="' + c[2] + '" rel="noopener" target="_blank">' + c[1] + '</a>», автор: ' + c[3] + ', ' + license +
        ' (файлы ' + c[0] + ', обрезано и уменьшено)</li>';
    }
    wrap.innerHTML =
      '<p class="m-kicker">Финальный зал храма</p>' +
      '<h2 class="m-title">Галерея святых</h2>' +
      '<p class="m-sub">Даже легенды склоняются. Нажми на икону.</p>' +
      '<div class="m-gallery">' +
      '  <div class="m-icon" role="button" tabindex="0" aria-label="Надеть очки на Васко">' +
      '    <div class="m-icon-inner">' +
      '      <img class="m-vasko" src="img/vasko.png" loading="lazy" decoding="async" width="646" height="653" alt="Васко Копаев">' +
             SHADES_SVG +
      '      <span class="m-impact m-dwi">Deal with it</span>' +
      '    </div>' +
      '    <div class="m-icon-name">СВ. ВАСКО ДОМАШКОДАТЕЛЬ</div>' +
      '  </div>' +
      '  <div class="m-saints">' +
      '    <figure class="m-saint"><div class="m-saint-pic"><img src="' + IMG + 'ronaldo-face.jpg" loading="lazy" alt="Криштиану Роналду"><span class="m-pray" aria-hidden="true">🙏</span></div>' +
      '      <figcaption><b>Св. Криштиану</b>покровитель прыжков</figcaption></figure>' +
      '    <figure class="m-saint"><div class="m-saint-pic"><img src="' + IMG + 'rock-peek.jpg" loading="lazy" alt="Дуэйн «Скала» Джонсон"><span class="m-pray" aria-hidden="true">🙏</span></div>' +
      '      <figcaption><b>Св. Скала</b>покровитель бровей</figcaption></figure>' +
      '    <figure class="m-saint"><div class="m-saint-pic"><img src="' + IMG + 'cat-praying.jpg" loading="lazy" alt="Кот смотрит вверх" style="object-position:50% 20%"><span class="m-pray" aria-hidden="true">🙏</span></div>' +
      '      <figcaption><b>Св. Котик</b>покровитель дедлайнов</figcaption></figure>' +
      '  </div>' +
      '</div>' +
      '<details class="m-credits"><summary>Мем-кредиты</summary>' +
      '<p>Фото взяты с Wikimedia Commons под свободными лицензиями. Подписи и монтаж — пародия, ' +
      'люди на фото не имеют отношения к храму (но мы уверены, что они бы одобрили). Бегемот нарисован вручную, дабстеп синтезирован в браузере.</p>' +
      '<ul>' + credits + '</ul></details>';
    slot.appendChild(wrap);

    const icon = wrap.querySelector('.m-icon');
    const shades = wrap.querySelector('.m-shades');
    const dwi = wrap.querySelector('.m-dwi');
    let busy = false;
    function drop(event) {
      if (busy) return;
      busy = true;
      shades.classList.remove('m-hidden', 'm-drop');
      dwi.classList.remove('m-in');
      void shades.getBoundingClientRect();
      shades.classList.add('m-drop');
      setTimeout(function () {
        dwi.classList.add('m-in');
        busy = false;
        if (event) celebrate(event);
      }, reduceMotion ? 50 : 1650);
    }
    icon.addEventListener('click', drop);
    icon.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); drop(); } });
    onVisible(icon, function () { drop(); }, 0.7);
  }

  // ---------- pop-ins ----------
  const PAW_SVG =
    '<svg viewBox="0 0 120 90" aria-hidden="true">' +
    '<rect x="40" y="28" width="90" height="40" rx="20" fill="#e8a25a"/>' +
    '<path d="M60 32 v32 M80 30 v36 M100 30 v36" stroke="#c97f36" stroke-width="5" stroke-linecap="round"/>' +
    '<circle cx="40" cy="48" r="28" fill="#f2b56e"/>' +
    '<ellipse cx="34" cy="56" rx="12" ry="9" fill="#f7a1b5"/>' +
    '<circle cx="20" cy="40" r="6" fill="#f7a1b5"/><circle cx="30" cy="30" r="6" fill="#f7a1b5"/>' +
    '<circle cx="44" cy="28" r="6" fill="#f7a1b5"/><circle cx="18" cy="54" r="5" fill="#f7a1b5"/>' +
    '</svg>';

  const POPUPS = [
    function () {
      const p = el('div', 'm-pop m-pop-peek',
        '<span class="m-pop-say">🤨 ты уже поблагодарил Васко?</span>' +
        '<img src="' + IMG + 'rock-peek.jpg" alt="Дуэйн «Скала» Джонсон выглядывает снизу">');
      return p;
    },
    function () {
      return el('div', 'm-pop m-pop-corner',
        '<div class="m-pop-card"><img src="img/vasko.png" alt="Васко Копаев"><div><b>Научная студия 🧪</b><br>Васко: скинул</div></div>');
    },
    function () {
      return el('div', 'm-pop m-pop-paw', '<span class="m-pop-say">мяу. слава Васко 🐾</span>' + PAW_SVG);
    },
    function () {
      return el('div', 'm-pop m-pop-corner',
        '<div class="m-pop-card"><img src="' + IMG + 'ronaldo-face.jpg" alt="Криштиану Роналду"><div><b>SIUUU-уведомление</b><br>Домашка сдана. Повод для прыжка ⚽</div></div>');
    },
    function () {
      return el('div', 'm-pop m-pop-corner',
        '<div class="m-pop-card"><img src="' + IMG + 'cat-sunglasses.jpg" alt="Кот в солнечных очках"><div><b>Кот-апостол</b><br>Домашка сдана. Можно чилить 😎</div></div>');
    }
  ];

  function startPopups() {
    const host = document.getElementById('meme-popups');
    if (!host) return;
    let index = 0;
    let shown = 0;
    let current = null;
    let hideTimer = 0;
    const MAX = 10;

    function hide(fast) {
      if (!current) return;
      const node = current;
      current = null;
      clearTimeout(hideTimer);
      node.classList.add('m-out');
      setTimeout(function () { node.remove(); }, fast || reduceMotion ? 0 : 450);
    }

    function show() {
      if (document.hidden || current) { schedule(15000); return; }
      const node = POPUPS[index % POPUPS.length]();
      index++;
      shown++;
      const close = el('button', 'm-pop-close', '×');
      close.type = 'button';
      close.setAttribute('aria-label', 'Закрыть мем');
      // Closing a meme by hand pushes the next one back to 90 s.
      close.addEventListener('click', function () { hide(true); schedule(90000); });
      node.appendChild(close);
      host.appendChild(node);
      current = node;
      hideTimer = setTimeout(function () { hide(false); }, 5000);
      schedule(40000 + Math.random() * 20000);
    }

    let nextTimer = 0;
    function schedule(ms) {
      clearTimeout(nextTimer);
      if (shown >= MAX) return;
      nextTimer = setTimeout(show, ms);
    }
    schedule(20000);
  }

  // ---------- mount ----------
  function mount(id, build) {
    const slot = document.getElementById(id);
    if (!slot) return;
    try { build(slot); } catch (e) { if (window.console) console.error('memes: ' + id, e); }
  }

  // Oswald replaces Impact for Cyrillic meme captions on systems without Impact.
  function loadMemeFont() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Oswald:wght@700&display=swap';
    document.head.appendChild(link);
  }

  function init() {
    loadMemeFont();
    mount('meme-slot-1', buildSiu);
    mount('meme-slot-2', buildRock);
    mount('meme-slot-3', buildRave);
    mount('meme-slot-4', buildCats);
    mount('meme-slot-5', buildChat);
    mount('meme-slot-6', buildGallery);
    startPopups();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
