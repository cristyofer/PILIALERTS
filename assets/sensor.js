/* =========================================================
   PILI — interação com o acelerômetro do celular
   - inclinar o celular move os logos 3D, a luz e o fundo
   - chacoalhar faz os logos darem uma volta e solta uma onda de luz
   ========================================================= */
(() => {
  const toque = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  if (!toque || !('DeviceOrientationEvent' in window)) return;

  const PILI = window.PILI || (window.PILI = {});
  PILI.voltas = 0;
  const lim = (v, a = -1, b = 1) => Math.min(b, Math.max(a, v));
  const pede = typeof DeviceOrientationEvent.requestPermission === 'function'; // iPhone pede licença

  /* ---------- aviso na tela ---------- */
  const pill = document.createElement('button');
  pill.className = 'sensor-pill';
  pill.type = 'button';
  pill.innerHTML = '<span class="sensor-cel"></span><b></b>';
  const texto = pill.querySelector('b');
  document.body.appendChild(pill);
  let escondeEm = 0;
  const mostra = (t, seg) => {
    texto.textContent = t;
    pill.classList.add('ver');
    clearTimeout(escondeEm);
    if (seg) escondeEm = setTimeout(() => pill.classList.remove('ver'), seg * 1000);
  };
  addEventListener('scroll', () => { if (scrollY > innerHeight * .6) pill.classList.remove('ver'); }, { passive: true });

  /* ---------- inclinação ---------- */
  let base = null, sx = 0, sy = 0, tx = 0, ty = 0, ligado = false, avisou = false;
  function inclinou(e) {
    if (e.beta == null || e.gamma == null) return;
    // quando o celular está deitado (tela para o lado), troca os eixos
    const ang = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
    let b = e.beta, g = e.gamma;
    if (ang === 90) { b = -e.gamma; g = e.beta; } else if (ang === -90 || ang === 270) { b = e.gamma; g = -e.beta; }
    if (base === null) base = b;
    base += (b - base) * .004; // vai se acostumando com o jeito que a pessoa segura
    tx = lim(g / 28);
    ty = lim((b - base) / 22);
    if (!ligado) { ligado = true; document.body.classList.add('com-sensor'); }
    if (!avisou) { avisou = true; mostra('Incline e chacoalhe o celular', 6); }
  }

  /* ---------- chacoalhar ---------- */
  let ultimaForca = 0, ultimoChacoalho = 0;
  function mexeu(e) {
    const a = e.acceleration && e.acceleration.x != null ? e.acceleration : null;
    let forca;
    if (a) forca = Math.hypot(a.x || 0, a.y || 0, a.z || 0);
    else {
      const g = e.accelerationIncludingGravity; if (!g || g.x == null) return;
      const m = Math.hypot(g.x, g.y, g.z);
      forca = Math.abs(m - ultimaForca); ultimaForca = m;
    }
    const agora = performance.now();
    if (forca > 17 && agora - ultimoChacoalho > 1300 && !document.body.classList.contains('em-filme')) {
      ultimoChacoalho = agora;
      chacoalhou();
    }
  }
  function chacoalhou() {
    PILI.voltas++;
    if (navigator.vibrate) navigator.vibrate([30, 40, 60]);
    const onda = document.createElement('div');
    onda.className = 'sensor-onda';
    document.body.appendChild(onda);
    setTimeout(() => onda.remove(), 1300);
    document.body.classList.remove('sacudiu'); void document.body.offsetWidth; document.body.classList.add('sacudiu');
    setTimeout(() => document.body.classList.remove('sacudiu'), 900);
    pill.classList.remove('ver');
  }
  PILI.chacoalhar = chacoalhou; // para testar no computador

  /* ---------- liga os sensores ---------- */
  function liga() {
    addEventListener('deviceorientation', inclinou, { passive: true });
    addEventListener('devicemotion', mexeu, { passive: true });
  }
  liga(); // no Android já funciona direto
  pill.addEventListener('click', async () => {
    if (!pede || ligado) { pill.classList.remove('ver'); return; }
    try {
      const r1 = await DeviceOrientationEvent.requestPermission();
      if (typeof DeviceMotionEvent !== 'undefined' && DeviceMotionEvent.requestPermission) await DeviceMotionEvent.requestPermission().catch(() => {});
      if (r1 !== 'granted') pill.classList.remove('ver');
    } catch (_) { pill.classList.remove('ver'); }
  });
  // iPhone: se em 1,2 s não chegou nada do sensor, pede licença com um toque
  if (pede) setTimeout(() => { if (!ligado) mostra('Toque aqui e use o movimento do celular'); }, 1200);

  /* ---------- manda a inclinação para o site como se fosse o mouse ---------- */
  let antes = 0;
  (function quadro(agora) {
    const dt = Math.min(.1, antes ? (agora - antes) / 1000 : .016); antes = agora;
    if (ligado && !document.body.classList.contains('em-filme')) {
      const k = 1 - Math.exp(-dt * 9);
      sx += (tx - sx) * k; sy += (ty - sy) * k;
      const x = innerWidth * (.5 + sx * .5), y = innerHeight * (.5 + sy * .5);
      dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: y, pointerType: 'sensor' }));
      document.documentElement.style.setProperty('--incl-x', sx.toFixed(3));
      document.documentElement.style.setProperty('--incl-y', sy.toFixed(3));
    }
    requestAnimationFrame(quadro);
  })(0);
})();
