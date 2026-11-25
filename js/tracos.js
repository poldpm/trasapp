/* TRAÇApp — traços de grafomotricitat amb el mètode de l'escola
   Cada traç és una unitat, com una lletra:
   - comença en un punt verd i acaba en un punt vermell;
   - porta una fletxa taronja que indica la direcció d'inici;
   - TOTS els extrems i canvis de direcció cauen exactament sobre una línia de la pauta
     (y = 0 línia de base, y = 1 línia del mig, y = 2 línia de dalt), perquè l'alumne
     tingui sempre una referència per saber fins on ha d'arribar.
   Unitats: les de la pauta. «h» és l'alçada del traç (1 = fins a la línia del mig,
   2 = fins a la línia de dalt). */
window.AT = window.AT || {};

(function () {
  const { s } = AT;
  const L = AT.LLETRES;
  const COL = L.colors;
  const GRUIX = L.unitats['gruix_traç'];
  const R_PUNT = L.unitats.radi_punts_inici_final;
  const TARONJA_FLETXA = '#f0892b';

  const arc = (cx, cy, r, a0, a1, n = 40) => Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + (a1 - a0) * i / n; return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
  const recta = (a, b, n = 12) => Array.from({ length: n + 1 }, (_, i) => [a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n]);
  const uneix = (...trossos) => trossos.reduce((acc, t) => acc.concat(acc.length ? t.slice(1) : t), []);

  /* Cada definició torna { p: polilínia, fletxa: [x, y, dx, dy] } */
  AT.TRACOS = {
    pal: {
      nom: 'Pal', fn: h => ({ p: recta([0, h], [0, 0]), fletxa: ['esq', 0, -1] })
    },
    copa: {
      nom: 'Copa', fn: h => {
        const w = 0.7 * h, r = w / 2;
        return { p: uneix(recta([0, 0], [0, h - r]), arc(r, h - r, r, Math.PI, 0), recta([w, h - r], [w, 0])), fletxa: ['esq', 0, 1] };
      }
    },
    garlanda: {
      nom: 'Garlanda', fn: h => {
        const w = 0.7 * h, r = w / 2;
        return { p: uneix(recta([0, h], [0, r]), arc(r, r, r, Math.PI, 2 * Math.PI), recta([w, r], [w, h])), fletxa: ['esq', 0, -1] };
      }
    },
    pont: {
      nom: 'Pont', fn: h => {
        const w = 0.9 * h;
        return { p: Array.from({ length: 49 }, (_, i) => { const t = i / 48; return [w * t, h * Math.sin(Math.PI * t)]; }), fletxa: ['esq', 0.5, 1] };
      }
    },
    ona: {
      nom: 'Ona', fn: h => {
        const w = 0.9 * h;
        return { p: Array.from({ length: 49 }, (_, i) => { const t = i / 48; return [w * t, h - h * Math.sin(Math.PI * t)]; }), fletxa: ['esq', 0.5, -1] };
      }
    },
    diagonal: {
      nom: 'Diagonal', fn: h => ({ p: recta([0, 0], [0.6 * h, h]), fletxa: ['esq', 0.6, 1] })
    },
    punxa: {
      nom: 'Punxa', fn: h => ({ p: uneix(recta([0, 0], [0.35 * h, h]), recta([0.35 * h, h], [0.7 * h, 0])), fletxa: ['esq', 0.35, 1] })
    },
    vall: {
      nom: 'Vall', fn: h => ({ p: uneix(recta([0, h], [0.35 * h, 0]), recta([0.35 * h, 0], [0.7 * h, h])), fletxa: ['esq', 0.35, -1] })
    },
    merlet: {
      nom: 'Merlet', fn: h => {
        const w = 0.6 * h;
        return { p: uneix(recta([0, 0], [0, h]), recta([0, h], [w, h]), recta([w, h], [w, 0])), fletxa: ['esq', 0, 1] };
      }
    },
    serra: {
      nom: 'Dent de serra', fn: h => {
        const w = 0.6 * h;
        return { p: uneix(recta([0, 0], [w, h]), recta([w, h], [w, 0])), fletxa: ['esq', 0.6, 1] };
      }
    },
    bucle: {
      nom: 'Bucle', fn: h => {
        /* com la «l»: puja cap a la dreta fins a dalt, fa la volta i baixa fins a la base */
        const p = Array.from({ length: 81 }, (_, i) => {
          const t = i / 80 * 2 * Math.PI;
          return [0.16 * h * t + 0.28 * h * Math.sin(t), h / 2 - (h / 2) * Math.cos(t)];
        });
        return { p, fletxa: ['esq', 0.6, 1] };
      }
    },
    rodona: {
      nom: 'Rodona', fn: h => {
        /* comença a dalt de tot (sobre la línia), gira cap a l'esquerra i torna al mateix punt */
        const r = h / 2;
        return { p: arc(r, r, r, Math.PI / 2, Math.PI / 2 + 2 * Math.PI, 80), fletxa: ['dalt', -1, 0], tancat: true };
      }
    },
    cargol: {
      nom: 'Cargol', fn: h => {
        const r = h / 2, voltes = 2.2;
        const p = Array.from({ length: 121 }, (_, i) => {
          const t = i / 120, a = Math.PI / 2 + t * voltes * 2 * Math.PI, rr = r * (1 - 0.85 * t);
          return [r + rr * Math.cos(a), r + rr * Math.sin(a)];
        });
        return { p, fletxa: ['dalt', -1, 0] };
      }
    }
  };

  /* Geometria d'un traç a l'alçada h, amb els límits per col·locar-lo en columnes */
  AT.tracos = {};
  AT.tracos.unitat = function (id, h) {
    const def = AT.TRACOS[id] || AT.TRACOS.copa;
    const d = def.fn(h);
    const p = d.p;
    const verd = p[0];
    /* si el traç es tanca (rodona), el punt vermell va just al costat del verd, sobre la mateixa línia */
    const vermell = d.tancat ? [verd[0] + 2.4 * R_PUNT, verd[1]] : p[p.length - 1];
    /* fletxa: al costat esquerre del punt d'inici, en la direcció del primer tram */
    const [lloc, dx, dy] = d.fletxa;
    const n = Math.hypot(dx, dy) || 1;
    const fl = { x: lloc === 'dalt' ? verd[0] : -0.32, y: lloc === 'dalt' ? verd[1] + 0.3 : (dy > 0 ? 0.08 : h - 0.08), dx: dx / n, dy: dy / n };
    const xs = p.map(q => q[0]).concat([fl.x - 0.1, verd[0] - R_PUNT, vermell[0] + R_PUNT]);
    return { esTraç: true, tracos: [p], verd, vermell, fletxa: fl, h, esq: Math.min(...xs) - 0.05, dre: Math.max(...xs) + 0.05 };
  };

  const X = x => AT.n(x * 100, 1), Y = y => AT.n((2 - y) * 100, 1);
  const cami = p => p.map((q, i) => (i ? 'L' : 'M') + X(q[0]) + ' ' + Y(q[1])).join('');

  function fletxa(g, f, h) {
    const llarg = Math.min(0.75, 0.38 * h + 0.15);
    const x0 = f.x, y0 = f.y, x1 = x0 + f.dx * llarg, y1 = y0 + f.dy * llarg;
    const a = Math.atan2(-(y1 - y0), x1 - x0), cap = 0.13;
    const punta = d => [x1 - cap * Math.cos(a + d), y1 + cap * Math.sin(a + d)];
    const [ax, ay] = punta(0.5), [bx, by] = punta(-0.5);
    const at = { fill: 'none', stroke: TARONJA_FLETXA, 'stroke-width': 3.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
    g.append(s('path', Object.assign({ d: `M${X(x0)} ${Y(y0)} L${X(x1)} ${Y(y1)}` }, at)));
    g.append(s('path', Object.assign({ d: `M${X(ax)} ${Y(ay)} L${X(x1)} ${Y(y1)} L${X(bx)} ${Y(by)}` }, at)));
  }

  /* Dibuixa un traç: model, gris, puntets, punts (només punts i fletxa) o buit */
  AT.tracos.dibuixa = function (un, estat) {
    const g = s('g');
    if (estat === 'buit') return g;
    if (estat === 'model' || estat === 'fletxes' || estat === 'gris') {
      un.tracos.forEach(p => g.append(s('path', { d: cami(p), fill: 'none', stroke: estat === 'gris' ? COL.repas : COL.model, 'stroke-width': GRUIX * 100, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })));
    } else if (estat === 'puntets') {
      const posats = [];
      un.tracos.forEach(p => AT.paraula.puntets(p, posats).forEach(q => g.append(s('circle', { cx: X(q[0]), cy: Y(q[1]), r: L.unitats.puntets.radi * 100, fill: COL.model }))));
    }
    fletxa(g, un.fletxa, un.h);
    g.append(s('circle', { cx: X(un.verd[0]), cy: Y(un.verd[1]), r: R_PUNT * 100, fill: COL.verd }));
    g.append(s('circle', { cx: X(un.vermell[0]), cy: Y(un.vermell[1]), r: R_PUNT * 100, fill: COL.vermell }));
    return g;
  };

  /* Miniatura per als botons de l'editor */
  AT.tracos.mini = function (id) {
    const un = AT.tracos.unitat(id, 2);
    const svg = s('svg', { viewBox: `${X(un.esq) - 10} -20 ${X(un.dre) - X(un.esq) + 20} 240`, class: 'mini-forma', 'aria-hidden': 'true' });
    svg.append(s('path', { d: cami(un.tracos[0]), fill: 'none', stroke: 'currentColor', 'stroke-width': 14, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
    return svg;
  };
})();
