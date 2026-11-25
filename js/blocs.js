/* TRAÇApp — blocs de les fitxes del dossier
   - caixa: pauta en caixa (rectangle amb les dues línies del mig puntejades) amb text
            en lligada (lletra de l'escola) o en pal (majúscules Raleway / Raleway Dots).
   - text: text normal (enunciats, «Dibuixa què és:», la dita per llegir…).
   - sanefa: caixa de pauta amb un patró que comença i l'alumne continua.
   - pauta: files de pauta Montessori buides.
   - imatge: dibuix gran (portada, mandala, full lliure). El gestiona la paginació.
   Tots els blocs tornen { rowH, fila(), avisos } com les files de pauta. */
window.AT = window.AT || {};

(function () {
  const { h, s } = AT;
  const L = AT.LLETRES;
  const COL = L.colors;
  const LINIA = { fosca: '#737373', mig: '#a2a2a2' };
  const MIDES_CAIXA = { gran: 5, mitjana: 4, petita: 3.3 }; // mm per franja (la caixa fa 3 franges)

  /* ---------- Majúscules (pal) ---------- */
  const ctx = document.createElement('canvas').getContext('2d');
  let ratioPal = 0.71;
  AT.blocsMetrica = function () {
    ctx.font = '100px "Raleway Dots"';
    const m = ctx.measureText('H');
    if (m.actualBoundingBoxAscent > 30) ratioPal = m.actualBoundingBoxAscent / 100;
  };
  const midaPal = u => 2 * u / ratioPal; // les majúscules van de la base a la línia de dalt
  const ampladaPal = (text, u) => { ctx.font = `100px "Raleway Dots"`; return ctx.measureText(text).width / 100 * midaPal(u); };

  /* Amplada d'un text en mm, en lligada o en pal */
  function amplada(text, lletra, u) {
    if (lletra === 'pal') return ampladaPal(text, u);
    const g = AT.paraula.construeix(text);
    return g.buida ? 0 : (g.dre - g.esq) * u;
  }

  /* Parteix un text en línies que càpiguen (respecta els salts de línia que hi hagi) */
  AT.motor.partirLinies = function (text, lletra, Wmax, u) {
    const out = [];
    String(text || '').split(/\n+/).map(t => t.trim()).filter(Boolean).forEach(par => {
      let actual = '';
      par.split(/\s+/).forEach(paraula => {
        const prova = actual ? actual + ' ' + paraula : paraula;
        if (actual && amplada(prova, lletra, u) > Wmax) { out.push(actual); actual = paraula; } else actual = prova;
      });
      if (actual) out.push(actual);
    });
    return out;
  };

  /* Dibuixa una caixa de pauta (amb o sense text) a l'SVG */
  function caixaPauta(svg, x, y, w, u, ambVores) {
    if (ambVores !== false) svg.append(s('rect', { x, y, width: w, height: 3 * u, fill: 'none', stroke: LINIA.fosca, 'stroke-width': 0.35 }));
    [1, 2].forEach(k => svg.append(s('line', { x1: x + 0.8, x2: x + w - 0.8, y1: y + k * u, y2: y + k * u, stroke: LINIA.mig, 'stroke-width': 0.22, 'stroke-dasharray': '0.7 0.6' })));
  }

  /* Escriu un text dins d'una caixa, centrat; torna false si no hi cap */
  function textACaixa(svg, text, lletra, estil, x, y, w, u) {
    if (!text || estil === 'buit') return true;
    const marge = Math.min(4, u);
    if (lletra === 'pal') {
      let mu = u;
      const wt = ampladaPal(text, mu);
      if (wt > w - 2 * marge) mu = u * (w - 2 * marge) / wt;
      const base = y + 2 * u;
      const attrs = { x: x + w / 2, y: base, 'text-anchor': 'middle', 'font-size': AT.n(midaPal(mu), 2) };
      if (estil === 'puntets') svg.append(s('text', Object.assign(attrs, { 'font-family': 'Raleway Dots, Raleway, sans-serif', fill: COL.model, stroke: COL.model, 'stroke-width': AT.n(0.035 * mu, 3), 'stroke-linejoin': 'round' }), text));
      else svg.append(s('text', Object.assign(attrs, { 'font-family': 'Raleway, sans-serif', 'font-weight': 300, fill: estil === 'gris' ? COL.repas : COL.model }), text));
      return wt <= w - 2 * marge;
    }
    const g = AT.paraula.construeix(text);
    if (g.buida) return true;
    let mu = u;
    const wt = (g.dre - g.esq) * u;
    if (wt > w - 2 * marge) mu = u * (w - 2 * marge) / wt;
    const ample = (g.dre - g.esq) * mu;
    const ox = x + (w - ample) / 2 - g.esq * mu;
    /* la línia de base de la lletra coincideix amb la segona línia de la caixa */
    const grup = s('g', { transform: `translate(${AT.n(ox, 3)} ${AT.n(y + 2 * u - 2 * mu, 3)}) scale(${AT.n(mu / 100, 5)})` });
    grup.append(AT.paraula.dibuixa(g, estil === 'model' ? 'model' : estil));
    svg.append(grup);
    return wt <= w - 2 * marge;
  }

  /* ---------- Bloc caixa ---------- */
  AT.motor.caixa = function (bloc, fitxa, W) {
    const u = MIDES_CAIXA[bloc.mida] || MIDES_CAIXA.mitjana;
    const aire = 2.5;
    const rowH = 3 * u + aire;
    const avisos = [];
    function fila() {
      const svg = s('svg', { class: 'fila', width: W + 'mm', height: rowH + 'mm', viewBox: `0 0 ${W} ${rowH}`, overflow: 'visible' });
      const y = aire / 2;
      if (bloc.amplada === 'parella') {
        const w = W * 0.42, gap = W * 0.06, x0 = (W - 2 * w - gap) / 2;
        caixaPauta(svg, x0, y, w, u); caixaPauta(svg, x0 + w + gap, y, w, u);
        textACaixa(svg, bloc.text, bloc.lletra, bloc.estil, x0, y, w, u);
      } else {
        const w = bloc.amplada === 'centrada' ? W * 0.6 : W;
        const x = (W - w) / 2;
        if (bloc.pauta !== false) caixaPauta(svg, x, y, w, u);
        textACaixa(svg, bloc.text, bloc.lletra, bloc.estil, x, y, w, u);
      }
      return svg;
    }
    if (bloc.text && bloc.estil !== 'buit') {
      const w = bloc.amplada === 'parella' ? W * 0.42 : bloc.amplada === 'centrada' ? W * 0.6 : W;
      if (amplada(bloc.text, bloc.lletra, u) > w - 2 * Math.min(4, u)) avisos.push(`«${bloc.text}» no cabia a la caixa i s’ha fet més petit.`);
    }
    return { rowH, fila, avisos, continu: false };
  };

  /* ---------- Bloc text ---------- */
  AT.motor.text = function (bloc, fitxa, W) {
    const pt = Number(bloc.midaText) || 14;
    const mm = pt * 0.3528;
    const linies = Math.max(1, String(bloc.text || '').split('\n').length);
    const rowH = linies * mm * 1.35 + 1.5;
    function fila() {
      return h('div', {
        class: 'bloc-text', style: {
          height: rowH + 'mm', fontSize: pt + 'pt', fontWeight: bloc.negreta ? 700 : 400,
          textAlign: bloc.alineacio || 'left', lineHeight: 1.35, whiteSpace: 'pre-line'
        }
      }, bloc.text || '');
    }
    return { rowH, fila, avisos: [], continu: false };
  };

  /* ---------- Bloc sanefa ---------- */
  AT.motor.sanefa = function (bloc, fitxa, W) {
    const u = MIDES_CAIXA[bloc.mida] || MIDES_CAIXA.gran;
    const aire = 2.5, rowH = 3 * u + aire;
    const model = Math.max(1, Number(bloc.model) || 2);
    function fila() {
      const svg = s('svg', { class: 'fila', width: W + 'mm', height: rowH + 'mm', viewBox: `0 0 ${W} ${rowH}`, overflow: 'visible' });
      const y = aire / 2, alt = 3 * u, pad = 1.6;
      caixaPauta(svg, 0, y, W, u);
      if (bloc.modeSanefa === 'imatge') {
        const mida = alt - 2 * pad;
        if (!bloc.imatge) { svg.append(s('text', { x: W / 2, y: y + alt / 2 + 1.2, 'text-anchor': 'middle', 'font-size': 3.2, fill: '#b0a0a6', class: 'nomes-pantalla' }, 'Puja un dibuixet per a la sanefa')); return svg; }
        const pas = mida * 1.25, n = Math.floor((W - 2 * pad) / pas);
        for (let i = 0; i < n; i++) {
          const visible = i < model;
          if (!visible && bloc.resta === 'buit') continue;
          svg.append(s('image', { href: bloc.imatge, x: pad + i * pas, y: y + pad, width: mida, height: mida, preserveAspectRatio: 'xMidYMid meet', opacity: visible ? 1 : 0.28 }));
        }
        return svg;
      }
      const forma = AT.formes[bloc.forma] || AT.formes.merlets;
      const a = alt * 0.62, w = W - 2 * pad - 2;
      const d = forma.fn(w, a);
      const x0 = pad + 1, y0 = y + (alt - a) / 2;
      const cami = p => p.map((q, i) => (i ? 'L' : 'M') + AT.n(q.x + x0, 2) + ' ' + AT.n(q.y + y0, 2)).join('');
      const solid = dd => svg.append(s('path', { d: dd, fill: 'none', stroke: COL.model, 'stroke-width': 0.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
      const punts = dd => svg.append(s('path', { d: dd, fill: 'none', stroke: COL.model, 'stroke-width': 0.75, 'stroke-dasharray': '0 1.9', 'stroke-linecap': 'round' }));
      if (d.separats) {
        d.tracos.forEach((p, i) => { if (i < model) solid(cami(p)); else if (bloc.resta !== 'buit') punts(cami(p)); });
      } else {
        const p = d.tracos[0];
        const lim = d.periode * model;
        const k = p.findIndex(q => q.x > lim);
        const tall = k < 0 ? p.length : k + 1;
        solid(cami(p.slice(0, tall)));
        if (bloc.resta !== 'buit' && tall < p.length) punts(cami(p.slice(tall - 1)));
      }
      return svg;
    }
    return { rowH, fila, avisos: [], continu: false };
  };

  /* ---------- Bloc pauta buida ---------- */
  AT.motor.pauta = function (bloc, fitxa, W) {
    return AT.motor.fila(Object.assign({}, bloc, { tipus: 'fila', lletra: 'a', columnes: ['buit'] }), fitxa, W);
  };

  /* ---------- Capçalera B: logotip + «Nom:» i «Data:» amb caixa de pauta ---------- */
  AT.motor.ALCADA_CAPCALERA = 30; // mm (capçalera + espai a sota)
  AT.motor.capcalera = function (fitxa) {
    const maj = !!fitxa.majuscules;
    const camp = text => {
      const svg = s('svg', { width: '62mm', height: '9mm', viewBox: '0 0 62 9' });
      const u = 2.9;
      caixaPauta(svg, 0.2, 0.25, 61.6, u);
      return h('div', { class: 'capb-camp' }, h('span', { class: 'capb-etiqueta' }, maj ? text.toUpperCase() : text), svg);
    };
    return h('div', { class: 'capb' },
      h('img', { class: 'capb-logo', src: AT.LOGO_ESCOLA, alt: 'Vedruna Escorial Vic' }),
      h('div', { class: 'capb-camps' }, camp('Nom:'), camp('Data:')));
  };
})();
