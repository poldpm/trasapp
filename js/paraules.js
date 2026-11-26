/* TRAÇApp — paraules i frases amb la lletra lligada de l'escola
   - Les lletres surten dels traços validats (dades/lletres.json), sense tocar-los.
   - Unions: si la lletra següent
     comença amb una cua d'entrada (un traç a part que puja des de baix), la unió la substitueix:
     va del final de la lletra anterior fins on acabava aquella cua. Si la lletra és d'un sol traç
     (e, l…), la unió arriba al punt on la seva entrada fa la mateixa alçada que la sortida anterior.
   - La q no s'uneix amb la lletra següent («unio_amb_la_seguent»: «cap» al JSON): la u va al costat.
   - Els punts verd i vermell són només per a les lletres soles: a les paraules i frases no hi van.
   - Cada lletra és sempre igual: la unió hi entra per un punt fix de la lletra, que no depèn de l'anterior.
   - Accents: un traç curt a sobre (à è é í ò ó ú); dièresi: dos punts (ï ü).
   - Majúscules, números i signes: tipografia normal (Raleway; Raleway Dots per resseguir), de la base a la línia de dalt.
   Unitats: les de la pauta (y=0 base, y=1 alçada de la x, y=2 dalt, y=−1 baix). */
window.AT = window.AT || {};

(function () {
  const { s } = AT;
  const L = AT.LLETRES;
  const COL = L.colors;
  const GRUIX = L.unitats['gruix_traç'];            // 0,105
  const R_PUNT = L.unitats.radi_punts_inici_final;  // 0,093
  const R_PUNT_I = L.unitats.radi_punt_i_j;         // 0,085
  const PUNTETS = L.unitats.puntets;                // radi 0,045 · separació 0,15
  const R_PUNTET_I = 0.075;                         // punt de la i a la versió de puntets (puntejat.py)

  const ACCENTS = {
    'à': ['a', 'greu'], 'è': ['e', 'greu'], 'é': ['e', 'agut'], 'í': ['i', 'agut'], 'ï': ['i', 'dieresi'],
    'ò': ['o', 'greu'], 'ó': ['o', 'agut'], 'ú': ['u', 'agut'], 'ü': ['u', 'dieresi']
  };

  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const norm = v => { const n = Math.hypot(v[0], v[1]) || 1; return [v[0] / n, v[1] / n]; };
  const dirInici = p => norm([p[Math.min(6, p.length - 1)][0] - p[0][0], p[Math.min(6, p.length - 1)][1] - p[0][1]]);
  const dirFinal = p => { const n = p.length; const q = p[Math.max(0, n - 7)]; return norm([p[n - 1][0] - q[0], p[n - 1][1] - q[1]]); };

  const ENTRADA_BUCLE = { alt: 1.0, baix: 0.45 };

  /* Anàlisi d'una lletra: quin traç és l'entrada i quin la sortida (pels punts verd i vermell) */
  const cache = {};
  function analitza(clau) {
    if (cache[clau]) return cache[clau];
    const dl = L.lletres[clau];
    const tr = dl.tracos.filter(t => t.tipus === 'traç');
    let entrada = 0, sortida = 0, dE = Infinity, dS = Infinity;
    tr.forEach((t, i) => {
      const a = dist(t.p[0], dl.punt_verd); if (a < dE) { dE = a; entrada = i; }
      const b = dist(t.p[t.p.length - 1], dl.punt_vermell); if (b < dS) { dS = b; sortida = i; }
    });
    const e = tr[entrada].p;
    /* cua d'entrada = traç a part que comença baix i només puja (sense tornar a baixar) */
    let maxY = -Infinity, baixada = 0;
    e.forEach(q => { maxY = Math.max(maxY, q[1]); baixada = Math.max(baixada, maxY - q[1]); });
    const esCua = tr.length > 1 && entrada !== sortida && e[e.length - 1][1] - e[0][1] > 0.3 && e[0][1] < 0.6 && baixada < 0.2;
    /* Punt fix per on la unió entra a la lletra: no depèn mai de la lletra anterior,
       perquè cada lletra quedi sempre igual. */
    let qIdx = 0;
    if (esCua) qIdx = e.length - 1;                       // la unió substitueix la cua sencera
    else if (e[0][1] >= 0.8) qIdx = 0;                     // comença per dalt (k, z): s'hi entra pel començament
    else {
      let top = 0;
      while (top + 1 < e.length && e[top + 1][1] >= e[top][1] - 0.005) top++;
      const tornaEnrere = e[Math.min(top + 12, e.length - 1)][0] < e[top][0];
      if (tornaEnrere) {
        /* Bucles. Les lletres amb bucle alt (b, f, h, l) s'entren a l'alçada de la línia del mig (y = 1),
           on el seu traç d'entrada ja puja cap al bucle: així la unió sempre puja, també des de les
           lletres que acaben a dalt (o, v, w, b…), sense fer ondulacions. La e (bucle petit) s'entra
           a mitja alçada, perquè més amunt perdria el bucle. */
        const llindar = ENTRADA_BUCLE[maxY > 1.5 ? 'alt' : 'baix'];
        const k = e.findIndex(q => q[1] >= llindar);
        qIdx = Math.max(0, Math.min(k < 0 ? 0 : k, top));
      } else qIdx = top;                                   // m, n, v, w, x: al capdamunt del primer pujant
    }
    /* Quant s'estén la lletra cap a l'esquerra del punt d'entrada (per no trepitjar l'anterior) */
    const Q = e[qIdx];
    let minX = Infinity;
    tr.forEach((t, i) => {
      const pts = i === entrada ? (esCua ? [] : t.p.slice(qIdx)) : t.p;
      pts.forEach(q => { if (q[0] < minX) minX = q[0]; });
    });
    const esquerra = (minX === Infinity ? Q[0] : minX) - Q[0];
    return (cache[clau] = { dl, entrada, sortida, esCua, qIdx, esquerra });
  }

  function corba(P0, t0, P3, t3) {
    const d = dist(P0, P3), h = 0.42 * d;
    const P1 = [P0[0] + t0[0] * h, P0[1] + t0[1] * h], P2 = [P3[0] - t3[0] * h, P3[1] - t3[1] * h];
    const pts = [];
    for (let i = 1; i < 20; i++) {
      const t = i / 20, m = 1 - t;
      pts.push([m * m * m * P0[0] + 3 * m * m * t * P1[0] + 3 * m * t * t * P2[0] + t * t * t * P3[0],
        m * m * m * P0[1] + 3 * m * m * t * P1[1] + 3 * m * t * t * P2[1] + t * t * t * P3[1]]);
    }
    return pts;
  }

  /* Mètrica de la tipografia normal (majúscules, números, signes) */
  const ctx = document.createElement('canvas').getContext('2d');
  let ratioMaj = 0.705;
  AT.paraulaMetrica = function () {
    ctx.font = '100px "Raleway Dots"';
    const m = ctx.measureText('H');
    if (m.actualBoundingBoxAscent > 30) ratioMaj = m.actualBoundingBoxAscent / 100;
  };
  const midaGlif = () => 2 / ratioMaj; // la majúscula arriba de la base a la línia de dalt
  const ampladaGlif = ch => { ctx.font = '100px "Raleway Dots"'; return ctx.measureText(ch).width / 100 * midaGlif(); };

  /* Construeix la geometria d'un text */
  AT.paraula = {};
  AT.paraula.buidaMemoria = () => Object.keys(cache).forEach(k => delete cache[k]);
  AT.paraula.construeix = function (text) {
    const g = { tracos: [], punts: [], taronja: [], verds: [], vermells: [], glifs: [], noDisponibles: [], unions: [] };
    let cursor = 0;        // on pot començar el següent element
    let anterior = null;   // última lletra de la paraula en curs: { traç de sortida, extrem dret }
    let dreta = 0;

    const tancaParaula = () => {
      if (anterior) g.vermells.push(anterior.vermell);
      anterior = null;
    };

    for (const ch of (text || '').normalize('NFC')) {
      if (ch === ' ') { tancaParaula(); cursor = dreta + 1.2; continue; }
      if (ch === '·' && anterior) {
        /* punt volat: tanca la paraula, punt a mitja alçada i torna a començar (l·l) */
        const x = dreta + 0.12;
        tancaParaula();
        g.punts.push({ x: x + R_PUNT_I, y: 0.55, r: R_PUNT_I });
        dreta = x + 2 * R_PUNT_I; cursor = dreta + 0.12;
        continue;
      }
      let base = ch, accent = null;
      if (ACCENTS[ch]) [base, accent] = ACCENTS[ch];
      if (L.lletres[base]) {
        /* La q no s'uneix amb la lletra següent (norma de l'escola, 26-11-2026): la u es posa al costat,
           amb la seva entrada pròpia, 0,3 a la dreta del final del pal horitzontal de la q. */
        if (anterior && anterior.senseUnio) {
          const fi = anterior.fiDreta;
          tancaParaula();
          cursor = fi + 0.3 - (L.lletres[base].punt_verd[0] - L.lletres[base].amplada_amb_punts.esquerra);
        }
        const an = analitza(AT.motor.clauLletra(base));
        const tr = an.dl.tracos.filter(t => t.tipus === 'traç').map(t => t.p.map(q => q.slice()));
        let dx, unioAmb = null;
        if (anterior) {
          /* Unió amb la lletra anterior */
          const E = anterior.final, tE = anterior.dir;
          const e = tr[an.entrada];
          let Q, tQ, g0;
          if (an.esCua) {
            Q = e[e.length - 1]; tQ = dirFinal(e);
            tr[an.entrada] = null; // la unió substitueix la cua d'entrada
          } else {
            const c = an.qIdx;
            Q = e[c]; tQ = c > 0 ? dirFinal(e.slice(0, c + 1)) : dirInici(e);
            tr[an.entrada] = e.slice(c);
          }
          /* Distància de la unió: la que demana el desnivell, però mai tan poca que
             la lletra trepitgi l'anterior (la panxa de la a, el bucle de la e…) */
          g0 = Math.max(0.2 + 0.35 * Math.abs(E[1] - Q[1]), 0.16 - an.esquerra);
          dx = E[0] + g0 - Q[0];
          unioAmb = { E, tE, Q, tQ };
        } else {
          dx = cursor - an.dl.amplada_amb_punts.esquerra;
          g.verds.push([an.dl.punt_verd[0] + dx, an.dl.punt_verd[1]]);
        }
        const mou = p => p.map(q => [q[0] + dx, q[1]]);
        const mogut = tr.map(t => t && mou(t));
        if (unioAmb) {
          const { E, tE } = unioAmb;
          const Q = [unioAmb.Q[0] + dx, unioAmb.Q[1]];
          const unio = corba(E, tE, Q, unioAmb.tQ);
          g.unions.push({ E, Q, n: unio.length, abans: anterior.traç.length });
          /* el traç de sortida anterior continua amb la unió (i amb l'entrada retallada, si n'hi ha) */
          const cont = anterior.traç;
          cont.push(...unio, Q);
          if (mogut[an.entrada]) { cont.push(...mogut[an.entrada].slice(1)); mogut[an.entrada] = cont; }
        }
        mogut.forEach((t, i) => { if (t && !(unioAmb && i === an.entrada)) g.tracos.push(t); });
        /* punt de la i / j, o accent */
        an.dl.tracos.filter(t => t.tipus === 'punt').forEach(t => {
          if (!(accent && base === 'i')) g.punts.push({ x: t.x + dx, y: t.y, r: R_PUNT_I });
        });
        if (accent) {
          const cos = an.dl.tracos.filter(t => t.tipus === 'traç').flatMap(t => t.p).filter(q => q[1] > 0.8);
          const cx = base === 'i' ? an.dl.tracos.find(t => t.tipus === 'punt').x + dx : cos.reduce((a, q) => a + q[0], 0) / (cos.length || 1) + dx;
          if (accent === 'dieresi') { g.punts.push({ x: cx - 0.17, y: 1.42, r: R_PUNT_I }); g.punts.push({ x: cx + 0.17, y: 1.42, r: R_PUNT_I }); }
          else g.tracos.push(accent === 'agut' ? [[cx + 0.14, 1.66], [cx - 0.1, 1.3]] : [[cx - 0.14, 1.66], [cx + 0.1, 1.3]]);
        }
        an.dl.linies_taronja.forEach(t => g.taronja.push({ x: t.x + dx, y_baix: t.y_baix, y_dalt: t.y_dalt }));
        const sortida = mogut[an.sortida];
        anterior = {
          traç: sortida, final: sortida[sortida.length - 1], dir: dirFinal(sortida),
          vermell: [an.dl.punt_vermell[0] + dx, an.dl.punt_vermell[1]],
          senseUnio: an.dl.unio_amb_la_seguent === 'cap',
          fiDreta: Math.max(...mogut.filter(Boolean).flat().map(q => q[0]))
        };
        dreta = Math.max(dreta, an.dl.amplada_amb_punts.dreta + dx);
        continue;
      }
      /* Majúscules, números i signes: tipografia normal */
      if (/[\p{L}\p{N}.,;:!?¡¿'’«»\-()]/u.test(ch)) {
        tancaParaula();
        const x = Math.max(cursor, dreta + (g.glifs.length || g.tracos.length ? 0.15 : 0));
        const w = ampladaGlif(ch);
        g.glifs.push({ ch, x, w });
        dreta = x + w; cursor = dreta + 0.2;
        continue;
      }
      g.noDisponibles.push(ch);
    }
    tancaParaula();

    /* límits */
    const xs = [];
    g.tracos.forEach(t => t.forEach(q => xs.push(q[0])));
    g.verds.concat(g.vermells).forEach(p => { xs.push(p[0] - R_PUNT); xs.push(p[0] + R_PUNT); });
    g.glifs.forEach(gl => { xs.push(gl.x); xs.push(gl.x + gl.w); });
    g.esq = xs.length ? Math.min(...xs) - 0.06 : 0;
    g.dre = xs.length ? Math.max(...xs) + 0.06 : 1;
    g.buida = !g.tracos.length && !g.glifs.length;
    return g;
  };

  /* Puntets al llarg d'un traç, cada 0,15, sense repetir-ne on el traç torna pel mateix lloc */
  function puntets(p, posats) {
    const out = [];
    let acum = 0, seg = 0;
    const posa = q => {
      if (posats.some(r => Math.hypot(r[0] - q[0], r[1] - q[1]) < 0.6 * PUNTETS.separacio)) return;
      posats.push(q); out.push(q);
    };
    let llarg = 0;
    for (let i = 1; i < p.length; i++) llarg += dist(p[i - 1], p[i]);
    const n = Math.max(1, Math.round(llarg / PUNTETS.separacio)), pas = llarg / n;
    posa(p[0]);
    let objectiu = pas;
    for (let i = 1; i < p.length; i++) {
      seg = dist(p[i - 1], p[i]);
      while (acum + seg >= objectiu - 1e-9 && seg > 0) {
        const t = (objectiu - acum) / seg;
        posa([p[i - 1][0] + (p[i][0] - p[i - 1][0]) * t, p[i - 1][1] + (p[i][1] - p[i - 1][1]) * t]);
        objectiu += pas;
      }
      acum += seg;
    }
    return out;
  }

  AT.paraula.puntets = (p, posats) => puntets(p, posats);

  const X = x => AT.n(x * 100, 1), Y = y => AT.n((2 - y) * 100, 1);
  const cami = p => p.map((q, i) => (i ? 'L' : 'M') + X(q[0]) + ' ' + Y(q[1])).join('');

  /* Dibuixa el text en un estat: model, fletxes (com el model), gris, puntets, punts o buit */
  AT.paraula.dibuixa = function (g, estat) {
    const grup = s('g');
    if (estat === 'buit') return grup;
    const taronja = () => g.taronja.forEach(t => grup.append(s('line', { x1: X(t.x), x2: X(t.x), y1: Y(t.y_dalt), y2: Y(t.y_baix), stroke: COL.taronja, 'stroke-width': 3 })));
    const color = estat === 'gris' ? COL.repas : COL.model;
    if (estat === 'model' || estat === 'fletxes' || estat === 'gris') {
      g.tracos.forEach(t => grup.append(s('path', { d: cami(t), fill: 'none', stroke: color, 'stroke-width': GRUIX * 100, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })));
      g.punts.forEach(p => grup.append(s('circle', { cx: X(p.x), cy: Y(p.y), r: p.r * 100, fill: color })));
      taronja();
    } else if (estat === 'puntets') {
      taronja();
      const posats = [];
      g.tracos.forEach(t => puntets(t, posats).forEach(q => grup.append(s('circle', { cx: X(q[0]), cy: Y(q[1]), r: PUNTETS.radi * 100, fill: COL.model }))));
      g.punts.forEach(p => grup.append(s('circle', { cx: X(p.x), cy: Y(p.y), r: R_PUNTET_I * 100, fill: COL.model })));
    } else {
      taronja(); // només punts
    }
    if (estat !== 'punts') {
      const fs = AT.n(midaGlif() * 100, 1);
      g.glifs.forEach(gl => {
        if (estat === 'puntets') grup.append(s('text', { x: X(gl.x), y: Y(0), 'font-family': 'Raleway Dots, Raleway, sans-serif', 'font-size': fs, fill: COL.model, stroke: COL.model, 'stroke-width': 3.5, 'stroke-linejoin': 'round' }, gl.ch));
        else grup.append(s('text', { x: X(gl.x), y: Y(0), 'font-family': 'Raleway, sans-serif', 'font-weight': 300, 'font-size': fs, fill: estat === 'gris' ? COL.repas : COL.model }, gl.ch));
      });
    }
    /* Els punts verd i vermell són només per a les lletres soles: als textos no hi van. */
    return grup;
  };
})();
