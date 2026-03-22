(function () {

  const C = CONFIG;

  const root = document.documentElement.style;
  root.setProperty('--od-green',   C.colors.odGreen);
  root.setProperty('--dark-green', C.colors.darkGreen);
  root.setProperty('--army-tan',   C.colors.armyTan);
  root.setProperty('--accent',     C.colors.accent);
  root.setProperty('--alert',      C.colors.alert);
  root.setProperty('--red',        C.colors.red);
  root.setProperty('--white',      C.colors.white);
  root.setProperty('--dark',       C.colors.dark);

  document.title = C.server.name + ' — Loading';

  const nameEl = document.getElementById('server-name-el');
  const prefix = C.server.name.replace(C.server.nameBold, '').trim();
  nameEl.innerHTML = prefix
    ? prefix + ' <span>' + C.server.nameBold + '</span>'
    : '<span>' + C.server.nameBold + '</span>';

  document.getElementById('server-sub-el').textContent  = C.server.subtitle;
  document.getElementById('hud-server-label').textContent = C.server.hudLabel;

  const slideshowEl = document.getElementById('slideshow');
  C.slideshow.forEach((src, i) => {
    const div = document.createElement('div');
    div.className = 'slide' + (i === 0 ? ' active' : '');
    div.style.backgroundImage = `url('${src}')`;
    slideshowEl.appendChild(div);
  });

  const slides = slideshowEl.querySelectorAll('.slide');
  let current = 0;
  setInterval(() => {
    slides[current].classList.remove('active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
  }, C.slideshowInterval);

  function updateClock() {
    const now    = new Date();
    const offset = new Date(now.getTime() + C.server.utcOffset * 3600000);
    const h = String(offset.getUTCHours()).padStart(2,'0');
    const m = String(offset.getUTCMinutes()).padStart(2,'0');
    const s = String(offset.getUTCSeconds()).padStart(2,'0');
    document.getElementById('live-time').textContent =
      `UTC+${C.server.utcOffset} ${h}:${m}:${s}`;
  }
  setInterval(updateClock, 1000);
  updateClock();

  setInterval(() => {
    document.getElementById('fps-counter').textContent =
      `FPS: ${58 + Math.floor(Math.random() * 6)}`;
  }, 1500);

  const PLAYERS_URL = `http://${C.server.ip}:${C.server.port}/players.json`;

  function renderPlayers(players) {
    const list = document.getElementById('player-list');
    list.innerHTML = '';
    document.getElementById('player-count-label').textContent =
      `${players.length} / ${C.server.maxSlots}`;

    if (players.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'player-item';
      empty.style.cssText = 'opacity:1;color:rgba(200,184,130,0.5);font-size:0.65rem';
      empty.innerHTML = `<span style="padding:4px 0">— KEINE SOLDATEN ONLINE —</span>`;
      list.appendChild(empty);
      return;
    }

    players.forEach((p, i) => {
      const ping      = p.ping ?? 0;
      const pingColor = ping < 60 ? C.colors.accent : ping < 120 ? C.colors.alert : C.colors.red;
      const name      = (p.name || 'Unbekannt').substring(0, 22);
      const id        = p.id ?? (i + 1);
      const div       = document.createElement('div');
      div.className   = 'player-item';
      div.style.animationDelay = `${i * 0.07}s`;
      div.innerHTML = `
        <div class="player-dot"></div>
        <span class="player-rank" style="color:var(--army-tan);min-width:22px">#${id}</span>
        <span class="player-name">${name}</span>
        <span class="player-ping" style="color:${pingColor}">${ping}ms</span>
      `;
      list.appendChild(div);
    });
  }

  function setStatusDot(ok) {
    const dot = document.getElementById('status-dot');
    if (!dot) return;
    dot.style.background = ok ? C.colors.accent : C.colors.red;
    dot.style.boxShadow  = ok ? `0 0 6px ${C.colors.accent}` : `0 0 6px ${C.colors.red}`;
  }

  async function fetchPlayers() {
    try {
      const res  = await fetch(PLAYERS_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error();
      renderPlayers(Array.isArray(await res.json()) ? await res.clone().json() : []);
      setStatusDot(true);
    } catch {
      setStatusDot(false);
      const label = document.getElementById('player-count-label');
      label.textContent = 'OFFLINE';
      label.style.color = C.colors.red;
    }
  }

  fetchPlayers();
  setInterval(fetchPlayers, C.playerList.refreshInterval * 1000);

  let pct = 0;

  function setProgress(val, label) {
    pct = Math.min(val, 100);
    document.getElementById('bar-fill').style.width = pct + '%';
    document.getElementById('loading-pct').textContent = Math.round(pct) + '%';
    if (label) document.getElementById('loading-text').textContent = label;
  }

  const loadInterval = setInterval(() => {
    pct += Math.random() * 1 + 0.5;
    if (pct >= 100) { pct = 100; clearInterval(loadInterval); }
    const idx = Math.floor((pct / 100) * C.loadingSteps.length);
    setProgress(pct, C.loadingSteps[Math.min(idx, C.loadingSteps.length - 1)]);
  }, 200);

  window.addEventListener('message', (e) => {
    if (e.data.type === 'playerList')   renderPlayers(e.data.players);
    if (e.data.type === 'loadProgress') setProgress(e.data.percent, e.data.label);
  });

  const PLAYLIST  = C.playlist;
  const audio     = document.getElementById('bgm');
  let trackIndex  = 0;
  let isPlaying   = false;
  let loopAll     = true;
  let volume      = C.defaultVolume;
  let waveInterval = null;

  const waveEl  = document.getElementById('mp-wave');
  const sigBars = document.querySelectorAll('.mp-signal-bar');

  for (let i = 0; i < 30; i++) {
    const b = document.createElement('div');
    b.className = 'wave-bar';
    b.style.height = '4px';
    waveEl.appendChild(b);
  }
  const waveBars = waveEl.querySelectorAll('.wave-bar');

  function fmt(sec) {
    if (!isFinite(sec)) return '0:00';
    return `${Math.floor(sec/60)}:${String(Math.floor(sec%60)).padStart(2,'0')}`;
  }

  function animateWave(playing) {
    clearInterval(waveInterval);
    if (!playing) {
      waveBars.forEach(b => { b.style.height='4px'; b.style.opacity='0.35'; });
      return;
    }
    waveInterval = setInterval(() => {
      waveBars.forEach(b => {
        const h = 3 + Math.random() * 20;
        b.style.height     = h + 'px';
        b.style.opacity    = 0.4 + (h / 23) * 0.6;
        b.style.background = h > 15 ? 'var(--accent)' : 'var(--od-green)';
      });
    }, 80);
  }

  setInterval(() => {
    if (!isPlaying) return;
    sigBars.forEach(b => b.classList.toggle('active', Math.random() > 0.3));
  }, 200);

  function renderPlaylist() {
    const pl = document.getElementById('mp-playlist');
    pl.innerHTML = '';
    PLAYLIST.forEach((t, i) => {
      const item = document.createElement('div');
      item.className = 'mp-pl-item' + (i === trackIndex ? ' current' : '');
      item.innerHTML =
        `<span class="mp-pl-num">${String(i+1).padStart(2,'0')}</span>` +
        `<span class="mp-pl-name">${t.title}</span>`;
      item.addEventListener('click', () => loadTrack(i, true));
      pl.appendChild(item);
    });
  }

  function loadTrack(idx, autoplay = false) {
    if (!PLAYLIST.length) return;
    trackIndex = (idx + PLAYLIST.length) % PLAYLIST.length;
    const t = PLAYLIST[trackIndex];
    audio.src    = t.file;
    audio.volume = volume;
    document.getElementById('mp-title').textContent = t.title;
    document.getElementById('mp-sub').textContent   =
      `TRACK ${String(trackIndex+1).padStart(2,'0')} / ${String(PLAYLIST.length).padStart(2,'0')} · ${C.server.radioLabel}`;
    document.getElementById('mp-seek-fill').style.width = '0%';
    document.getElementById('mp-cur').textContent = '0:00';
    document.getElementById('mp-dur').textContent = '0:00';
    renderPlaylist();
    if (autoplay) playTrack();
  }

  function playTrack() {
    audio.play().then(() => {
      isPlaying = true;
      document.getElementById('btn-play').textContent = '⏸';
      animateWave(true);
      sigBars.forEach(b => b.classList.add('active'));
    }).catch(() => {});
  }

  function pauseTrack() {
    audio.pause();
    isPlaying = false;
    document.getElementById('btn-play').textContent = '▶';
    animateWave(false);
    sigBars.forEach(b => b.classList.remove('active'));
  }

  document.getElementById('btn-play').addEventListener('click', () => {
    if (!PLAYLIST.length) return;
    if (!audio.src || audio.src === window.location.href) { loadTrack(0, true); return; }
    isPlaying ? pauseTrack() : playTrack();
  });
  document.getElementById('btn-prev').addEventListener('click', () => loadTrack(trackIndex - 1, isPlaying));
  document.getElementById('btn-next').addEventListener('click', () => loadTrack(trackIndex + 1, isPlaying));
  document.getElementById('btn-loop').addEventListener('click', function () {
    loopAll = !loopAll;
    this.classList.toggle('active', loopAll);
  });
  document.getElementById('btn-loop').classList.add('active');

  audio.addEventListener('ended', () => loopAll ? loadTrack(trackIndex + 1, true) : pauseTrack());

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    document.getElementById('mp-seek-fill').style.width =
      (audio.currentTime / audio.duration * 100) + '%';
    document.getElementById('mp-cur').textContent = fmt(audio.currentTime);
    document.getElementById('mp-dur').textContent = fmt(audio.duration);
  });

  document.getElementById('mp-seek').addEventListener('click', function (e) {
    if (!audio.duration) return;
    const r = this.getBoundingClientRect();
    audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
  });

  const volEl     = document.getElementById('mp-vol');
  const volFillEl = document.getElementById('mp-vol-fill');
  volFillEl.style.width = (volume * 100) + '%';

  volEl.addEventListener('click', function (e) {
    const r = this.getBoundingClientRect();
    volume = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    audio.volume = volume;
    volFillEl.style.width = (volume * 100) + '%';
  });

  let firstClick = true;
  document.addEventListener('click', () => {
    if (!firstClick) return;
    firstClick = false;
    if (PLAYLIST.length && (!audio.src || audio.src === window.location.href)) {
      loadTrack(0, true);
    }
  }, { capture: true });

  renderPlaylist();
  if (PLAYLIST.length) {
    document.getElementById('mp-title').textContent = PLAYLIST[0].title;
    document.getElementById('mp-sub').textContent   =
      `TRACK 01 / ${String(PLAYLIST.length).padStart(2,'0')} · ${C.server.radioLabel}`;
  }

})();
