// =====================================================================
// ХРАМ СВЯТОГО ВАСКО: hero, effects layer, footer, praise burst.
// Public API for the other parts of the site:
//   window.templeCelebrate(x, y)  burst of confetti, emoji, holy light and
//                                 a choir chord at viewport point (x, y);
//                                 with no arguments, at the screen centre.
//   window.templePraise(x, y)     the same burst, and it also adds one to
//                                 the praise counter.
// =====================================================================

(function () {
  'use strict';

  const PRAISE_STORAGE_KEY = 'vasko-temple-praise-count';
  const REDUCED_MOTION = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const TICKER_NEWS = [
    '<b>СРОЧНО:</b> ВАСКО СДЕЛАЛ ДОМАШКУ',
    'ГРУППА СПАСЕНА',
    'ДЕДЛАЙН ПОВЕРЖЕН В ЧЕСТНОМ БОЮ',
    'ПРЕПОДАВАТЕЛЬ НАУЧНОЙ СТУДИИ ПРОТИРАЕТ ОЧКИ И НЕ ВЕРИТ',
    'УЧЁНЫЕ НЕ МОГУТ ОБЪЯСНИТЬ ПРОИСХОДЯЩЕЕ',
    'СТАРОСТА ПЛАЧЕТ ОТ СЧАСТЬЯ',
    'В ОБЩАГЕ ЗАЖГЛИ СВЕЧИ',
    'ЧАТ ГРУППЫ ВПЕРВЫЕ ЗА СЕМЕСТР ПИШЕТ «СПАСИБО», А НЕ «ЧТО ЗАДАЛИ?»',
    'НАУЧНАЯ СТУДИЯ ОБЪЯВЛЕНА ВОСЬМЫМ ЧУДОМ СВЕТА',
    'ВАСКО ОТКАЗАЛСЯ ОТ КОММЕНТАРИЕВ: ОН ПОПРАВЛЯЕТ ОЧКИ',
    'ПАНИКА В ГРУППЕ СНИЖЕНА ДО НУЛЯ',
    '<b>МОЛНИЯ:</b> КОПАЕВ — ЭТО НЕ ФАМИЛИЯ, ЭТО ДИАГНОЗ «КОПАЕТ ГЛУБЖЕ ВСЕХ»'
  ];

  const FOOTER_THANKS = [
    'СПАСИБО, ВАСКО',
    'ДЯКУЄМО',
    'THANK YOU, SAINT VASKO',
    'MERCI, MONSIEUR KOPAEV',
    'DANKE SCHÖN',
    'GRAZIE MILLE',
    'ARIGATŌ, VASKO-SAMA',
    'БЛАГОДАРИМ ЗА НАУЧНУЮ СТУДИЮ',
    'СПАСИБО, ЧТО СДЕЛАЛ',
    'СПАСИБО, ЧТО ДАЛ СПИСАТЬ',
    'СПАСИБО, ЧТО ТЫ ЕСТЬ',
    'GRACIAS, SEÑOR DE LA TAREA'
  ];

  const PEER_CAPTIONS = [
    '*смотрит на тебя поверх очков с одобрением*',
    '*медленно опускает очки. Дедлайн отступает на шаг*',
    '*одобрительно кивает. +5 к зачёту*',
    '*видит твою недоделанную лабу. Прощает.*',
    '*поправляет перчатку. Это значит «я сделаю и это»*',
    '*взгляд поверх очков. Где-то в деканате зажглась свеча*',
    '*молча оценивает твой конспект. Конспект краснеет*'
  ];

  const PEER_CAPTION_TIRED = '*Васко устал от твоего внимания. Иди делай домашку. Хотя нет — он уже сделал.*';

  const HOLY_WORDS = [
    'АЛЛИЛУЙЯ!', 'СЛАВА ВАСКО!', 'ДОМАШКА ЗАСЧИТАНА', 'АМИНЬ!', '+1 К КАРМЕ',
    'СПАСЁН!', 'ХВАЛА!', 'ЗАЧЁТ!', 'ОСАННА!', 'ВАСКО ВИДИТ'
  ];

  const BURST_EMOJI = ['🙏', '✨', '📜', '🙏', '✨', '🕯️', '👼', '📜', '🌟', '🙏'];

  const CONFETTI_COLORS = ['#f5c542', '#ffe7a3', '#fff8e1', '#ffffff', '#c41e3a', '#e8a93a', '#b58cff', '#f5c542'];

  // Ranks: [minimum praise count, title].
  const PRAISE_RANKS = [
    [1, 'Послушник'],
    [5, 'Прихожанин'],
    [12, 'Певчий хора отличников'],
    [25, 'Дьякон домашки'],
    [50, 'Апостол научной студии'],
    [100, 'Архиепископ дедлайнов'],
    [250, 'Ты уже сам немного Васко'],
    [777, 'Святейший Списыватель всея группы']
  ];

  // Chord progression for the choir, in Hz (an endless "А-минь").
  const CHOIR_CHORDS = [
    [261.63, 329.63, 392.0, 523.25, 659.25],
    [174.61, 349.23, 440.0, 523.25, 698.46],
    [261.63, 329.63, 392.0, 523.25, 783.99],
    [196.0, 293.66, 392.0, 493.88, 587.33],
    [220.0, 329.63, 440.0, 523.25, 659.25],
    [174.61, 261.63, 349.23, 440.0, 523.25],
    [196.0, 246.94, 392.0, 493.88, 587.33],
    [130.81, 261.63, 392.0, 523.25, 659.25]
  ];

  const templeState = {
    praiseCount: 0,
    peerIndex: 0,
    peerClicks: 0,
    peerTimer: 0,
    captionTimer: 0,
    burstLayer: null,
    activeParticles: 0,
    audioContext: null,
    reverbNode: null,
    chordIndex: 0,
    lastChoirTime: -1,
    typedKeys: ''
  };

  // ---------------------------------------------------------------
  // Storage (wrapped: private windows may throw)
  // ---------------------------------------------------------------

  function praiseCountLoad() {
    try {
      const stored = window.localStorage.getItem(PRAISE_STORAGE_KEY);
      const parsed = parseInt(stored || '0', 10);
      return isFinite(parsed) && parsed > 0 ? parsed : 0;
    } catch (error) {
      return 0;
    }
  }

  function praiseCountSave(count) {
    try {
      window.localStorage.setItem(PRAISE_STORAGE_KEY, String(count));
    } catch (error) {
      // Storage is unavailable; the counter lives only in this tab.
    }
  }

  // ---------------------------------------------------------------
  // Small helpers
  // ---------------------------------------------------------------

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function randomPick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function russianTimesWord(count) {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) {
      return 'раза';
    }
    return 'раз';
  }

  function praiseRankTitle(count) {
    let title = '';
    for (let index = 0; index < PRAISE_RANKS.length; index += 1) {
      if (count >= PRAISE_RANKS[index][0]) {
        title = PRAISE_RANKS[index][1];
      }
    }
    return title;
  }

  function repeatedSpans(items) {
    const once = items.map(function (item) { return '<span>' + item + '</span>'; }).join('');
    return once + once;
  }

  // ---------------------------------------------------------------
  // Hero
  // ---------------------------------------------------------------

  function heroRender(hero) {
    const halo = '✦ СВЯТ ✦ СВЯТ ✦ СВЯТ ✦ ВАСКО КОПАЕВ ✦ СПАСИТЕЛЬ ГРУППЫ ✦ ДОМАШКА СДЕЛАНА ';
    const ringStars = [0, 45, 90, 135, 180, 225, 270, 315]
      .map(function (angle) { return '<i style="--a:' + angle + 'deg"></i>'; })
      .join('');

    hero.innerHTML =
      '<div class="temple-ticker" aria-label="Срочные новости">' +
        '<span class="temple-ticker__label">ПРЯМОЙ ЭФИР</span>' +
        '<div class="temple-ticker__viewport"><div class="temple-ticker__track">' + repeatedSpans(TICKER_NEWS) + '</div></div>' +
      '</div>' +
      '<div class="temple-hero__inner">' +
        '<div class="temple-enter" style="--enter:.1s">' +
          '<div class="vasko-stage">' +
            '<div class="vasko-rays"></div>' +
            '<div class="vasko-rays vasko-rays--fine"></div>' +
            '<div class="vasko-glow"></div>' +
            '<svg class="vasko-halo-text" viewBox="0 0 200 200" aria-hidden="true">' +
              '<defs><path id="vasko-halo-path" d="M100,100 m-90,0 a90,90 0 1,1 180,0 a90,90 0 1,1 -180,0"></path></defs>' +
              '<text><textPath href="#vasko-halo-path" textLength="563" lengthAdjust="spacing">' + halo + '</textPath></text>' +
            '</svg>' +
            '<div class="vasko-ring" aria-hidden="true">' + ringStars + '</div>' +
            '<button class="vasko-frame" type="button" aria-label="Встретиться взглядом со Святым Васко">' +
              '<img src="img/vasko.png" alt="Святой Васко Копаев в чёрных перчатках опускает золотые очки и смотрит прямо в душу" width="646" height="653" draggable="false">' +
              '<span class="vasko-glint"></span>' +
            '</button>' +
            '<div class="vasko-caption" role="status" aria-live="polite"></div>' +
          '</div>' +
        '</div>' +
        '<p class="temple-kicker temple-enter" style="--enter:.35s">✦ Храм Святой Домашки · приход научной студии ✦</p>' +
        '<h1 class="temple-title temple-enter" style="--enter:.5s">' +
          '<span class="temple-title__small">Святой</span>' +
          '<span class="temple-title__name">Васко Копаев</span>' +
        '</h1>' +
        '<p class="temple-subtitle temple-enter" style="--enter:.7s">' +
          'Спаситель группы. Повелитель научной студии. ' +
          '<em>Тот, кто сделал домашку, пока мы делали вид, что делаем.</em>' +
        '</p>' +
        '<blockquote class="temple-scripture temple-enter" style="--enter:.85s">' +
          '«И сказал Васко: да будет домашка. И стала домашка. ' +
          'И увидела группа, что это хорошо, и списала, и возрадовалась.»' +
          '<cite>— Книга Дедлайнов, 3:14</cite>' +
        '</blockquote>' +
        '<div class="praise temple-enter" style="--enter:1s">' +
          '<button class="praise-btn" type="button">🙏 ВОЗНЕСТИ ХВАЛУ</button>' +
          '<p class="praise-count" aria-live="polite"></p>' +
          '<p class="praise-rank"></p>' +
        '</div>' +
      '</div>' +
      '<a class="temple-scroll" href="#worshippers">↓ узреть паству ↓</a>';
  }

  function praiseDisplayUpdate(bump) {
    const countEl = document.querySelector('#temple-hero .praise-count');
    const rankEl = document.querySelector('#temple-hero .praise-rank');
    if (!countEl || !rankEl) {
      return;
    }
    const count = templeState.praiseCount;
    countEl.innerHTML = 'Хвала вознесена <b>' + count + '</b> ' + russianTimesWord(count);

    const rank = praiseRankTitle(count);
    const previousRank = rankEl.getAttribute('data-rank') || '';
    if (rank) {
      rankEl.innerHTML = 'Твоё звание в храме: <b>' + rank + '</b>';
    } else {
      rankEl.textContent = 'Ты ещё не вознёс хвалу. Васко ждёт. Васко всегда ждёт.';
    }
    rankEl.setAttribute('data-rank', rank);

    if (bump) {
      const number = countEl.querySelector('b');
      if (number) {
        number.classList.add('is-bumped');
      }
      if (rank !== previousRank) {
        rankEl.classList.remove('is-promoted');
        void rankEl.offsetWidth;
        rankEl.classList.add('is-promoted');
      }
    }
  }

  function praiseAdd(x, y) {
    templeState.praiseCount += 1;
    praiseCountSave(templeState.praiseCount);
    praiseDisplayUpdate(true);
    templeCelebrate(x, y);
  }

  function praiseButtonClick(event) {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    button.classList.remove('is-pressed');
    void button.offsetWidth;
    button.classList.add('is-pressed');
    praiseAdd(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  function peerCaptionShow(text) {
    const caption = document.querySelector('#temple-hero .vasko-caption');
    if (!caption) {
      return;
    }
    caption.textContent = text;
    caption.classList.add('is-shown');
    window.clearTimeout(templeState.captionTimer);
    templeState.captionTimer = window.setTimeout(function () {
      caption.classList.remove('is-shown');
    }, 3400);
  }

  function photoClick(event) {
    const frame = event.currentTarget;
    frame.classList.remove('is-peering');
    void frame.offsetWidth;
    frame.classList.add('is-peering');
    window.clearTimeout(templeState.peerTimer);
    templeState.peerTimer = window.setTimeout(function () {
      frame.classList.remove('is-peering');
    }, 2500);

    templeState.peerClicks += 1;
    if (templeState.peerClicks % 8 === 0) {
      peerCaptionShow(PEER_CAPTION_TIRED);
    } else {
      peerCaptionShow(PEER_CAPTIONS[templeState.peerIndex % PEER_CAPTIONS.length]);
      templeState.peerIndex += 1;
    }

    // A tiny sparkle where the glasses gleam.
    const rect = frame.getBoundingClientRect();
    burstEmojiSpawn(burstLayerGet(), rect.left + rect.width * 0.73, rect.top + rect.height * 0.56, REDUCED_MOTION ? 0 : 4, ['✨']);
  }

  // ---------------------------------------------------------------
  // Effects layer
  // ---------------------------------------------------------------

  function effectsRender(layer) {
    const narrow = window.innerWidth < 640;
    const sparkCount = narrow ? 14 : 22;
    const starCount = narrow ? 8 : 12;
    const candleCount = narrow ? 3 : 5;
    const parts = [];

    for (let index = 0; index < sparkCount; index += 1) {
      const duration = randomBetween(14, 28);
      parts.push(
        '<span class="fx-spark" style="' +
          '--x:' + randomBetween(0, 100).toFixed(2) + '%;' +
          '--s:' + randomBetween(3, 8).toFixed(1) + 'px;' +
          '--o:' + randomBetween(0.35, 0.85).toFixed(2) + ';' +
          '--sway:' + randomBetween(-60, 60).toFixed(0) + 'px;' +
          '--d:' + duration.toFixed(1) + 's;' +
          '--delay:' + (-randomBetween(0, duration)).toFixed(1) + 's"></span>'
      );
    }

    for (let index = 0; index < starCount; index += 1) {
      parts.push(
        '<span class="fx-star" style="' +
          '--x:' + randomBetween(2, 96).toFixed(2) + '%;' +
          '--y:' + randomBetween(2, 92).toFixed(2) + '%;' +
          '--s:' + randomBetween(8, 18).toFixed(0) + 'px;' +
          '--d:' + randomBetween(3, 7).toFixed(1) + 's;' +
          '--delay:' + (-randomBetween(0, 7)).toFixed(1) + 's">✦</span>'
      );
    }

    for (let index = 0; index < candleCount; index += 1) {
      const duration = randomBetween(38, 60);
      const left = ((index + 0.5) / candleCount) * 100 + randomBetween(-6, 6);
      parts.push(
        '<span class="fx-candle" style="' +
          '--x:' + Math.min(96, Math.max(2, left)).toFixed(2) + '%;' +
          '--sway:' + randomBetween(-40, 40).toFixed(0) + 'px;' +
          '--d:' + duration.toFixed(1) + 's;' +
          '--delay:' + (-randomBetween(0, duration)).toFixed(1) + 's"></span>'
      );
    }

    layer.innerHTML = parts.join('');
  }

  // ---------------------------------------------------------------
  // Footer
  // ---------------------------------------------------------------

  function footerRender(footer) {
    footer.innerHTML =
      '<div class="tf-marquee" aria-label="Благодарности">' +
        '<div class="tf-marquee__track">' + repeatedSpans(FOOTER_THANKS) + '</div>' +
      '</div>' +
      '<div class="tf-inner">' +
        '<div class="tf-seal"><img src="img/vasko.png" alt="" width="88" height="88"></div>' +
        '<ul class="tf-stats">' +
          '<li><b>1</b>домашка сделана — и этого хватило</li>' +
          '<li><b>вся</b>группа спасена, включая тех, кто не читал чат</li>' +
          '<li><b>∞</b>дней без паники перед научной студией</li>' +
        '</ul>' +
        '<p class="tf-copy">© Церковь Святой Домашки, основана в 2026 г. от С. Д. (от Сдачи Домашки)</p>' +
        '<p class="tf-joke">Все права защищены Васко. Все домашки — тоже. ' +
          'Пожертвования принимаются шавермой, энергетиками и зачётками.</p>' +
        '<p class="tf-small">Сайт собран с любовью группой, которая теперь спит спокойно. ' +
          'Ни одна домашка при создании не пострадала.</p>' +
        '<a class="tf-up" href="#temple-hero">↑ Вознестись к лику ↑</a>' +
      '</div>';
  }

  // ---------------------------------------------------------------
  // Burst: confetti, emoji, holy light, words
  // ---------------------------------------------------------------

  function burstLayerGet() {
    if (templeState.burstLayer && templeState.burstLayer.isConnected) {
      return templeState.burstLayer;
    }
    const layer = document.createElement('div');
    layer.id = 'temple-burst';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);
    templeState.burstLayer = layer;
    return layer;
  }

  function particleFly(element, options) {
    // options: vx, vy (px/s), gravity (px/s^2), duration (ms), spin (deg/s), flutter (bool)
    if (typeof element.animate !== 'function') {
      element.remove();
      return;
    }
    const frames = [];
    const steps = 10;
    const seconds = options.duration / 1000;
    for (let step = 0; step <= steps; step += 1) {
      const progress = step / steps;
      const time = progress * seconds;
      const drag = 1 - progress * 0.45;
      const dx = options.vx * time * drag;
      const dy = options.vy * time * drag + 0.5 * options.gravity * time * time;
      const rotation = options.spin * time;
      const flutter = options.flutter ? ' rotate3d(1, 0.4, 0, ' + (rotation * 2.2).toFixed(0) + 'deg)' : '';
      const scale = options.grow ? (0.4 + Math.min(1, progress * 4) * 0.8).toFixed(2) : '1';
      frames.push({
        transform: 'translate3d(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px,0) rotate(' + rotation.toFixed(0) + 'deg)' + flutter + ' scale(' + scale + ')',
        opacity: progress < 0.7 ? 1 : Math.max(0, (1 - progress) / 0.3)
      });
    }
    templeState.activeParticles += 1;
    const animation = element.animate(frames, { duration: options.duration, easing: 'linear', fill: 'forwards' });
    animation.onfinish = function () {
      templeState.activeParticles -= 1;
      element.remove();
    };
  }

  function burstConfettiSpawn(layer, x, y, count) {
    for (let index = 0; index < count; index += 1) {
      const piece = document.createElement('i');
      piece.className = Math.random() < 0.3 ? 'temple-confetti is-round' : 'temple-confetti';
      piece.style.left = x + 'px';
      piece.style.top = y + 'px';
      piece.style.background = randomPick(CONFETTI_COLORS);
      if (Math.random() < 0.35) {
        piece.style.boxShadow = '0 0 6px rgba(255, 220, 120, 0.9)';
      }
      layer.appendChild(piece);
      const angle = -Math.PI / 2 + randomBetween(-1, 1) * Math.PI * 0.62;
      const speed = randomBetween(380, 980);
      particleFly(piece, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 1500,
        duration: randomBetween(1700, 2800),
        spin: randomBetween(-720, 720),
        flutter: true
      });
    }
  }

  function burstEmojiSpawn(layer, x, y, count, pool) {
    for (let index = 0; index < count; index += 1) {
      const emoji = document.createElement('span');
      emoji.className = 'temple-emoji';
      emoji.textContent = randomPick(pool || BURST_EMOJI);
      emoji.style.left = x + 'px';
      emoji.style.top = y + 'px';
      emoji.style.fontSize = randomBetween(22, 42).toFixed(0) + 'px';
      layer.appendChild(emoji);
      const ascending = Math.random() < 0.5;
      const angle = -Math.PI / 2 + randomBetween(-1, 1) * Math.PI * 0.55;
      const speed = randomBetween(220, 620);
      particleFly(emoji, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: ascending ? -120 : 900,
        duration: randomBetween(1900, 3200),
        spin: randomBetween(-160, 160),
        flutter: false,
        grow: true
      });
    }
  }

  function burstLightSpawn(layer, x, y) {
    const flash = document.createElement('div');
    flash.className = 'temple-flash';
    flash.style.background =
      'radial-gradient(circle at ' + x + 'px ' + y + 'px, rgba(255,255,245,0.95) 0%, rgba(255,236,170,0.55) 14%, rgba(245,197,66,0.18) 36%, rgba(245,197,66,0) 62%)';
    layer.appendChild(flash);

    const beam = document.createElement('div');
    beam.className = 'temple-beam';
    beam.style.left = x + 'px';
    beam.style.height = Math.max(80, y + 60) + 'px';
    layer.appendChild(beam);

    if (typeof flash.animate !== 'function') {
      flash.remove();
      beam.remove();
      return;
    }
    const peak = REDUCED_MOTION ? 0.45 : 1;
    flash.animate(
      [{ opacity: 0 }, { opacity: peak, offset: 0.12 }, { opacity: 0 }],
      { duration: REDUCED_MOTION ? 500 : 900, easing: 'ease-out' }
    ).onfinish = function () { flash.remove(); };
    beam.animate(
      [
        { opacity: 0, transform: 'scaleX(0.3)' },
        { opacity: REDUCED_MOTION ? 0.4 : 0.9, transform: 'scaleX(1)', offset: 0.2 },
        { opacity: 0, transform: 'scaleX(1.4)' }
      ],
      { duration: 1400, easing: 'ease-out' }
    ).onfinish = function () { beam.remove(); };
  }

  function burstWordSpawn(layer, x, y) {
    const word = document.createElement('span');
    word.className = 'temple-word';
    word.textContent = randomPick(HOLY_WORDS);
    const margin = 120;
    word.style.left = Math.min(window.innerWidth - margin, Math.max(margin, x)) + 'px';
    word.style.top = Math.max(60, y - 40) + 'px';
    layer.appendChild(word);
    if (typeof word.animate !== 'function') {
      window.setTimeout(function () { word.remove(); }, 1500);
      return;
    }
    word.animate(
      [
        { opacity: 0, transform: 'translate(-50%, -50%) scale(0.4)' },
        { opacity: 1, transform: 'translate(-50%, -90%) scale(1.15)', offset: 0.18 },
        { opacity: 1, transform: 'translate(-50%, -140%) scale(1)', offset: 0.7 },
        { opacity: 0, transform: 'translate(-50%, -190%) scale(0.95)' }
      ],
      { duration: 1700, easing: 'ease-out' }
    ).onfinish = function () { word.remove(); };
  }

  function templeCelebrate(x, y) {
    if (typeof x !== 'number' || typeof y !== 'number' || !isFinite(x) || !isFinite(y)) {
      x = window.innerWidth / 2;
      y = window.innerHeight / 2;
    }
    const layer = burstLayerGet();
    const crowded = templeState.activeParticles > 450;
    const confettiCount = REDUCED_MOTION ? 0 : (crowded ? 20 : 80);
    const emojiCount = REDUCED_MOTION ? 0 : (crowded ? 5 : 16);

    burstLightSpawn(layer, x, y);
    burstConfettiSpawn(layer, x, y, confettiCount);
    burstEmojiSpawn(layer, x, y, emojiCount);
    burstWordSpawn(layer, x, y);
    choirPlay();
  }

  // ---------------------------------------------------------------
  // Angelic choir (Web Audio, only after a click)
  // ---------------------------------------------------------------

  function audioContextGet() {
    if (!templeState.audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        return null;
      }
      try {
        templeState.audioContext = new AudioContextClass();
      } catch (error) {
        return null;
      }
    }
    if (templeState.audioContext.state === 'suspended') {
      templeState.audioContext.resume();
    }
    return templeState.audioContext;
  }

  function reverbGet(context) {
    if (templeState.reverbNode) {
      return templeState.reverbNode;
    }
    // A cathedral: 3.2 seconds of decaying stereo noise.
    const seconds = 3.2;
    const length = Math.floor(context.sampleRate * seconds);
    const impulse = context.createBuffer(2, length, context.sampleRate);
    for (let channel = 0; channel < 2; channel += 1) {
      const data = impulse.getChannelData(channel);
      for (let index = 0; index < length; index += 1) {
        data[index] = (Math.random() * 2 - 1) * Math.pow(1 - index / length, 2.6);
      }
    }
    const convolver = context.createConvolver();
    convolver.buffer = impulse;
    const wet = context.createGain();
    wet.gain.value = 0.55;
    convolver.connect(wet);
    wet.connect(context.destination);
    templeState.reverbNode = convolver;
    return convolver;
  }

  function choirPlay() {
    const context = audioContextGet();
    if (!context) {
      return;
    }
    const now = context.currentTime;
    if (now - templeState.lastChoirTime < 0.28) {
      return;
    }
    templeState.lastChoirTime = now;

    const chord = CHOIR_CHORDS[templeState.chordIndex % CHOIR_CHORDS.length];
    templeState.chordIndex += 1;
    const endTime = now + 3.2;

    // Envelope: slow swell, hold, long release.
    const master = context.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.2, now + 0.28);
    master.gain.setValueAtTime(0.2, now + 1.0);
    master.gain.exponentialRampToValueAtTime(0.0001, endTime);
    master.connect(context.destination);
    master.connect(reverbGet(context));

    // Vowel "аа" formants turn sawtooth buzz into voices.
    const voiceBus = context.createGain();
    voiceBus.gain.value = 0.5;
    const formants = [[750, 7, 1.0], [1150, 9, 0.55], [2500, 11, 0.22]];
    for (let index = 0; index < formants.length; index += 1) {
      const filter = context.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = formants[index][0];
      filter.Q.value = formants[index][1];
      const gain = context.createGain();
      gain.gain.value = formants[index][2] * 2.2;
      voiceBus.connect(filter);
      filter.connect(gain);
      gain.connect(master);
    }
    const body = context.createBiquadFilter();
    body.type = 'lowpass';
    body.frequency.value = 900;
    const bodyGain = context.createGain();
    bodyGain.gain.value = 0.25;
    voiceBus.connect(body);
    body.connect(bodyGain);
    bodyGain.connect(master);

    // Shared vibrato.
    const vibrato = context.createOscillator();
    vibrato.frequency.value = 5.3;
    const vibratoDepth = context.createGain();
    vibratoDepth.gain.value = 7;
    vibrato.connect(vibratoDepth);
    vibrato.start(now);
    vibrato.stop(endTime);

    const detunes = [-11, 0, 9];
    for (let noteIndex = 0; noteIndex < chord.length; noteIndex += 1) {
      for (let voiceIndex = 0; voiceIndex < detunes.length; voiceIndex += 1) {
        const oscillator = context.createOscillator();
        oscillator.type = 'sawtooth';
        oscillator.frequency.value = chord[noteIndex];
        oscillator.detune.value = detunes[voiceIndex] + randomBetween(-3, 3);
        vibratoDepth.connect(oscillator.detune);
        const voiceGain = context.createGain();
        voiceGain.gain.value = 0.09;
        oscillator.connect(voiceGain);
        voiceGain.connect(voiceBus);
        oscillator.start(now + noteIndex * 0.03);
        oscillator.stop(endTime);
      }
    }

    // Heavenly sparkle: a quick bell arpeggio on top.
    const top = chord[chord.length - 1] * 2;
    const bellNotes = [top, top * 1.2599, top * 1.4983, top * 2];
    for (let bellIndex = 0; bellIndex < bellNotes.length; bellIndex += 1) {
      const start = now + 0.05 + bellIndex * 0.07;
      const bell = context.createOscillator();
      bell.type = 'sine';
      bell.frequency.value = bellNotes[bellIndex];
      const bellGain = context.createGain();
      bellGain.gain.setValueAtTime(0.0001, start);
      bellGain.gain.exponentialRampToValueAtTime(0.06, start + 0.01);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, start + 1.1);
      bell.connect(bellGain);
      bellGain.connect(master);
      bell.start(start);
      bell.stop(start + 1.2);
    }
  }

  // ---------------------------------------------------------------
  // Easter egg: type "васко" or "vasko" anywhere on the page.
  // ---------------------------------------------------------------

  function secretWordKeydown(event) {
    const target = event.target;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
      return;
    }
    if (!event.key || event.key.length !== 1) {
      return;
    }
    templeState.typedKeys = (templeState.typedKeys + event.key.toLowerCase()).slice(-8);
    if (/(васко|vasko)$/.test(templeState.typedKeys)) {
      templeState.typedKeys = '';
      templeCelebrate(window.innerWidth / 2, window.innerHeight * 0.4);
    }
  }

  // ---------------------------------------------------------------
  // Start
  // ---------------------------------------------------------------

  window.templeCelebrate = templeCelebrate;
  window.templePraise = praiseAdd;

  function templeStart() {
    templeState.praiseCount = praiseCountLoad();

    const hero = document.getElementById('temple-hero');
    if (hero) {
      heroRender(hero);
      praiseDisplayUpdate(false);
      const praiseButton = hero.querySelector('.praise-btn');
      praiseButton.addEventListener('click', praiseButtonClick);
      praiseButton.addEventListener('animationend', function (event) {
        if (event.animationName === 'btn-pop') {
          praiseButton.classList.remove('is-pressed');
        }
      });
      hero.querySelector('.vasko-frame').addEventListener('click', photoClick);
      hero.addEventListener('animationend', function (event) {
        if (event.animationName === 'count-bump') {
          event.target.classList.remove('is-bumped');
        }
      });
    }

    const effects = document.getElementById('temple-effects');
    if (effects) {
      effectsRender(effects);
    }

    const footer = document.getElementById('temple-footer');
    if (footer) {
      footerRender(footer);
    }

    document.addEventListener('keydown', secretWordKeydown);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', templeStart);
  } else {
    templeStart();
  }
})();
