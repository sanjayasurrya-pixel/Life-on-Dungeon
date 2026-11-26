(() => {
  const MUTE_KEY = 'lod-bgm-muted';
  const TIME_KEY = 'lod-bgm-time';
  const audio = document.getElementById('bgm');
  const btn = document.getElementById('bgmToggle');
  if (!audio || !btn) return;

  const iconOn = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg><span>Musik</span>';
  const iconOff = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M22 9l-6 6"/><path d="M16 9l6 6"/></svg><span>Mati</span>';

  let muted = localStorage.getItem(MUTE_KEY) === '1';
  audio.volume = 0.35;

  function render() {
    audio.muted = muted;
    btn.innerHTML = muted ? iconOff : iconOn;
    btn.setAttribute('aria-pressed', String(!muted));
    btn.setAttribute('aria-label', muted ? 'Nyalakan musik latar' : 'Matikan musik latar');
    btn.title = muted ? 'Nyalakan musik latar' : 'Matikan musik latar';
  }

  function saveTime() {
    try { sessionStorage.setItem(TIME_KEY, String(audio.currentTime || 0)); } catch {}
  }

  function restoreTime() {
    let saved = parseFloat(sessionStorage.getItem(TIME_KEY) || '0');
    if (!Number.isFinite(saved) || saved < 0) return;
    const apply = () => {
      try {
        const dur = audio.duration;
        if (Number.isFinite(dur) && dur > 0) saved = saved % dur;
        audio.currentTime = saved;
      } catch {}
    };
    if (audio.readyState >= 1) apply();
    else audio.addEventListener('loadedmetadata', apply, { once: true });
  }

  async function tryPlay() {
    if (muted) return;
    try { await audio.play(); } catch { /* autoplay blocked; waits for interaction */ }
  }

  btn.addEventListener('click', async () => {
    muted = !muted;
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
    render();
    if (!muted) tryPlay();
  });

  const unlock = () => {
    tryPlay();
    ['pointerdown', 'keydown', 'touchstart'].forEach((evt) => {
      document.removeEventListener(evt, unlock, true);
    });
  };
  ['pointerdown', 'keydown', 'touchstart'].forEach((evt) => {
    document.addEventListener(evt, unlock, true);
  });

  let lastSave = 0;
  audio.addEventListener('timeupdate', () => {
    const now = Date.now();
    if (now - lastSave > 1000) {
      lastSave = now;
      saveTime();
    }
  });
  window.addEventListener('pagehide', saveTime);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) saveTime();
  });

  render();
  restoreTime();
  tryPlay();
})();
