/* =========================================================
   PILI — fundo vivo, passeio pelos produtos e interações
   ========================================================= */
(() => {
  const { logo3D } = window.PILI;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const lim = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const suave = (a, b, x) => { const t = lim((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const rgb = (hex) => { hex = hex.trim(); const n = parseInt(hex.slice(1), 16); return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };
  const mistura = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  const parado = false; // animações sempre ligadas
  const celular = () => innerWidth <= 900;

  let mx = innerWidth / 2, my = innerHeight / 2;
  addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });

  /* ---------- cor atual do site (segue a seção na tela) ---------- */
  const corAtual = { c1: rgb('#9B5CFF'), c2: rgb('#5C3DFF') };
  const alvo = { c1: corAtual.c1, c2: corAtual.c2 };
  const secoes = $$('section[data-cor], section.produto');
  const corDe = (el) => {
    const cs = getComputedStyle(el);
    const c1 = el.dataset.cor || cs.getPropertyValue('--c') || '#9B5CFF';
    const c2 = el.dataset.cor2 || cs.getPropertyValue('--c2') || c1;
    return { c1: rgb(c1), c2: rgb(c2) };
  };
  const coresSecao = new Map(secoes.map((s) => [s, corDe(s)]));

  /* ---------- fundo vivo (placa de vídeo) ---------- */
  const cv = $('#fundo-vivo');
  const gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  let desenhaFundo = () => {};
  if (gl && !parado) {
    const vs = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
    const fs = `precision mediump float;
uniform vec2 r;uniform float t;uniform vec3 c1;uniform vec3 c2;uniform vec2 m;uniform float s;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
 return mix(mix(h(i),h(i+vec2(1.,0.)),u.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
 vec2 p=(gl_FragCoord.xy-.5*r)/r.y;
 float tt=t*.05;
 vec2 pp=p+vec2(0.,s);
 vec2 q=vec2(fbm(pp*1.3+vec2(tt,0.)),fbm(pp*1.3+vec2(5.2,1.3)-tt));
 vec2 w=vec2(fbm(pp*1.1+q*2.2+vec2(1.7,9.2)+tt*.7),fbm(pp*1.1+q*2.2+vec2(8.3,2.8)-tt*.5));
 float f=fbm(pp*1.2+w*2.);
 vec3 col=vec3(.010,.007,.020);
 col=mix(col,c1*.62,smoothstep(.34,.86,f));
 col=mix(col,c2*.55,smoothstep(.5,.95,w.x)*.75);
 col+=c1*pow(smoothstep(.58,1.,f),3.)*.8;
 float fio=abs(sin(pp.x*1.7+w.y*4.+tt*3.)*.45-pp.y+.15*sin(pp.x*3.1-tt*2.));
 col+=mix(c1,c2,.4)*(.03/(fio+.035))*smoothstep(1.3,.1,abs(p.x));
 float fio2=abs(sin(pp.x*1.2-w.x*3.-tt*2.)*.35-pp.y-.35);
 col+=mix(c2,vec3(1.),.2)*(.012/(fio2+.03))*smoothstep(1.3,.2,abs(p.x));
 float d=length(p-m);col+=c1*.1/(d*d*4.+.6);
 col*=smoothstep(2.,.15,length(p*vec2(.7,1.)));
 gl_FragColor=vec4(col,1.);
}`;
    const sh = (tipo, src) => { const o = gl.createShader(tipo); gl.shaderSource(o, src); gl.compileShader(o); return o; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(pr);
    if (gl.getProgramParameter(pr, gl.LINK_STATUS)) {
      gl.useProgram(pr);
      const b = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const a = gl.getAttribLocation(pr, 'a');
      gl.enableVertexAttribArray(a);
      gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
      const u = (nome) => gl.getUniformLocation(pr, nome);
      const U = { r: u('r'), t: u('t'), c1: u('c1'), c2: u('c2'), m: u('m'), s: u('s') };
      const medir = () => {
        const k = celular() ? .4 : .5;
        cv.width = Math.round(innerWidth * k); cv.height = Math.round(innerHeight * k);
        gl.viewport(0, 0, cv.width, cv.height);
      };
      medir(); addEventListener('resize', medir);
      desenhaFundo = (t) => {
        gl.uniform2f(U.r, cv.width, cv.height);
        gl.uniform1f(U.t, t);
        gl.uniform3fv(U.c1, corAtual.c1);
        gl.uniform3fv(U.c2, corAtual.c2);
        gl.uniform2f(U.m, (mx - innerWidth / 2) / innerHeight, (innerHeight / 2 - my) / innerHeight);
        gl.uniform1f(U.s, scrollY / innerHeight * .18);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };
    }
  } else {
    cv.style.display = 'none';
    document.body.style.background = 'radial-gradient(80% 60% at 50% 20%,#1a0d33,#030206 70%) fixed';
  }

  /* ---------- passeio pelos produtos ---------- */
  const passeio = $('#passeio');
  const cores = ['#9B5CFF', '#3D8BFF', '#25D366', '#FF3B5C', '#FFB020'];
  const cores2 = ['#5C3DFF', '#00D1FF', '#00B3A4', '#FF7A3D', '#FF5C3D'];
  const logosP = $$('.passeio-logo').map((el) => ({ el, ...logo3D(el, el.dataset.cor, el.dataset.cor2, 30, 90) }));
  const itens = $$('.passeio-item');
  const pontos = $$('#passeio-pontos button');
  const barraP = $('#passeio-barra');
  const gigante = $('.passeio-gigante');
  const dica = $('.passeio-dica');
  const ORB = [
    [['TikTok', '#ff2d6f'], ['YouTube', '#ff3030'], ['Twitch', '#9146ff'], ['Kick', '#53fc18'], ['Chat unificado', '#C9B0FF'], ['Alertas', '#9B5CFF']],
    [['16:9 horizontal', '#3D8BFF'], ['9:16 vertical', '#9CC4FF'], ['Várias plataformas', '#00D1FF'], ['Ligado ao ALERTS', '#9B5CFF'], ['Atualiza sozinho', '#25D366']],
    [['Responde em 1 s', '#25D366'], ['QR code', '#ffffff'], ['Pedidos', '#8BF0B5'], ['Conversas em blocos', '#00B3A4'], ['24 horas', '#25D366']],
    [['7.1 virtual', '#FF3B5C'], ['6.837 fones', '#FF9FB0'], ['Controle de tiro', '#FF7A3D'], ['~35 ms', '#ffffff'], ['Radar', '#FF3B5C']],
    [['10 faixas', '#FFB020'], ['2 PCs', '#FFD480'], ['Fontes no OBS', '#ffffff'], ['Rede de casa', '#FF5C3D'], ['Por programa', '#FFB020']],
  ];
  const orbita = $('#passeio-orbita');
  const chips = [];
  ORB.forEach((lista, k) => lista.forEach(([txt, cor], j) => {
    const e = document.createElement('div');
    e.className = 'orb';
    e.innerHTML = `<i style="background:${cor};box-shadow:0 0 10px ${cor}"></i>${txt}`;
    orbita.appendChild(e);
    chips.push({ e, k, j, n: lista.length });
  }));
  let fs = 0; // posição suavizada (0 a 4)
  let giro = 0; // volta extra quando chacoalha o celular
  const posicaoDe = () => {
    const r = passeio.getBoundingClientRect();
    const total = r.height - innerHeight;
    const prog = lim(-r.top / total);
    let f = lim(prog * 4.6 - .3, 0, 4);
    const k = Math.min(3, Math.floor(f));
    f = k + suave(.22, .78, f - k);
    return { r, prog, f, total };
  };
  pontos.forEach((b, k) => b.addEventListener('click', () => {
    const { total } = posicaoDe();
    const top = passeio.getBoundingClientRect().top + scrollY;
    scrollTo({ top: top + ((k + .3) / 4.6) * total + 2, behavior: 'smooth' });
  }));

  function atualizaPasseio(t) {
    const { r, prog, f } = posicaoDe();
    if (r.bottom < -50 || r.top > innerHeight + 50) { document.body.classList.remove('no-passeio'); return null; }
    fs += (f - fs) * (1 - Math.exp(-(window.__dtP || .016) * 6.5));
    const R = celular() ? 250 : 430;
    giro += ((window.PILI.voltas || 0) * 360 - giro) * (1 - Math.exp(-(window.__dtP || .016) * 3.2));
    logosP.forEach((l, k) => {
      const d = k - fs;
      const a = d * .95;
      const x = Math.sin(a) * R, z = (Math.cos(a) - 1) * R;
      const op = lim(1.1 - Math.abs(d) * .8);
      l.el.style.opacity = op;
      l.el.style.visibility = op <= 0 ? 'hidden' : 'visible';
      l.el.style.zIndex = String(100 - Math.round(Math.abs(d) * 10));
      l.el.style.transform = `translate3d(${x.toFixed(1)}px,${(Math.abs(d) * 20).toFixed(1)}px,${z.toFixed(1)}px)`;
      if (op > 0) {
        l.gira.style.transform = `rotateX(${(Math.sin(t * .7 + k) * 6 - (my / innerHeight - .5) * 14).toFixed(2)}deg) rotateY(${(-d * 32 + Math.sin(t * .6 + k) * 14 + (mx / innerWidth - .5) * 30 + giro).toFixed(2)}deg)`;
        const ciclo = ((t + k) % 4) / 4;
        l.faixa.setAttribute('transform', `translate(${(-400 + ciclo * 1700).toFixed(0)} 0) rotate(18 0 500)`);
      }
    });
    const RX = celular() ? 175 : 300, RY = celular() ? 48 : 80;
    chips.forEach((c) => {
      const w = lim(1 - Math.abs(c.k - fs) * 1.8);
      if (w <= 0) { c.e.style.opacity = 0; return; }
      const ang = t * .32 + (c.j / c.n) * Math.PI * 2 + (c.k - fs) * 1.6;
      const fr = Math.sin(ang);
      const x = Math.cos(ang) * RX;
      const y = fr * RY + (c.j % 2 ? 26 : -26) - 10;
      const esc = .78 + .3 * (fr + 1) / 2;
      c.e.style.opacity = (w * (.45 + .55 * (fr + 1) / 2)).toFixed(3);
      c.e.style.zIndex = fr > 0 ? '200' : '1';
      c.e.style.transform = `translate(-50%,-50%) translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(${esc.toFixed(3)})`;
    });
    itens.forEach((it, k) => {
      const d = k - fs;
      const op = lim(1 - Math.abs(d) * 2.2);
      it.style.opacity = op;
      it.style.visibility = op <= 0 ? 'hidden' : 'visible';
      it.style.transform = `translateY(${(d * 80).toFixed(1)}px)`;
      it.style.filter = Math.abs(d) > .02 ? `blur(${(Math.abs(d) * 14).toFixed(1)}px)` : 'none';
      it.style.pointerEvents = op > .6 ? 'auto' : 'none';
    });
    gigante.style.transform = `translateX(${(-fs * innerWidth).toFixed(1)}px)`;
    const ativo = Math.round(fs);
    pontos.forEach((b, k) => b.classList.toggle('on', k === ativo));
    barraP.style.width = `${prog * 100}%`;
    dica.style.opacity = prog < .04 ? 1 : 0;
    const dentro = r.top <= 1 && r.bottom >= innerHeight - 1;
    document.body.classList.toggle('no-passeio', dentro);
    if (!dentro) return null;
    const k0 = Math.floor(fs), k1 = Math.min(4, k0 + 1), tt = fs - k0;
    return { c1: mistura(rgb(cores[k0]), rgb(cores[k1]), tt), c2: mistura(rgb(cores2[k0]), rgb(cores2[k1]), tt) };
  }

  /* ---------- abertura: logo vem para perto ao rolar ---------- */
  const abertura = $('#abertura');
  const aberturaConteudo = $('#abertura-conteudo');
  const logoAbertura = $('#logo-abertura');
  function atualizaAbertura() {
    const y = scrollY, hh = innerHeight;
    if (y > hh * 1.2) return;
    const p = lim(y / hh);
    aberturaConteudo.style.transform = `translateY(${(y * .35).toFixed(1)}px)`;
    aberturaConteudo.style.opacity = (1 - p * 1.3).toFixed(3);
    const l3 = logoAbertura.querySelector('.l3d');
    if (l3) l3.style.transform = `scale(${(1 + p * .9).toFixed(3)})`;
    void abertura;
  }

  /* ---------- luz do cursor ---------- */
  const luz = $('#luz-cursor');
  let lx = mx, ly = my;

  /* ---------- laço principal ---------- */
  let ultimo = 0;
  function quadro(agora) {
    // filme aberto: o fundo fica parado para o celular não engasgar
    if (document.body.classList.contains('em-filme')) { ultimo = 0; requestAnimationFrame(quadro); return; }
    const t = agora / 1000;
    const dt = Math.min(.5, ultimo ? t - ultimo : .016); ultimo = t;
    window.__dtP = dt;
    const cp = atualizaPasseio(t);
    if (cp) { alvo.c1 = cp.c1; alvo.c2 = cp.c2; }
    else {
      const meio = innerHeight / 2;
      for (const s of secoes) {
        const r = s.getBoundingClientRect();
        if (r.top <= meio && r.bottom >= meio) { const c = coresSecao.get(s); alvo.c1 = c.c1; alvo.c2 = c.c2; break; }
      }
    }
    const k = 1 - Math.exp(-dt * (cp ? 12 : 2.6));
    corAtual.c1 = mistura(corAtual.c1, alvo.c1, k);
    corAtual.c2 = mistura(corAtual.c2, alvo.c2, k);
    const css = `rgb(${corAtual.c1.map((v) => Math.round(v * 255)).join(',')})`;
    document.documentElement.style.setProperty('--cor-atual', css);
    atualizaAbertura();
    const kl = 1 - Math.exp(-dt * 8); lx += (mx - lx) * kl; ly += (my - ly) * kl;
    luz.style.transform = `translate(${lx.toFixed(1)}px,${ly.toFixed(1)}px)`;
    desenhaFundo(t);
    requestAnimationFrame(quadro);
  }
  requestAnimationFrame(quadro);

  /* ---------- luz e inclinação nos cartões ---------- */
  document.addEventListener('pointermove', (e) => {
    const el = e.target.closest && e.target.closest('.numero,.recurso,.cartao,.google');
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    el.style.setProperty('--mx', `${x}px`);
    el.style.setProperty('--my', `${y}px`);
    if (el.classList.contains('cartao')) {
      el.style.setProperty('--rx', `${((.5 - y / r.height) * 7).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${((x / r.width - .5) * 9).toFixed(2)}deg`);
    }
  }, { passive: true });

  /* ---------- números que contam ao aparecer ---------- */
  const conta = new IntersectionObserver((itens2) => itens2.forEach((it) => {
    if (!it.isIntersecting) return;
    conta.unobserve(it.target);
    const el = it.target, txt = el.textContent.trim();
    const m = txt.match(/^(~?)(\d{1,3}(?:\.\d{3})+|\d+)(.*)$/);
    if (!m || parado) return;
    const fim = +m[2].replace(/\./g, '');
    const t0 = performance.now(), dur = 1400;
    const passo = (agora) => {
      const p = lim((agora - t0) / dur);
      const v = Math.round(fim * (1 - Math.pow(1 - p, 3)));
      el.textContent = m[1] + v.toLocaleString('pt-BR') + m[3];
      if (p < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  }), { threshold: .6 });
  $$('.numero strong').forEach((s) => conta.observe(s));
})();
