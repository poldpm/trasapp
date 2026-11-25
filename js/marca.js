/* TRAÇApp — imatge de marca
   «TRAÇ» en majúscules sòlides + «app» amb la lletra lligada de l'escola en puntets.
   La fletxa 1 llegeix TRAÇA (TRAÇ + la «a» de app) i la fletxa 2 llegeix APP.
   Un sol punt verd (on comença el nom) i un sol punt vermell (on acaba), com una paraula de la fitxa.
   Colors i elements del mètode: pauta Montessori, puntets, línia taronja a les «p», fletxes #1800ad. */
window.AT = window.AT || {};

(function () {
  const { s } = AT;
  const C = {
    granat: '#810023', verd: '#00bf63', vermell: '#e0003f', vermellIcona: '#ff4f7b',
    taronja: '#ffbd59', fletxa: '#1800ad', pautaFosca: '#737373', pautaClara: '#a2a2a2'
  };
  const FONT = '"Bricolage Grotesque"';
  const ctx = document.createElement('canvas').getContext('2d');
  const mesura = (t, fs) => { ctx.font = `700 ${fs}px ${FONT}`; return ctx.measureText(t); };
  const ratioMaj = () => { const m = mesura('H', 100); return m.actualBoundingBoxAscent > 30 ? m.actualBoundingBoxAscent / 100 : 0.7; };

  /* Puntets al llarg d'un traç (unitats de pauta) */
  function puntets(p, sep, posats) {
    const out = [];
    let llarg = 0;
    for (let i = 1; i < p.length; i++) llarg += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
    const n = Math.max(1, Math.round(llarg / sep)), pas = llarg / n;
    const posa = q => { if (!posats.some(r => Math.hypot(r[0] - q[0], r[1] - q[1]) < 0.6 * pas)) { posats.push(q); out.push(q); } };
    posa(p[0]);
    let acum = 0, obj = pas;
    for (let i = 1; i < p.length; i++) {
      const seg = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
      while (seg > 0 && acum + seg >= obj - 1e-9) {
        const t = (obj - acum) / seg;
        posa([p[i - 1][0] + (p[i][0] - p[i - 1][0]) * t, p[i - 1][1] + (p[i][1] - p[i - 1][1]) * t]);
        obj += pas;
      }
      acum += seg;
    }
    return out;
  }

  /* Fletxa corba amb punta i número, com les de l'ordre del traç */
  function fletxa(svg, x1, x2, y, amunt, n, gruix, mida) {
    const h = (amunt ? -1 : 1) * mida * 1.6;
    const c1 = [x1 + (x2 - x1) * 0.18, y + h], c2 = [x2 - (x2 - x1) * 0.18, y + h];
    svg.append(s('path', { d: `M${x1} ${y} C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${x2} ${y}`, fill: 'none', stroke: C.fletxa, 'stroke-width': gruix, 'stroke-linecap': 'round' }));
    const a = Math.atan2(y - c2[1], x2 - c2[0]), L = mida * 0.85;
    const p = d => [x2 - L * Math.cos(a + d), y - L * Math.sin(a + d)];
    const [ax, ay] = p(0.5), [bx, by] = p(-0.5);
    svg.append(s('path', { d: `M${ax} ${ay} L${x2} ${y} L${bx} ${by}`, fill: 'none', stroke: C.fletxa, 'stroke-width': gruix, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
    svg.append(s('text', { x: x1 - mida * 0.9, y: y + (amunt ? -mida * 0.2 : mida * 1.1), 'font-family': 'Poppins, Arial, sans-serif', 'font-weight': 500, 'font-size': mida * 1.25, fill: C.fletxa, 'text-anchor': 'middle' }, String(n)));
  }

  /* Logotip. opcions: { u: px per unitat de pauta, pauta: bool, fletxes: bool, color } */
  AT.marca = {};
  AT.marca.logo = function (o = {}) {
    const u = o.u || 40, pauta = o.pauta !== false, fletxes = o.fletxes !== false;
    const color = o.color || C.granat;
    const marge = fletxes ? u * 0.95 : u * 0.12;
    const top = marge, base = top + 2 * u;
    const fs = 2 * u / ratioMaj();
    const xT = u * 0.55;                       // deixa lloc al punt verd
    const wT = mesura('TRAÇ', fs).width;
    const geo = AT.paraula.construeix('app');
    const geoA = AT.paraula.construeix('a');
    const xApp = xT + wT + u * 0.12;           // on comença «app»
    const ox = xApp - geo.esq * u;             // origen de les unitats de «app»
    const fiA = ox + (geoA.dre - 0.2) * u;     // final de la «a» (per a la fletxa de TRAÇA)
    const fi = ox + geo.dre * u;
    const W = Math.ceil(fi + u * 0.5), H = Math.ceil(top + 3 * u + (fletxes ? u * 0.95 : u * 0.12));
    const svg = s('svg', { class: 'logo-tracapp', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'TRAÇApp' });

    if (pauta) {
      [[0, C.pautaFosca, 0.05], [1, C.pautaClara, 0.025], [2, C.pautaClara, 0.025], [3, C.pautaFosca, 0.05]].forEach(([k, c, w]) =>
        svg.append(s('line', { x1: 0, x2: W, y1: top + k * u, y2: top + k * u, stroke: c, 'stroke-width': Math.max(1, w * u) })));
    }
    /* TRAÇ */
    svg.append(s('text', { x: xT, y: base, 'font-family': 'Bricolage Grotesque, Figtree, sans-serif', 'font-weight': 700, 'font-size': fs, fill: color }, 'TRAÇ'));
    /* app: línies taronja de les «p» per sota dels puntets */
    const X = x => ox + x * u, Y = y => base - y * u;
    geo.taronja.forEach(t => svg.append(s('line', { x1: X(t.x), x2: X(t.x), y1: Y(t.y_dalt), y2: Y(t.y_baix), stroke: C.taronja, 'stroke-width': Math.max(1.2, 0.05 * u) })));
    const radi = Math.max(0.9, (o.radiPuntet || 0.06) * u), sep = o.separacio || 0.17;
    const posats = [];
    geo.tracos.forEach(t => puntets(t, sep, posats).forEach(q => svg.append(s('circle', { cx: AT.n(X(q[0]), 2), cy: AT.n(Y(q[1]), 2), r: AT.n(radi, 2), fill: color }))));
    /* un sol punt verd (inici del nom) i un sol punt vermell (final) */
    const rp = Math.max(3.4, 0.13 * u); // punts verd i vermell: visibles també en petit
    svg.append(s('circle', { cx: xT - u * 0.28, cy: base - rp * 0.2, r: rp, fill: C.verd }));
    const [vx, vy] = geo.vermells[0];
    svg.append(s('circle', { cx: X(vx), cy: Y(vy), r: rp, fill: C.vermell }));
    if (fletxes) {
      const g = Math.max(1.4, 0.06 * u), m = u * 0.32;
      fletxa(svg, xT + u * 0.05, fiA, top - u * 0.22, true, 1, g, m);
      fletxa(svg, xApp + u * 0.1, fi - u * 0.1, top + 3 * u + u * 0.22, false, 2, g, m);
    }
    return svg;
  };

  /* Icona: la ç de l'escola, gruixuda, amb la cua d'entrada en puntets que es fa traç sòlid */
  AT.marca.icona = function (px = 100) {
    const dl = AT.LLETRES.lletres['ç'];
    const k = 28, oy = 8; // px per unitat i posició de la línia de dalt
    const X = x => 23 + x * k, Y = y => oy + (2 - y) * k;
    const svg = s('svg', { viewBox: '0 0 100 100', width: px, height: px, class: 'icona-tracapp', role: 'img', 'aria-label': 'TRAÇApp' });
    svg.append(s('rect', { width: 100, height: 100, rx: 23, fill: C.granat }));
    [[2, 0.22], [1, 0.12], [0, 0.12], [-1, 0.22]].forEach(([y, o]) => svg.append(s('line', { x1: 0, x2: 100, y1: Y(y), y2: Y(y), stroke: '#fff', 'stroke-opacity': o, 'stroke-width': 0.9 })));
    const tr = dl.tracos.filter(t => t.tipus === 'traç').map(t => t.p);
    /* tros inicial en puntets, la resta sòlida i gruixuda */
    const primer = tr[0];
    const tall = Math.floor(primer.length * 0.42);
    const cami = p => p.map((q, i) => (i ? 'L' : 'M') + AT.n(X(q[0]), 2) + ' ' + AT.n(Y(q[1]), 2)).join('');
    puntets(primer.slice(0, tall + 1), 0.2, []).forEach(q => svg.append(s('circle', { cx: AT.n(X(q[0]), 2), cy: AT.n(Y(q[1]), 2), r: 2.1, fill: '#fff' })));
    const solid = [primer.slice(tall), ...tr.slice(1)];
    solid.forEach(p => svg.append(s('path', { d: cami(p), fill: 'none', stroke: '#fff', 'stroke-width': 6.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })));
    const [vx, vy] = dl.punt_verd, [rx, ry] = dl.punt_vermell;
    svg.append(s('circle', { cx: X(vx), cy: Y(vy), r: 5.6, fill: C.verd, stroke: C.granat, 'stroke-width': 1.6 }));
    svg.append(s('circle', { cx: X(rx), cy: Y(ry), r: 5.6, fill: C.vermellIcona, stroke: C.granat, 'stroke-width': 1.6 }));
    return svg;
  };

  /* Icona com a text SVG (per a la pestanya del navegador) */
  AT.marca.iconaText = px => new XMLSerializer().serializeToString(AT.marca.icona(px));

  /* Posa el logotip a la barra i la icona a la pestanya, quan les tipografies ja són a punt */
  AT.posaMarca = function () {
    const lloc = document.getElementById('logo-barra');
    if (lloc) lloc.replaceChildren(AT.marca.logo({ u: 15, pauta: false, fletxes: false, radiPuntet: 0.09, separacio: 0.2 }));
    try {
      let l = document.querySelector('link[rel="icon"]');
      if (!l) { l = document.createElement('link'); l.rel = 'icon'; document.head.append(l); }
      l.type = 'image/svg+xml';
      l.href = 'data:image/svg+xml,' + encodeURIComponent(AT.marca.iconaText(64));
    } catch (e) { /* sense icona dinàmica */ }
  };
})();
