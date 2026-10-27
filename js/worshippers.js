// =====================================================================
// "Молящиеся человечки": the shrine of Saint Vasko and his bowing flock.
// Builds everything inside <section id="worshippers">.
// Optional link to the temple part: window.templeCelebrate(x, y) is
// called with viewport coordinates when someone touches the holy photo.
// =====================================================================

(function () {
  'use strict';

  const root = document.getElementById('worshippers');
  if (!root) {
    return;
  }

  const MAX_PEOPLE = 60;
  const BUBBLE_LIFE_MS = 3400;
  const MAX_BUBBLES = 3;
  const MASS_BOW_MS = 3900;

  const motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

  function isReducedMotion() {
    return Boolean(motionQuery && motionQuery.matches);
  }

  // ---------------------------------------------------------------------
  // Texts
  // ---------------------------------------------------------------------

  const PHRASES = [
    'Васко, ты бог 🙏',
    'Я даже не открывал задание…',
    'Научная студия побеждена!',
    'Аминь',
    'Слава Васко!',
    'Я назову сына Васко',
    'Он сделал всё. Даже то, что не задавали',
    'Дедлайн трепещет пред ним',
    'Преподаватель плакал от красоты',
    'А что вообще было задано?',
    'Васко, распишись в моей зачётке',
    'Я поставил свечку. Три свечки.',
    'Мы недостойны!',
    'ДОМАШКА.pdf — моя новая библия',
    'Ctrl+C, Ctrl+V, Ctrl+Аминь',
    'Пришёл, увидел, сдал',
    'Моя мама теперь тоже молится Васко',
    'Святой покровитель дедлайнов',
    'Я думал, научная студия — это фотостудия',
    'Васко, благослови мою курсовую',
    'Говорят, он решает задачи во сне',
    'Сессия? Не боюсь. У нас есть Васко',
    'Пять из пяти. Нет, шесть из пяти!',
    'Он опускает очки — и задачи решаются сами',
    'Я принёс ему печеньки 🍪',
    'В его кудрях хранится мудрость веков',
    'Простите, я спал на паре',
    'Перчатки — чтобы не оставлять отпечатков гениальности',
    'Где записаться в секту?',
    'Можно и мне кусочек благодати?',
    'Аллилуйя! Зачёт!',
    'Ом-м-м… Васко-о-о…',
    'Распечатал его фото и повесил над кроватью',
    'Даже нейросети ему кланяются',
    'Я теперь верю в чудеса',
    'Он спас нас всех. Всю. Группу.',
    'Кто не кланяется — тот делает домашку сам',
    'Васко, научи меня жить',
    'Это был не человек. Это была легенда',
    'Я плачу. Это слёзы благодарности'
  ];

  const ARRIVAL_PHRASES = [
    'Я опоздал, но я верую!',
    'Пропустите, я тоже хочу поклониться!',
    'Говорят, тут раздают благодать',
    'Я из параллельной группы, можно?',
    'Услышал о чуде — прибежал',
    'Мне сказали, тут спасают от дедлайнов',
    'Я с пары сбежал ради этого',
    'Где тут кланяются Васко?'
  ];

  const TOUCH_PHRASES = [
    'ОН КОСНУЛСЯ НАС!',
    'Лик засиял!',
    'Я видел свет!',
    'Благодать снизошла!',
    'Осторожно, святыня!',
    'Чудо! Чудо!'
  ];

  const SIGNS = [
    'СПАСИБО ВАСКО',
    'ВАСКО ТОП',
    'МЫ НЕДОСТОЙНЫ',
    '5/5',
    'ВАСКО — ЛЕГЕНДА',
    '♥ ВАСКО ♥',
    'СПАС ГРУППУ',
    'ДОМАШКА ✓',
    'ЗАЧЁТ!',
    'ВАСКО > ДЕДЛАЙН',
    'АМИНЬ',
    '10/10'
  ];

  const CHANTS = [
    'СЛА-А-АВА ВАСКО!',
    'МЫ НЕДОСТОЙНЫ!',
    'А-А-АМИНЬ!',
    'ВАСКО! ВАСКО! ВАСКО!'
  ];

  // Crowd size thresholds and the rank shown under the counter.
  const RANKS = [
    [0, 'тайный кружок'],
    [20, 'верная паства'],
    [30, 'растущий культ'],
    [40, 'мегацерковь'],
    [50, 'вселенский собор'],
    [60, 'мест нет: молимся из коридора']
  ];

  // ---------------------------------------------------------------------
  // Palettes for the little people
  // ---------------------------------------------------------------------

  const SKINS = ['#ffdcbc', '#f6cfa4', '#eab38a', '#d99a6c', '#c68642', '#9c6a3c', '#7a4a26'];
  const SHIRTS = ['#e85d75', '#4fc3a1', '#5aa9e6', '#f7a35c', '#b388eb', '#ff8fab', '#7bd389', '#ffd166', '#6c8cff', '#f4845f', '#3ec1d3', '#e9e3d5'];
  const PANTS = ['#2b2d42', '#3d405b', '#264653', '#4a3b5c', '#2f3e46', '#1d3557'];
  const HAIRS = ['#2b1d14', '#5a3825', '#8b5a2b', '#d9a441', '#1b1b1b', '#b5462f', '#e8c07d', '#7f5af0', '#3b2a20'];
  const HATS = ['#e63946', '#2a9d8f', '#f4a261', '#8338ec', '#3a86ff', '#ef476f'];
  const MATS = ['#7a1f3d', '#1f4e79', '#5b2a86', '#1e6f5c', '#8a3b12', '#6d1a5e'];
  const HAIR_STYLES = ['short', 'curly', 'long', 'bun', 'ponytail', 'beanie', 'cap', 'spiky', 'short', 'long', 'curly'];

  // ---------------------------------------------------------------------
  // Small helpers
  // ---------------------------------------------------------------------

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function shuffled(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  // Returns a function that hands out the list items in random order and
  // reshuffles when the list runs out, so phrases rarely repeat.
  function deckMake(list) {
    let deck = [];
    return function deckNext() {
      if (deck.length === 0) {
        deck = shuffled(list);
      }
      return deck.pop();
    };
  }

  const phraseNext = deckMake(PHRASES);
  const signNext = deckMake(SIGNS);

  // Multiplies each RGB channel of a #rrggbb colour by factor.
  function shade(hex, factor) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.min(255, Math.round(((n >> 16) & 255) * factor));
    const g = Math.min(255, Math.round(((n >> 8) & 255) * factor));
    const b = Math.min(255, Math.round((n & 255) * factor));
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  function restartClass(el, className) {
    el.classList.remove(className);
    void el.offsetWidth;
    el.classList.add(className);
  }

  function celebrateAt(x, y) {
    if (typeof window.templeCelebrate === 'function') {
      try {
        window.templeCelebrate(x, y);
      } catch (err) {
        // The temple effect failed; the shrine works without it.
      }
    }
  }

  // ---------------------------------------------------------------------
  // SVG figures (viewBox 0 0 80 100, facing right, ground at y = 96)
  // ---------------------------------------------------------------------

  const HAIR_SHORT = 'M-11.6 1 C-12.5 -9 -5 -13.5 1.5 -13 C8 -12.5 11.5 -8.5 11.6 -3.5 C8 -6.5 3 -7.5 -1 -6 C-4 -5 -5.5 -2 -6.5 2 Z';
  const HAIR_LONG = 'M-11.8 2 C-13 -10 -5 -14 1.5 -13.5 C8 -13 11.8 -8.5 11.8 -3 C8 -6.5 3 -7.5 -1 -6 C-3.5 -3 -3.5 6 -2 14 C-6 16.5 -11.5 15.5 -14 12 C-12.5 9 -11.8 6 -11.8 2 Z';

  function hairSvg(p) {
    const h = p.hair;
    const short = '<path d="' + HAIR_SHORT + '" fill="' + h + '"/>';
    if (p.hairStyle === 'curly') {
      const curls = [[-10, -3, 4.6], [-8, -9, 5], [-2, -12, 5], [4, -11.5, 4.6], [9, -7.5, 4], [-11.5, 3, 4.2], [-9.5, 8.5, 3.6]];
      let out = short;
      for (let i = 0; i < curls.length; i += 1) {
        out += '<circle cx="' + curls[i][0] + '" cy="' + curls[i][1] + '" r="' + curls[i][2] + '" fill="' + h + '"/>';
      }
      return out;
    }
    if (p.hairStyle === 'long') {
      return '<path d="' + HAIR_LONG + '" fill="' + h + '"/>';
    }
    if (p.hairStyle === 'bun') {
      return short + '<circle cx="-5" cy="-13.5" r="5.2" fill="' + h + '"/>' +
        '<rect x="-8.5" y="-10.6" width="7" height="2" rx="1" fill="' + p.hat + '"/>';
    }
    if (p.hairStyle === 'ponytail') {
      return short + '<path d="M-10 -6 C-18 -8 -21 1 -16.5 9 C-15 3 -13 -1 -9 -2 Z" fill="' + h + '"/>' +
        '<circle cx="-11" cy="-4.5" r="1.8" fill="' + p.hat + '"/>';
    }
    if (p.hairStyle === 'beanie') {
      return '<path d="M-11.5 2 C-12.5 -2 -12 -4 -11 -4 L-6 -3 C-6 0 -7 2 -11.5 2 Z" fill="' + h + '"/>' +
        '<path d="M-12 -1 C-12.5 -12 -5 -16 1 -16 C7.5 -16 12.5 -11 12 -2 Z" fill="' + p.hat + '"/>' +
        '<rect x="-12.8" y="-4" width="25.6" height="4.6" rx="2.3" fill="' + shade(p.hat, 0.78) + '"/>' +
        '<circle cx="0" cy="-16.5" r="3.6" fill="#fff6e0"/>';
    }
    if (p.hairStyle === 'cap') {
      return short +
        '<path d="M-11.2 -3 C-11.2 -12 -4 -14.5 1.5 -14.5 C7.5 -14.5 11.2 -10 11.2 -4 Z" fill="' + p.hat + '"/>' +
        '<path d="M8.5 -5.5 L19 -4 Q20.2 -2.2 18 -1.8 L8.5 -2.4 Z" fill="' + shade(p.hat, 0.72) + '"/>';
    }
    if (p.hairStyle === 'spiky') {
      return '<path d="M-11.5 2 L-13.5 -6 L-8 -8 L-9.5 -14.5 L-3 -11 L-0.5 -17.5 L3 -11.5 L8.5 -14.5 L8.5 -8.5 L12.5 -5 L5 -6 L-1 -6 C-4 -4 -5.5 -1 -6.5 2 Z" fill="' + h + '"/>';
    }
    return short;
  }

  function headSvg(p, x, y) {
    let out = '<g transform="translate(' + x + ' ' + y + ')">' +
      '<circle r="11" fill="' + p.skin + '"/>' +
      hairSvg(p) +
      '<circle cx="-1.5" cy="1.5" r="2.4" fill="' + p.skinDark + '"/>' +
      '<path d="M3.4 -1.2 Q5.6 -3.8 7.8 -1.2" stroke="#2a1a12" stroke-width="1.4" fill="none" stroke-linecap="round"/>' +
      '<circle cx="6.6" cy="3.2" r="2.3" fill="#ff6f86" opacity="0.45"/>' +
      '<path d="M5.2 4.6 Q8.6 9.2 10.9 4 Z" fill="#5a1f2a"/>';
    if (p.glasses) {
      out += '<circle cx="5.8" cy="-1.6" r="3.3" fill="rgba(255,255,255,0.18)" stroke="#f5c542" stroke-width="1"/>' +
        '<path d="M2.5 -2.2 L-5.5 -3.2" stroke="#f5c542" stroke-width="0.9"/>';
    }
    return out + '</g>';
  }

  function armSvg(p, cls, x, top, bottom, color) {
    return '<g class="w-arm ' + cls + '">' +
      '<path d="M' + x + ' ' + top + ' L' + x + ' ' + bottom + '" stroke="' + color + '" stroke-width="5" stroke-linecap="round"/>' +
      '<circle cx="' + x + '" cy="' + (bottom + 2) + '" r="3.1" fill="' + p.skinDark + '"/>' +
      '</g>';
  }

  function standingSvg(p) {
    const shirtDark = shade(p.shirt, 0.72);
    return '<ellipse class="w-shadow" cx="33" cy="96" rx="17" ry="3"/>' +
      '<g class="w-leg w-leg-b"><path d="M32 64 L34 91" stroke="' + shade(p.pants, 0.8) + '" stroke-width="6" stroke-linecap="round"/>' +
      '<ellipse cx="36.5" cy="93.6" rx="5" ry="2.6" fill="#1d1426"/></g>' +
      '<g class="w-leg w-leg-a"><path d="M28 64 L27 91" stroke="' + p.pants + '" stroke-width="6" stroke-linecap="round"/>' +
      '<ellipse cx="29.5" cy="93.8" rx="5" ry="2.6" fill="#241a30"/></g>' +
      '<g class="w-torso">' +
      armSvg(p, 'w-arm-back', 27.5, 44, 63, shirtDark) +
      '<rect x="21" y="38" width="18" height="29" rx="8" fill="' + p.shirt + '"/>' +
      '<path d="M26.5 38.6 L31 43.5 L35.5 38.6" stroke="' + shirtDark + '" stroke-width="1.3" fill="none"/>' +
      headSvg(p, 31, 26) +
      armSvg(p, 'w-arm-front', 30, 44, 63, shade(p.shirt, 0.9)) +
      '</g>';
  }

  function kneelingSvg(p) {
    const shirtDark = shade(p.shirt, 0.72);
    return '<rect class="w-mat" x="1" y="90.5" width="66" height="7.5" rx="2.5" fill="' + p.mat + '" stroke="#e8b84a" stroke-width="1"/>' +
      '<rect x="5" y="92.6" width="58" height="3.3" rx="1.5" fill="none" stroke="rgba(255,215,120,0.65)" stroke-dasharray="2 1.6" stroke-width="0.8"/>' +
      '<path d="M1 92 l-3 -1 M1 94.2 l-3 0 M1 96.4 l-3 1 M67 92 l3 -1 M67 94.2 l3 0 M67 96.4 l3 1" stroke="#e8b84a" stroke-width="0.8"/>' +
      '<path d="M24 80 L40 89 L15 89.5" stroke="' + p.pants + '" stroke-width="7.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<ellipse cx="12.5" cy="89.6" rx="4.6" ry="2.5" fill="#241a30"/>' +
      '<g class="w-torso">' +
      armSvg(p, 'w-arm-back', 21.5, 58, 77, shirtDark) +
      '<rect x="15" y="52" width="18" height="30" rx="8" fill="' + p.shirt + '"/>' +
      '<path d="M20.5 52.6 L25 57.5 L29.5 52.6" stroke="' + shirtDark + '" stroke-width="1.3" fill="none"/>' +
      headSvg(p, 25, 40) +
      armSvg(p, 'w-arm-front', 24, 58, 77, shade(p.shirt, 0.9)) +
      '</g>';
  }

  function figureSvg(p) {
    const inner = p.pose === 'kneel' ? kneelingSvg(p) : standingSvg(p);
    return '<svg class="w-fig" viewBox="0 0 80 100" focusable="false" aria-hidden="true">' + inner + '</svg>';
  }

  // ---------------------------------------------------------------------
  // Static markup: heading, stage, altar, controls
  // ---------------------------------------------------------------------

  function candleHtml(height) {
    return '<span class="w-candle" style="--h:' + height + ';--fd:' + rand(0.9, 1.6).toFixed(2) + 's;--fdl:-' + rand(0, 2).toFixed(2) + 's">' +
      '<span class="w-flame"></span></span>';
  }

  function motesHtml(count) {
    let out = '';
    for (let i = 0; i < count; i += 1) {
      out += '<span class="w-mote" style="--x:' + rand(5, 95).toFixed(1) + '%;--dx:' + rand(-30, 30).toFixed(0) + 'px;--t:' +
        rand(5, 9).toFixed(2) + 's;--dl:-' + rand(0, 9).toFixed(2) + 's"></span>';
    }
    return out;
  }

  function altarHtml() {
    return '<div class="w-altar">' +
      '<div class="w-rays" aria-hidden="true"></div>' +
      '<div class="w-glow" aria-hidden="true"></div>' +
      '<div class="w-motes" aria-hidden="true">' + motesHtml(12) + '</div>' +
      '<div class="w-shrine">' +
      '<div class="w-halo" aria-hidden="true"></div>' +
      '<button type="button" class="w-frame" aria-label="Коснуться святого лика Васко">' +
      '<span class="w-frame-in"><img class="w-photo" src="img/vasko.png" width="646" height="653" ' +
      'alt="Святой Васко Копаев в чёрных перчатках опускает золотые очки"></span></button>' +
      '<div class="w-plaque">СВ. ВАСКО</div>' +
      '</div>' +
      '<div class="w-table" aria-hidden="true">' +
      '<span class="w-candles">' + candleHtml(54) + candleHtml(40) + candleHtml(28) + '</span>' +
      '<span class="w-scrolls">' +
      '<span class="w-pdf">ДОМАШКА.pdf</span>' +
      '<span class="w-scroll-row"><i class="w-scroll"></i></span>' +
      '<span class="w-scroll-row"><i class="w-scroll"></i><i class="w-scroll"></i></span>' +
      '<span class="w-twinkle" style="--x:-14%;--y:18%;--dl:0s">✦</span>' +
      '<span class="w-twinkle" style="--x:104%;--y:6%;--dl:-0.8s">✦</span>' +
      '<span class="w-twinkle" style="--x:92%;--y:62%;--dl:-1.6s">✧</span>' +
      '</span>' +
      '<span class="w-candles">' + candleHtml(28) + candleHtml(40) + candleHtml(54) + '</span>' +
      '</div>' +
      '<div class="w-slab" aria-hidden="true"></div>' +
      '<div class="w-pedestal">' +
      '<span class="w-pedestal-top">✦ Спаситель группы ✦</span>' +
      '<span class="w-pedestal-sub">победитель научной студии</span>' +
      '</div>' +
      '<div class="w-steps" aria-hidden="true"><i></i><i></i></div>' +
      '</div>';
  }

  root.innerHTML =
    '<h2 class="section-title">Паства Васко</h2>' +
    '<p class="section-subtitle w-lead">Сюда приходит каждый, кому Васко сделал домашку по научной студии. ' +
    'То есть вся группа. Они кланяются. Они молятся. Они до сих пор не верят, что всё сдано.</p>' +
    '<div class="w-stage">' +
    '<div class="w-chant" aria-hidden="true"></div>' +
    '<div class="w-flock w-flock-l" aria-hidden="true"></div>' +
    altarHtml() +
    '<div class="w-flock w-flock-r" aria-hidden="true"></div>' +
    '</div>' +
    '<div class="w-controls">' +
    '<div class="w-counter" role="status" aria-live="polite">' +
    '<span class="w-count-label">Молящихся: <b class="w-count-num">0</b></span>' +
    '<span class="w-rank"></span></div>' +
    '<button type="button" class="w-btn w-btn-join">➕ Присоединиться к молящимся</button>' +
    '<button type="button" class="w-btn w-btn-bow">🙇 Поклониться всем</button>' +
    '</div>' +
    '<p class="w-hint">Коснитесь святого лика. Или любого человечка: он скажет, что думает.</p>';

  const stage = root.querySelector('.w-stage');
  const flockL = root.querySelector('.w-flock-l');
  const flockR = root.querySelector('.w-flock-r');
  const altar = root.querySelector('.w-altar');
  const frame = root.querySelector('.w-frame');
  const photo = root.querySelector('.w-photo');
  const chant = root.querySelector('.w-chant');
  const countNum = root.querySelector('.w-count-num');
  const rankEl = root.querySelector('.w-rank');
  const joinBtn = root.querySelector('.w-btn-join');
  const bowBtn = root.querySelector('.w-btn-bow');

  // ---------------------------------------------------------------------
  // People
  // ---------------------------------------------------------------------

  // Each record: { data, el, isLeft, z, walking, talking }.
  const people = [];
  let activeBubbles = 0;
  let massTimer = 0;
  let sectionVisible = true;

  function personDataMake(pose) {
    const skin = pick(SKINS);
    return {
      pose: pose,
      skin: skin,
      skinDark: shade(skin, 0.9),
      shirt: pick(SHIRTS),
      pants: pick(PANTS),
      hair: pick(HAIRS),
      hairStyle: pick(HAIR_STYLES),
      hat: pick(HATS),
      mat: pick(MATS),
      glasses: Math.random() < 0.22,
      scale: rand(0.86, 1.12),
      sign: pose === 'sign' ? signNext() : '',
      jitter: rand(-0.12, 0.12)
    };
  }

  function personElMake(data) {
    const el = document.createElement('div');
    let cls = 'w-person';
    if (data.pose === 'kneel') {
      cls += ' w-pose-kneel';
    } else {
      cls += ' w-pose-stand';
    }
    if (data.pose === 'sign') {
      cls += ' w-pose-sign';
    }
    el.className = cls;
    el.style.setProperty('--s', data.scale.toFixed(2));
    let body = '<div class="w-body">' + figureSvg(data);
    if (data.pose === 'sign') {
      body += '<div class="w-sign"><span></span></div>';
    }
    el.innerHTML = body + '</div>';
    if (data.pose === 'sign') {
      el.querySelector('.w-sign span').textContent = data.sign;
    }
    return el;
  }

  // Sets the animation delay of one person from the distance to the altar,
  // so the bow travels outwards from the shrine like a wave.
  function waveSet(person, altarX, altarY) {
    const r = person.el.getBoundingClientRect();
    const dx = r.left + r.width / 2 - altarX;
    const dy = r.top + r.height / 2 - altarY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    person.el.style.setProperty('--d', (dist * 0.0034 + person.data.jitter).toFixed(3) + 's');
    person.el.style.setProperty('--md', (dist * 0.0009).toFixed(3) + 's');
  }

  function altarCenter() {
    const a = altar.getBoundingClientRect();
    return [a.left + a.width / 2, a.top + a.height * 0.45];
  }

  function wavesUpdate() {
    const c = altarCenter();
    for (let i = 0; i < people.length; i += 1) {
      if (!people[i].walking) {
        waveSet(people[i], c[0], c[1]);
      }
    }
  }

  function personAdd(pose, walk) {
    const isLeft = flockL.children.length <= flockR.children.length;
    const flockEl = isLeft ? flockL : flockR;
    const data = personDataMake(pose);
    const el = personElMake(data);
    const person = { data: data, el: el, isLeft: isLeft, z: 100 - flockEl.children.length, walking: false, talking: false };
    el.style.zIndex = String(person.z);
    flockEl.appendChild(el);
    people.push(person);
    el.addEventListener('click', function () {
      personPoke(person);
    });
    if (walk) {
      walkIn(person);
    }
    return person;
  }

  function walkIn(person) {
    const el = person.el;
    const arrival = people.length >= MAX_PEOPLE
      ? 'Последнее место! Остальные — в коридор'
      : pick(ARRIVAL_PHRASES);

    if (isReducedMotion() || typeof el.animate !== 'function') {
      el.classList.add('w-appear');
      const c = altarCenter();
      waveSet(person, c[0], c[1]);
      window.setTimeout(function () {
        bubbleShow(person, arrival, true);
      }, 300);
      return;
    }

    const stageRect = stage.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const dx = person.isLeft ? -(r.right - stageRect.left + 10) : (stageRect.right - r.left + 10);
    const duration = Math.min(4200, Math.max(1500, Math.abs(dx) * 6));

    person.walking = true;
    el.classList.add('w-walking');
    el.style.zIndex = '250';
    const anim = el.animate(
      [{ transform: 'translateX(' + dx.toFixed(0) + 'px)' }, { transform: 'translateX(0px)' }],
      { duration: duration, easing: 'cubic-bezier(.3,.1,.5,1)' }
    );
    anim.onfinish = function () {
      person.walking = false;
      el.classList.remove('w-walking');
      el.style.zIndex = String(person.z);
      const c = altarCenter();
      waveSet(person, c[0], c[1]);
      restartClass(el, 'w-joy');
      bubbleShow(person, arrival, true);
    };
  }

  // ---------------------------------------------------------------------
  // Speech bubbles
  // ---------------------------------------------------------------------

  function bubbleShow(person, text, force) {
    if (person.talking || person.walking) {
      return;
    }
    // Pokes and arrivals may exceed the usual limit, but not flood the stage.
    if (activeBubbles >= (force ? MAX_BUBBLES * 2 : MAX_BUBBLES)) {
      return;
    }
    person.talking = true;
    activeBubbles += 1;

    const bubble = document.createElement('div');
    bubble.className = 'w-bubble';
    bubble.textContent = text;
    person.el.appendChild(bubble);
    person.el.style.zIndex = '300';

    // Keep the bubble inside the stage; the tail still points at the person.
    const sr = stage.getBoundingClientRect();
    const br = bubble.getBoundingClientRect();
    let shift = 0;
    if (br.left < sr.left + 6) {
      shift = sr.left + 6 - br.left;
    } else if (br.right > sr.right - 6) {
      shift = sr.right - 6 - br.right;
    }
    bubble.style.setProperty('--bx', Math.round(shift) + 'px');
    if (br.top < sr.top + 4) {
      bubble.classList.add('w-bubble-low');
    }
    bubble.classList.add('w-pop');

    window.setTimeout(function () {
      bubble.remove();
      activeBubbles -= 1;
      person.talking = false;
      if (!person.walking) {
        person.el.style.zIndex = String(person.z);
      }
    }, BUBBLE_LIFE_MS);
  }

  function bubbleRandom(phrase) {
    const idle = [];
    for (let i = 0; i < people.length; i += 1) {
      if (!people[i].walking && !people[i].talking) {
        idle.push(people[i]);
      }
    }
    if (idle.length > 0) {
      bubbleShow(pick(idle), phrase, false);
    }
  }

  function bubbleLoop() {
    window.setTimeout(function () {
      if (sectionVisible && !document.hidden) {
        bubbleRandom(phraseNext());
      }
      bubbleLoop();
    }, rand(1300, 2500));
  }

  function personPoke(person) {
    if (person.walking) {
      return;
    }
    restartClass(person.el, 'w-joy');
    bubbleShow(person, phraseNext(), true);
  }

  // ---------------------------------------------------------------------
  // Counter, buttons, shrine
  // ---------------------------------------------------------------------

  function countUpdate(bump) {
    const n = people.length;
    countNum.textContent = String(n);
    let rank = RANKS[0][1];
    for (let i = 0; i < RANKS.length; i += 1) {
      if (n >= RANKS[i][0]) {
        rank = RANKS[i][1];
      }
    }
    rankEl.textContent = 'уровень: ' + rank;
    if (n >= MAX_PEOPLE) {
      joinBtn.disabled = true;
      joinBtn.textContent = '🙏 Храм переполнен';
    }
    if (bump) {
      restartClass(countNum, 'w-bump');
    }
  }

  function joinClick() {
    if (people.length >= MAX_PEOPLE) {
      return;
    }
    personAdd(Math.random() < 0.35 ? 'sign' : 'stand', true);
    countUpdate(true);
  }

  function bowAll() {
    if (massTimer) {
      return;
    }
    stage.classList.add('w-mass');
    altar.classList.add('w-blessed');
    chant.textContent = pick(CHANTS);
    restartClass(chant, 'w-on');
    const fr = frame.getBoundingClientRect();
    celebrateAt(fr.left + fr.width / 2, fr.top + fr.height * 0.4);
    massTimer = window.setTimeout(function () {
      stage.classList.remove('w-mass');
      altar.classList.remove('w-blessed');
      chant.classList.remove('w-on');
      massTimer = 0;
    }, MASS_BOW_MS);
  }

  function sparkBurst(x, y) {
    if (isReducedMotion()) {
      return;
    }
    const glyphs = ['✦', '✧', '★', '✨'];
    for (let i = 0; i < 14; i += 1) {
      const spark = document.createElement('span');
      const angle = (Math.PI * 2 * i) / 14 + rand(-0.2, 0.2);
      const dist = rand(50, 120);
      spark.className = 'w-spark';
      spark.textContent = pick(glyphs);
      spark.style.left = x.toFixed(0) + 'px';
      spark.style.top = y.toFixed(0) + 'px';
      spark.style.setProperty('--tx', (Math.cos(angle) * dist).toFixed(0) + 'px');
      spark.style.setProperty('--ty', (Math.sin(angle) * dist).toFixed(0) + 'px');
      altar.appendChild(spark);
      window.setTimeout(function () {
        spark.remove();
      }, 1000);
    }
  }

  function shrineTouch(event) {
    const fr = frame.getBoundingClientRect();
    const fromKeyboard = event.detail === 0;
    const x = fromKeyboard ? fr.left + fr.width / 2 : event.clientX;
    const y = fromKeyboard ? fr.top + fr.height / 2 : event.clientY;
    celebrateAt(x, y);

    const ar = altar.getBoundingClientRect();
    sparkBurst(x - ar.left, y - ar.top);
    restartClass(frame, 'w-touched');

    const phrases = shuffled(TOUCH_PHRASES);
    for (let i = 0; i < 3; i += 1) {
      window.setTimeout(function () {
        bubbleRandom(phrases[i]);
      }, 120 + i * 260);
    }
  }

  // ---------------------------------------------------------------------
  // Start
  // ---------------------------------------------------------------------

  // Front rows first: kneelers and bowers; sign holders stand at the back
  // so their signs stay visible.
  const startPoses = shuffled(['kneel', 'kneel', 'kneel', 'kneel', 'kneel', 'kneel', 'kneel', 'kneel', 'stand', 'stand', 'stand', 'stand'])
    .concat(shuffled(['stand', 'stand', 'stand', 'stand', 'stand', 'stand', 'sign', 'sign', 'sign', 'sign', 'sign', 'sign']));
  for (let i = 0; i < startPoses.length; i += 1) {
    personAdd(startPoses[i], false);
  }
  countUpdate(false);

  joinBtn.addEventListener('click', joinClick);
  bowBtn.addEventListener('click', bowAll);
  frame.addEventListener('click', shrineTouch);

  wavesUpdate();
  window.requestAnimationFrame(wavesUpdate);
  if (!photo.complete) {
    photo.addEventListener('load', wavesUpdate);
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(wavesUpdate);
  }

  let resizeTimer = 0;
  window.addEventListener('resize', function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(wavesUpdate, 200);
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      sectionVisible = entries[0].isIntersecting;
    }, { threshold: 0.15 });
    observer.observe(stage);
  }

  bubbleLoop();
})();
