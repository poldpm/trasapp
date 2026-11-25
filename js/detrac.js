/* TRAÇApp — activitats de «De traç en traç»
   Grafomotricitat fora dels dossiers del mes. Totes les activitats donen referències
   a l'alumne: punts al voltant dels quals es gira, nusos de quadrícula, línies que fan de camí.
   - voltant: sèries de bucles, ones, rodones o cargols al voltant de punts de referència.
   - colors: patró de quadrets de colors per continuar en una quadrícula.
   - quadricula: sanefa geomètrica sobre quadrícula (tots els vèrtexs en nusos).
   - copia: copiar una figura en una quadrícula o en una graella de punts (geoplà).
   - estret: camins que s'estrenyen, per traçar pel mig sense tocar les vores.
   Tots tornen { rowH, fila(), avisos, continu } com la resta de blocs. */
window.AT = window.AT || {};

(function () {
  const { s } = AT;
  const COL = AT.LLETRES.colors;
  const GRIS = '#737373', GRIS_CLAR = '#c8c8c8', NEGRE = '#2b2b2b';
  const n = x => AT.n(x, 2);
  const cami = pts => pts.map((q, i) => (i ? 'L' : 'M') + n(q[0]) + ' ' + n(q[1])).join('');
  const traç = (svg, pts, extra) => svg.append(s('path', Object.assign({ d: cami(pts), fill: 'none', stroke: GRIS, 'stroke-width': 0.75, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, extra || {})));
  const punt = (svg, x, y, r, fill) => svg.append(s('circle', { cx: n(x), cy: n(y), r, fill }));
  const W0 = () => AT.config.full.amplada - AT.config.full.marges.esquerra - AT.config.full.marges.dreta;

  /* ---------- Colors per als patrons ---------- */
  AT.detrac = {};
  AT.detrac.COLORS = ['#e53935', '#1e88e5', '#7cb342', '#fdd835', '#fb8c00', '#d81b60', '#8e24aa', '#6d4c41', '#00897b', '#f48fb1', '#3949ab', '#9e9e9e'];

  /* ---------- 1. Al voltant de punts ---------- */
  const MIDES_VOLTANT = { gran: 16, mitjana: 12, petita: 9 }; // alçada de l'element (mm)
  AT.detrac.FORMES_VOLTANT = { bucles: 'Bucles', ones: 'Ones', rodones: 'Rodones', cargols: 'Cargols' };

  /* Cada forma torna els elements (polilínies) i els punts de referència, en una franja d'alçada h,
     amb la línia de base a y = h (y creix cap avall) */
  function formaVoltant(forma, w, h) {
    const p = h * (forma === 'rodones' || forma === 'cargols' ? 1.15 : 0.95);
    const k = Math.max(1, Math.floor(w / p)), per = w / k;
    const elements = [], punts = [];
    if (forma === 'bucles') {
      /* bucles com la «l»: cada bucle tanca un punt; s'hi gira al voltant */
      const c = per / (2 * Math.PI), R = Math.max(c * 2.6, h * 0.3); // bucles rodons: el punt queda ben al mig
      let sI = 0.5; for (let it = 0; it < 40; it++) sI = Math.min(Math.PI - 0.01, (R * Math.sin(sI)) / c); // c·s = R·sin s
      for (let i = 0; i < k; i++) {
        const pts = [];
        for (let j = 0; j <= 60; j++) {
          const t = i * 2 * Math.PI + j / 60 * 2 * Math.PI;
          pts.push([c * t + R * Math.sin(t), h - (h / 2) * (1 - Math.cos(t))]);
        }
        elements.push(pts);
        const yTop = 0, yInt = h - (h / 2) * (1 - Math.cos(Math.PI - sI));
        punts.push([c * (i * 2 * Math.PI + Math.PI), (yTop + yInt) / 2]);
      }
    } else if (forma === 'ones') {
      /* ones: cada arc passa per sobre d'un punt */
      for (let i = 0; i < k; i++) {
        const pts = [];
        for (let j = 0; j <= 40; j++) { const t = j / 40; pts.push([i * per + t * per, h - h * Math.sin(Math.PI * t)]); }
        elements.push(pts);
        punts.push([i * per + per / 2, h * 0.62]);
      }
    } else if (forma === 'rodones') {
      const r = h / 2 * 0.86;
      for (let i = 0; i < k; i++) {
        const cx = i * per + per / 2, cy = h / 2;
        const pts = [];
        for (let j = 0; j <= 64; j++) { const a = -Math.PI / 2 - j / 64 * 2 * Math.PI; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
        elements.push(pts);
        punts.push([cx, cy]);
      }
    } else { // cargols: surten del punt i s'obren
      const r = h / 2 * 0.9, voltes = 2.2;
      for (let i = 0; i < k; i++) {
        const cx = i * per + per / 2, cy = h / 2;
        const pts = [];
        for (let j = 0; j <= 120; j++) { const t = j / 120, a = -Math.PI / 2 - t * voltes * 2 * Math.PI, rr = r * t; pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]); }
        elements.push(pts);
        punts.push([cx, cy]);
      }
    }
    return { elements, punts };
  }

  AT.motor.voltant = function (bloc, fitxa, W) {
    const h = MIDES_VOLTANT[bloc.mida] || MIDES_VOLTANT.mitjana;
    const pad = 4, aire = 3, rowH = h + 2 * pad + aire;
    const model = Math.max(1, Number(bloc.model) || 2);
    function fila() {
      const svg = s('svg', { class: 'fila', width: W + 'mm', height: rowH + 'mm', viewBox: `0 0 ${W} ${rowH}`, overflow: 'visible' });
      const y0 = aire / 2;
      if (bloc.caixa !== false) svg.append(s('rect', { x: 0.2, y: y0, width: W - 0.4, height: h + 2 * pad, fill: 'none', stroke: GRIS, 'stroke-width': 0.35 }));
      const { elements, punts } = formaVoltant(bloc.forma || 'bucles', W - 2 * pad - 4, h);
      const ox = pad + 2, oy = y0 + pad;
      elements.forEach((pts, i) => {
        const mogut = pts.map(q => [q[0] + ox, q[1] + oy]);
        if (i < model) traç(svg, mogut);
        else if (bloc.resta === 'puntets') traç(svg, mogut, { 'stroke-dasharray': '0 1.6', 'stroke-width': 0.6 });
      });
      punts.forEach(q => punt(svg, q[0] + ox, q[1] + oy, 0.75, NEGRE));
      /* punt verd on comença el primer element */
      const p0 = elements[0][0];
      punt(svg, p0[0] + ox, p0[1] + oy, 0.85, COL.verd);
      return svg;
    }
    return { rowH, fila, avisos: [], continu: false };
  };

  /* ---------- 2. Patró de colors en quadrícula ---------- */
  AT.motor.colors = function (bloc, fitxa, W) {
    const c = Number(bloc.cela) || 6;
    const patro = Array.isArray(bloc.patro) && bloc.patro.length ? bloc.patro : [[1, 0], [0, 1]];
    const R = patro.length, P = patro[0].length;
    const cols = Math.floor((W - 1) / c);
    const aire = 4, rowH = R * c + aire;
    const model = Math.max(1, Number(bloc.model) || 2);
    function fila() {
      const svg = s('svg', { class: 'fila', width: W + 'mm', height: rowH + 'mm', viewBox: `0 0 ${W} ${rowH}` });
      const x0 = (W - cols * c) / 2, y0 = aire / 2;
      for (let r = 0; r < R; r++) for (let k = 0; k < Math.min(cols, model * P); k++) {
        const col = patro[r][k % P];
        if (col) svg.append(s('rect', { x: n(x0 + k * c), y: n(y0 + r * c), width: c, height: c, fill: AT.detrac.COLORS[(col - 1) % AT.detrac.COLORS.length] }));
      }
      for (let r = 0; r <= R; r++) svg.append(s('line', { x1: x0, x2: x0 + cols * c, y1: n(y0 + r * c), y2: n(y0 + r * c), stroke: GRIS, 'stroke-width': r === 0 || r === R ? 0.4 : 0.2 }));
      for (let k = 0; k <= cols; k++) svg.append(s('line', { x1: n(x0 + k * c), x2: n(x0 + k * c), y1: y0, y2: y0 + R * c, stroke: GRIS, 'stroke-width': k === 0 || k === cols ? 0.4 : 0.2 }));
      return svg;
    }
    return { rowH, fila, avisos: [], continu: false };
  };

  /* ---------- 3. Sanefa geomètrica en quadrícula ---------- */
  /* Patrons: R files, P columnes per repetició, segments [x1, y1, x2, y2] en nusos (y = 0 a dalt) */
  AT.detrac.SANEFES = {
    merlets: { nom: 'Merlets', R: 2, P: 2, seg: [[0, 2, 0, 0], [0, 0, 1, 0], [1, 0, 1, 2], [1, 2, 2, 2]] },
    escala: { nom: 'Escala', R: 2, P: 2, seg: [[0, 2, 0, 1], [0, 1, 1, 1], [1, 1, 1, 0], [1, 0, 2, 0], [2, 0, 2, 2]] },
    rombes: { nom: 'Rombes', R: 2, P: 2, seg: [[0, 1, 1, 0], [1, 0, 2, 1], [2, 1, 1, 2], [1, 2, 0, 1]] },
    triangles: { nom: 'Triangles', R: 2, P: 2, seg: [[0, 2, 1, 0], [1, 0, 2, 2], [2, 2, 0, 2]] },
    zigazaga: { nom: 'Ziga-zaga', R: 2, P: 2, seg: [[0, 2, 1, 0], [1, 0, 2, 2]] },
    dents: { nom: 'Dents de serra', R: 2, P: 2, seg: [[0, 2, 2, 0], [2, 0, 2, 2]] },
    fletxes: { nom: 'Fletxes', R: 2, P: 2, seg: [[0, 0, 2, 1], [2, 1, 0, 2], [0, 2, 0, 0]] },
    quadrats: { nom: 'Quadrats', R: 2, P: 3, seg: [[0, 0, 2, 0], [2, 0, 2, 2], [2, 2, 0, 2], [0, 2, 0, 0]] },
    greca: { nom: 'Greca', R: 3, P: 4, seg: [[0, 3, 0, 0], [0, 0, 3, 0], [3, 0, 3, 2], [3, 2, 1, 2], [1, 2, 1, 1], [1, 1, 2, 1], [0, 3, 4, 3]] },
    cases: { nom: 'Cases', R: 3, P: 3, seg: [[0, 3, 0, 1], [0, 1, 1, 0], [1, 0, 2, 1], [2, 1, 2, 3], [2, 3, 0, 3], [2, 3, 3, 3]] }
  };
  AT.motor.quadricula = function (bloc, fitxa, W) {
    const c = Number(bloc.cela) || 6;
    const def = bloc.sanefa === 'propia' && bloc.segments ? { R: bloc.R || 2, P: bloc.P || 2, seg: bloc.segments } : (AT.detrac.SANEFES[bloc.sanefa] || AT.detrac.SANEFES.merlets);
    const cols = Math.floor((W - 1) / c);
    const aire = 4, rowH = def.R * c + aire;
    const model = Math.max(1, Number(bloc.model) || 2);
    function fila() {
      const svg = s('svg', { class: 'fila', width: W + 'mm', height: rowH + 'mm', viewBox: `0 0 ${W} ${rowH}` });
      const x0 = (W - cols * c) / 2, y0 = aire / 2;
      for (let r = 0; r <= def.R; r++) svg.append(s('line', { x1: x0, x2: x0 + cols * c, y1: n(y0 + r * c), y2: n(y0 + r * c), stroke: GRIS_CLAR, 'stroke-width': 0.22 }));
      for (let k = 0; k <= cols; k++) svg.append(s('line', { x1: n(x0 + k * c), x2: n(x0 + k * c), y1: y0, y2: y0 + def.R * c, stroke: GRIS_CLAR, 'stroke-width': 0.22 }));
      for (let rep = 0; rep < model && (rep + 1) * def.P <= cols; rep++) {
        def.seg.forEach(([a, b, d, e]) => svg.append(s('line', {
          x1: n(x0 + (rep * def.P + a) * c), y1: n(y0 + b * c), x2: n(x0 + (rep * def.P + d) * c), y2: n(y0 + e * c),
          stroke: NEGRE, 'stroke-width': 0.6, 'stroke-linecap': 'round'
        })));
      }
      return svg;
    }
    return { rowH, fila, avisos: [], continu: false };
  };

  /* ---------- 4. Copiar en quadrícula o en punts ---------- */
  /* Figures sobre una graella de 8 × 8 (polilínies de nusos) */
  AT.detrac.FIGURES = {
    casa: { nom: 'Casa', linies: [[[1, 8], [1, 4], [4, 1], [7, 4], [7, 8], [1, 8]], [[3, 8], [3, 5], [5, 5], [5, 8]]] },
    fletxa: { nom: 'Fletxa', linies: [[[4, 1], [7, 4], [5, 4], [5, 7], [3, 7], [3, 4], [1, 4], [4, 1]]] },
    vaixell: { nom: 'Vaixell', linies: [[[1, 6], [7, 6], [6, 7], [2, 7], [1, 6]], [[4, 6], [4, 1], [7, 5], [4, 5]]] },
    arbre: { nom: 'Arbre', linies: [[[4, 1], [7, 5], [1, 5], [4, 1]], [[3, 5], [3, 7], [5, 7], [5, 5]]] },
    peix: { nom: 'Peix', linies: [[[1, 4], [3, 2], [6, 2], [7, 4], [6, 6], [3, 6], [1, 4]], [[7, 4], [8, 2], [8, 6], [7, 4]]] },
    estrella: { nom: 'Estrella', linies: [[[4, 1], [5, 3], [7, 3], [5, 5], [6, 7], [4, 6], [2, 7], [3, 5], [1, 3], [3, 3], [4, 1]]] },
    castell: { nom: 'Castell', linies: [[[1, 7], [1, 2], [2, 2], [2, 3], [3, 3], [3, 2], [5, 2], [5, 3], [6, 3], [6, 2], [7, 2], [7, 7], [1, 7]], [[3, 7], [3, 5], [5, 5], [5, 7]]] },
    cor: { nom: 'Cor', linies: [[[4, 7], [1, 4], [1, 2], [2, 1], [3, 1], [4, 2], [5, 1], [6, 1], [7, 2], [7, 4], [4, 7]]] },
    cotxe: { nom: 'Cotxe', linies: [[[1, 6], [1, 4], [2, 4], [3, 2], [5, 2], [6, 4], [7, 4], [7, 6], [1, 6]], [[2, 6], [2, 7], [3, 7], [3, 6]], [[5, 6], [5, 7], [6, 7], [6, 6]]] },
    espelma: { nom: 'Espelma', linies: [[[3, 8], [3, 3], [5, 3], [5, 8], [3, 8]], [[4, 3], [4, 2]], [[4, 2], [3, 1], [4, 0], [5, 1], [4, 2]]] }
  };
  const MIDA_GRAELLA = 8;
  AT.motor.copia = function (bloc, fitxa, W) {
    const parells = Number(bloc.parells) === 2 ? 2 : 1;
    const N = MIDA_GRAELLA;
    const gap = parells === 2 ? 6 : 12;
    const ample = (W - (parells * 2 - 1) * gap) / (parells * 2);
    const c = Math.min(ample / N, parells === 2 ? 4.6 : 7.5);
    const costat = c * N;
    const aire = 5, rowH = costat + aire;
    const figures = (bloc.figures || ['casa', 'fletxa']).slice(0, parells);
    function graella(svg, x0, y0) {
      if (bloc.graella === 'punts') {
        for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) punt(svg, x0 + i * c, y0 + j * c, Math.max(0.35, c * 0.07), GRIS);
        svg.append(s('rect', { x: n(x0 - c * 0.5), y: n(y0 - c * 0.5), width: n(costat + c), height: n(costat + c), fill: 'none', stroke: GRIS, 'stroke-width': 0.35 }));
      } else {
        for (let i = 0; i <= N; i++) {
          const w = i === 0 || i === N ? 0.4 : 0.2;
          svg.append(s('line', { x1: n(x0 + i * c), x2: n(x0 + i * c), y1: y0, y2: n(y0 + costat), stroke: GRIS, 'stroke-width': w }));
          svg.append(s('line', { x1: x0, x2: n(x0 + costat), y1: n(y0 + i * c), y2: n(y0 + i * c), stroke: GRIS, 'stroke-width': w }));
        }
      }
    }
    function fila() {
      const svg = s('svg', { class: 'fila', width: W + 'mm', height: rowH + 'mm', viewBox: `0 0 ${W} ${rowH}`, overflow: 'visible' });
      const total = parells * 2 * costat + (parells * 2 - 1) * gap;
      let x = (W - total) / 2;
      const y0 = aire / 2 + (bloc.graella === 'punts' ? c * 0.5 : 0);
      figures.forEach(fid => {
        const fig = fid && typeof fid === 'object' ? fid : (AT.detrac.FIGURES[fid] || AT.detrac.FIGURES.casa);
        graella(svg, x, y0);
        fig.linies.forEach(l => traç(svg, l.map(([a, b]) => [x + a * c, y0 + b * c]), { stroke: NEGRE, 'stroke-width': 0.7 }));
        x += costat + gap;
        graella(svg, x, y0);
        x += costat + gap;
      });
      return svg;
    }
    return { rowH: rowH + (bloc.graella === 'punts' ? c : 0), fila, avisos: [], continu: false };
  };

  /* ---------- 5. Camins que s'estrenyen ---------- */
  AT.motor.estret = function (bloc, fitxa, W) {
    const g0 = Number(bloc.ampleInici) || 16, g1 = Number(bloc.ampleFinal) || 4;
    const amp = bloc.forma === 'recte' ? 0 : (Number(bloc.ona) || 6);
    const aire = 4, rowH = g0 + amp * 2 + aire;
    function fila() {
      const svg = s('svg', { class: 'fila', width: W + 'mm', height: rowH + 'mm', viewBox: `0 0 ${W} ${rowH}` });
      const yc = rowH / 2, x0 = 3, x1 = W - 3, L = x1 - x0;
      const centre = t => {
        if (bloc.forma === 'ona') return yc - amp * Math.sin(t * 4 * Math.PI);
        if (bloc.forma === 'zigazaga') { const f = (t * 4) % 1; return yc - amp * (f < 0.5 ? 4 * f - 1 : 3 - 4 * f); }
        return yc;
      };
      const vora = sig => Array.from({ length: 121 }, (_, i) => { const t = i / 120, g = g0 + (g1 - g0) * t; return [x0 + t * L, centre(t) + sig * g / 2]; });
      traç(svg, vora(-1), { stroke: NEGRE, 'stroke-width': 0.5 });
      traç(svg, vora(1), { stroke: NEGRE, 'stroke-width': 0.5 });
      punt(svg, x0 + 1.5, centre(0), 1, COL.verd);
      punt(svg, x1 - 1.5, centre(1), 1, COL.vermell);
      return svg;
    }
    return { rowH, fila, avisos: [], continu: false };
  };

  /* ---------- Capçalera de «De traç en traç» ---------- */
  AT.motor.capcaleraDetrac = function (fitxa) {
    const { h } = AT;
    const curs = AT.config.cursos[fitxa.curs];
    const camp = text => {
      const svg = s('svg', { width: '62mm', height: '9mm', viewBox: '0 0 62 9' });
      svg.append(s('rect', { x: 0.2, y: 0.25, width: 61.6, height: 8.5, fill: 'none', stroke: GRIS, 'stroke-width': 0.35 }));
      [1, 2].forEach(k => svg.append(s('line', { x1: 1, x2: 61, y1: 0.25 + k * 2.83, y2: 0.25 + k * 2.83, stroke: '#a2a2a2', 'stroke-width': 0.22, 'stroke-dasharray': '0.7 0.6' })));
      return h('div', { class: 'capb-camp' }, h('span', { class: 'capb-etiqueta' }, text), svg);
    };
    /* un traç de puntets que va del punt verd al vermell, sota el títol */
    const motiu = s('svg', { class: 'detrac-motiu', viewBox: '0 0 60 8', width: '52mm', height: '7mm' });
    const pts = Array.from({ length: 61 }, (_, i) => { const x = 3 + i * 0.9; return [x, 4 - 2.6 * Math.sin((x - 3) / 54 * 3 * 2 * Math.PI)]; });
    motiu.append(s('path', { d: cami(pts), fill: 'none', stroke: '#810023', 'stroke-width': 0.7, 'stroke-dasharray': '0 1.7', 'stroke-linecap': 'round' }));
    motiu.append(s('circle', { cx: pts[0][0], cy: pts[0][1], r: 1.2, fill: COL.verd }));
    const fi = pts[pts.length - 1];
    motiu.append(s('circle', { cx: fi[0], cy: fi[1], r: 1.2, fill: COL.vermell }));
    return h('div', { class: 'capb capd' },
      h('div', { class: 'capd-esq' },
        h('img', { class: 'capd-logo', src: AT.LOGO_ESCOLA, alt: 'Vedruna Escorial Vic' }),
        h('div', { class: 'capd-titol' },
          h('span', { class: 'capd-nom' }, 'De traç en traç'),
          motiu,
          h('span', { class: 'capd-curs' }, curs ? curs.nom : ''))),
      h('div', { class: 'capb-camps' }, camp('Nom:'), camp('Data:')));
  };

  /* Estrelles de dificultat (referència per a la mestra) */
  AT.detrac.estrelles = function (nivell, mida = 14) {
    const svg = s('svg', { class: 'estrelles', viewBox: `0 0 ${nivell * 24} 24`, width: nivell * mida + 'px', height: mida + 'px', role: 'img', 'aria-label': 'Dificultat ' + nivell + ' de 3' });
    for (let i = 0; i < nivell; i++) {
      const pts = Array.from({ length: 10 }, (_, k) => { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 4.6 : 11; return [12 + i * 24 + r * Math.cos(a), 12.5 + r * Math.sin(a)]; });
      svg.append(s('polygon', { points: pts.map(q => q.map(v => v.toFixed(2)).join(',')).join(' '), fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6, 'stroke-linejoin': 'round' }));
    }
    return svg;
  };
})();
