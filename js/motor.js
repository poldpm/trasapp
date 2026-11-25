/* Art del traç — motor de fitxes
   Converteix una fitxa (llista de blocs) en fulls A4 a mida real (mm).
   - Cal·ligrafia: pauta Montessori de l'escola + les lletres pròpies de l'escola
     (js/lletres-dades.js, generat de dades/lletres.json). No s'hi fa servir cap tipografia.
   - Grafomotricitat: traços generats matemàticament, amb model i punts per resseguir.
   - Paginació: les files no es parteixen mai entre fulls i «Omple el full» aprofita
     tot l'espai lliure (directriu d'estalvi de paper). */
window.AT = window.AT || {};

(function () {
  const { h, s } = AT;
  const FONT = '"Playwrite ES"'; // només per a la marca de l'app, mai a les fitxes
  const NEGRE = '#111111';
  const PUNTS = '#333333';

  /* ---------- Tipografies ---------- */
  const metr = { x: 0.5, carregada: false };
  const ctx = document.createElement('canvas').getContext('2d');

  AT.lletra = {
    async carrega() {
      try {
        await Promise.all([
          document.fonts.load(`300 100px ${FONT}`, 'Art del traç'),
          document.fonts.load(`100 100px ${FONT}`, 'Art del traç'),
          document.fonts.load('700 16px Nunito'),
          document.fonts.load('300 16px Nunito', 'ABC123'),
          document.fonts.load('400 16px Nunito'),
          document.fonts.load('500 16px Poppins', '0123456789')
        ]);
      } catch (e) { /* sense xarxa: es fa servir la mètrica aproximada */ }
      if (AT.paraulaMetrica) AT.paraulaMetrica();
      ctx.font = `300 100px ${FONT}`;
      const m = ctx.measureText('x');
      if (document.fonts.check(`300 100px ${FONT}`) && m.actualBoundingBoxAscent > 10) {
        metr.x = m.actualBoundingBoxAscent / 100;
        metr.carregada = true;
      }
      return metr.carregada;
    },
    carregada: () => metr.carregada,
    midaPerFranja: b => b / metr.x,
    amplada(text, mida, pes = 300) {
      ctx.font = `${pes} 100px ${FONT}`;
      return ctx.measureText(text).width / 100 * mida;
    }
  };

  /* ---------- Mides segons curs ---------- */
  AT.motor = {};
  const mida = (curs, area, nom) => {
    const c = AT.config.cursos[curs] || AT.config.cursos.primer;
    return c.mides[area][nom] || c.mides[area].gran;
  };
  AT.motor.mida = mida;

  /* ---------- Lletres de l'escola ---------- */
  const L = AT.LLETRES;
  const COL = L.colors; // model, repas, verd, vermell, taronja, fletxa
  const RADI_PUNT = L.unitats.radi_punts_inici_final * 100;

  /* Clau de dades d'una lletra (la q segons la configuració) */
  AT.motor.clauLletra = function (lletra) {
    if (lletra === 'q') return (AT.store.config().versioQ === 'q_cua') ? 'q_cua' : 'q';
    return L.lletres[lletra] ? lletra : 'a';
  };
  AT.motor.lletresDisponibles = 'a b c ç d e f g h i j k l m n o p q r s t u v w x y z'.split(' ');

  /* Dibuixa una columna (una lletra en un dels seus estats) en coordenades SVG de les dades:
     X = x·100, Y = (2−y)·100 (línia de dalt Y=0, base Y=200, baix Y=300). */
  function columna(dl, estat, ambFletxes) {
    const g = s('g');
    const taronja = () => dl.linies_taronja.forEach(t => g.append(s('line', {
      x1: t.x * 100, x2: t.x * 100, y1: (2 - t.y_dalt) * 100, y2: (2 - t.y_baix) * 100,
      stroke: COL.taronja, 'stroke-width': 3
    })));
    if (estat === 'model' || estat === 'gris') {
      g.append(s('path', { d: dl.svg_model, fill: estat === 'model' ? COL.model : COL.repas }));
      taronja();
      if (estat === 'model' && ambFletxes) g.append(s('path', { d: dl.svg_fletxes, fill: COL.fletxa }));
    } else if (estat === 'punts') {
      taronja();
      g.append(s('path', { d: dl.svg_puntets, fill: COL.model }));
    } else {
      taronja(); // columna de pràctica: només punts (i línia taronja si la lletra en porta)
    }
    const [vx, vy] = dl.punt_verd, [rx, ry] = dl.punt_vermell;
    g.append(s('circle', { cx: vx * 100, cy: (2 - vy) * 100, r: RADI_PUNT, fill: COL.verd }));
    g.append(s('circle', { cx: rx * 100, cy: (2 - ry) * 100, r: RADI_PUNT, fill: COL.vermell }));
    if (estat === 'model' && ambFletxes) {
      dl.numeros_fletxes.forEach(n => g.append(s('text', {
        x: n.x * 100, y: (2 - n.y) * 100, 'font-family': 'Poppins, Arial, sans-serif', 'font-weight': 500,
        'font-size': 20, fill: COL.fletxa, 'text-anchor': 'middle'
      }, String(n.n))));
    }
    return g;
  }
  AT.motor.columnaLletra = columna;

  /* Estats possibles de cada columna d'una fila */
  AT.motor.ESTATS = [
    ['model', 'Model'],
    ['fletxes', 'Model amb fletxes'],
    ['gris', 'Gris clar'],
    ['puntets', 'Puntets'],
    ['punts', 'Només punts'],
    ['buit', 'En blanc']
  ];
  /* Combinacions ràpides per a les columnes d'una fila (la resta de columnes repeteix l'última) */
  AT.motor.PATRONS = [
    ['Model i puntets', ['model', 'puntets']],
    ['Model, gris i punts', ['model', 'gris', 'punts']],
    ['Model i punts', ['model', 'punts']],
    ['Tot puntets', ['puntets']],
    ['Tot gris', ['gris']],
    ['Només punts', ['punts']],
    ['Pauta en blanc', ['buit']]
  ];

  /* Una lletra, en un dels estats, en coordenades SVG de les dades */
  function lletraEnEstat(dl, estat) {
    if (estat === 'buit') return s('g');
    if (estat === 'puntets') return columna(dl, 'punts', false);
    if (estat === 'punts') return columna(dl, 'sols', false);
    if (estat === 'gris') return columna(dl, 'gris', false);
    return columna(dl, 'model', estat === 'fletxes');
  }

  /* Lletra de la fitxa a què fa referència un bloc («@0» = 1a lletra de la fitxa) */
  AT.motor.lletraDeBloc = function (bloc, fitxa) {
    const v = bloc.lletra || '@0';
    if (v.startsWith('@')) {
      const ll = (fitxa.lletres || [])[Number(v.slice(1))] || (fitxa.lletres || [])[0] || 'a';
      return ll;
    }
    return v;
  };

  /* Unitat que es repeteix a cada columna: una lletra o una paraula (lletres una darrere l'altra).
     PROVISIONAL per a paraules: no es dibuixen unions (l'escola no les ha decidit). Cada lletra
     comença una mica després del punt vermell de l'anterior perquè l'alumne faci la unió. */
  const ENTRE_LLETRES = 0.25, ENTRE_PARAULES = 1.2;
  function unitat(text) {
    const parts = [], noDisponibles = [];
    let x = null, prev = null;
    for (const ch of text) {
      if (ch === ' ') { if (prev) x = prev.dx + prev.dl.amplada_amb_punts.dreta + ENTRE_PARAULES; prev = null; continue; }
      const c = ch.toLowerCase();
      if (!L.lletres[c] || c === 'q_cua') { noDisponibles.push(ch); continue; }
      const dl = L.lletres[AT.motor.clauLletra(c)];
      let dx;
      if (prev) dx = prev.dx + prev.dl.punt_vermell[0] + ENTRE_LLETRES - dl.punt_verd[0];
      else if (x !== null) dx = x - dl.amplada_amb_punts.esquerra;
      else dx = 0;
      const p = { dl, dx, c };
      parts.push(p); prev = p;
    }
    if (!parts.length) return { parts, esq: 0, dre: 1, noDisponibles };
    const esq = parts[0].dx + parts[0].dl.amplada_amb_punts.esquerra;
    const dre = Math.max(...parts.map(p => p.dx + p.dl.amplada_amb_punts.dreta));
    return { parts, esq, dre, noDisponibles };
  }
  AT.motor.unitat = unitat;

  /* Pauta Montessori de l'escola: 4 línies; les dues del mig més clares i fines */
  const PAUTA = { fosca: '#737373', mig: '#a2a2a2' };
  const PX = 210 / 794; // mm per píxel de la plantilla de Canva (A4 = 794 px)

  function pautaFila(svg, W, y0, u) {
    const linia = (y, c, w) => svg.append(s('line', { x1: 0, x2: W, y1: y, y2: y, stroke: c, 'stroke-width': w }));
    /* Cada fila és una pauta completa de 4 línies, sense compartir-ne cap amb la fila del costat:
       dalt i baix fosques; les dues del mig (alçada de la x i línia de base) més primes i clares. */
    linia(y0, PAUTA.fosca, 2 * PX);
    linia(y0 + u, PAUTA.mig, 1 * PX);
    linia(y0 + 2 * u, PAUTA.mig, 1 * PX);
    linia(y0 + 3 * u, PAUTA.fosca, 2 * PX);
  }

  function dibuixaUnitat(un, estat, ox, y0, u) {
    const g = s('g', { transform: `translate(${AT.n(ox, 3)} ${AT.n(y0, 3)}) scale(${AT.n(u / 100, 5)})` });
    if (un.tracos) { g.append(AT.paraula.dibuixa(un, estat)); return g; } // paraula o frase
    un.parts.forEach(p => {
      const e = lletraEnEstat(p.dl, estat);
      e.setAttribute('transform', `translate(${AT.n(p.dx * 100, 2)} 0)`);
      g.append(e);
    });
    return g;
  }

  /* Quantes columnes hi caben i quin estat té cada una */
  AT.motor.columnesDeFila = function (bloc, fitxa, W) {
    const u = mida(fitxa.curs, 'caligrafia', bloc.mida);
    const text = bloc.tipus === 'paraula' ? (bloc.text || '') : AT.motor.lletraDeBloc(bloc, fitxa);
    const un = bloc.tipus === 'paraula' ? AT.paraula.construeix(text) : unitat(text);
    const inici = 8 * PX, marge = 6 * PX;
    let reduida = false, uTriada = u;
    /* Una paraula o frase que no hi cap es fa més petita fins que hi càpiga */
    if (bloc.tipus === 'paraula' && (un.dre - un.esq) * u > W - marge - inici) {
      uTriada = u; reduida = true;
    }
    const uFinal = reduida ? (W - marge - inici) / (un.dre - un.esq) : u;
    const ampleCol = (un.dre - un.esq) * uFinal;
    const separacio = (bloc.tipus === 'paraula' ? 1.2 * uFinal : 30 * PX);
    const n = Math.max(1, Math.floor((W - marge - inici + separacio) / (ampleCol + separacio)));
    const patro = Array.isArray(bloc.columnes) && bloc.columnes.length ? bloc.columnes : ['model', 'puntets'];
    /* A les paraules l'ordre continua de fila en fila (sovint només hi cap una paraula per fila);
       a les files de lletra, totes les files del bloc són iguals. */
    const total = bloc.tipus === 'paraula' ? n * (bloc.files === 'auto' ? Math.max(3, Math.ceil(4 / n)) : Math.max(1, Number(bloc.files) || 1)) : n;
    const estats = Array.from({ length: Math.min(total, 24) }, (_, i) => patro[Math.min(i, patro.length - 1)]);
    const estat = (r, i) => { const k = bloc.tipus === 'paraula' ? r * n + i : i; return patro[Math.min(k, patro.length - 1)]; };
    return { u: uFinal, uTriada, reduida, un, ampleCol, inici, separacio, marge, n, estats, estat, text };
  };

  /* Bloc «Fila de pauta» (una lletra) o «Paraules» (una paraula o frase curta) */
  AT.motor.fila = function (bloc, fitxa, W) {
    const c = AT.motor.columnesDeFila(bloc, fitxa, W);
    const { u, un, ampleCol, inici, separacio, marge, n, estat } = c;
    const aire = Math.max(4, 0.4 * u);
    const rowH = 3 * u + aire;
    const y0 = aire / 2;
    const avisos = [];
    if (bloc.tipus === 'paraula') {
      if (un.buida) avisos.push('El bloc de paraules està buit: escriu-hi una paraula o una frase.');
      if (un.noDisponibles.length) avisos.push(`No es poden escriure aquests caràcters: ${[...new Set(un.noDisponibles)].join(' ')}.`);
    }
    if (c.reduida) avisos.push(`«${c.text.trim()}» no hi cabia a la mida triada i s’ha fet més petita (${String(AT.n(u, 1)).replace('.', ',')} mm).`);
    else if (inici + ampleCol > W - marge + 0.01) avisos.push(`«${c.text}» no hi cap en una fila: tria una mida més petita.`);

    function fila(r) {
      const svg = s('svg', { class: 'fila', width: W + 'mm', height: rowH + 'mm', viewBox: `0 0 ${W} ${rowH}`, overflow: 'visible' });
      pautaFila(svg, W, y0, u);
      for (let i = 0; i < n; i++) svg.append(dibuixaUnitat(un, estat(r || 0, i), inici + i * (ampleCol + separacio) - un.esq * u, y0, u));
      return svg;
    }
    const lletra = bloc.tipus === 'paraula' ? null : c.text;
    return { rowH, fila, avisos, solaEnPagina: lletra === 'ç', continu: true };
  };

  /* Mostra de les lletres de la fitxa, just sota la capçalera */
  AT.motor.mostra = function (fitxa, W) {
    const m = fitxa.mostra || {};
    const lletres = (fitxa.lletres || []).filter(l => L.lletres[l]);
    if (!m.visible || !lletres.length) return null;
    let u = mida(fitxa.curs, 'caligrafia', m.mida || 'gran');
    const ambFletxes = m.estil === 'fletxes';
    const caixes = lletres.map(l => {
      const dl = L.lletres[AT.motor.clauLletra(l)];
      let esq = dl.amplada_amb_punts.esquerra, dre = dl.amplada_amb_punts.dreta;
      if (ambFletxes) { esq = Math.min(esq, dl.limits_amb_fletxes.xmin - 0.12); dre = Math.max(dre, dl.limits_amb_fletxes.xmax); }
      return { dl, esq, dre };
    });
    const sep = 1.4;
    const totalU = caixes.reduce((a, c) => a + c.dre - c.esq, 0) + sep * (caixes.length - 1);
    if (totalU * u > W - 6) u = (W - 6) / totalU; // si no hi cap, es fa una mica més petita
    const marge = 0.45 * u;
    const rowH = 3 * u + 2 * marge;
    const svg = s('svg', { class: 'fila mostra', width: W + 'mm', height: rowH + 'mm', viewBox: `0 0 ${W} ${rowH}`, overflow: 'visible' });
    pautaFila(svg, W, marge, u);
    let x = (W - totalU * u) / 2;
    const estat = m.estil === 'gris' ? 'gris' : m.estil === 'puntets' ? 'puntets' : ambFletxes ? 'fletxes' : 'model';
    caixes.forEach(c => {
      const g = lletraEnEstat(c.dl, estat);
      g.setAttribute('transform', `translate(${AT.n(x - c.esq * u, 3)} ${AT.n(marge, 3)}) scale(${AT.n(u / 100, 5)})`);
      svg.append(g);
      x += (c.dre - c.esq + sep) * u;
    });
    return { rowH, el: svg };
  };

  /* ---------- Grafomotricitat: formes ---------- */
  /* Cada forma rep l'amplada w i l'alçada a (mm) i retorna una llista de tracos,
     cada traç és una llista de punts {x, y} (y = 0 a dalt). «periode» indica
     quina amplada ocupa una repetició (serveix per fer el model). */
  const TAU = Math.PI * 2;
  function mostreja(f, t0, t1, n) {
    const p = [];
    for (let i = 0; i <= n; i++) p.push(f(t0 + (t1 - t0) * i / n));
    return p;
  }
  const reps = (w, ample) => Math.max(1, Math.round(w / ample));

  AT.formes = {
    horitzontal: { nom: 'Línia recta', fn: (w, a) => ({ periode: Math.min(w, a * 1.2), tracos: [mostreja(t => ({ x: t * w, y: a / 2 }), 0, 1, 80)] }) },
    vertical: {
      nom: 'Pals', fn: (w, a) => {
        const k = reps(w, a * 0.5), p = w / k;
        return { periode: p, separats: true, tracos: Array.from({ length: k }, (_, i) => mostreja(t => ({ x: p * (i + 0.5), y: t * a }), 0, 1, 12)) };
      }
    },
    diagonal: {
      nom: 'Diagonals', fn: (w, a) => {
        const k = reps(w, a * 0.6), p = w / k;
        return { periode: p, separats: true, tracos: Array.from({ length: k }, (_, i) => mostreja(t => ({ x: p * i + p * 0.2 + t * p * 0.6, y: a - t * a }), 0, 1, 12)) };
      }
    },
    zigazaga: {
      nom: 'Ziga-zaga', fn: (w, a) => {
        const k = reps(w, a * 0.8), p = w / k, pts = [];
        for (let i = 0; i <= k * 2; i++) pts.push({ x: i * p / 2, y: i % 2 ? 0 : a });
        return { periode: p, tracos: [densifica(pts, 2)] };
      }
    },
    ones: {
      nom: 'Ones', fn: (w, a) => {
        const k = reps(w, a * 1.4), p = w / k;
        return { periode: p, tracos: [mostreja(x => ({ x, y: a / 2 - (a / 2) * Math.sin(TAU * x / p) }), 0, w, k * 40)] };
      }
    },
    ponts: {
      nom: 'Ponts', fn: (w, a) => {
        const k = reps(w, a * 0.9), p = w / k;
        return { periode: p, tracos: [mostreja(x => ({ x, y: a - a * Math.abs(Math.sin(Math.PI * x / p)) }), 0, w, k * 40)] };
      }
    },
    copes: {
      nom: 'Garlandes', fn: (w, a) => {
        const k = reps(w, a * 0.9), p = w / k;
        return { periode: p, tracos: [mostreja(x => ({ x, y: a * Math.abs(Math.sin(Math.PI * x / p)) }), 0, w, k * 40)] };
      }
    },
    bucles: {
      nom: 'Bucles', fn: (w, a) => {
        const k = reps(w, a * 0.75), c = w / (k * TAU), R = Math.max(c * 1.9, a * 0.2);
        const pts = mostreja(t => ({ x: c * t + R * Math.sin(t) * 0.999, y: a / 2 + (a / 2) * Math.cos(t) }), 0, k * TAU, k * 60);
        return { periode: w / k, tracos: [pts] };
      }
    },
    merlets: {
      nom: 'Castell', fn: (w, a) => {
        const k = reps(w, a * 0.9), p = w / k, pts = [{ x: 0, y: a }];
        for (let i = 0; i < k; i++) {
          const x = i * p;
          pts.push({ x, y: 0 }, { x: x + p / 2, y: 0 }, { x: x + p / 2, y: a }, { x: x + p, y: a });
        }
        return { periode: p, tracos: [densifica(pts, 2)] };
      }
    },
    serra: {
      nom: 'Serra', fn: (w, a) => {
        const k = reps(w, a * 0.8), p = w / k, pts = [{ x: 0, y: a }];
        for (let i = 0; i < k; i++) pts.push({ x: (i + 1) * p, y: 0 }, { x: (i + 1) * p, y: a });
        return { periode: p, tracos: [densifica(pts, 2)] };
      }
    },
    cercles: {
      nom: 'Rodones', fn: (w, a) => {
        const r = a * 0.45, k = reps(w, a * 1.15), p = w / k;
        /* com la «o»: comença a dalt a la dreta i gira cap a l'esquerra */
        return {
          periode: p, separats: true,
          tracos: Array.from({ length: k }, (_, i) => mostreja(t => ({ x: p * (i + 0.5) + r * Math.cos(-Math.PI / 3 - t), y: a / 2 + r * Math.sin(-Math.PI / 3 - t) }), 0, -TAU * 0.98, 60))
        };
      }
    },
    espirals: {
      nom: 'Cargols', fn: (w, a) => {
        const r = a * 0.47, k = reps(w, a * 1.15), p = w / k, voltes = 2.6;
        return {
          periode: p, separats: true,
          tracos: Array.from({ length: k }, (_, i) => mostreja(t => {
            const rr = r * (1 - t / (voltes * TAU));
            return { x: p * (i + 0.5) + rr * Math.cos(-Math.PI / 2 - t), y: a / 2 + rr * Math.sin(-Math.PI / 2 - t) };
          }, 0, voltes * TAU * 0.92, 140))
        };
      }
    }
  };

  function densifica(pts, pas) {
    const out = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      const d = Math.hypot(b.x - a.x, b.y - a.y), n = Math.max(1, Math.ceil(d / pas));
      for (let j = 1; j <= n; j++) out.push({ x: a.x + (b.x - a.x) * j / n, y: a.y + (b.y - a.y) * j / n });
    }
    return out;
  }

  const cami = (pts, dx, dy) => pts.map((p, i) => (i ? 'L' : 'M') + AT.n(p.x + dx) + ' ' + AT.n(p.y + dy)).join('');
  const primerMesEnlla = (pts, x) => { const i = pts.findIndex(p => p.x > x); return i < 0 ? pts.length : i; };

  function nivellAjuda(ajuda, r, N) {
    if (ajuda === 'resseguir') return 0;
    if (ajuda === 'model') return 2;
    return N <= 1 ? 0 : N === 2 ? r : Math.min(2, Math.floor(r * 3 / N));
  }

  AT.motor.grafomotricitat = function (bloc, curs, W) {
    const a = mida(curs, 'grafomotricitat', bloc.mida);
    const gap = Math.max(7, a * 0.5);
    const img = a * 1.15;
    const teIni = !!bloc.imatgeInici, teFi = !!bloc.imatgeFinal;
    const rowH = Math.max(a, (teIni || teFi) ? img : 0) + gap;
    const pad = 3;
    const x0 = pad + (teIni ? img + 4 : 0);
    const x1 = W - pad - (teFi ? img + 4 : 0);
    const w = Math.max(10, x1 - x0);
    const forma = AT.formes[bloc.forma] || AT.formes.ones;
    const dades = forma.fn(w, a);

    function fila(r, N) {
      const svg = s('svg', { class: 'fila', width: W + 'mm', height: rowH + 'mm', viewBox: `0 0 ${W} ${rowH}` });
      const yc = rowH / 2, y0 = yc - a / 2;
      if (bloc.guies === 'linies') {
        [y0, y0 + a].forEach(y => svg.append(s('line', { x1: x0 - 2, x2: x1 + 2, y1: y, y2: y, stroke: '#9a9a9a', 'stroke-width': 0.22 })));
      }
      if (teIni) svg.append(s('image', { href: bloc.imatgeInici, x: pad, y: yc - img / 2, width: img, height: img, preserveAspectRatio: 'xMidYMid meet' }));
      if (teFi) svg.append(s('image', { href: bloc.imatgeFinal, x: W - pad - img, y: yc - img / 2, width: img, height: img, preserveAspectRatio: 'xMidYMid meet' }));

      const niv = nivellAjuda(bloc.ajuda, r, N);
      const model = (d, extra) => svg.append(s('path', Object.assign({ d, fill: 'none', stroke: NEGRE, 'stroke-width': 0.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, extra)));
      const punts = d => svg.append(s('path', { d, fill: 'none', stroke: PUNTS, 'stroke-width': 0.85, 'stroke-dasharray': '0 2.1', 'stroke-linecap': 'round' }));
      const inici = p => { if (bloc.puntInici) svg.append(s('circle', { cx: AT.n(p.x + x0), cy: AT.n(p.y + y0), r: 1.1, fill: NEGRE })); };

      if (dades.separats) {
        const T = dades.tracos, k = T.length;
        const finsA = niv === 0 ? k : niv === 1 ? Math.ceil(k / 2) : 1;
        T.forEach((pts, i) => {
          if (i === 0) model(cami(pts, x0, y0));
          else if (i < finsA) punts(cami(pts, x0, y0));
          else return;
          inici(pts[0]);
        });
      } else {
        const pts = dades.tracos[0];
        const m = Math.min(pts.length, primerMesEnlla(pts, dades.periode) + 1);
        const limit = niv === 0 ? pts.length : niv === 1 ? primerMesEnlla(pts, w * 0.55) + 1 : m;
        model(cami(pts.slice(0, m), x0, y0));
        if (limit > m) punts(cami(pts.slice(m - 1, limit), x0, y0));
        inici(pts[0]);
      }
      return svg;
    }
    return { rowH, fila, avisos: [] };
  };

  /* Miniatura d'una forma (per als botons de l'editor) */
  AT.motor.miniForma = function (id) {
    const w = 60, a = 16;
    const d = AT.formes[id].fn(w, a);
    const svg = s('svg', { viewBox: `-3 -3 ${w + 6} ${a + 6}`, class: 'mini-forma', 'aria-hidden': 'true' });
    d.tracos.forEach(pts => svg.append(s('path', { d: cami(pts, 0, 0), fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })));
    return svg;
  };

  /* ---------- Paginació ---------- */
  const ENUNCIAT = 8;      // mm que ocupa un enunciat (12 pt + espai)
  const ENTRE_BLOCS = 5;   // mm entre blocs
  const CAPCALERA = 31;    // mm de la capçalera oficial + espai inferior

  function motorDe(bloc, fitxa, W) {
    if (bloc.tipus === 'fila' || bloc.tipus === 'paraula') return AT.motor.fila(bloc, fitxa, W);
    if (bloc.tipus === 'grafomotricitat') return AT.motor.grafomotricitat(bloc, fitxa.curs, W);
    return null;
  }

  AT.motor.pagina = function (fitxa) {
    const F = AT.config.full;
    const W = F.amplada - F.marges.esquerra - F.marges.dreta;
    const H = F.alcada - F.marges.dalt - F.marges.baix;
    const avisos = [];
    const pagines = [];
    const nova = () => { const p = { cap: pagines.length === 0 && fitxa.capcalera !== false ? H - CAPCALERA : H, usat: 0, items: [] }; pagines.push(p); return p; };
    let pag = nova();

    /* Mostra de les lletres, just sota la capçalera */
    const mostra = fitxa.area === 'caligrafia' ? AT.motor.mostra(fitxa, W) : null;
    if (mostra) {
      pag.items.push({ tipus: 'mostra', alt: mostra.rowH + 3, el: mostra.el });
      pag.usat += mostra.rowH + 3;
    }
    if (fitxa.area === 'caligrafia' && (fitxa.lletres || []).includes('ç') && fitxa.lletres.length > 1) {
      avisos.push('La ç va sola en una pàgina: millor fer-ne una fitxa a part.');
    }

    const motors = fitxa.blocs.map(b => {
      const m = motorDe(b, fitxa, W);
      if (m) m.avisos.forEach(a => avisos.push(a));
      return m;
    });

    fitxa.blocs.forEach((bloc, bi) => {
      const m = motors[bi];
      /* La ç va sola en una pàgina (norma de l'escola) */
      if (pag.tancada || (m && m.solaEnPagina && pag.items.length)) pag = nova();
      if (m && m.solaEnPagina) pag.tancada = true;
      const sep = pag.items.length ? ENTRE_BLOCS : 0;
      const enun = bloc.enunciat && bloc.enunciat.trim() ? ENUNCIAT : 0;
      if (bloc.tipus === 'espai') {
        const alt = bloc.alcada === 'auto' ? 30 : Number(bloc.alcada) || 60;
        if (pag.usat + sep + enun + alt > pag.cap + 0.01) pag = nova();
        const s0 = pag.items.length ? ENTRE_BLOCS : 0;
        pag.items.push({ tipus: 'enunciat', bloc, alt: s0 + enun, sep: s0 });
        pag.items.push({ tipus: 'espai', bloc, alt, auto: bloc.alcada === 'auto' });
        pag.usat += s0 + enun + alt;
        return;
      }
      const minim = bloc.files === 'auto' ? 1 : Math.max(1, Number(bloc.files) || 1);
      for (let r = 0; r < minim; r++) {
        /* Sense enunciat, les files de pauta continuen just a sota de les del bloc anterior */
        const darrer = () => pag.items[pag.items.length - 1];
        const separa = () => (pag.items.length && darrer().tipus !== 'mostra' && (enun || !m.continu) ? ENTRE_BLOCS : 0);
        const necessari = r === 0 ? separa() + enun + m.rowH : m.rowH;
        if (pag.usat + necessari > pag.cap + 0.01 && pag.items.length) pag = nova();
        if (r === 0) {
          const s0 = separa();
          pag.items.push({ tipus: 'enunciat', bloc, alt: s0 + enun, sep: s0 });
          pag.usat += s0 + enun;
        }
        pag.items.push({ tipus: 'fila', bloc, bi, alt: m.rowH });
        pag.usat += m.rowH;
      }
    });

    /* «Omple el full»: reparteix l'espai que sobra a cada full entre els blocs automàtics */
    pagines.forEach(p => {
      const autos = [];
      p.items.forEach((it, i) => { if (it.tipus === 'fila' && it.bloc.files === 'auto') autos.push(i); });
      const ultimaDeCada = new Map();
      autos.forEach(i => ultimaDeCada.set(p.items[i].bloc.id, i));
      let afegit = true;
      while (afegit) {
        afegit = false;
        for (const [id] of ultimaDeCada) {
          const i = ultimaDeCada.get(id);
          const it = p.items[i];
          if (p.usat + it.alt <= p.cap + 0.01) {
            p.items.splice(i + 1, 0, { tipus: 'fila', bloc: it.bloc, bi: it.bi, alt: it.alt });
            p.usat += it.alt;
            for (const [id2, j] of ultimaDeCada) if (j > i) ultimaDeCada.set(id2, j + 1);
            ultimaDeCada.set(id, i + 1);
            afegit = true;
          }
        }
      }
      const espaiAuto = p.items.find(it => it.tipus === 'espai' && it.auto);
      if (espaiAuto) { espaiAuto.alt += Math.max(0, p.cap - p.usat - 0.5); p.usat = p.cap; }
    });

    /* Índex de cada fila dins del seu bloc (per a la progressió d'ajuda) */
    const total = new Map(), compt = new Map();
    pagines.forEach(p => p.items.forEach(it => { if (it.tipus === 'fila') total.set(it.bloc.id, (total.get(it.bloc.id) || 0) + 1); }));
    pagines.forEach(p => p.items.forEach(it => {
      if (it.tipus !== 'fila') return;
      const r = compt.get(it.bloc.id) || 0;
      it.r = r; it.N = total.get(it.bloc.id);
      compt.set(it.bloc.id, r + 1);
    }));

    const ultima = pagines[pagines.length - 1];
    const ocupacio = pagines.map(p => p.usat / p.cap);
    if (ultima.usat / ultima.cap < 0.6) avisos.push(`El full ${pagines.length} queda ${ultima.items.length ? 'mig buit' : 'buit'}. Posa «Omple el full» a l’últim bloc o afegeix-ne un altre.`);
    if (!fitxa.blocs.length) avisos.length = 0;

    return { pagines, motors, W, avisos, ocupacio };
  };

  /* ---------- Fulls (DOM) ---------- */
  function capcalera(fitxa) {
    const curs = AT.config.cursos[fitxa.curs];
    const logo = AT.store.config().logo;
    return h('table', { class: 'capcalera' },
      h('colgroup', null, h('col'), h('col'), h('col'), h('col')),
      h('tr', null,
        h('td', { colspan: 3, class: 'cap-nom' }, h('b', null, 'Nom i Cognoms:')),
        h('td', { class: 'cap-data' }, h('b', null, 'Data:'))),
      h('tr', { class: 'cap-separador' }, h('td', { colspan: 4 })),
      h('tr', null,
        h('td', { class: 'cap-logo' }, logo
          ? h('img', { src: logo, alt: 'Logotip de l’escola' })
          : h('span', { class: 'nomes-pantalla logo-buit' }, 'Logo')),
        h('td', { colspan: 2, class: 'cap-titol' }, fitxa.titol || 'TÍTOL'),
        h('td', { class: 'cap-curs' }, h('b', null, curs ? curs.nom : '')))
    );
  }

  AT.motor.fulls = function (fitxa) {
    const res = AT.motor.pagina(fitxa);
    const F = AT.config.full;
    const fulls = res.pagines.map((p, pi) => {
      const full = h('div', {
        class: 'full',
        style: {
          width: F.amplada + 'mm', height: F.alcada + 'mm',
          padding: `${F.marges.dalt}mm ${F.marges.dreta}mm ${F.marges.baix}mm ${F.marges.esquerra}mm`
        }
      });
      if (pi === 0 && fitxa.capcalera !== false) full.append(capcalera(fitxa));
      const cos = h('div', { class: 'cos' });
      p.items.forEach(it => {
        if (it.tipus === 'enunciat') {
          if (!it.bloc.enunciat || !it.bloc.enunciat.trim()) { if (it.sep) cos.append(h('div', { style: { height: it.sep + 'mm' } })); return; }
          cos.append(h('p', { class: 'enunciat', style: { height: it.alt + 'mm', paddingTop: it.sep + 'mm' } }, it.bloc.enunciat));
        } else if (it.tipus === 'fila') {
          cos.append(res.motors[it.bi].fila(it.r, it.N));
        } else if (it.tipus === 'mostra') {
          it.el.style.marginBottom = '3mm';
          cos.append(it.el);
        } else if (it.tipus === 'espai') {
          cos.append(h('div', { class: 'espai-dibuix', style: { height: it.alt + 'mm' } }));
        }
      });
      full.append(cos);
      full.append(h('div', { class: 'num-pagina', style: { bottom: F.peu + 'mm', right: F.marges.dreta + 'mm' } }, String(pi + 1)));
      return full;
    });
    return { fulls, avisos: res.avisos, ocupacio: res.ocupacio };
  };
})();
