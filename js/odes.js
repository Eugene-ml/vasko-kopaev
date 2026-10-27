// Odes, commandments, testimonials and chronicle for the temple of Vasko Kopaev.
// Owns the sections #odes, #commandments, #testimonials and #chronicle.
// All CSS classes used here start with "o-".
(function () {
  'use strict';

  const STORAGE_KEY = 'vasko-odes-testimonials-v1';
  const MAX_SAVED = 40;

  function reducedMotion() {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {
      return false;
    }
  }

  // Creates an element with a class and plain text (never HTML).
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  // The photo sits in a clipping wrapper: the source image has a dark
  // strip along its bottom edge, which the wrapper crops away.
  function photo(className) {
    const box = el('span', 'o-photo-box ' + className);
    const img = el('img', 'o-photo');
    img.src = 'img/vasko.png';
    img.alt = 'Васко Копаев';
    img.loading = 'lazy';
    img.decoding = 'async';
    box.appendChild(img);
    return box;
  }

  function sectionHeader(section, title, subtitle) {
    const wrap = el('div', 'o-wrap');
    const h2 = el('h2', 'section-title', title);
    wrap.appendChild(h2);
    if (subtitle) wrap.appendChild(el('p', 'o-subtitle', subtitle));
    section.appendChild(wrap);
    return wrap;
  }

  // ------------------------------------------------------------------
  // 1. ODES AND HYMNS
  // ------------------------------------------------------------------

  const POEMS = [
    {
      tab: 'Ода',
      title: 'Ода на день Великого Спасения',
      byline: 'в высоком штиле, по примеру М. В. Ломоносова',
      rate: 0.85,
      pitch: 0.8,
      stanzas: [
        { lines: [
          'Восторг внезапный ум пленил:',
          'Когда дедлайн над нами реял,',
          'Наш Васко ноутбук открыл —',
          'И дух премудрости повеял.',
          'Дрожала группа, как листва,',
          'Забыв и сон, и все слова;',
          'А он перчатки натянул',
          'И в бездну формул заглянул.'
        ] },
        { lines: [
          'О, Васко! Кудрей буйный вал',
          'Венчает лоб, где мысль клокочет;',
          'Ты взгляд поверх очков послал —',
          'И интеграл пощады хочет.',
          'Цепь серебром на нём горит,',
          'Дедлайн, завидев, прочь бежит,',
          'И сам профессор, сняв пенсне,',
          'Шепнул: «Такое — лишь во сне!»'
        ] },
        { lines: [
          'Да славят все твой подвиг сей',
          'От первых парт и до последних!',
          'Ты спас прогульщиков, друзей',
          'И даже тех, кто спал в соседних.',
          'Гремите, трубы и смартфон!',
          'Наш Васко — гений и закон!',
          'И каждый, кто домашку сдал,',
          'Ему возносит мадригал!'
        ] }
      ]
    },
    {
      tab: 'Пушкин',
      title: 'К***ву',
      byline: 'с извинениями перед А. С. Пушкиным',
      rate: 0.95,
      pitch: 1,
      stanzas: [
        { lines: [
          'Я помню чудное мгновенье:',
          'Ты скинул в чат свою домашку,',
          'Как мимолётное виденье,',
          'Как ангел — грешникам поблажку.'
        ] },
        { lines: [
          'В томленьях сессии безбрежной',
          'Я ждал ответа до утра,',
          'И голос твой звучал небрежно:',
          '«Держите, бедные. Пора».'
        ] },
        { lines: [
          'Шли дни. Дедлайнов вихрь мятежный',
          'Рассеял прежние мечты,',
          'Но взгляд поверх очков, безгрешный,',
          'И гений чистой правоты —'
        ] },
        { lines: [
          'Я не забуду. В упоенье',
          'Душа воскресла — вновь и вновь',
          'И божество, и вдохновенье,',
          'И сон, и баллы, и любовь.'
        ] }
      ]
    },
    {
      tab: 'Акафист',
      title: 'Акафист Святому Васко, домашки подателю',
      byline: 'читается стоя, с зажжённым экраном смартфона',
      rate: 0.9,
      pitch: 0.9,
      stanzas: [
        { label: 'Кондак 1', lines: [
          'Избранному спасителю группы и научной студии светильнику,',
          'от погибели дедлайновой избавившему нас,',
          'благодарственное пение приносим, недостойные одногруппники твои.',
          'Ты же, имея очки златые и взор поверх оных, зовёшь нам:',
          'Радуйся, Васко, домашки нашей спасителю!'
        ] },
        { label: 'Икос 1', lines: [
          'Ангелы с небес дивились, видя, как в нощи глухой ноутбук твой воссиял.',
          'Радуйся, кудрей премудрых носителю.',
          'Радуйся, очки долу спускающий и взором грешных студентов прожигающий.',
          'Радуйся, перчатками чёрными клавиши благословляющий.',
          'Радуйся, цепию серебряной в полумраке сияющий.',
          'Радуйся, старосту от седины преждевременной избавивший.',
          'Радуйся, PDF в четвёртом часу ночи ниспославший.',
          'Радуйся, «держите» глаголющий и смайликов не требующий.',
          'Радуйся, Васко, домашки нашей спасителю!'
        ] },
        { label: 'Кондак 2', lines: [
          'Видя группу, во тьме незнания блуждающую, не прошёл ты мимо,',
          'но сел, и вздохнул, и сделал всё за единую ночь.',
          'Темже вопием тебе: Аллилуия! Аллилуия! Аллилуия!'
        ] }
      ]
    },
    {
      tab: 'Рэп',
      title: 'Vasko Flow (feat. Вся Группа)',
      byline: 'бит качает, мама волнуется',
      rate: 1.15,
      pitch: 1.05,
      stanzas: [
        { label: 'Куплет', lines: [
          'Йо! Полночь. Дедлайн. В чате — паника, вой,',
          'Все пишут «кто решил?» — тишина, как отбой.',
          'Мы легли всей группой, как сервер в сессию,',
          'Но он выходит из тьмы — спокойно, без агрессии.',
          'В чёрных перчатках, как будто хирург,',
          'Он вскрыл это задание — щёлк! — и вокруг',
          'Летают формулы, графики, выводы, сноски,',
          'А мы стоим под сценой, раскрыв рты, как подростки.',
          'Очки — на кончик носа, взгляд — как приговор:',
          '«Вы серьёзно? Даже это?» — и закончен разговор.',
          'Цепь на шее блестит — это не бижутерия,',
          'Это орден за спасение. Это мистерия.'
        ] },
        { label: 'Хук', hook: true, lines: [
          'Кто нас вытащил из ямы? — ВАСКО!',
          'Кто сильнее всей программы? — ВАСКО!',
          'Кто без кофе до утра? — ВАСКО!',
          'Скажи «спасибо», детвора! — ВАСКО!'
        ] }
      ]
    },
    {
      tab: 'Хокку',
      title: 'Пять хокку о спасении',
      byline: 'написано кистью на обороте методички',
      rate: 0.8,
      pitch: 1,
      haiku: true,
      stanzas: [
        { lines: ['Осенний дедлайн.', 'В чате группы — ни звука.', 'Лишь Васко онлайн.'] },
        { lines: ['Сползают очки.', 'Взгляд поверх золотой оправы —', 'замерзает пруд.'] },
        { lines: ['Старый пруд.', 'Васко скинул решенье —', 'всплеск благодарности.'] },
        { lines: ['Чёрные перчатки.', 'Даже сакура знает:', 'отпечатков нет.'] },
        { lines: ['Утро. Сдано всё.', 'Староста плачет тихо.', 'Сакура цветёт.'] }
      ]
    }
  ];

  const speech = {
    supported: typeof window.speechSynthesis !== 'undefined' &&
      typeof window.SpeechSynthesisUtterance !== 'undefined',
    activeButton: null
  };

  function speechPickVoice() {
    try {
      const voices = window.speechSynthesis.getVoices() || [];
      for (let i = 0; i < voices.length; i++) {
        const lang = (voices[i].lang || '').toLowerCase();
        if (lang.indexOf('ru') === 0) return voices[i];
      }
    } catch (e) {
      // no voice list; the browser falls back to its default voice
    }
    return null;
  }

  function speechResetButton() {
    if (speech.activeButton) {
      speech.activeButton.textContent = '🔊 Читать вслух';
      speech.activeButton.classList.remove('o-speaking');
      speech.activeButton.setAttribute('aria-pressed', 'false');
    }
    speech.activeButton = null;
  }

  function speechStop() {
    if (!speech.supported) return;
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // ignore
    }
    speechResetButton();
  }

  // Chrome stops long utterances after about 15 seconds, so each stanza
  // is queued as its own utterance.
  function speechReadPoem(poem, button) {
    if (!speech.supported) return;
    if (speech.activeButton === button) {
      speechStop();
      return;
    }
    speechStop();
    const chunks = [poem.title + '.'];
    for (let i = 0; i < poem.stanzas.length; i++) {
      chunks.push(poem.stanzas[i].lines.join('\n'));
    }
    const voice = speechPickVoice();
    speech.activeButton = button;
    button.textContent = '⏹ Остановить';
    button.classList.add('o-speaking');
    button.setAttribute('aria-pressed', 'true');
    for (let i = 0; i < chunks.length; i++) {
      const utterance = new window.SpeechSynthesisUtterance(chunks[i]);
      utterance.lang = 'ru-RU';
      if (voice) utterance.voice = voice;
      utterance.rate = poem.rate || 1;
      utterance.pitch = poem.pitch || 1;
      if (i === chunks.length - 1) {
        utterance.onend = function () {
          if (speech.activeButton === button) speechResetButton();
        };
      }
      utterance.onerror = function () {
        if (speech.activeButton === button) speechResetButton();
      };
      window.speechSynthesis.speak(utterance);
    }
  }

  function poemBuildCard(poem, index) {
    const card = el('article', 'o-scroll' + (poem.haiku ? ' o-scroll--haiku' : ''));
    card.id = 'o-poem-' + index;
    card.setAttribute('role', 'tabpanel');
    card.setAttribute('aria-labelledby', 'o-tab-' + index);

    card.appendChild(el('span', 'o-corner o-corner--tl', '❦'));
    card.appendChild(el('span', 'o-corner o-corner--br', '❦'));

    const head = el('header', 'o-scroll-head');
    head.appendChild(el('h3', 'o-scroll-title', poem.title));
    head.appendChild(el('p', 'o-scroll-byline', poem.byline));
    card.appendChild(head);

    const body = el('div', 'o-scroll-body');
    let firstLine = true;
    for (let s = 0; s < poem.stanzas.length; s++) {
      const stanza = poem.stanzas[s];
      const block = el('div', 'o-stanza' + (stanza.hook ? ' o-stanza--hook' : ''));
      if (stanza.label) block.appendChild(el('p', 'o-stanza-label', stanza.label));
      for (let l = 0; l < stanza.lines.length; l++) {
        const text = stanza.lines[l];
        const line = el('p', 'o-line');
        if (/^Радуйся/.test(text) || /Аллилуия/.test(text)) line.classList.add('o-line--refrain');
        if (firstLine && !poem.haiku) {
          line.classList.add('o-line--first');
          line.appendChild(el('span', 'o-dropcap', text.charAt(0)));
          line.appendChild(document.createTextNode(text.slice(1)));
          firstLine = false;
        } else {
          line.textContent = text;
        }
        block.appendChild(line);
      }
      body.appendChild(block);
    }
    card.appendChild(body);

    const foot = el('footer', 'o-scroll-foot');
    if (speech.supported) {
      const read = el('button', 'o-btn o-btn--read', '🔊 Читать вслух');
      read.type = 'button';
      read.setAttribute('aria-pressed', 'false');
      read.addEventListener('click', function () {
        speechReadPoem(poem, read);
      });
      foot.appendChild(read);
    } else {
      foot.appendChild(el('p', 'o-hint', 'Ваш браузер не умеет читать вслух. Читайте сами — громко и с выражением.'));
    }
    foot.appendChild(el('span', 'o-seal', 'В'));
    card.appendChild(foot);
    return card;
  }

  function odesBuild(section) {
    const wrap = sectionHeader(section, 'Оды и гимны',
      'Лучшие поэты группы трудились три бессонные ночи (столько же, сколько Васко — одну).');

    const icon = el('figure', 'o-icon');
    const frame = el('div', 'o-icon-frame');
    const portrait = photo('o-icon-photo');
    portrait.appendChild(el('span', 'o-icon-halo'));
    frame.appendChild(portrait);
    icon.appendChild(frame);
    icon.appendChild(el('figcaption', 'o-icon-caption', 'Святой Васко Копаев, покровитель домашек'));
    wrap.appendChild(icon);

    const tabs = el('div', 'o-tabs');
    tabs.setAttribute('role', 'tablist');
    tabs.setAttribute('aria-label', 'Выбор песнопения');

    const stage = el('div', 'o-stage');
    const cards = [];
    const tabButtons = [];
    let current = 0;

    function show(index, focusTab) {
      const count = POEMS.length;
      current = (index + count) % count;
      speechStop();
      for (let i = 0; i < count; i++) {
        const active = i === current;
        cards[i].hidden = !active;
        cards[i].classList.toggle('o-scroll--active', active);
        tabButtons[i].setAttribute('aria-selected', active ? 'true' : 'false');
        tabButtons[i].tabIndex = active ? 0 : -1;
      }
      counter.textContent = (current + 1) + ' / ' + count;
      if (focusTab) tabButtons[current].focus();
    }

    for (let i = 0; i < POEMS.length; i++) {
      const tab = el('button', 'o-tab', POEMS[i].tab);
      tab.type = 'button';
      tab.id = 'o-tab-' + i;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', 'o-poem-' + i);
      tab.addEventListener('click', function () { show(i, false); });
      tab.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowRight') { event.preventDefault(); show(current + 1, true); }
        if (event.key === 'ArrowLeft') { event.preventDefault(); show(current - 1, true); }
      });
      tabButtons.push(tab);
      tabs.appendChild(tab);

      const card = poemBuildCard(POEMS[i], i);
      cards.push(card);
      stage.appendChild(card);
    }

    const nav = el('div', 'o-nav');
    const prev = el('button', 'o-btn o-btn--ghost', '‹ Прежнее');
    prev.type = 'button';
    prev.setAttribute('aria-label', 'Предыдущее песнопение');
    const counter = el('span', 'o-counter');
    const next = el('button', 'o-btn o-btn--ghost', 'Следующее ›');
    next.type = 'button';
    next.setAttribute('aria-label', 'Следующее песнопение');
    prev.addEventListener('click', function () { show(current - 1, false); });
    next.addEventListener('click', function () { show(current + 1, false); });
    nav.appendChild(prev);
    nav.appendChild(counter);
    nav.appendChild(next);

    // Swipe left or right on phones to change the poem.
    let touchX = null;
    let touchY = null;
    stage.addEventListener('touchstart', function (event) {
      touchX = event.touches[0].clientX;
      touchY = event.touches[0].clientY;
    }, { passive: true });
    stage.addEventListener('touchend', function (event) {
      if (touchX === null) return;
      const dx = event.changedTouches[0].clientX - touchX;
      const dy = event.changedTouches[0].clientY - touchY;
      touchX = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        show(current + (dx < 0 ? 1 : -1), false);
      }
    }, { passive: true });

    wrap.appendChild(tabs);
    wrap.appendChild(stage);
    wrap.appendChild(nav);
    show(0, false);
  }

  // ------------------------------------------------------------------
  // 2. TEN COMMANDMENTS
  // ------------------------------------------------------------------

  const COMMANDMENTS = [
    'Аз есмь Васко, сделавший домашку твою. Да не будет у тебя иных спасителей.',
    'Не сотвори себе дедлайна на последнюю ночь, ибо не каждую ночь бодрствует Васко.',
    'Не произноси имени Васко всуе — только вместе со словами «спасибо» и «ты лучший».',
    'Почитай дедлайн свой, как Васко почитает его.',
    'Не списывай у Васко без благодарности.',
    'Чти кудри и очки его, да продлятся дни твои в зачётной книжке.',
    'Не меняй в работе Васко ни единой запятой, ибо совершенна она.',
    'Не укради оформления его. Хотя бы шрифт поменяй, грешник.',
    'Не пиши «а что задали?» в седьмом часу утра.',
    'Не желай ноутбука Васко, ни зарядки его, ни мышки его, ни перчаток его, ничего, что у Васко.'
  ];

  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

  function commandmentsBuild(section) {
    const wrap = sectionHeader(section, 'Десять заповедей Васко',
      'Высечено на камне. Камень был единственным, что не сдалось научной студии.');
    const tablets = el('div', 'o-tablets');
    for (let t = 0; t < 2; t++) {
      const tablet = el('div', 'o-tablet');
      tablet.appendChild(photo('o-tablet-avatar'));
      const list = el('ol', 'o-tablet-list');
      list.start = t * 5 + 1;
      for (let i = t * 5; i < t * 5 + 5; i++) {
        const item = el('li', 'o-commandment');
        item.appendChild(el('span', 'o-numeral', ROMAN[i]));
        item.appendChild(el('span', 'o-commandment-text', COMMANDMENTS[i]));
        list.appendChild(item);
      }
      tablet.appendChild(list);
      tablets.appendChild(tablet);
    }
    wrap.appendChild(tablets);
    wrap.appendChild(el('p', 'o-footnote',
      '* Одиннадцатая заповедь была, но Васко её уже выполнил за всех.'));
  }

  // ------------------------------------------------------------------
  // 3. TESTIMONIALS
  // ------------------------------------------------------------------

  const TESTIMONIALS = [
    { who: 'Студент, проспавший пару', stars: 5,
      text: 'Проснулся в 14:00. Домашка уже сдана. Подумал, что это сон. Это был Васко.' },
    { who: 'Староста', stars: 5,
      text: 'Впервые за все годы мне не пришлось писать в чат «ну что там?». Я плачу третий день. От счастья.' },
    { who: 'Та, кто открыла задание в 23:58', stars: 5,
      text: 'Увидела слово «гипотеза» и начала молиться. Через минуту в чат упал PDF. Молитва работает, и её зовут Васко.' },
    { who: 'Думал, что научная студия — это кружок рисования', stars: 5,
      text: 'Я до сих пор не знаю, что мы сдали. Но мы это сдали. Аминь.' },
    { who: 'Тот, кто вечно спрашивает «а что задали?»', stars: 5,
      text: 'Мне впервые ответили не «посмотри в беседе», а «держи». Я распечатал это сообщение и повесил над кроватью.' },
    { who: 'Отличник, который хотел сделать сам', stars: 5,
      text: 'Открыл работу Васко. Закрыл свою. Теперь я не отличник, я — верующий.' },
    { who: 'Кот, спавший на клавиатуре Васко', stars: 5,
      text: 'Мрр. Он меня не согнал. Он печатал вокруг меня. Всю ночь. Святой человек.' },
    { who: 'Будильник Васко', stars: 5,
      text: 'Я прозвенел в 7:00. Он уже не спал. Он и не ложился. Я впервые почувствовал себя ненужным.' },
    { who: 'Мама одногруппника', stars: 5,
      text: 'Сынок первый раз за семестр выспался и даже поел. Васко, приходите на борщ. В любое время.' },
    { who: 'Чат группы «Научная студия 💀»', stars: 5,
      text: 'За ночь: 347 сообщений «мы умрём» и один файл от Васко. Утром: 512 сообщений «ВАСКО БОГ».' }
  ];

  function storageLoad() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      const clean = [];
      for (let i = 0; i < parsed.length; i++) {
        const item = parsed[i];
        if (item && typeof item.text === 'string' && typeof item.who === 'string') {
          clean.push({
            who: item.who.slice(0, 60),
            text: item.text.slice(0, 400),
            stars: item.stars === 7 ? 7 : 5,
            mine: true
          });
        }
      }
      return clean;
    } catch (e) {
      return [];
    }
  }

  function storageSave(list) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_SAVED)));
      return true;
    } catch (e) {
      return false;
    }
  }

  function testimonialBuildCard(item) {
    const card = el('figure', 'o-card' + (item.mine ? ' o-card--mine' : ''));
    const starsText = item.stars === 7 ? '★★★★★★★' : '★★★★★';
    const stars = el('div', 'o-stars', starsText);
    stars.setAttribute('aria-label', 'Оценка: ' + (item.stars === 7 ? '7 из 5' : '5 из 5'));
    card.appendChild(stars);
    const quote = el('blockquote', 'o-quote');
    quote.appendChild(el('p', null, item.text));
    card.appendChild(quote);
    const caption = el('figcaption', 'o-who', '— ' + item.who);
    card.appendChild(caption);
    if (item.mine) card.appendChild(el('span', 'o-badge', 'новое свидетельство'));
    return card;
  }

  function testimonialsBuild(section) {
    const wrap = sectionHeader(section, 'Свидетельства спасённых',
      'Имена изменены. Слёзы — настоящие.');

    const grid = el('div', 'o-cards');
    const saved = storageLoad();
    for (let i = 0; i < saved.length; i++) grid.appendChild(testimonialBuildCard(saved[i]));
    for (let i = 0; i < TESTIMONIALS.length; i++) grid.appendChild(testimonialBuildCard(TESTIMONIALS[i]));

    const form = el('form', 'o-form');
    form.setAttribute('novalidate', '');
    form.appendChild(el('h3', 'o-form-title', 'Оставь своё свидетельство'));
    form.appendChild(el('p', 'o-form-hint', 'Расскажи, как Васко спас тебя. Ложь не принимается (её и так не бывает: Васко спас всех).'));

    const textLabel = el('label', 'o-label', 'Слово хвалы');
    textLabel.htmlFor = 'o-praise-text';
    const textArea = el('textarea', 'o-input o-input--area');
    textArea.id = 'o-praise-text';
    textArea.maxLength = 400;
    textArea.rows = 3;
    textArea.placeholder = 'Например: «Без Васко я бы до сих пор читал задание»';

    const row = el('div', 'o-form-row');
    const nameBox = el('div', 'o-field');
    const nameLabel = el('label', 'o-label', 'Кто ты, спасённый?');
    nameLabel.htmlFor = 'o-praise-name';
    const nameInput = el('input', 'o-input');
    nameInput.id = 'o-praise-name';
    nameInput.type = 'text';
    nameInput.maxLength = 60;
    nameInput.placeholder = 'Аноним с задней парты';
    nameBox.appendChild(nameLabel);
    nameBox.appendChild(nameInput);

    const starBox = el('div', 'o-field');
    const starLabel = el('label', 'o-label', 'Оценка Васко');
    starLabel.htmlFor = 'o-praise-stars';
    const starSelect = el('select', 'o-input o-select');
    starSelect.id = 'o-praise-stars';
    const options = [
      ['5', '★★★★★ — пять из пяти'],
      ['5', '★★★★★ — пять из пяти, но с чувством'],
      ['7', '★★★★★★★ — шкала не выдержала']
    ];
    for (let i = 0; i < options.length; i++) {
      const option = el('option', null, options[i][1]);
      option.value = options[i][0];
      starSelect.appendChild(option);
    }
    starBox.appendChild(starLabel);
    starBox.appendChild(starSelect);
    row.appendChild(nameBox);
    row.appendChild(starBox);

    const submit = el('button', 'o-btn o-btn--gold', '✦ Вознести хвалу');
    submit.type = 'submit';
    const status = el('p', 'o-form-status');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');

    form.appendChild(textLabel);
    form.appendChild(textArea);
    form.appendChild(row);
    form.appendChild(submit);
    form.appendChild(status);

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const text = textArea.value.trim().slice(0, 400);
      const who = (nameInput.value.trim() || 'Аноним с задней парты').slice(0, 60);
      if (!text) {
        status.textContent = 'Пустая хвала — тоже хвала, но напиши хоть слово.';
        textArea.focus();
        return;
      }
      const item = { who: who, text: text, stars: starSelect.value === '7' ? 7 : 5, mine: true };
      const card = testimonialBuildCard(item);
      card.classList.add('o-card--new');
      grid.insertBefore(card, grid.firstChild);

      const list = storageLoad();
      list.unshift(item);
      const stored = storageSave(list);
      status.textContent = stored
        ? 'Свидетельство принято и высечено в памяти браузера навеки.'
        : 'Свидетельство принято! (Браузер не даёт сохранить, но Васко всё равно запомнил.)';
      textArea.value = '';

      if (typeof window.templeCelebrate === 'function') {
        try {
          const rect = submit.getBoundingClientRect();
          window.templeCelebrate(rect.left + rect.width / 2, rect.top + rect.height / 2);
        } catch (e) {
          // the celebration is optional
        }
      }
      try {
        card.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'nearest' });
      } catch (e) {
        // old browsers without options support
      }
    });

    wrap.appendChild(form);
    wrap.appendChild(grid);
  }

  // ------------------------------------------------------------------
  // 4. CHRONICLE
  // ------------------------------------------------------------------

  const CHRONICLE = [
    { when: 'День 1, 10:00', icon: '📜', title: 'Задание выдано. Группа в ужасе.',
      text: 'Преподаватель произнёс слово «исследование». Кто-то на задней парте тихо уронил ручку и душу.' },
    { when: 'День 2', icon: '🙈', title: 'Группа делает вид, что задания нет.',
      text: 'Мемов в чате: 48. Строчек решения: 0. Настроение: «потом».' },
    { when: 'День 5', icon: '😰', title: 'Первая паника.',
      text: 'Староста пишет: «Ну что, кто-нибудь начал?» Прочитали 27 человек. Ответили 0.' },
    { when: 'Последний вечер, 21:00', icon: '🕯️', title: 'Стадия торга.',
      text: 'Группа всерьёз обсуждает переезд в другую страну и смену фамилий.' },
    { when: 'Ночь X, 23:12', icon: '💻', title: 'Васко открыл ноутбук.',
      text: 'Надел перчатки. Опустил очки. Посмотрел поверх них на задание. Задание отвело взгляд первым.',
      key: true },
    { when: 'Ночь X, 02:30', icon: '⚡', title: 'Великое Делание.',
      text: 'Где-то вдали тихо плакал дедлайн. Кот уснул на клавиатуре — Васко печатал вокруг кота.' },
    { when: 'Ночь X, 04:44', icon: '📎', title: 'В чат упал PDF.',
      text: 'Одно сообщение: «держите». Без смайлика. Легенды не нуждаются в смайликах.' },
    { when: 'Утро', icon: '🌅', title: 'Домашка сдана. Небеса разверзлись.',
      text: 'Голуби за окном выстроились в слово «СПАСИБО». Почти. Но мы поняли.',
      key: true, photo: true },
    { when: 'Отныне и навеки', icon: '👑', title: 'Этот день — государственный праздник группы.',
      text: 'Отмечается ежегодно: сном до обеда, тортом в форме очков и троекратным «Слава Васко!».',
      key: true, last: true }
  ];

  function chronicleBuild(section) {
    const wrap = sectionHeader(section, 'Летопись Великого Спасения',
      'Составлено по свидетельствам очевидцев, скриншотам и одному коту.');

    const list = el('ol', 'o-timeline');
    const items = [];
    for (let i = 0; i < CHRONICLE.length; i++) {
      const entry = CHRONICLE[i];
      const item = el('li', 'o-event' + (entry.key ? ' o-event--key' : '') + (entry.last ? ' o-event--last' : ''));
      const dot = el('span', 'o-event-dot', entry.icon);
      dot.setAttribute('aria-hidden', 'true');
      const box = el('div', 'o-event-box');
      box.appendChild(el('p', 'o-event-when', entry.when));
      box.appendChild(el('h3', 'o-event-title', entry.title));
      box.appendChild(el('p', 'o-event-text', entry.text));
      if (entry.photo) {
        const glow = el('div', 'o-event-photo');
        glow.appendChild(photo('o-event-photo-img'));
        box.appendChild(glow);
        item.classList.add('o-event--photo');
      }
      item.appendChild(dot);
      item.appendChild(box);
      list.appendChild(item);
      items.push(item);
    }
    wrap.appendChild(list);

    const meter = gaugeBuild();
    wrap.appendChild(meter.root);

    const canObserve = typeof window.IntersectionObserver === 'function' && !reducedMotion();
    if (!canObserve) {
      for (let i = 0; i < items.length; i++) items[i].classList.add('o-visible');
      meter.fill(true);
      return;
    }
    list.classList.add('o-timeline--animated');
    const observer = new window.IntersectionObserver(function (entries) {
      for (let i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          entries[i].target.classList.add('o-visible');
          observer.unobserve(entries[i].target);
        }
      }
    }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
    for (let i = 0; i < items.length; i++) observer.observe(items[i]);

    const meterObserver = new window.IntersectionObserver(function (entries) {
      for (let i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          meter.fill(false);
          meterObserver.disconnect();
        }
      }
    }, { threshold: 0.4 });
    meterObserver.observe(meter.root);
  }

  // The holiness gauge. Its track runs from 0% to 150%, so 146% fits
  // inside the track and the 100% mark sits at two thirds of its width.
  function gaugeBuild() {
    const TARGET = 146;
    const SCALE = 150;
    const root = el('div', 'o-meter');
    root.appendChild(el('h3', 'o-meter-title', 'Васко-метр'));

    const readout = el('p', 'o-meter-readout');
    readout.appendChild(el('span', 'o-meter-label', 'Уровень святости: '));
    const value = el('span', 'o-meter-value', '0%');
    readout.appendChild(value);
    root.appendChild(readout);

    const track = el('div', 'o-meter-track');
    track.setAttribute('role', 'meter');
    track.setAttribute('aria-label', 'Уровень святости Васко');
    track.setAttribute('aria-valuemin', '0');
    track.setAttribute('aria-valuemax', String(SCALE));
    track.setAttribute('aria-valuenow', String(TARGET));
    track.setAttribute('aria-valuetext', TARGET + '%');
    const bar = el('div', 'o-meter-fill');
    const limit = el('div', 'o-meter-limit');
    limit.style.left = (100 / SCALE * 100) + '%';
    limit.appendChild(el('span', 'o-meter-limit-label', '100% — предел для смертных'));
    track.appendChild(bar);
    track.appendChild(limit);
    root.appendChild(track);

    const scale = el('ul', 'o-meter-scale');
    const marks = [
      ['0', 'Спит на паре'],
      ['50', 'Отличник'],
      ['100', 'Староста'],
      ['146', 'ВАСКО']
    ];
    for (let i = 0; i < marks.length; i++) {
      const mark = el('li', 'o-meter-mark' + (marks[i][0] === '146' ? ' o-meter-mark--vasko' : ''), marks[i][1]);
      mark.style.left = (Number(marks[i][0]) / SCALE * 100) + '%';
      scale.appendChild(mark);
    }
    root.appendChild(scale);
    const note = el('p', 'o-meter-note', 'Прибор зашкаливает. Учёные научной студии в замешательстве.');
    root.appendChild(note);

    let done = false;
    function fill(instant) {
      if (done) return;
      done = true;
      const width = (TARGET / SCALE * 100) + '%';
      if (instant) {
        bar.style.width = width;
        value.textContent = TARGET + '%';
        root.classList.add('o-meter--full');
        return;
      }
      bar.style.width = width;
      const start = performance.now();
      const duration = 2600;
      function tick(now) {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        value.textContent = Math.round(TARGET * eased) + '%';
        if (t < 1) {
          window.requestAnimationFrame(tick);
        } else {
          root.classList.add('o-meter--full');
        }
      }
      window.requestAnimationFrame(tick);
    }
    return { root: root, fill: fill };
  }

  // ------------------------------------------------------------------
  // START
  // ------------------------------------------------------------------

  function start() {
    const builders = [
      ['odes', odesBuild],
      ['commandments', commandmentsBuild],
      ['testimonials', testimonialsBuild],
      ['chronicle', chronicleBuild]
    ];
    for (let i = 0; i < builders.length; i++) {
      const section = document.getElementById(builders[i][0]);
      if (!section) continue;
      section.classList.add('o-section');
      try {
        builders[i][1](section);
      } catch (e) {
        if (window.console) window.console.error('odes.js: ' + builders[i][0], e);
      }
    }
    if (speech.supported) {
      window.addEventListener('pagehide', speechStop);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
