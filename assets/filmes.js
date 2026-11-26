/* =========================================================
   PILI — filmes curtos de cada produto (animados no navegador)
   palco de 1280 x 720, escalado para caber na tela
   ========================================================= */
(() => {
  const { logo3D, linkWhats } = window.PILI;
  const $ = (s) => document.querySelector(s);
  const cinema = $('#cinema'), palco = $('#palco'), quadro = $('#quadro'), legenda = $('#legenda');
  const linha = $('#linha'), barraTempo = linha.querySelector('i'), bolinha = linha.querySelector('b');
  const btTocar = $('#tocar'), btDeNovo = $('#denovo'), btVoz = $('#voz'), btComprar = $('#comprar-filme');

  /* ---------- utilidades ---------- */
  const lim = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  // celular / tela de toque: tira desfoques e usa menos camadas no logo
  const leve = matchMedia('(max-width: 900px), (pointer: coarse)').matches;
  const borra = (el, px) => { el.style.filter = (leve || px < .05) ? 'none' : `blur(${px.toFixed(2)}px)`; };
  const E = {
    sai: (x) => 1 - Math.pow(1 - x, 3),
    mola: (x) => { const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); },
    suave: (x) => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
    reto: (x) => x,
  };
  const fase = (t, a, d, f = E.sai) => f(lim((t - a) / d));
  const h = (pai, tag, cls, css, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (css) e.style.cssText = css;
    if (html != null) e.innerHTML = html;
    pai.appendChild(e);
    return e;
  };
  const ruido = (i, t) => (Math.sin(i * 12.9898 + t * 7.1) * .5 + Math.sin(i * 4.1 + t * 13.7) * .3 + Math.sin(t * 3 + i) * .2) * .5 + .5;
  const PLAT = [['TikTok', '#ff2d6f'], ['YouTube', '#ff3030'], ['Twitch', '#9146ff'], ['Kick', '#53fc18']];

  // título que entra palavra por palavra ( *palavra* = colorida, | = quebra de linha )
  function titulo(el, texto, topo = 64, tamanho = 52) {
    const t = h(el, 'div', 'f-titulo', `top:${topo}px;font-size:${tamanho}px`);
    const spans = [];
    texto.split(' ').forEach((w) => {
      if (w === '|') { h(t, 'br'); return; }
      const cor = w.includes('*');
      spans.push(h(t, 'span', cor ? 'cor' : '', null, w.replace(/\*/g, '')));
    });
    return (tl) => spans.forEach((s, i) => {
      const p = fase(tl, .1 + i * .08, .6);
      s.style.opacity = p;
      s.style.transform = `translateY(${(1 - p) * 30}px)`;
      borra(s, (1 - p) * 6);
    });
  }
  const entra = (el, p, dx = 0, dy = 40, esc = 1) => {
    el.style.opacity = lim(p);
    el.style.transform = `translate(${(1 - p) * dx}px,${(1 - p) * dy}px) scale(${esc === 1 ? 1 : esc + (1 - esc) * p})`;
  };
  function caixa(el, x, y, w, ht, rot) {
    const c = h(el, 'div', 'f-caixa', `left:${x}px;top:${y}px;width:${w}px;height:${ht}px`);
    if (rot) h(c, 'div', '', 'padding:16px 20px;font-size:17px;font-weight:600;color:#a1a1a6;border-bottom:1px solid rgba(255,255,255,.08);letter-spacing:.02em', rot);
    return c;
  }
  function logoEm(el, x, y, tam, P, camadas = 24) {
    const box = h(el, 'div', '', `position:absolute;left:${x}px;top:${y}px;width:${tam}px;height:${tam}px`);
    const lg = logo3D(box, P.c, P.c3, leve ? Math.min(camadas, 10) : camadas, 80);
    return { box, ...lg };
  }
  const brilhoLogo = (lg, t, fase0 = 0) => {
    const ciclo = ((t + fase0) % 3) / 3;
    lg.faixa.setAttribute('transform', `translate(${(-400 + ciclo * 1700).toFixed(0)} 0) rotate(18 0 500)`);
  };

  /* ---------- cenas que todos os filmes usam ---------- */
  const abertura = (fala, sub) => ({
    d: 4.4, fala,
    monta(c, P) {
      const lg = logoEm(c, 500, 95, 280, P, 30);
      const nome = h(c, 'div', 'f-grande', 'top:420px;font-size:88px', P.nome);
      const s = h(c, 'div', 'f-grande', 'top:530px;font-size:30px;font-weight:500;letter-spacing:-.01em;color:#cfcfd4', sub);
      return (t) => {
        const a = fase(t, 0, 1.6, E.sai);
        lg.box.style.opacity = a;
        lg.box.style.transform = `scale(${.55 + .45 * a})`;
        lg.gira.style.transform = `rotateX(${Math.sin(t * 1.1) * 6}deg) rotateY(${(1 - a) * -200 + Math.sin(t * 1.3) * 16}deg)`;
        brilhoLogo(lg, t);
        const n = fase(t, .7, 1.2);
        nome.style.opacity = n;
        if (!leve) nome.style.letterSpacing = `${(.35 - .4 * n).toFixed(3)}em`;
        borra(nome, (1 - n) * 10);
        entra(s, fase(t, 1.4, .9), 0, 20);
      };
    },
  });
  const fim = (fala, linha2, botao = 'Comprar pelo WhatsApp', selo) => ({
    d: 4.8, fala,
    monta(c, P) {
      const lg = logoEm(c, 545, 80, 190, P, 24);
      const nome = h(c, 'div', 'f-grande', 'top:300px;font-size:70px', P.nome);
      const l2 = h(c, 'div', 'f-grande', `top:388px;font-size:34px;font-weight:600;letter-spacing:-.02em;color:${P.c2}`, linha2);
      const bt = h(c, 'div', '', 'position:absolute;left:50%;top:462px;transform:translateX(-50%);display:flex;align-items:center;gap:12px;font-size:26px;font-weight:700;padding:18px 36px;border-radius:99px;background:#25D366;color:#04120a;box-shadow:0 20px 60px -10px rgba(37,211,102,.6);white-space:nowrap',
        `<svg width="30" height="30" style="color:#04120a"><use href="#i-whats"/></svg>${botao}`);
      let sl;
      if (selo) sl = h(c, 'div', '', `position:absolute;left:760px;top:70px;padding:10px 20px;border-radius:99px;font-size:26px;font-weight:800;letter-spacing:.1em;background:${P.c};color:#fff;transform:rotate(8deg);box-shadow:0 10px 40px -8px ${P.c}`, selo);
      return (t) => {
        const a = fase(t, 0, 1.2);
        lg.box.style.opacity = a;
        lg.gira.style.transform = `rotateY(${Math.sin(t * 1.4) * 24}deg) rotateX(${Math.sin(t) * 6}deg)`;
        brilhoLogo(lg, t, 1);
        entra(nome, fase(t, .25, .8), 0, 30);
        entra(l2, fase(t, .55, .8), 0, 30);
        const b = fase(t, .9, .9, E.mola);
        bt.style.opacity = lim(b);
        bt.style.transform = `translateX(-50%) scale(${(.6 + .4 * b) * (1 + Math.sin(t * 5) * .015 * (t > 2 ? 1 : 0))})`;
        if (sl) { const s = fase(t, 1.3, .7, E.mola); sl.style.opacity = lim(s); sl.style.transform = `rotate(8deg) scale(${.3 + .7 * s})`; }
      };
    },
  });

  /* =========================================================
     PILI ALERTS
     ========================================================= */
  const ALERTS = {
    nome: 'PILI ALERTS', c: '#9B5CFF', c2: '#C9B0FF', c3: '#E2D4FF', whats: 'Olá! Vi o filme no site e quero comprar o PILI ALERTS.',
    cenas: [
      abertura('Este é o Pili Alerts. Alertas e chat para a sua live.', 'Alertas e chat para quem transmite ao vivo'),
      {
        d: 5, fala: 'Ele junta o chat do TikTok, YouTube, Twitch e Kick numa tela só.',
        monta(c) {
          const ti = titulo(c, 'Quatro plataformas. *Um* *chat.*');
          const chips = PLAT.map(([n, cor], i) => {
            const ch = h(c, 'div', 'f-chip', `left:110px;top:${215 + i * 92}px`, `<i style="background:${cor};box-shadow:0 0 14px ${cor}"></i>${n}`);
            return ch;
          });
          const bx = caixa(c, 640, 190, 530, 410, 'CHAT UNIFICADO');
          const msgs = [
            [0, 'mari.lives', 'chegueiii 💜'], [1, 'GuiFPS', 'que jogada!!'], [2, 'nightowl', 'boa noite chat'],
            [3, 'kickzera', 'POG'], [0, 'ana.tt', 'manda salve pra mim'], [1, 'Lucas', 'primeira vez aqui'],
            [2, 'raven_br', 'clip isso!'], [3, 'tuba', 'bora 1k'], [0, 'jojo', '🔥🔥🔥'],
          ];
          const els = msgs.map(([p, u, txt]) => h(bx, 'div', 'f-msg', '', `<i style="background:${PLAT[p][1]}"></i><b>${u}</b><span style="color:#cfcfd4">${txt}</span>`));
          const voos = msgs.map(([p]) => h(c, 'div', '', `position:absolute;width:14px;height:14px;border-radius:50%;background:${PLAT[p][1]};box-shadow:0 0 18px ${PLAT[p][1]};opacity:0`));
          return (t) => {
            ti(t);
            chips.forEach((ch, i) => entra(ch, fase(t, .2 + i * .1, .6), -60, 0));
            entra(bx, fase(t, .3, .8), 60, 0);
            const ini = (i) => .9 + i * .42;
            const chegou = msgs.filter((_, i) => t > ini(i) + .35).length;
            els.forEach((el, i) => {
              const p = fase(t, ini(i) + .3, .45);
              const pos = 345 - (chegou - 1 - i) * 52;
              el.style.top = `${pos}px`;
              el.style.opacity = t > ini(i) + .3 ? lim(p) * lim((pos - 40) / 40) : 0;
              el.style.transform = `translateX(${(1 - p) * -40}px)`;
            });
            voos.forEach((v, i) => {
              const p = lim((t - ini(i)) / .4);
              const p0 = msgs[i][0];
              const x0 = 300, y0 = 238 + p0 * 92, x1 = 650, y1 = 545;
              v.style.opacity = p > 0 && p < 1 ? 1 : 0;
              v.style.left = `${x0 + (x1 - x0) * E.suave(p)}px`;
              v.style.top = `${y0 + (y1 - y0) * E.suave(p) - Math.sin(p * Math.PI) * 60}px`;
              if (p > 0 && p < 1) chips[p0].style.boxShadow = `0 0 30px ${PLAT[p0][1]}66`;
            });
            chips.forEach((ch, i) => { if (!voos.some((v, j) => msgs[j][0] === i && v.style.opacity === '1')) ch.style.boxShadow = 'none'; });
          };
        },
      },
      {
        d: 5, fala: 'Cada seguidor, presente e membro vira um alerta com imagem, texto e som do seu jeito.',
        monta(c, P) {
          const ti = titulo(c, 'Alertas do *seu* *jeito.*');
          const aneis = [0, 1, 2].map(() => h(c, 'div', '', `position:absolute;left:640px;top:390px;width:10px;height:10px;border-radius:50%;border:2px solid ${P.c};opacity:0`));
          const card = (rot, nome, icone, cor) => {
            const k = h(c, 'div', 'f-caixa', `left:330px;top:270px;width:620px;height:240px;display:flex;align-items:center;gap:30px;padding:0 40px;background:linear-gradient(135deg,rgba(40,24,70,.95),rgba(16,12,24,.95));border-color:${cor}66`);
            h(k, 'div', '', `flex:none;width:130px;height:130px;border-radius:50%;display:grid;place-items:center;font-size:62px;background:radial-gradient(circle at 35% 30%,${cor},#1a1024);box-shadow:0 0 50px ${cor}88`, icone);
            h(k, 'div', '', '', `<div style="font-size:20px;font-weight:700;letter-spacing:.18em;color:${cor}">${rot}</div><div style="font-size:46px;font-weight:700;letter-spacing:-.03em;margin-top:4px">${nome}</div>`);
            return k;
          };
          const a1 = card('NOVO SEGUIDOR', '@lucas_gamer', '💜', P.c);
          const a2 = card('PRESENTE · TIKTOK', '@ana.live · 5 Leões', '🦁', '#ff2d6f');
          const conf = Array.from({ length: 36 }, (_, i) => {
            const cor = [P.c, P.c2, '#ff2d6f', '#ffd166', '#53fc18'][i % 5];
            return { el: h(c, 'div', '', `position:absolute;left:0;top:0;width:${8 + (i % 3) * 3}px;height:${12 + (i % 4) * 2}px;border-radius:2px;background:${cor};opacity:0`), a: (i / 36) * Math.PI * 2 + Math.sin(i) * .3, v: 260 + (i * 37) % 220 };
          });
          return (t) => {
            ti(t);
            const mostra = (k, a, b) => {
              const p = fase(t, a, .6, E.mola), q = fase(t, b, .4, E.reto);
              k.style.opacity = lim(p) * (1 - q);
              k.style.transform = `scale(${.6 + .4 * p - q * .1}) translateY(${q * -30}px)`;
            };
            mostra(a1, .4, 2.4);
            mostra(a2, 2.6, 9);
            aneis.forEach((r, i) => {
              const base = i < 2 ? .5 + i * .2 : 2.7;
              const p = lim((t - base) / 1.4);
              const s = p * 900;
              r.style.width = r.style.height = `${s}px`;
              r.style.left = `${640 - s / 2}px`;
              r.style.top = `${390 - s / 2}px`;
              r.style.opacity = p > 0 ? (1 - p) * .8 : 0;
            });
            conf.forEach((k, i) => {
              const base = i % 2 ? .5 : 2.7;
              const tt = t - base;
              if (tt < 0 || tt > 2) { k.el.style.opacity = 0; return; }
              const x = 640 + Math.cos(k.a) * k.v * tt;
              const y = 390 + Math.sin(k.a) * k.v * tt + 260 * tt * tt;
              k.el.style.opacity = 1 - tt / 2;
              k.el.style.transform = `translate(${x}px,${y}px) rotate(${tt * 600 + i * 40}deg)`;
            });
          };
        },
      },
      {
        d: 5, fala: 'Ele lê o chat em voz alta e recorta os melhores momentos da live.',
        monta(c, P) {
          const ti = titulo(c, 'Voz no chat. *Clipes* na hora.');
          const v = caixa(c, 110, 200, 500, 380, 'NARRAÇÃO POR VOZ');
          const bolha = h(v, 'div', '', 'position:absolute;left:24px;right:24px;top:80px;padding:18px 20px;border-radius:18px;background:rgba(255,255,255,.06);font-size:24px', '<b style="color:#C9B0FF">GuiFPS</b> &nbsp;bora, Pili! que jogada 🔥');
          const barras = Array.from({ length: 34 }, (_, i) => h(v, 'div', '', `position:absolute;bottom:60px;left:${30 + i * 13.2}px;width:8px;border-radius:4px;background:linear-gradient(${P.c2},${P.c})`));
          h(v, 'div', '', 'position:absolute;left:24px;bottom:22px;font-size:15px;color:#a1a1a6', '🔊 voz neural · funciona sem internet');
          const k = caixa(c, 670, 200, 500, 380, 'EDITOR DE CLIPES');
          const tela = h(k, 'div', '', `position:absolute;left:24px;right:24px;top:72px;height:170px;border-radius:14px;background:linear-gradient(135deg,#2a1745,#0e0a18);overflow:hidden`);
          const mira = h(tela, 'div', '', 'position:absolute;left:50%;top:50%;width:40px;height:40px;margin:-20px;border:2px solid rgba(255,255,255,.7);border-radius:50%');
          const trilha = h(k, 'div', '', 'position:absolute;left:24px;right:24px;top:265px;height:46px;border-radius:10px;background:repeating-linear-gradient(90deg,#241a33 0 38px,#1a1326 38px 76px)');
          const sel = h(trilha, 'div', '', `position:absolute;top:-3px;bottom:-3px;border:3px solid ${P.c2};border-radius:10px;background:${P.c}33`);
          const cab = h(trilha, 'div', '', 'position:absolute;top:-10px;bottom:-10px;width:3px;background:#fff;border-radius:2px');
          const ok = h(k, 'div', '', `position:absolute;left:24px;bottom:20px;font-size:18px;font-weight:600;color:${P.c2}`, '✂️ Clipe salvo · 00:42');
          return (t) => {
            ti(t);
            entra(v, fase(t, .2, .8), -50, 0);
            entra(k, fase(t, .35, .8), 50, 0);
            entra(bolha, fase(t, .8, .6), 0, 20);
            const fala = t > 1.2 && t < 4.6;
            barras.forEach((b, i) => { b.style.height = `${8 + (fala ? ruido(i, t) * 110 : 4)}px`; });
            const x = lim((t - .8) / 3.4);
            cab.style.left = `${x * 100}%`;
            const s0 = .3, s1 = lim(x, s0, .72);
            sel.style.left = `${s0 * 100}%`;
            sel.style.width = `${Math.max(0, s1 - s0) * 100}%`;
            sel.style.opacity = x > s0 ? 1 : 0;
            mira.style.transform = `translate(${Math.sin(t * 2) * 60}px,${Math.cos(t * 1.6) * 30}px)`;
            entra(ok, fase(t, 3.6, .5), 0, 14);
          };
        },
      },
      fim('Pili Alerts. Chame no WhatsApp e garanta o seu.', 'Tudo dentro do OBS.'),
    ],
  };

  /* =========================================================
     PILI STREAM
     ========================================================= */
  function jogo(el, P) {
    el.style.overflow = 'hidden';
    const ceu = h(el, 'div', '', `position:absolute;inset:0;background:linear-gradient(180deg,#0d1b3d 0%,${P.c}55 55%,#ffb38a55 70%,#120d1f 70%)`);
    const sol = h(el, 'div', '', 'position:absolute;left:62%;top:30%;width:18%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,#ffe2b8,#ff8a5c 60%,transparent 70%);filter:blur(1px)');
    const morros = h(el, 'div', '', 'position:absolute;left:0;right:0;top:52%;height:20%;background:radial-gradient(60px 50px at 50% 100%,#1b1430 98%,transparent) 0 0/120px 100% repeat-x;opacity:.9');
    const chao = h(el, 'div', '', 'position:absolute;left:-50%;right:-50%;top:70%;bottom:0;background:repeating-linear-gradient(90deg,#1b1430 0 40px,#231a3d 40px 80px);transform:perspective(200px) rotateX(55deg);transform-origin:top');
    h(el, 'div', '', 'position:absolute;left:50%;top:50%;width:26px;height:26px;margin:-13px;border:2px solid #fff;border-radius:50%;opacity:.85');
    h(el, 'div', '', 'position:absolute;right:6%;bottom:7%;font-size:16px;font-weight:700;color:#fff;opacity:.9', '30 / 90');
    h(el, 'div', '', 'position:absolute;left:5%;top:7%;width:15%;aspect-ratio:1;max-width:64px;border-radius:50%;border:2px solid rgba(255,255,255,.5);background:rgba(0,0,0,.3)');
    return (t) => {
      morros.style.backgroundPositionX = `${-t * 30}px`;
      chao.style.backgroundPositionX = `${-t * 90}px`;
      sol.style.transform = `translateY(${Math.sin(t) * 4}px)`;
      void ceu;
    };
  }
  const STREAM = {
    nome: 'PILI Stream', c: '#3D8BFF', c2: '#9CC4FF', c3: '#CFE2FF', whats: 'Olá! Vi o filme no site e quero comprar o PILI Stream.',
    cenas: [
      abertura('Este é o Pili Stream, o seu estúdio de live.', 'O seu estúdio de live'),
      {
        d: 5, fala: 'Transmita na horizontal e na vertical ao mesmo tempo, numa live só.',
        monta(c, P) {
          const ti = titulo(c, 'Horizontal e vertical. *Juntos.*');
          const H = h(c, 'div', 'f-caixa', 'left:120px;top:190px;width:680px;height:383px;border-radius:18px');
          const V = h(c, 'div', 'f-caixa', 'left:870px;top:160px;width:250px;height:444px;border-radius:26px');
          const jh = jogo(h(H, 'div', '', 'position:absolute;inset:0'), P);
          const jv = jogo(h(V, 'div', '', 'position:absolute;inset:0'), P);
          [H, V].forEach((q) => { h(q, 'div', 'f-ao-vivo', 'left:14px;top:14px', 'AO VIVO'); });
          const vh = h(H, 'div', '', 'position:absolute;left:120px;top:16px;font-size:15px;font-weight:600;background:rgba(0,0,0,.45);padding:4px 10px;border-radius:7px');
          const vv = h(V, 'div', '', 'position:absolute;left:14px;top:50px;font-size:15px;font-weight:600;background:rgba(0,0,0,.45);padding:4px 10px;border-radius:7px');
          const r1 = h(c, 'div', '', 'position:absolute;left:120px;top:590px;font-size:18px;color:#a1a1a6', '16:9 · YouTube, Twitch, Kick');
          const r2 = h(c, 'div', '', 'position:absolute;left:870px;top:618px;font-size:18px;color:#a1a1a6', '9:16 · TikTok, Shorts');
          return (t) => {
            ti(t);
            entra(H, fase(t, .2, .9), -80, 0);
            entra(V, fase(t, .45, .9), 80, 0);
            entra(r1, fase(t, 1.1, .6), 0, 10); entra(r2, fase(t, 1.2, .6), 0, 10);
            jh(t); jv(t);
            vh.textContent = `👁 ${Math.round(820 + t * 180).toLocaleString('pt-BR')}`;
            vv.textContent = `👁 ${Math.round(1400 + t * 260).toLocaleString('pt-BR')}`;
          };
        },
      },
      {
        d: 5, fala: 'Uma live só, enviada para várias plataformas juntas.',
        monta(c, P) {
          const ti = titulo(c, 'Uma live. *Todas* as plataformas.');
          const ns = 'http://www.w3.org/2000/svg';
          const svg = document.createElementNS(ns, 'svg');
          svg.setAttribute('width', '1280'); svg.setAttribute('height', '720');
          svg.style.cssText = 'position:absolute;inset:0';
          c.appendChild(svg);
          const centro = [640, 400];
          const pos = [[230, 270], [230, 530], [1050, 270], [1050, 530]];
          const linhas = pos.map(([x, y], i) => {
            const l = document.createElementNS(ns, 'line');
            l.setAttribute('x1', centro[0]); l.setAttribute('y1', centro[1]); l.setAttribute('x2', x); l.setAttribute('y2', y);
            l.setAttribute('stroke', PLAT[i][1]); l.setAttribute('stroke-width', '3'); l.setAttribute('stroke-linecap', 'round');
            const comp = Math.hypot(x - centro[0], y - centro[1]);
            l.setAttribute('stroke-dasharray', comp); l.dataset.comp = comp;
            svg.appendChild(l);
            return l;
          });
          const pulsos = Array.from({ length: 12 }, (_, i) => h(c, 'div', '', `position:absolute;width:12px;height:12px;margin:-6px;border-radius:50%;background:${PLAT[i % 4][1]};box-shadow:0 0 16px ${PLAT[i % 4][1]}`));
          const nucleo = h(c, 'div', '', `position:absolute;left:540px;top:300px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,${P.c}55,transparent 70%)`);
          const lg = logoEm(c, 570, 330, 140, P, 18);
          const nos = PLAT.map(([n, cor], i) => {
            const [x, y] = pos[i];
            const e = h(c, 'div', 'f-chip', `left:${x - (i < 2 ? 150 : 10)}px;top:${y - 26}px`, `<i style="background:${cor}"></i>${n}`);
            const lv = h(e, 'span', '', 'font-size:12px;font-weight:800;letter-spacing:.08em;background:#ff2d55;padding:3px 7px;border-radius:5px;margin-left:6px;opacity:0', 'AO VIVO');
            return { e, lv };
          });
          return (t) => {
            ti(t);
            const a = fase(t, .2, .8, E.mola);
            lg.box.style.transform = `scale(${lim(a, 0, 1.2)})`;
            lg.gira.style.transform = `rotateY(${t * 40}deg)`;
            brilhoLogo(lg, t);
            nucleo.style.transform = `scale(${1 + Math.sin(t * 4) * .08})`;
            linhas.forEach((l, i) => {
              const p = fase(t, .8 + i * .2, .7);
              l.setAttribute('stroke-dashoffset', (1 - p) * l.dataset.comp);
              const pn = fase(t, .9 + i * .2, .6, E.mola);
              nos[i].e.style.opacity = lim(pn);
              nos[i].e.style.transform = `scale(${.6 + .4 * pn})`;
              nos[i].lv.style.opacity = fase(t, 1.5 + i * .2, .3);
            });
            pulsos.forEach((p, i) => {
              const k = i % 4;
              const ini = 1.6 + k * .2;
              const prog = ((t - ini) * .8 + Math.floor(i / 4) / 3) % 1;
              if (t < ini) { p.style.opacity = 0; return; }
              const [x, y] = pos[k];
              p.style.opacity = 1;
              p.style.left = `${centro[0] + (x - centro[0]) * prog}px`;
              p.style.top = `${centro[1] + (y - centro[1]) * prog}px`;
            });
          };
        },
      },
      {
        d: 5, fala: 'Já vem ligado ao Pili Alerts, com volume por trilha e a qualidade certa para cada plataforma.',
        monta(c, P) {
          const ti = titulo(c, 'Som e imagem *no ponto.*');
          const m = caixa(c, 150, 190, 470, 400, 'VOLUME POR TRILHA');
          const nomes = ['Jogo', 'Microfone', 'Música', 'Alertas'];
          const vu = nomes.map((n, i) => {
            const x = 50 + i * 105;
            h(m, 'div', '', `position:absolute;left:${x}px;top:80px;width:26px;height:230px;border-radius:13px;background:#1b1a22`);
            const b = h(m, 'div', '', `position:absolute;left:${x}px;bottom:${400 - 310}px;width:26px;border-radius:13px;background:linear-gradient(0deg,${P.c},${P.c2} 70%,#ffd166)`);
            h(m, 'div', '', `position:absolute;left:${x - 20}px;top:330px;width:66px;text-align:center;font-size:15px;color:#cfcfd4`, n);
            return b;
          });
          const itens = [
            ['✓ PILI ALERTS conectado', '#25D366'],
            ['TikTok · 1080p · 60 qps', PLAT[0][1]],
            ['YouTube · 1440p · 60 qps', PLAT[1][1]],
            ['Twitch · 1080p · 60 qps', PLAT[2][1]],
          ].map(([txt, cor], i) => h(c, 'div', 'f-chip', `left:700px;top:${205 + i * 92}px;font-size:24px`, `<i style="background:${cor};box-shadow:0 0 12px ${cor}"></i>${txt}`));
          return (t) => {
            ti(t);
            entra(m, fase(t, .2, .8), -50, 0);
            vu.forEach((b, i) => { b.style.height = `${30 + ruido(i * 3, t * .6) * 190 * fase(t, .6, .6)}px`; });
            itens.forEach((it, i) => entra(it, fase(t, .7 + i * .35, .6, E.mola), 60, 0));
          };
        },
      },
      fim('Pili Stream. E ele ainda se atualiza sozinho. Chame no WhatsApp.', 'E ainda se atualiza sozinho.'),
    ],
  };

  /* =========================================================
     PILI BOT
     ========================================================= */
  const BOT = {
    nome: 'PILI BOT', c: '#25D366', c2: '#8BF0B5', c3: '#D2FBE2', whats: 'Olá! Vi o filme no site e quero comprar o PILI BOT.',
    cenas: [
      abertura('Este é o Pili Bot, o robô do seu WhatsApp.', 'O robô do seu WhatsApp'),
      {
        d: 4.6, fala: 'Leia o QR code e pronto: ele já está ligado ao seu WhatsApp.',
        monta(c, P) {
          const ti = titulo(c, 'Leia o QR. *Pronto.*');
          const moldura = h(c, 'div', 'f-caixa', 'left:470px;top:170px;width:340px;height:340px;background:#fff;border-radius:28px');
          const cv = h(moldura, 'canvas', '', 'position:absolute;left:20px;top:20px;width:300px;height:300px');
          cv.width = 300; cv.height = 300;
          const g = cv.getContext('2d');
          const n = 25, s = 12;
          let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
          g.fillStyle = '#0b0b0f';
          for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (rnd() > .52) g.fillRect(x * s, y * s, s, s);
          const olho = (x, y) => { g.fillStyle = '#fff'; g.fillRect(x * s - s, y * s - s, 9 * s, 9 * s); g.fillStyle = '#0b0b0f'; g.fillRect(x * s, y * s, 7 * s, 7 * s); g.fillStyle = '#fff'; g.fillRect(x * s + s, y * s + s, 5 * s, 5 * s); g.fillStyle = '#0b0b0f'; g.fillRect(x * s + 2 * s, y * s + 2 * s, 3 * s, 3 * s); };
          olho(0, 0); olho(18, 0); olho(0, 18);
          const scan = h(moldura, 'div', '', `position:absolute;left:10px;right:10px;height:4px;border-radius:2px;background:${P.c};box-shadow:0 0 20px 4px ${P.c}`);
          const ok = h(c, 'div', '', `position:absolute;left:560px;top:260px;width:160px;height:160px;border-radius:50%;background:${P.c};display:grid;place-items:center;font-size:90px;color:#04120a;font-weight:800;box-shadow:0 0 80px ${P.c}`, '✓');
          const tx = h(c, 'div', 'f-grande', `top:545px;font-size:34px;color:${P.c2}`, 'Conectado ao WhatsApp');
          return (t) => {
            ti(t);
            entra(moldura, fase(t, .2, .8, E.mola), 0, 0, .7);
            cv.style.clipPath = `inset(0 0 ${(1 - fase(t, .4, 1.1, E.suave)) * 100}% 0)`;
            const sc = lim((t - 1.2) / 1.4);
            scan.style.top = `${10 + Math.abs(Math.sin(sc * Math.PI * 1.5)) * 316}px`;
            scan.style.opacity = sc > 0 && sc < 1 ? 1 : 0;
            const o = fase(t, 2.7, .6, E.mola);
            ok.style.opacity = lim(o);
            ok.style.transform = `scale(${o})`;
            borra(moldura, fase(t, 2.7, .5) * 4);
            entra(tx, fase(t, 3, .6), 0, 20);
          };
        },
      },
      {
        d: 5.4, fala: 'Ele responde os seus clientes na hora, de dia e de madrugada.',
        monta(c, P) {
          const ti = titulo(c, 'Resposta *na hora.*');
          const cel = h(c, 'div', 'f-caixa', 'left:430px;top:150px;width:420px;height:470px;border-radius:40px;background:#0b141a;border:6px solid #23232b');
          h(cel, 'div', '', 'height:64px;background:#1f2c34;display:flex;align-items:center;gap:12px;padding:0 20px;font-size:18px;font-weight:600', `<span style="width:36px;height:36px;border-radius:50%;background:${P.c};display:inline-block"></span>Sua loja <span style="font-size:13px;color:#8BF0B5;font-weight:500;margin-left:auto">● online</span>`);
          const corpo = h(cel, 'div', '', 'position:absolute;left:0;right:0;top:64px;bottom:0;background:radial-gradient(circle at 30% 20%,#13232b,#0b141a)');
          const falas = [
            [.4, 'c', 'Oi! Vocês fazem entrega? 🙂'],
            [1.6, 'b', 'Olá! 👋 Sou o atendente da loja.<br>1 · Ver produtos<br>2 · Fazer pedido<br>3 · Falar com alguém'],
            [2.8, 'c', '2'],
            [3.6, 'b', 'Perfeito! Me diga o seu nome e o que deseja 😊'],
          ];
          const bolhas = falas.map(([, q, txt]) => h(corpo, 'div', '', `position:absolute;${q === 'c' ? 'left:16px;background:#202c33' : 'right:16px;background:#005c4b'};max-width:300px;padding:10px 14px;border-radius:14px;font-size:17px;line-height:1.35;opacity:0`, txt));
          const digitando = h(corpo, 'div', '', 'position:absolute;right:16px;padding:12px 16px;border-radius:14px;background:#005c4b;font-size:20px;letter-spacing:3px;opacity:0', '•••');
          const selo = h(c, 'div', 'f-chip', `left:880px;top:300px;font-size:24px`, `<i style="background:${P.c};box-shadow:0 0 12px ${P.c}"></i>Respondeu em 1 s`);
          const selo2 = h(c, 'div', 'f-chip', `left:140px;top:420px;font-size:24px`, '🌙 03:12 da manhã');
          return (t) => {
            ti(t);
            entra(cel, fase(t, .1, .8), 0, 60);
            let y = 16;
            const alturas = bolhas.map((b) => b.offsetHeight);
            falas.forEach(([ini], i) => {
              const p = fase(t, ini, .45, E.mola);
              if (t >= ini) {
                bolhas[i].style.top = `${y}px`;
                bolhas[i].style.opacity = lim(p);
                bolhas[i].style.transform = `scale(${.85 + .15 * p})`;
                bolhas[i].style.transformOrigin = falas[i][1] === 'c' ? 'left bottom' : 'right bottom';
                y += alturas[i] + 10;
              } else bolhas[i].style.opacity = 0;
            });
            const dig = (t > 1.05 && t < 1.6) || (t > 3.1 && t < 3.6);
            digitando.style.opacity = dig ? 1 : 0;
            digitando.style.top = `${y}px`;
            entra(selo, fase(t, 1.8, .6, E.mola), 40, 0);
            entra(selo2, fase(t, 2.4, .6, E.mola), -40, 0);
          };
        },
      },
      {
        d: 5, fala: 'Você monta as conversas em blocos, sem programar nada, e recebe cada pedido organizado.',
        monta(c, P) {
          const ti = titulo(c, 'Monte em *blocos.* Receba *pedidos.*');
          const nomes = [['Início', '👋'], ['Menu', '📋'], ['Pedido', '🛒'], ['Fim', '✅']];
          const ns = 'http://www.w3.org/2000/svg';
          const svg = document.createElementNS(ns, 'svg');
          svg.setAttribute('width', '1280'); svg.setAttribute('height', '720');
          svg.style.cssText = 'position:absolute;inset:0';
          c.appendChild(svg);
          const fios = [0, 1, 2].map((i) => {
            const p = document.createElementNS(ns, 'path');
            const x0 = 140 + i * 270 + 200, x1 = 140 + (i + 1) * 270;
            p.setAttribute('d', `M${x0} 290 C ${x0 + 40} 290, ${x1 - 40} 290, ${x1} 290`);
            p.setAttribute('stroke', P.c); p.setAttribute('stroke-width', '3'); p.setAttribute('fill', 'none');
            p.setAttribute('stroke-dasharray', '80'); svg.appendChild(p);
            return p;
          });
          const blocos = nomes.map(([n, ic], i) => h(c, 'div', 'f-caixa', `left:${140 + i * 270}px;top:235px;width:200px;height:110px;display:flex;align-items:center;gap:14px;padding:0 20px;font-size:26px;font-weight:700;border-color:${P.c}55`, `<span style="font-size:34px">${ic}</span>${n}`));
          const pedidos = [['Maria', '2 itens · entrega'], ['João', '1 item · retirada'], ['Bia', '3 itens · entrega']].map(([n, d], i) =>
            h(c, 'div', 'f-caixa', `left:${190 + i * 310}px;top:420px;width:280px;height:120px;padding:18px 20px`, `<div style="font-size:14px;font-weight:700;letter-spacing:.14em;color:${P.c2}">NOVO PEDIDO</div><div style="font-size:28px;font-weight:700;margin-top:4px">${n}</div><div style="font-size:16px;color:#a1a1a6">${d}</div>`));
          return (t) => {
            ti(t);
            blocos.forEach((b, i) => {
              const p = fase(t, .3 + i * .35, .6, E.mola);
              b.style.opacity = lim(p);
              b.style.transform = i === 2 ? `translateY(${(1 - p) * 140}px) rotate(${(1 - p) * -6}deg)` : `scale(${.7 + .3 * p})`;
            });
            fios.forEach((f, i) => f.setAttribute('stroke-dashoffset', (1 - fase(t, .7 + i * .35, .5)) * 80));
            pedidos.forEach((p, i) => entra(p, fase(t, 2.4 + i * .3, .6, E.mola), 0, 50));
          };
        },
      },
      fim('Pili Bot. Seu WhatsApp vendendo sozinho. Chame a gente.', 'Seu WhatsApp vendendo sozinho.'),
    ],
  };

  /* =========================================================
     PILI UPGRADE SOUND
     ========================================================= */
  const UPGRADE = {
    nome: 'PILI UPGRADE SOUND', c: '#FF3B5C', c2: '#FF9FB0', c3: '#FFD2DA', whats: 'Olá! Vi o filme no site e quero receber o PILI UPGRADE SOUND.',
    cenas: [
      abertura('Este é o Pili Upgrade Sound, feito para o Call of Duty.', 'Som de vantagem para o Call of Duty'),
      {
        d: 5, fala: 'Escolha o seu fone entre milhares de medições e o som fica ajustado para ele.',
        monta(c, P) {
          const ti = titulo(c, 'O som certo *para o seu fone.*');
          const l = caixa(c, 110, 190, 470, 400, '');
          const cont = h(l, 'div', '', 'position:absolute;left:24px;top:18px;font-size:16px;font-weight:600;color:#a1a1a6;letter-spacing:.04em');
          const janela = h(l, 'div', '', 'position:absolute;left:0;right:0;top:60px;bottom:0;overflow:hidden;mask-image:linear-gradient(transparent,#000 25%,#000 75%,transparent)');
          const fones = ['HyperX Cloud II', 'Razer BlackShark V2', 'SteelSeries Arctis Nova 7', 'Astro A50', 'Corsair HS80', 'JBL Quantum 910', 'Sony INZONE H9', 'Sennheiser HD 560S', 'Audio-Technica ATH-M50x', 'Beyerdynamic DT 990', 'Logitech G PRO X', 'HyperX Cloud III', 'Razer Kraken V3', 'Turtle Beach Stealth 700'];
          const lista = h(janela, 'div', '', 'position:absolute;left:0;right:0;top:0');
          const lin = [];
          for (let r = 0; r < 4; r++) fones.forEach((f) => lin.push(h(lista, 'div', '', 'height:54px;display:flex;align-items:center;padding:0 24px;font-size:22px;color:#cfcfd4', f)));
          const alvoIdx = 14 * 3 + 10; // Logitech G PRO X
          const g = caixa(c, 640, 190, 530, 400, 'CURVA DO SEU FONE');
          const ns = 'http://www.w3.org/2000/svg';
          const svg = document.createElementNS(ns, 'svg');
          svg.setAttribute('viewBox', '0 0 530 330'); svg.style.cssText = 'position:absolute;left:0;top:62px;width:530px;height:330px';
          g.appendChild(svg);
          for (let i = 1; i < 6; i++) { const gl = document.createElementNS(ns, 'line'); gl.setAttribute('x1', 0); gl.setAttribute('x2', 530); gl.setAttribute('y1', i * 55); gl.setAttribute('y2', i * 55); gl.setAttribute('stroke', 'rgba(255,255,255,.06)'); svg.appendChild(gl); }
          const curva = document.createElementNS(ns, 'path');
          curva.setAttribute('fill', 'none'); curva.setAttribute('stroke', P.c); curva.setAttribute('stroke-width', '4'); curva.setAttribute('stroke-linecap', 'round');
          if (!leve) curva.style.filter = `drop-shadow(0 0 8px ${P.c})`;
          svg.appendChild(curva);
          const area = document.createElementNS(ns, 'path');
          area.setAttribute('fill', `${P.c}22`); svg.insertBefore(area, curva);
          const alvoCurva = (x) => Math.sin(x * 9) * 26 + Math.sin(x * 23 + 1) * 12 - (x > .7 ? (x - .7) * 120 : 0) + (x < .15 ? (0.15 - x) * 160 : 0);
          return (t) => {
            ti(t);
            entra(l, fase(t, .2, .8), -50, 0);
            entra(g, fase(t, .35, .8), 50, 0);
            const n = Math.round(6837 * fase(t, .4, 1.8, E.suave));
            cont.textContent = `${n.toLocaleString('pt-BR')} MEDIÇÕES DE FONES`;
            const rol = fase(t, .4, 2.2, E.sai);
            const y = rol * (alvoIdx * 54 - 120);
            lista.style.transform = `translateY(${-y}px)`;
            const pronto = t > 2.6;
            lin.forEach((e, i) => {
              const sel = pronto && i === alvoIdx;
              e.style.color = sel ? '#fff' : '#8e8e93';
              e.style.fontWeight = sel ? '700' : '400';
              e.style.background = sel ? `${P.c}33` : 'transparent';
            });
            const m = fase(t, 2.7, 1.2, E.suave);
            let d = '', a = 'M0 330';
            for (let i = 0; i <= 60; i++) {
              const x = i / 60;
              const yv = 165 - alvoCurva(x) * m + Math.sin(x * 40 + t * 6) * 2 * (1 - m);
              d += `${i ? 'L' : 'M'}${(x * 530).toFixed(1)} ${yv.toFixed(1)}`;
              a += ` L${(x * 530).toFixed(1)} ${yv.toFixed(1)}`;
            }
            curva.setAttribute('d', d);
            area.setAttribute('d', `${a} L530 330 Z`);
          };
        },
      },
      {
        d: 5, fala: 'Com o som sete ponto um virtual, você sabe de onde vem cada passo.', leg: 'Com o som 7.1 virtual, você sabe de onde vem cada passo.',
        monta(c, P) {
          const ti = titulo(c, 'Saiba *de onde* vem cada passo.');
          const cx = 640, cy = 405, r = 215;
          const base = h(c, 'div', '', `position:absolute;left:${cx - r}px;top:${cy - r}px;width:${r * 2}px;height:${r * 2}px;border-radius:50%;border:1px solid ${P.c}66;background:radial-gradient(circle,${P.c}14 0 30%,transparent 31% 50%,${P.c}10 51% 52%,transparent 53%)`);
          [0.33, 0.66].forEach((k) => h(c, 'div', '', `position:absolute;left:${cx - r * k}px;top:${cy - r * k}px;width:${r * 2 * k}px;height:${r * 2 * k}px;border-radius:50%;border:1px solid rgba(255,255,255,.08)`));
          const varre = h(c, 'div', '', `position:absolute;left:${cx - r}px;top:${cy - r}px;width:${r * 2}px;height:${r * 2}px;border-radius:50%;background:conic-gradient(from 0deg,${P.c}66,transparent 25%)`);
          const can = [['FE', -30], ['FD', 30], ['C', 0], ['LE', -90], ['LD', 90], ['TE', -150], ['TD', 150]];
          const dots = can.map(([n, a]) => {
            const rad = (a - 90) * Math.PI / 180;
            return h(c, 'div', '', `position:absolute;left:${cx + Math.cos(rad) * (r + 34) - 22}px;top:${cy + Math.sin(rad) * (r + 34) - 22}px;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;font-size:14px;font-weight:700;background:#15131b;border:1px solid rgba(255,255,255,.15)`, n);
          });
          h(c, 'div', '', `position:absolute;left:${cx - 18}px;top:${cy - 18}px;width:36px;height:36px;border-radius:50%;background:#fff;box-shadow:0 0 30px #fff8;display:grid;place-items:center;font-size:18px`, '🎧');
          const ang = (-140 - 90) * Math.PI / 180;
          const ex = cx + Math.cos(ang) * r * .72, ey = cy + Math.sin(ang) * r * .72;
          const inimigo = h(c, 'div', '', `position:absolute;left:${ex - 14}px;top:${ey - 14}px;width:28px;height:28px;border-radius:50%;background:${P.c};box-shadow:0 0 30px ${P.c}`);
          const onda = h(c, 'div', '', `position:absolute;border-radius:50%;border:2px solid ${P.c}`);
          const rot = h(c, 'div', 'f-chip', `left:60px;top:560px;font-size:22px;border-color:${P.c}66`, '👣 Passos · atrás à esquerda');
          const sete = h(c, 'div', 'f-chip', 'left:960px;top:250px;font-size:22px', '7.1 virtual');
          return (t) => {
            ti(t);
            entra(base, fase(t, .1, .8), 0, 0, .8);
            varre.style.transform = `rotate(${t * 140}deg)`;
            varre.style.opacity = fase(t, .3, .6);
            dots.forEach((d, i) => { const p = fase(t, .4 + i * .08, .5, E.mola); d.style.opacity = lim(p); d.style.transform = `scale(${p})`; });
            const vis = fase(t, 1.6, .4);
            inimigo.style.opacity = vis * (.6 + .4 * Math.sin(t * 9));
            const tt = ((t - 1.6) % .8) / .8;
            const s = tt * 120;
            Object.assign(onda.style, { left: `${ex - s / 2}px`, top: `${ey - s / 2}px`, width: `${s}px`, height: `${s}px`, opacity: t > 1.6 ? 1 - tt : 0 });
            const brilha = t > 1.6 ? (Math.sin(t * 9) * .5 + .5) : 0;
            dots[5].style.background = `rgba(255,59,92,${.15 + brilha * .7})`;
            dots[3].style.background = `rgba(255,59,92,${.1 + brilha * .3})`;
            entra(rot, fase(t, 2, .6, E.mola), -40, 0);
            entra(sete, fase(t, 2.3, .6, E.mola), 40, 0);
          };
        },
      },
      {
        d: 5.2, fala: 'E o controle de tiro abaixa a sua arma para você escutar o inimigo.',
        monta(c, P) {
          const ti = titulo(c, 'A arma *abaixa.* O inimigo *aparece.*');
          const painel = caixa(c, 140, 180, 1000, 420, '');
          const chave = h(painel, 'div', '', 'position:absolute;left:30px;top:22px;display:flex;align-items:center;gap:14px;font-size:20px;font-weight:600');
          const trilho = h(chave, 'div', '', 'width:64px;height:36px;border-radius:18px;background:#3a3a44;position:relative;transition:background .3s');
          const bola = h(trilho, 'div', '', 'position:absolute;left:3px;top:3px;width:30px;height:30px;border-radius:50%;background:#fff;transition:left .3s');
          h(chave, 'span', '', '', 'Controle de tiro');
          const db = h(painel, 'div', '', `position:absolute;right:30px;top:24px;font-size:26px;font-weight:700;color:${P.c2}`);
          const fila = (y, rot, cor) => {
            h(painel, 'div', '', `position:absolute;left:30px;top:${y - 4}px;font-size:16px;color:#a1a1a6;width:150px`, rot);
            return Array.from({ length: 64 }, (_, i) => h(painel, 'div', '', `position:absolute;left:${190 + i * 12.4}px;width:7px;border-radius:4px;background:${cor}`));
          };
          const arma = fila(170, '🔫 Sua arma', P.c);
          const passos = fila(330, '👣 Inimigo', '#ffffff');
          return (t) => {
            ti(t);
            entra(painel, fase(t, .1, .8), 0, 50);
            const liga = t > 1.4;
            trilho.style.background = liga ? P.c : '#3a3a44';
            bola.style.left = liga ? '31px' : '3px';
            const k = 1 - fase(t, 1.5, .9, E.suave) * .82;
            db.textContent = `arma ${Math.round(-10 - (1 - k) / .82 * 45)} dB`;
            arma.forEach((b, i) => {
              const tiro = Math.max(0, Math.sin(t * 9 + i * .3)) ** 2;
              const a = (20 + tiro * 110 + ruido(i, t) * 20) * k;
              b.style.height = `${a}px`; b.style.top = `${170 - a / 2 + 6}px`;
            });
            passos.forEach((b, i) => {
              const pa = Math.max(0, Math.sin(t * 5 + i * .15)) ** 6;
              const a = 6 + pa * 46 + ruido(i + 9, t) * 6;
              b.style.height = `${a}px`; b.style.top = `${330 - a / 2 + 6}px`;
              b.style.opacity = .5 + .5 * (1 - k);
            });
          };
        },
      },
      fim('Pili Upgrade Sound. E é grátis. Peça o seu pelo WhatsApp.', 'Ouça antes. Atire primeiro.', 'Quero o meu — grátis', 'GRÁTIS'),
    ],
  };

  /* =========================================================
     PILI AUDIO
     ========================================================= */
  function pc(el, x, y, nome, P) {
    const g = h(el, 'div', '', `position:absolute;left:${x}px;top:${y}px;width:260px;height:230px`);
    h(g, 'div', '', `position:absolute;left:0;top:0;width:260px;height:160px;border-radius:14px;border:5px solid #2b2a33;background:linear-gradient(135deg,${P.c}33,#0d0c12)`);
    h(g, 'div', '', 'position:absolute;left:115px;top:160px;width:30px;height:30px;background:#2b2a33');
    h(g, 'div', '', 'position:absolute;left:70px;top:188px;width:120px;height:10px;border-radius:5px;background:#2b2a33');
    h(g, 'div', '', 'position:absolute;left:0;right:0;top:206px;text-align:center;font-size:20px;font-weight:600', nome);
    return g;
  }
  const AUDIO = {
    nome: 'PILI AUDIO', c: '#FFB020', c2: '#FFD480', c3: '#FFEBC2', whats: 'Olá! Vi o filme no site e quero comprar o PILI AUDIO.',
    cenas: [
      abertura('Este é o Pili Audio, uma mesa de som em rede.', 'Mesa de som em rede entre dois PCs'),
      {
        d: 4.8, fala: 'Ele acha sozinho os dois computadores da sua casa.',
        monta(c, P) {
          const ti = titulo(c, 'Ele acha *os dois PCs* sozinho.');
          const a = pc(c, 170, 230, 'PC do jogo', P);
          const b = pc(c, 850, 230, 'PC da live', P);
          const ondas = [0, 1, 2, 3, 4, 5].map((i) => h(c, 'div', '', `position:absolute;border-radius:50%;border:2px solid ${P.c};opacity:0`));
          const fio = h(c, 'div', '', `position:absolute;left:440px;top:308px;height:4px;border-radius:2px;background:repeating-linear-gradient(90deg,${P.c} 0 16px,transparent 16px 28px);width:0`);
          const ok = h(c, 'div', 'f-chip', `left:540px;top:350px;font-size:22px;border-color:${P.c}66`, `<i style="background:#25D366"></i>Encontrado`);
          return (t) => {
            ti(t);
            entra(a, fase(t, .2, .8), -60, 0);
            entra(b, fase(t, .35, .8), 60, 0);
            ondas.forEach((o, i) => {
              const cx = i % 2 ? 980 : 300, cy = 310;
              const tt = ((t - .8 - Math.floor(i / 2) * .4) % 1.2) / 1.2;
              const s = tt * 380;
              o.style.left = `${cx - s / 2}px`; o.style.top = `${cy - s / 2}px`; o.style.width = o.style.height = `${s}px`;
              o.style.opacity = t > .8 && t < 2.2 ? (1 - tt) * .7 : 0;
            });
            fio.style.width = `${fase(t, 2, .7) * 400}px`;
            fio.style.backgroundPositionX = `${t * 40}px`;
            const p = fase(t, 2.6, .6, E.mola);
            ok.style.opacity = lim(p); ok.style.transform = `scale(${p})`;
          };
        },
      },
      {
        d: 5, fala: 'São até dez faixas de som, separadas por programa.',
        monta(c, P) {
          const ti = titulo(c, '*10 faixas* separadas por programa.');
          const m = caixa(c, 110, 170, 1060, 440, '');
          const nomes = ['Jogo', 'Discord', 'Música', 'Navegador', 'Microfone', 'Alertas', 'Vídeo', 'Sistema', 'Faixa 9', 'Faixa 10'];
          const canais = nomes.map((n, i) => {
            const x = 40 + i * 100;
            h(m, 'div', '', `position:absolute;left:${x + 34}px;top:40px;width:6px;height:300px;border-radius:3px;background:#24232c`);
            const vu = h(m, 'div', '', `position:absolute;left:${x + 52}px;bottom:${440 - 340}px;width:8px;border-radius:4px;background:linear-gradient(0deg,${P.c},#ffe9a8)`);
            const bt = h(m, 'div', '', `position:absolute;left:${x + 17}px;width:40px;height:22px;border-radius:6px;background:linear-gradient(#f4f4f7,#9c9ca6);box-shadow:0 4px 10px rgba(0,0,0,.5)`);
            h(m, 'div', '', `position:absolute;left:${x - 8}px;top:360px;width:90px;text-align:center;font-size:15px;color:#cfcfd4`, n);
            h(m, 'div', '', `position:absolute;left:${x + 24}px;top:392px;width:26px;height:6px;border-radius:3px;background:hsl(${30 + i * 32} 90% 60%)`);
            return { vu, bt, x };
          });
          return (t) => {
            ti(t);
            entra(m, fase(t, .1, .8), 0, 50);
            canais.forEach((k, i) => {
              const p = fase(t, .4 + i * .07, .6, E.mola);
              const pos = .3 + .35 * Math.sin(t * .9 + i * .8) + .15;
              k.bt.style.top = `${40 + (1 - pos) * 278 + (1 - p) * 60}px`;
              k.bt.style.opacity = lim(p);
              k.vu.style.height = `${(20 + ruido(i * 2, t * .7) * 260) * pos * p}px`;
            });
          };
        },
      },
      {
        d: 5, fala: 'Cada faixa chega no outro computador e vira uma fonte de som no OBS.',
        monta(c, P) {
          const ti = titulo(c, 'Cada faixa vira *uma fonte no OBS.*');
          const a = pc(c, 110, 250, 'PC do jogo', P);
          const obs = caixa(c, 760, 180, 400, 420, 'FONTES · OBS');
          const fontes = ['Jogo', 'Discord', 'Música', 'Microfone', 'Alertas', 'Navegador'];
          const itens = fontes.map((f, i) => h(obs, 'div', '', `position:absolute;left:18px;right:18px;top:${70 + i * 56}px;height:46px;border-radius:12px;background:rgba(255,255,255,.05);display:flex;align-items:center;gap:12px;padding:0 14px;font-size:19px`, `<i style="width:10px;height:10px;border-radius:50%;background:hsl(${30 + i * 32} 90% 60%)"></i>PILI · ${f}<span style="margin-left:auto;width:70px;height:6px;border-radius:3px;background:#24232c;overflow:hidden"><span class="m" style="display:block;height:100%;background:${P.c}"></span></span>`));
          const medidores = itens.map((it) => it.querySelector('.m'));
          const bolas = Array.from({ length: 18 }, (_, i) => h(c, 'div', '', `position:absolute;width:12px;height:12px;margin:-6px;border-radius:50%;background:hsl(${30 + (i % 6) * 32} 90% 60%);box-shadow:0 0 14px hsl(${30 + (i % 6) * 32} 90% 60%)`));
          return (t) => {
            ti(t);
            entra(a, fase(t, .1, .8), -50, 0);
            entra(obs, fase(t, .25, .8), 50, 0);
            itens.forEach((it, i) => entra(it, fase(t, 1 + i * .3, .5, E.mola), 30, 0));
            medidores.forEach((m, i) => { m.style.width = `${t > 1 + i * .3 ? ruido(i, t) * 100 : 0}%`; });
            bolas.forEach((b, i) => {
              const p = ((t * .7 + i / 18) % 1);
              const x0 = 380, x1 = 760, y = 330 + Math.sin(p * Math.PI * 2 + i) * 22;
              b.style.left = `${x0 + (x1 - x0) * p}px`; b.style.top = `${y}px`;
              b.style.opacity = t > .8 ? Math.sin(p * Math.PI) : 0;
            });
          };
        },
      },
      fim('Pili Audio. Som profissional em dois computadores. Chame no WhatsApp.', 'Som profissional em dois PCs.'),
    ],
  };

  const FILMES = { alerts: ALERTS, stream: STREAM, bot: BOT, upgrade: UPGRADE, audio: AUDIO };

  /* ---------- voz ---------- */
  const temVoz = false; // voz desligada a pedido: os filmes ficam só com animação e legenda
  let vozLigada = temVoz, falando = false, voz = null;
  function escolheVoz() {
    if (!temVoz) return;
    const vs = speechSynthesis.getVoices().filter((v) => /pt[-_]BR/i.test(v.lang));
    voz = vs.find((v) => /Natural|Online/i.test(v.name)) || vs.find((v) => /Google/i.test(v.name)) || vs[0] || null;
  }
  if (temVoz) { escolheVoz(); speechSynthesis.onvoiceschanged = escolheVoz; }
  function fala(txt) {
    if (!vozLigada || !temVoz) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = 'pt-BR'; if (voz) u.voice = voz;
    u.rate = 1.07;
    falando = true;
    u.onend = u.onerror = () => { falando = false; };
    speechSynthesis.speak(u);
  }
  const calar = () => { if (temVoz) speechSynthesis.cancel(); falando = false; };
  function pintaVoz() { btVoz.innerHTML = vozLigada ? '🔊 <span>Voz ligada</span>' : '🔇 <span>Voz desligada</span>'; }
  if (!temVoz) btVoz.style.display = 'none';
  pintaVoz();

  /* ---------- tocador ---------- */
  let filme = null, tempo = 0, tocando = false, idx = -1, atual = null, segurou = 0, antes = 0, grade = null;
  const icone = () => {
    btTocar.innerHTML = tocando
      ? '<svg viewBox="0 0 16 16"><rect x="3" y="2" width="3.5" height="12" rx="1" fill="#fff"/><rect x="9.5" y="2" width="3.5" height="12" rx="1" fill="#fff"/></svg>'
      : '<svg viewBox="0 0 16 16"><path d="M4 2l10 6-10 6z" fill="#fff"/></svg>';
  };
  const total = () => filme.cenas.reduce((s, c) => s + c.d, 0);
  function cenaEm(t) {
    let a = 0;
    for (let i = 0; i < filme.cenas.length; i++) {
      if (t < a + filme.cenas[i].d || i === filme.cenas.length - 1) return [i, a];
      a += filme.cenas[i].d;
    }
  }
  function escala() { palco.style.transform = `scale(${quadro.clientWidth / 1280})`; }
  addEventListener('resize', () => { if (filme) escala(); });

  function abrir(id) {
    filme = FILMES[id];
    if (!filme) return;
    cinema.style.setProperty('--c', filme.c);
    cinema.style.setProperty('--c2', filme.c2);
    palco.style.setProperty('--c', filme.c);
    palco.style.setProperty('--c2', filme.c2);
    palco.innerHTML = '';
    h(palco, 'div', 'fundo-filme');
    grade = h(palco, 'div', 'grade-filme');
    btComprar.href = linkWhats(filme.whats);
    btComprar.target = '_blank'; btComprar.rel = 'noopener';
    cinema.classList.add('aberto');
    document.body.classList.add('em-filme'); // pausa o fundo e os logos da página
    cinema.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    escala();
    tempo = 0; idx = -1; atual = null; tocando = true; icone();
  }
  function fechar() {
    tocando = false; calar();
    cinema.classList.remove('aberto');
    document.body.classList.remove('em-filme');
    cinema.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => { if (!cinema.classList.contains('aberto')) { palco.innerHTML = ''; filme = null; } }, 650);
  }
  function mostra() {
    const [i, ini] = cenaEm(tempo);
    const cena = filme.cenas[i];
    if (i !== idx) {
      if (atual) atual.el.remove();
      const el = h(palco, 'div', 'cena');
      atual = { el, up: cena.monta(el, filme) };
      idx = i; segurou = 0;
      legenda.textContent = cena.leg || cena.fala;
      if (tocando && tempo - ini < .4) fala(cena.fala);
    }
    const tl = tempo - ini;
    let op = Math.min(1, tl / .35);
    if (i < filme.cenas.length - 1) op = Math.min(op, (cena.d - tl) / .3);
    atual.el.style.opacity = lim(op);
    atual.up(tl, lim(tl / cena.d));
    const pr = tempo / total();
    barraTempo.style.width = `${pr * 100}%`;
    bolinha.style.left = `${pr * 100}%`;
    if (grade && !leve) grade.style.setProperty('--gy', `${(tempo * 36) % 64}px`);
  }
  function quadroLoop(agora) {
    const dt = Math.min(.25, (agora - antes) / 1000 || 0);
    antes = agora;
    if (filme && tocando) {
      tempo += dt;
      const [i, ini] = cenaEm(tempo);
      const fimCena = ini + filme.cenas[i].d;
      // espera a voz terminar a frase antes de trocar de cena (no máximo 3 s)
      if (vozLigada && falando && tempo > fimCena - .05 && segurou < 3) { tempo = fimCena - .05; segurou += dt; }
      if (tempo >= total()) { tempo = total(); tocando = false; icone(); }
    }
    if (filme && cinema.classList.contains('aberto')) mostra();
    requestAnimationFrame(quadroLoop);
  }
  requestAnimationFrame(quadroLoop);

  /* ---------- botões ---------- */
  document.addEventListener('click', (e) => {
    const alvo = e.target.closest('[data-filme]');
    if (alvo) { e.preventDefault(); abrir(alvo.dataset.filme); }
  });
  $('#fechar').addEventListener('click', fechar);
  cinema.addEventListener('click', (e) => { if (e.target === cinema) fechar(); });
  btTocar.addEventListener('click', () => {
    if (!filme) return;
    if (!tocando && tempo >= total()) { tempo = 0; idx = -1; }
    tocando = !tocando; icone();
    if (temVoz) { if (tocando) speechSynthesis.resume(); else speechSynthesis.pause(); }
  });
  btDeNovo.addEventListener('click', () => { calar(); tempo = 0; idx = -1; tocando = true; icone(); });
  btVoz.addEventListener('click', () => { vozLigada = !vozLigada; if (!vozLigada) calar(); pintaVoz(); });
  linha.addEventListener('click', (e) => {
    if (!filme) return;
    const r = linha.getBoundingClientRect();
    calar();
    tempo = lim((e.clientX - r.left) / r.width) * total();
    idx = -1;
  });
  addEventListener('keydown', (e) => {
    if (!cinema.classList.contains('aberto')) return;
    if (e.key === 'Escape') fechar();
    if (e.key === ' ') { e.preventDefault(); btTocar.click(); }
  });

  window.PILI.abrirFilme = abrir;
  window.PILI.irPara = (s, pausar) => { calar(); tempo = s; idx = -1; if (pausar) { tocando = false; icone(); } };
})();
