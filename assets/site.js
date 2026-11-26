/* =========================================================
   PILI — vitrine. Troque o número abaixo pelo seu WhatsApp
   (só números: 55 + DDD + número, ex.: 5531999998888)
   ========================================================= */
const WHATSAPP = '5549991726420';

const linkWhats = (msg) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
document.querySelectorAll('[data-whats]').forEach((a) => {
  a.href = linkWhats(a.dataset.whats);
  a.target = '_blank';
  a.rel = 'noopener';
});

const reduzMovimento = false; // animações sempre ligadas (pedido do dono do site)

/* ---------- logo P em 3D (camadas empilhadas) ---------- */
const P_D = 'M280 218 L700 218 L782 298 L782 450 L703 527 L493 527 L493 758 L437 758 L390 712 L390 435 L678 435 L678 313 L427 313 Z M305 338 L493 338 L493 410 L420 410 Z';
let idSvg = 0;
function mistura(hex, alvo, t) {
  const n = parseInt(hex.slice(1), 16), m = parseInt(alvo.slice(1), 16);
  const c = (a, b) => Math.round(a + (b - a) * t);
  const r = c(n >> 16, m >> 16), g = c((n >> 8) & 255, (m >> 8) & 255), b = c(n & 255, m & 255);
  return `rgb(${r},${g},${b})`;
}
function logo3D(alvo, cor, cor2, camadas = 22, fundo = 70) {
  alvo.innerHTML = '';
  const base = document.createElement('div');
  base.className = 'l3d';
  const gira = document.createElement('div');
  gira.className = 'l3d-gira';
  base.appendChild(gira);
  const tam = alvo.clientWidth || 300;
  const passo = (fundo / camadas) * (tam / 380);
  for (let i = 0; i < camadas; i++) {
    const frente = i === camadas - 1;
    const z = (i - (camadas - 1) / 2) * passo;
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '250 190 560 600');
    svg.style.transform = `translateZ(${z.toFixed(2)}px)`;
    const p = document.createElementNS(ns, 'path');
    p.setAttribute('d', P_D);
    if (frente) {
      const id = 'g' + ++idSvg;
      svg.innerHTML = `<defs>
        <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${cor2}"/><stop offset=".45" stop-color="${cor}"/><stop offset="1" stop-color="${mistura(cor, '#000000', .35)}"/>
        </linearGradient>
        <linearGradient id="${id}b" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
        </linearGradient>
        <clipPath id="${id}c"><path d="${P_D}"/></clipPath>
      </defs>`;
      p.setAttribute('fill', `url(#${id})`);
      svg.appendChild(p);
      const borda = document.createElementNS(ns, 'path');
      borda.setAttribute('d', P_D);
      borda.setAttribute('fill', 'none');
      borda.setAttribute('stroke', 'rgba(255,255,255,.55)');
      borda.setAttribute('stroke-width', '3');
      svg.appendChild(borda);
      const g = document.createElementNS(ns, 'g');
      g.setAttribute('clip-path', `url(#${id}c)`);
      const faixa = document.createElementNS(ns, 'rect');
      faixa.setAttribute('class', 'faixa-brilho');
      faixa.setAttribute('x', '0'); faixa.setAttribute('y', '100');
      faixa.setAttribute('width', '160'); faixa.setAttribute('height', '800');
      faixa.setAttribute('fill', `url(#${id}b)`);
      faixa.setAttribute('transform', 'translate(-400 0) rotate(18 0 500)');
      g.appendChild(faixa);
      svg.appendChild(g);
    } else {
      // lateral: escurece para o fundo, com um fio de luz na borda
      const t = i / (camadas - 1);
      p.setAttribute('fill', mistura(cor, '#000000', .78 - t * .38));
      if (i === 0) p.setAttribute('fill', mistura(cor, '#000000', .85));
      svg.appendChild(p);
    }
    gira.appendChild(svg);
  }
  alvo.appendChild(base);
  return { gira, faixa: gira.querySelector('.faixa-brilho') };
}

/* ---------- monta todos os logos ---------- */
const logos = []; // {el, gira, faixa, modo, fase}
function registra(el, modo, camadas, fundo) {
  const r = logo3D(el, el.dataset.cor, el.dataset.cor2, camadas, fundo);
  logos.push({ el, ...r, modo, fase: Math.random() * 6, visivel: false, rx: 0, ry: 0 });
}
const abertura = document.getElementById('logo-abertura');
registra(abertura, 'mouse', +abertura.dataset.camadas, +abertura.dataset.fundo);
document.querySelectorAll('.logo-produto').forEach((el) => { el.style.cssText = 'position:absolute;inset:14%'; registra(el, 'rolagem', 28, 80); });
document.querySelectorAll('.trilho .mini').forEach((el) => registra(el, 'balanco', 10, 60));
document.querySelectorAll('.cartao .mini').forEach((el) => registra(el, 'balanco', 14, 70));

const veLogo = new IntersectionObserver((itens) => {
  itens.forEach((it) => { const l = logos.find((x) => x.el === it.target); if (l) l.visivel = it.isIntersecting; });
}, { rootMargin: '100px' });
logos.forEach((l) => veLogo.observe(l.el));

let mx = 0, my = 0;
addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; });

function anima(agora) {
  const t = agora / 1000;
  for (const l of logos) {
    if (!l.visivel) continue;
    let ry, rx;
    if (l.modo === 'mouse') {
      ry = Math.sin(t * .55) * 22 + mx * 50;
      rx = Math.sin(t * .4) * 6 - my * 26;
    } else if (l.modo === 'rolagem') {
      const r = l.el.getBoundingClientRect();
      const meio = (r.top + r.height / 2) / innerHeight - .5; // -0.5 .. 0.5
      ry = meio * -90 + Math.sin(t * .7 + l.fase) * 10 + mx * 18;
      rx = Math.sin(t * .5 + l.fase) * 5 - my * 10 + meio * 12;
    } else {
      ry = Math.sin(t * .8 + l.fase) * 28;
      rx = Math.sin(t * .6 + l.fase) * 6;
    }
    if (reduzMovimento) { ry = -18; rx = 4; }
    l.ry += (ry - l.ry) * .08; l.rx += (rx - l.rx) * .08;
    l.gira.style.transform = `rotateX(${l.rx.toFixed(2)}deg) rotateY(${l.ry.toFixed(2)}deg)`;
    if (l.faixa) {
      const ciclo = ((t + l.fase) % 4.5) / 4.5;
      const x = -400 + ciclo * 1700;
      l.faixa.setAttribute('transform', `translate(${x.toFixed(0)} 0) rotate(18 0 500)`);
    }
  }
  requestAnimationFrame(anima);
}
requestAnimationFrame(anima);

/* ---------- surgir ao rolar ---------- */
const veSurge = new IntersectionObserver((itens) => {
  itens.forEach((it) => { if (it.isIntersecting) { it.target.classList.add('in'); veSurge.unobserve(it.target); } });
}, { threshold: .15, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.surge').forEach((el) => veSurge.observe(el));

/* ---------- barra e botão flutuante ---------- */
const barra = document.getElementById('barra');
const flutua = document.getElementById('flutua');
const frase = document.getElementById('frase');
// quebra a frase em palavras para acender conforme rola
const destaque = new Set(['explodir.', 'vertical', 'WhatsApp.', 'inimigo.', 'só.']);
frase.innerHTML = frase.textContent.trim().split(/\s+/).map((w) => `<span${destaque.has(w) ? ' class="cor"' : ''}>${w}</span> `).join('');
const palavras = [...frase.querySelectorAll('span')];
function rolou() {
  const y = scrollY;
  barra.classList.toggle('rolou', y > 20);
  flutua.classList.toggle('ver', y > innerHeight * .8);
  const r = frase.getBoundingClientRect();
  const prog = Math.min(1, Math.max(0, (innerHeight * .85 - r.top) / (r.height + innerHeight * .35)));
  const n = Math.round(prog * palavras.length);
  palavras.forEach((s, i) => s.classList.toggle('on', i < n));
}
addEventListener('scroll', rolou, { passive: true });
rolou();

/* ---------- poeira de luz na abertura ---------- */
(function poeira() {
  const cv = document.getElementById('poeira');
  if (!cv || reduzMovimento) return;
  const ctx = cv.getContext('2d');
  let w, h, pts;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  function medir() {
    w = cv.clientWidth; h = cv.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pts = Array.from({ length: Math.round(w * h / 9000) }, () => ({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.4 + .3, v: Math.random() * .25 + .05, a: Math.random() }));
  }
  medir(); addEventListener('resize', medir);
  (function quadro() {
    ctx.clearRect(0, 0, w, h);
    for (const p of pts) {
      p.y -= p.v; p.a += .01;
      if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; }
      ctx.globalAlpha = .25 + Math.sin(p.a) * .25 + .25;
      ctx.fillStyle = '#d9c6ff';
      ctx.beginPath(); ctx.arc(p.x + mx * 20 * p.r, p.y, p.r, 0, 6.283); ctx.fill();
    }
    requestAnimationFrame(quadro);
  })();
})();

window.PILI = { logo3D, linkWhats };
