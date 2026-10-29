/* Local, dependency-free Naqsh invitation. */
(function () {
  'use strict';
  const config = window.INVITATION_CONFIG;
  const select = selector => document.querySelector(selector);
  const root = document.documentElement;
  const valueAt = path => path.split('.').reduce((value, key) => value?.[key], config);
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  document.querySelectorAll('[data-bind]').forEach(node => { node.textContent = valueAt(node.dataset.bind) ?? ''; });
  const iconStyles = select('#iconStyles');
  if (iconStyles) {
    const enableIcons = () => { iconStyles.media = 'all'; };
    if (iconStyles.sheet) enableIcons();
    else iconStyles.addEventListener('load', enableIcons, { once:true });
  }
  document.title = config.site.title;
  root.lang = config.site.language;
  select('meta[name="description"]').content = config.site.description;
  select('meta[property="og:title"]').content = config.site.ogTitle ?? config.site.title;
  select('meta[property="og:description"]').content = config.site.ogDescription ?? config.site.description;
  document.querySelectorAll('meta[property="og:image"],meta[name="twitter:image"]').forEach(node => { node.content = config.media.ogImage; });
  Object.entries(config.theme).forEach(([key, value]) => root.style.setProperty(`--${key.replace(/[A-Z]/g, letter => '-' + letter.toLowerCase())}`, value));
  [['--lace-image', 'divider'], ['--scratch-bg', 'scratchBackground'], ['--formal-bg', 'formalBackground'], ['--event-bg', 'eventBackground'], ['--verse-bg', 'verseBackground'], ['--blessings-bg', 'blessingsBackground']].forEach(([key, media]) => root.style.setProperty(key, `url("${new URL(config.media[media], location.href).href}")`));

  let revealedCount = 0, dateCelebrated = false;
  config.scratch.items.forEach(item => {
    const wrapper = element('div', 'scratch-item');
    const circle = element('div', 'scratch-circle');
    const decoration = element('div', 'scratch-decoration'); decoration.setAttribute('aria-hidden', 'true');
    const value = element('span', 'scratch-value', item.value); value.setAttribute('aria-hidden', 'true');
    const canvas = element('canvas', 'scratch-canvas'); canvas.tabIndex = 0; canvas.setAttribute('role', 'button');
    canvas.setAttribute('aria-label', `${config.interface.revealDate} ${item.label.toLowerCase()}: ${config.scratch.accessibilityHint}`);
    circle.append(decoration, value, canvas); wrapper.append(circle, element('p', 'scratch-label', item.label));
    select('#scratchCards').append(wrapper);
    window.NaqshScratch(canvas, {
      ...item, coverLabel: config.scratch.coverLabel, threshold: config.scratch.threshold,
      onReveal() {
        revealedCount++;
        const complete = revealedCount === config.scratch.items.length;
        select('#scratchStatus').textContent = complete ? config.scratch.completeMessage : `${item.label}: ${item.value}`;
        if (complete && !dateCelebrated) {
          dateCelebrated = true;
          select('#countdown').classList.add('is-date-revealed');
          select('#countdownUnits').removeAttribute('aria-hidden');
          window.NaqshCelebrateDate?.();
        }
      },
    });
  });

  // The same independently authored ornamental seals used in garden-custom.
  function mandala() {
    const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('aria-hidden', 'true'); svg.classList.add('mandala');
    function shape(tag, attributes) {
      const node = document.createElementNS(ns, tag);
      Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, String(value))); svg.append(node);
    }
    [47, 44, 39, 27, 15].forEach((radius, index) => shape('circle', { cx: 50, cy: 50, r: radius, fill: 'none', stroke: 'currentColor', 'stroke-width': index === 0 ? 0.65 : 0.35, opacity: 0.5 }));
    for (let index = 0; index < 20; index++) {
      shape('path', { d: 'M50 5 Q59 19 50 27 Q41 19 50 5Z', transform: `rotate(${index * 18} 50 50)`, fill: '#b2925012', stroke: 'currentColor', 'stroke-width': 0.3, opacity: 0.6 });
      shape('circle', { cx: 50, cy: 28, r: 0.8, fill: 'currentColor', opacity: 0.5, transform: `rotate(${index * 18} 50 50)` });
    }
    return svg;
  }
  select('#countdownUnits').setAttribute('aria-label', config.countdown.accessibleLabel);
  const countdownNumbers = config.countdown.labels.map(label => {
    const wrapper = element('div', 'countdown-unit'), seal = element('div', 'countdown-seal');
    const number = element('span', 'countdown-number', '00');
    seal.append(mandala(), number); wrapper.append(seal, element('p', 'countdown-label', label));
    select('#countdownUnits').append(wrapper); return number;
  });
  const countdownTarget = new Date(config.countdown.isoDate).getTime();
  function updateCountdown() {
    const seconds = Math.max(0, Math.floor((countdownTarget - Date.now()) / 1000));
    const values = [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60];
    countdownNumbers.forEach((node, index) => { node.textContent = String(values[index]).padStart(2, '0'); });
    if (!seconds) select('#countdownTitle').textContent = config.countdown.completeMessage;
  }
  updateCountdown();
  setInterval(() => { if (!document.hidden) updateCountdown(); }, 1000);

  config.events.forEach(event => {
    const section = element('section', 'event-section'); section.id = event.id;
    section.setAttribute('aria-labelledby', `${event.id}Title`);
    section.append(element('p', 'eyebrow reveal', event.eyebrow));
    const card = element('article', 'event-card reveal');
    const frame = element('div', 'event-frame'); frame.setAttribute('aria-hidden', 'true');
    ['left','right','top','bottom'].forEach(side => frame.append(element('span', `event-frame-${side}`)));
    card.append(frame);
    const title = element('h2', 'event-name', event.name); title.id = `${event.id}Title`;
    const ornament = element('div', 'ornament'); ornament.setAttribute('aria-hidden', 'true'); ornament.append(element('span', '', '✦'));
    const details = element('dl', 'event-details');
    function detail(label, ...children) {
      const group = element('div', 'event-detail');
      const value = element('dd'); value.append(...children);
      const icon = element('i', `event-detail-icon fa-solid ${label === config.labels.date ? 'fa-calendar-days' : label === config.labels.time ? 'fa-clock' : 'fa-location-dot'}`);
      icon.setAttribute('aria-hidden', 'true');
      group.append(icon, element('dt', '', label), value); details.append(group); return group;
    }
    const date = [element('span', 'event-weekday', event.weekday), element('span', 'event-date', event.date)];
    if (event.hijriDate) date.push(element('span', 'event-hijri', event.hijriDate));
    detail(config.labels.date, ...date).querySelector('dt').classList.add('sr-only');
    const programme = element('div', 'programme');
    event.programme.forEach(item => {
      const row = element('div', 'programme-row');
      row.append(element('span', 'programme-name', item.name), element('span', 'programme-time', item.time));
      programme.append(row);
    });
    detail(config.labels.time, programme);
    detail(config.labels.venue, element('span', 'event-venue', event.venue), element('span', 'event-address', event.address));
    if (event.invocation) {
      const invocation = element('p', 'event-invocation', event.invocation);
      invocation.lang = 'ar'; invocation.dir = 'rtl'; card.append(invocation);
    }
    card.append(title, ornament, details);
    const actions = element('div', 'event-actions');
    if (event.locationDemoMessage) {
      const button = element('button', 'map-link'); button.type = 'button';
      const message = element('p', 'location-demo-message', event.locationDemoMessage);
      message.id = `${event.id}LocationDemo`; message.hidden = true; message.setAttribute('role', 'status');
      button.setAttribute('aria-controls', message.id); button.setAttribute('aria-expanded', 'false');
      button.addEventListener('click', () => {
        message.hidden = !message.hidden;
        button.setAttribute('aria-expanded', String(!message.hidden));
      });
      const ns = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(ns, 'svg'); svg.setAttribute('width', '13'); svg.setAttribute('height', '15'); svg.setAttribute('viewBox', '0 0 24 28'); svg.setAttribute('aria-hidden', 'true');
      const path = document.createElementNS(ns, 'path'); path.setAttribute('d', 'M12 2a9 9 0 0 0-9 9c0 6 9 15 9 15s9-9 9-15a9 9 0 0 0-9-9Z M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0'); path.setAttribute('fill', 'none'); path.setAttribute('stroke', 'currentColor'); path.setAttribute('stroke-width', '1.5'); svg.append(path);
      button.append(svg, element('span', '', event.mapLabel)); actions.append(button, message);
    }
    const calendar = element('a', 'map-link calendar-link', event.calendarLabel);
    calendar.href = './media/nikkah.ics'; calendar.download = 'Amina-Zayan-Nikkah.ics';
    actions.append(calendar); card.append(actions);
    section.append(card); select('#events').append(section);
  });
  select('#handsImage').src = config.media.hands;
  select('#closingMonogram').src = config.media.monogram;
  select('#dua').hidden = !config.dua.enabled;
  select('#duaTranslation').hidden = !config.dua.translation.trim();
  select('#duaMessage').hidden = !config.dua.message.trim();

  const intro = select('#introVideo'), poster = select('#introPoster'), hero = select('#heroPoster');
  const opening = select('#opening'), gate = select('#openingGate'), invitation = select('#invitation');
  const heroCopy = select('.hero-content');
  const scrollCue = select('.scroll-cue'), heroShade = select('.hero-shade'), heroDivider = select('#heroDivider');
  const openingChrome = [scrollCue, heroShade, heroDivider];
  openingChrome.forEach(node => { node.hidden = true; });
  const followingSections = [...invitation.children].filter(node => node.id !== 'hero');
  followingSections.forEach(node => { node.inert = true; });
  heroCopy.setAttribute('aria-hidden', 'true');
  select('.scroll-cue').tabIndex = -1;
  select('.scroll-cue').setAttribute('aria-hidden', 'true');
  intro.src = config.media.introVideo; intro.poster = poster.src = config.media.introPoster;
  hero.src = config.media.heroPoster;
  intro.muted = true;
  gate.setAttribute('aria-label', config.opening.accessibleLabel);
  const music = select('#backgroundMusic'), musicToggle = select('#musicToggle');
  music.src = config.media.music;
  music.volume = config.opening.musicVolume;
  let soundWanted = true, opened = false, completed = false, openingTimer, heroCopyTimer, chromeTimer, completionTimer, openingStartedAt = 0, revealObserver;
  // A fragment reload must still start at the cover, now inside the hero.
  history.scrollRestoration = 'manual';
  root.style.scrollBehavior = 'auto';
  function resetCoverScroll() { if (!opened) window.scrollTo(0, 0); }
  resetCoverScroll();
  window.addEventListener('load', () => requestAnimationFrame(resetCoverScroll), { once:true });
  function musicUi() {
    const playing = !music.paused && !music.error;
    musicToggle.classList.toggle('is-muted', !playing);
    musicToggle.setAttribute('aria-pressed', String(playing));
    musicToggle.setAttribute('aria-label', music.error ? config.interface.musicUnavailable : playing ? config.interface.muteMusic : config.interface.playMusic);
  }
  music.addEventListener('play', musicUi); music.addEventListener('pause', musicUi); music.addEventListener('error', musicUi);
  musicToggle.addEventListener('click', () => {
    if (!music.paused) { soundWanted = false; music.pause(); }
    else { soundWanted = true; music.play().catch(musicUi); }
  });
  musicUi();
  function observeReveals() {
    if (revealObserver) return;
    revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
    }), { threshold: 0.06 });
    document.querySelectorAll('.reveal').forEach(node => revealObserver.observe(node));
  }
  function showOpeningChrome() {
    if (!opened) return;
    scrollCue.hidden = heroDivider.hidden = false;
    scrollCue.getBoundingClientRect();
    document.body.classList.add('is-chrome-ready');
  }
  function showHeroCopy() {
    clearTimeout(heroCopyTimer);
    if (!opened || opening.classList.contains('is-hero-ready')) return;
    heroCopy.hidden = false;
    heroShade.hidden = false;
    chromeTimer = setTimeout(showOpeningChrome, config.opening.chromeDelayMs ?? 2400);
    // Establish the hidden line styles before starting their staggered transitions.
    heroCopy.getBoundingClientRect();
    opening.classList.add('is-hero-ready');
    document.body.classList.add('is-hero-ready');
    heroCopy.removeAttribute('aria-hidden');
    opening.dataset.heroTextAtMs = String(Math.round(performance.now() - openingStartedAt));
    opening.dataset.heroTextBounds = JSON.stringify(heroCopy.getBoundingClientRect().toJSON());
  }
  async function showInvitation() {
    if (!opened || completed) return;
    completed = true; clearTimeout(openingTimer); showHeroCopy();
    // Decode the actual last video frame before crossfading to it.
    if (hero.decode) await Promise.race([hero.decode().catch(() => {}), new Promise(resolve => setTimeout(resolve, 700))]);
    if (!opened || !completed) return;
    // The text stays in the hero throughout; only the video layer fades away.
    followingSections.forEach(node => { node.inert = false; });
    select('.scroll-cue').removeAttribute('tabindex');
    select('.scroll-cue').removeAttribute('aria-hidden');
    observeReveals();
    root.classList.remove('scroll-locked'); document.body.classList.remove('scroll-locked');
    // Every opening begins at the hero, including after reloading a section link.
    root.style.scrollBehavior = 'auto'; window.scrollTo(0, 0); root.style.removeProperty('scroll-behavior');
    opening.dataset.heroHandoffBounds = JSON.stringify(heroCopy.getBoundingClientRect().toJSON());
    document.body.classList.add('is-open'); opening.classList.add('is-leaving');
    opening.dataset.state = 'complete';
    completionTimer = setTimeout(() => {
      const moveFocus = opening.contains(document.activeElement);
      opening.hidden = true; intro.pause();
      if (moveFocus) select('.scroll-cue').focus({ preventScroll: true });
    }, config.opening.transitionMs);
  }
  function resetPlaybackTimeout() {
    clearTimeout(openingTimer);
    openingTimer = setTimeout(showInvitation, config.opening.playbackTimeoutMs);
  }
  function startOpening() {
    if (opened) return;
    opened = true; openingStartedAt = performance.now(); gate.classList.add('is-opening'); gate.setAttribute('aria-disabled', 'true');
    // Keep text in its final location while the video plays beneath it.
    opening.classList.add('is-playing');
    opening.dataset.state = 'playing';
    // Text follows actual video progress, so buffering cannot reveal it too early.
    if (soundWanted) music.play().catch(musicUi);
    if (intro.error) { showInvitation(); return; }
    intro.currentTime = 0;
    intro.play().catch(showInvitation);
    resetPlaybackTimeout();
  }
  intro.addEventListener('playing', () => {
    if (intro.requestVideoFrameCallback) intro.requestVideoFrameCallback(() => poster.classList.add('is-hidden'));
    else requestAnimationFrame(() => poster.classList.add('is-hidden'));
  });
  intro.addEventListener('timeupdate', () => {
    if (opened && intro.currentTime * 1000 >= (config.opening.heroTextDelayMs ?? 4500)) showHeroCopy();
  });
  intro.addEventListener('ended', showInvitation);
  intro.addEventListener('error', () => { if (opened) showInvitation(); });
  gate.addEventListener('click', startOpening);
  select('#skipIntro').addEventListener('click', () => {
    if (!opened) { opened = true; soundWanted = false; }
    showInvitation();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { music.pause(); intro.pause(); clearTimeout(openingTimer); }
    else {
      updateCountdown();
      if (opened && !completed) { intro.play().catch(showInvitation); resetPlaybackTimeout(); }
      if (opened && soundWanted) music.play().catch(musicUi);
    }
  });
  function resetOpeningState() {
    clearTimeout(openingTimer); clearTimeout(heroCopyTimer); clearTimeout(chromeTimer); clearTimeout(completionTimer);
    music.pause(); intro.pause(); opened = completed = false; soundWanted = true;
    try { intro.currentTime = 0; } catch (_) {}
    opening.hidden = false; opening.classList.remove('is-playing', 'is-leaving', 'is-hero-ready');
    gate.classList.remove('is-opening'); gate.removeAttribute('aria-disabled');
    poster.classList.remove('is-hidden'); heroCopy.hidden = true; heroCopy.setAttribute('aria-hidden', 'true');
    openingChrome.forEach(node => { node.hidden = true; });
    scrollCue.tabIndex = -1; scrollCue.setAttribute('aria-hidden', 'true');
    followingSections.forEach(node => { node.inert = true; });
    document.body.classList.remove('is-open', 'is-hero-ready', 'is-chrome-ready');
    root.classList.add('scroll-locked'); document.body.classList.add('scroll-locked');
    root.style.scrollBehavior = 'auto'; window.scrollTo(0, 0); opening.dataset.state = 'cover';
  }
  window.addEventListener('pagehide', resetOpeningState);
  window.addEventListener('pageshow', event => { if (event.persisted) resetOpeningState(); });
})();
