const SEGMENTS = 10;
  const SEG_ANGLE = 360 / SEGMENTS;
  const OUTER = ['#d8262c', '#8a4fc8', '#2e7fd8', '#2fae4e', '#f5c518',
                 '#f28c1e', '#d8262c', '#8a4fc8', '#2e7fd8', '#2fae4e'];

  const wheel = document.getElementById('wheel');
  const btn = document.getElementById('spinBtn');
  const verdict = document.getElementById('verdict');
  const hint = document.getElementById('hint');

  const stops = [];
  for (let i = 0; i < SEGMENTS; i++) {
    const a = i * SEG_ANGLE;
    stops.push(`${OUTER[i]} ${a + 1.5}deg ${a + SEG_ANGLE - 1.5}deg`);
  }
  wheel.style.background =
    `conic-gradient(#f6e9c9 0deg 1.5deg, ${stops.join(', ')}, #f6e9c9 ${360 - 1.5}deg 360deg)`;

  const inner = ['var(--red) 0deg 36deg'];
  for (let i = 1; i < SEGMENTS; i++) {
    const c = i % 2 ? 'var(--black-seg)' : 'var(--red)';
    inner.push(`${c} ${i * SEG_ANGLE}deg ${(i + 1) * SEG_ANGLE}deg`);
  }
  document.getElementById('innerDisc').style.background = `conic-gradient(${inner.join(', ')})`;

  const numEls = [];
  for (let i = 0; i < SEGMENTS; i++) {
    const el = document.createElement('div');
    el.className = 'num';
    el.textContent = i + 1;
    wheel.appendChild(el);
    numEls.push(el);
  }
  function placeNumbers() {
    const radius = wheel.clientWidth * 0.42;
    numEls.forEach((el, i) => {
      el.style.transform =
        `translate(-50%, -50%) rotate(${i * SEG_ANGLE + SEG_ANGLE / 2}deg) translateY(${-radius}px)`;
    });
  }
  placeNumbers();
  addEventListener('resize', placeNumbers);

  let current = 0;
  let spinning = false;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let audioCtx = null;
  function tick() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch { return; }
    }
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.value = 1100;
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  function segmentAt(rotation) {
    const pointerAngle = (360 - (rotation % 360)) % 360;
    return Math.floor(pointerAngle / SEG_ANGLE) + 1;
  }

  const easeOutCubic = x => 1 - Math.pow(1 - x, 3);

  function spin() {
    if (spinning) return;
    spinning = true;
    btn.disabled = true;
    verdict.textContent = 'Berputar\u2026';
    hint.textContent = '';

    const target = current + 1440 + Math.random() * 360;
    const start = performance.now();
    const duration = reduceMotion ? 400 : 5200;
    let lastSegment = segmentAt(current);

    function frame(now) {
      const p = Math.min((now - start) / duration, 1);
      const rot = current + (target - current) * easeOutCubic(p);
      wheel.style.transform = `rotate(${rot}deg)`;

      const seg = segmentAt(rot);
      if (seg !== lastSegment && !reduceMotion) tick();
      lastSegment = seg;

      if (p < 1) {
        requestAnimationFrame(frame);
      } else {
        current = target % 360;
        wheel.style.transform = `rotate(${current}deg)`;
        verdict.textContent = `Angka ${segmentAt(current)}`;
        spinning = false;
        btn.disabled = false;
      }
    }
    requestAnimationFrame(frame);
  }

  btn.addEventListener('click', spin);
  document.addEventListener('keydown', e => {
    if ((e.key === ' ' || e.key === 'Enter') && document.activeElement !== btn) spin();
  });
