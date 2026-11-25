/* TRAÇApp — pantalles de l'aplicació */
window.AT = window.AT || {};

(function () {
  const { h, s, icona } = AT;
  const C = AT.config;
  AT.vistes = {};

  /* ---------- Peces comunes ---------- */
  function molles(passos) {
    return h('nav', { class: 'molles', 'aria-label': 'On ets' },
      h('ol', null, passos.map((p, i) => h('li', null,
        i < passos.length - 1 ? h('a', { href: '#' + p.ruta }, p.text) : h('span', { 'aria-current': 'page' }, p.text)))));
  }

  /* Número de curs sobre una pauta Montessori (les xifres arriben a la línia de dalt) */
  function pautaTitol(parts, opts = {}) {
    const b = opts.franja || 10, W = opts.amplada || 220;
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.font = '700 100px "Bricolage Grotesque"';
    const ratio = (ctx.measureText('H').actualBoundingBoxAscent || 70) / 100;
    const fs = 2 * b / ratio;
    const H = b * 3 + 4;
    const svg = s('svg', { class: 'pauta-titol ' + (opts.class || ''), viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': parts.map(p => p.t).join('') });
    const y0 = 2;
    [[0, 'ext'], [b, 'int'], [2 * b, 'int'], [3 * b, 'ext']].forEach(([y, t]) =>
      svg.append(s('line', { x1: 0, x2: W, y1: y0 + y, y2: y0 + y, class: 'pt-' + t })));
    svg.append(s('text', { x: opts.x || 3, y: y0 + 2 * b, 'font-size': fs, class: 'pt-model' }, parts.map(p => p.t).join('')));
    return svg;
  }
  AT.pautaTitol = pautaTitol;

  /* Miniatura del primer full d'una fitxa */
  function miniatura(fitxa, ample) {
    const PX = 3.7795;
    const esc = ample / (C.full.amplada * PX);
    const { fulls } = AT.motor.fulls(fitxa);
    const marc = h('div', { class: 'mini-full', style: { width: ample + 'px', height: (C.full.alcada * PX * esc) + 'px' }, 'aria-hidden': 'true' });
    const dins = fulls[0];
    dins.style.transform = `scale(${esc})`;
    dins.style.transformOrigin = '0 0';
    marc.append(dins);
    return marc;
  }

  function targetaFitxa(f, onCanvi) {
    const curs = C.cursos[f.curs], area = C.arees[f.area];
    const confirma = h('div', { class: 'confirma', hidden: true },
      h('span', null, 'Vols esborrar aquesta fitxa?'),
      h('button', { class: 'boto boto-perill boto-petit', type: 'button', onclick: () => { AT.store.esborra(f.id); AT.avis('Fitxa esborrada'); onCanvi(); } }, 'Esborra'),
      h('button', { class: 'boto boto-petit', type: 'button', onclick: () => { confirma.hidden = true; } }, 'Cancel·la'));
    return h('article', { class: 'targeta-fitxa' },
      h('a', { href: '#fitxa-' + f.id, class: 'targeta-fitxa-enllac', 'aria-label': 'Obre ' + f.titol },
        miniatura(f, 132)),
      h('div', { class: 'targeta-fitxa-text' },
        h('h3', null, h('a', { href: '#fitxa-' + f.id }, f.titol || 'Sense títol')),
        h('p', { class: 'etiquetes' },
          h('span', { class: 'xip' }, curs ? curs.curt : '?'),
          area ? h('span', { class: 'xip xip-suau' }, area.nom) : null,
          f.mes ? h('span', { class: 'xip xip-suau' }, AT.nomMes(f.mes)) : null,
          f.coleccio === 'detrac' && f.nivell ? h('span', { class: 'dificultat' }, AT.detrac.estrelles(f.nivell, 13)) : null),
        h('p', { class: 'meta' }, 'Modificada ' + AT.data(f.modificat)),
        h('div', { class: 'accions-fitxa' },
          h('button', { class: 'boto-icona', type: 'button', title: 'Duplica', 'aria-label': 'Duplica ' + f.titol, onclick: () => { AT.store.duplica(f.id); AT.avis('Fitxa duplicada'); onCanvi(); } }, icona('copia', 18)),
          h('button', { class: 'boto-icona', type: 'button', title: 'Esborra', 'aria-label': 'Esborra ' + f.titol, onclick: () => { confirma.hidden = false; } }, icona('paperera', 18))),
        confirma));
  }

  function llistaFitxes(filtre, buit) {
    const zona = h('div', { class: 'llista-fitxes' });
    const pinta = () => {
      zona.replaceChildren();
      const fs = AT.store.fitxes().filter(f => !f.esborrany).filter(filtre);
      if (!fs.length) { zona.append(h('p', { class: 'buit' }, buit)); return; }
      fs.forEach(f => zona.append(targetaFitxa(f, pinta)));
    };
    pinta();
    return zona;
  }

  /* ---------- Inici: tria el curs ---------- */
  AT.vistes.inici = function () {
    const fitxes = AT.store.fitxes().filter(f => !f.esborrany);
    const compte = id => fitxes.filter(f => f.curs === id).length;
    return h('div', { class: 'vista vista-inici' },
      h('section', { class: 'portada' },
        h('div', { class: 'portada-logo' }, AT.marca.logo({ u: 46 })),
        h('h1', { class: 'sr' }, 'TRAÇApp'),
        h('p', { class: 'portada-text' }, 'Les fitxes d’Art del traç, amb la lletra de l’escola: cal·ligrafia i grafomotricitat de 1r i 2n, a punt per imprimir.')),
      h('section', { class: 'seccio' },
        h('h2', { class: 'titol-seccio' }, 'Tria el curs'),
        h('div', { class: 'graella-cursos' },
          Object.values(C.cursos).map(c => h('a', { class: 'tria-curs', href: '#' + c.id },
            h('span', { class: 'tria-curs-num' }, pautaTitol([{ t: c.curt }], { franja: 11, amplada: 52, x: 4, class: 'pauta-num' })),
            h('span', { class: 'tria-curs-text' },
              h('strong', null, c.ordinal + ' de primària'),
              h('span', null, compte(c.id) === 1 ? '1 fitxa desada' : compte(c.id) + ' fitxes desades')),
            icona('endavant', 22))))),
      h('section', { class: 'seccio' },
        h('div', { class: 'capcalera-seccio' },
          h('h2', { class: 'titol-seccio' }, 'Últimes fitxes'),
          fitxes.length ? h('a', { href: '#fitxes', class: 'enllac' }, 'Veure-les totes') : null),
        llistaFitxes(() => true, 'Encara no hi ha cap fitxa. Tria un curs per començar la primera.'))
    );
  };

  /* ---------- Curs: cal·ligrafia o grafomotricitat ---------- */
  AT.vistes.curs = function (cursId) {
    const c = C.cursos[cursId];
    const actual = AT.mesActual();
    return h('div', { class: 'vista' },
      molles([{ ruta: 'inici', text: 'Inici' }, { text: c.nom }]),
      h('h1', { class: 'titol-vista' }, c.nom),
      h('p', { class: 'subtitol' }, 'Tria el mes. Cada mes és un dossier amb la portada, la dita, les lletres, la grafomotricitat i els extres.'),
      (() => {
        const fs = AT.store.dossier(cursId, 'detrac');
        return h('a', { class: 'tria-detrac', href: `#${cursId}-detrac` },
          h('span', { class: 'tria-detrac-motiu', 'aria-hidden': 'true' }, motiuDetrac()),
          h('span', { class: 'tria-detrac-text' },
            h('strong', null, 'De traç en traç'),
            h('span', null, 'Grafomotricitat fora dels dossiers del mes: al voltant de punts, quadrícules, còpia de figures i camins.'),
            h('span', { class: 'meta' }, fs.length ? (fs.length === 1 ? '1 fitxa' : fs.length + ' fitxes') : 'Encara buit')),
          icona('endavant', 22));
      })(),
      h('h2', { class: 'titol-seccio' }, 'Dossiers del mes'),
      h('div', { class: 'graella-mesos' }, C.mesos.map(([id, nom]) => {
        const fs = AT.store.dossier(cursId, id);
        return h('a', { class: 'tria-mes' + (id === actual ? ' actual' : ''), href: `#${cursId}-${id}` },
          fs.length ? miniatura(fs[0], 92) : h('span', { class: 'mes-buit', 'aria-hidden': 'true' }),
          h('span', { class: 'tria-mes-text' },
            h('strong', null, nom),
            h('span', null, fs.length ? (fs.length === 1 ? '1 fitxa' : fs.length + ' fitxes') : 'Encara buit'),
            id === actual ? h('span', { class: 'xip-mes' }, 'Aquest mes') : null));
      })));
  };

  /* Petit traç de puntets del punt verd al vermell, per a «De traç en traç» */
  function motiuDetrac() {
    const svg = s('svg', { viewBox: '0 0 80 24', width: 80, height: 24 });
    const pts = Array.from({ length: 41 }, (_, i) => [6 + i * 1.7, 12 - 7 * Math.sin(i / 40 * 2.5 * 2 * Math.PI)]);
    svg.append(s('path', { d: pts.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(''), fill: 'none', stroke: '#810023', 'stroke-width': 2, 'stroke-dasharray': '0 4', 'stroke-linecap': 'round' }));
    svg.append(s('circle', { cx: pts[0][0], cy: pts[0][1], r: 3.4, fill: '#00bf63' }));
    svg.append(s('circle', { cx: pts[40][0], cy: pts[40][1], r: 3.4, fill: '#e0003f' }));
    return svg;
  }

  /* Model → fitxa de prova per a la miniatura */
  function provaDeModel(m, cursId, mesId, area) {
    const c = C.cursos[cursId];
    const base = m.crea(c, AT.nomMes(mesId));
    return {
      curs: cursId, area, titol: base.titol || AT.titolLletres(base.lletres || []), capcalera: true,
      coleccio: area === 'detrac' ? 'detrac' : undefined, nivell: m.nivell,
      lletres: base.lletres, mostra: Object.assign({ visible: true, estil: 'fletxes', mida: 'gran' }, base.mostra || {}),
      compost: base.compost, dades: base.dades && Object.assign({}, base.dades, { dita: base.dades.dita || 'Exemple de dita per veure com queda.' }),
      blocs: (base.blocs || []).map((b, i) => Object.assign(AT.clona(C.blocs[b.tipus]), b, { id: 'p' + i }))
    };
  }

  /* Galeria de «De traç en traç»: per tipus d'activitat, amb la dificultat de referència */
  function galeriaDetrac(cursId) {
    const tipus = [...new Set(AT.models.detrac.map(m => m.tipus))];
    return tipus.map(t => h('section', { class: 'grup-models' },
      h('div', { class: 'grup-models-cap' }, h('h3', null, t)),
      h('div', { class: 'graella-models' }, AT.models.detrac.filter(m => m.tipus === t).map(m => h('button', {
        class: 'tria-model', type: 'button',
        onclick: () => { const f = AT.store.nova(cursId, 'detrac', m.id, 'detrac'); location.hash = 'fitxa-' + f.id; }
      },
        miniatura(provaDeModel(m, cursId, 'detrac', 'detrac'), 130),
        h('span', { class: 'tria-model-text' },
          h('span', { class: 'dificultat', title: 'Dificultat de referència' }, AT.detrac.estrelles(m.nivell, 15), h('span', { class: 'sr' }, `Dificultat ${m.nivell} de 3`)),
          h('strong', null, m.nom), h('span', null, m.text)))))));
  }

  /* Galeria de models per afegir al dossier */
  function galeriaModels(cursId, mesId) {
    if (mesId === 'detrac') return galeriaDetrac(cursId);
    const c = C.cursos[cursId];
    return Object.values(C.arees).map(a => h('section', { class: 'grup-models' },
      h('div', { class: 'grup-models-cap' }, h('h3', null, a.nom), h('p', null, a.descripcio)),
      h('div', { class: 'graella-models' }, (AT.models[a.id] || []).map(m => {
        const base = m.crea(c, AT.nomMes(mesId));
        const prova = {
          curs: cursId, area: a.id, titol: base.titol || AT.titolLletres(base.lletres || []), capcalera: true,
          lletres: base.lletres, mostra: Object.assign({ visible: true, estil: 'fletxes', mida: 'gran' }, base.mostra || {}),
          compost: base.compost, dades: base.dades && Object.assign({}, base.dades, { dita: base.dades.dita || 'Exemple de dita per veure com queda.' }),
          blocs: (base.blocs || []).map((b, i) => Object.assign(AT.clona(C.blocs[b.tipus]), b, { id: 'p' + i }))
        };
        return h('button', {
          class: 'tria-model', type: 'button',
          onclick: () => { const f = AT.store.nova(cursId, a.id, m.id, mesId); location.hash = 'fitxa-' + f.id; }
        },
          miniatura(prova, 130),
          h('span', { class: 'tria-model-text' }, h('strong', null, m.nom), h('span', null, m.text)));
      }))));
  }

  /* ---------- Dossier del mes ---------- */
  AT.vistes.dossier = function (cursId, mesId) {
    const c = C.cursos[cursId], nomMes = AT.nomMes(mesId);
    const llista = h('div', { class: 'llista-dossier' });
    const pinta = () => {
      const fs = AT.store.dossier(cursId, mesId);
      llista.replaceChildren(...(fs.length ? fs.map((f, i) => {
        const n = AT.motor.fulls(f).fulls.length;
        const confirma = h('div', { class: 'confirma', hidden: true },
          h('span', null, 'Vols esborrar aquesta fitxa?'),
          h('button', { class: 'boto boto-perill boto-petit', type: 'button', onclick: () => { AT.store.esborra(f.id); AT.avis('Fitxa esborrada'); pinta(); } }, 'Esborra'),
          h('button', { class: 'boto boto-petit', type: 'button', onclick: () => { confirma.hidden = true; } }, 'Cancel·la'));
        const estrelles = f.coleccio === 'detrac' && f.nivell ? h('span', { class: 'dificultat', title: 'Dificultat de referència' }, AT.detrac.estrelles(f.nivell, 14)) : null;
        return h('article', { class: 'fitxa-dossier' },
          h('span', { class: 'fitxa-dossier-num' }, String(i + 1)),
          h('a', { href: '#fitxa-' + f.id, 'aria-label': 'Obre ' + f.titol }, miniatura(f, 96)),
          h('div', { class: 'fitxa-dossier-text' },
            h('h3', null, h('a', { href: '#fitxa-' + f.id }, f.titol || 'Sense títol')),
            h('p', { class: 'etiquetes' }, estrelles, f.coleccio === 'detrac' ? null : h('span', { class: 'xip xip-suau' }, (C.arees[f.area] || {}).nom || ''), h('span', { class: 'meta' }, n === 1 ? '1 full' : n + ' fulls')),
            h('div', { class: 'accions-fitxa' },
              h('button', { class: 'boto-icona', type: 'button', title: 'Puja', 'aria-label': 'Puja ' + f.titol, disabled: i === 0, onclick: () => { AT.store.mouEnDossier(f.id, -1); pinta(); } }, icona('amunt', 18)),
              h('button', { class: 'boto-icona', type: 'button', title: 'Baixa', 'aria-label': 'Baixa ' + f.titol, disabled: i === fs.length - 1, onclick: () => { AT.store.mouEnDossier(f.id, 1); pinta(); } }, icona('avall', 18)),
              h('button', { class: 'boto-icona', type: 'button', title: 'Duplica', 'aria-label': 'Duplica ' + f.titol, onclick: () => { AT.store.duplica(f.id); AT.avis('Fitxa duplicada'); pinta(); } }, icona('copia', 18)),
              h('button', { class: 'boto-icona', type: 'button', title: 'Esborra', 'aria-label': 'Esborra ' + f.titol, onclick: () => { confirma.hidden = false; } }, icona('paperera', 18))),
            confirma));
      }) : [h('p', { class: 'buit' }, `El dossier de ${nomMes.toLowerCase()} encara és buit. Afegeix-hi la primera fitxa a sota.`)]));
      boto.disabled = !fs.length;
    };
    const boto = h('button', { type: 'button', class: 'boto boto-primari', onclick: () => AT.imprimeixDossier(cursId, mesId) }, icona('impressora', 18), 'Imprimeix el dossier');
    pinta();
    return h('div', { class: 'vista' },
      molles([{ ruta: 'inici', text: 'Inici' }, { ruta: cursId, text: c.nom }, { text: nomMes }]),
      h('div', { class: 'capcalera-dossier' },
        h('div', null, h('h1', { class: 'titol-vista' }, `${nomMes} · ${c.curt}`), h('p', { class: 'subtitol' }, mesId === 'detrac'
          ? 'Grafomotricitat fora dels dossiers del mes. Les estrelles indiquen la dificultat, només com a referència.'
          : 'Les fitxes del dossier, en l’ordre en què s’imprimeixen.')),
        boto),
      llista,
      h('section', { class: 'seccio' },
        h('h2', { class: 'titol-seccio' }, 'Afegeix una fitxa'),
        galeriaModels(cursId, mesId)));
  };

  /* ---------- Totes les fitxes ---------- */
  AT.vistes.fitxes = function () {
    const estat = { curs: 'tots', mes: 'tots', cerca: '' };
    const zona = h('div');
    const pinta = () => {
      zona.replaceChildren(llistaFitxes(f =>
        (estat.curs === 'tots' || f.curs === estat.curs) &&
        (estat.mes === 'tots' || f.mes === estat.mes) &&
        (!estat.cerca || (f.titol || '').toLowerCase().includes(estat.cerca.toLowerCase())),
        'Cap fitxa no coincideix amb el filtre.'));
    };
    const filtre = (nom, ops, clau) => h('div', { class: 'segmentat', role: 'radiogroup', 'aria-label': nom },
      ops.map(([v, t]) => {
        const id = 'f-' + clau + '-' + v;
        return [h('input', { type: 'radio', name: 'f-' + clau, id, value: v, checked: estat[clau] === v, onchange: () => { estat[clau] = v; pinta(); } }),
          h('label', { for: id }, t)];
      }));
    pinta();
    return h('div', { class: 'vista' },
      molles([{ ruta: 'inici', text: 'Inici' }, { text: 'Fitxes desades' }]),
      h('h1', { class: 'titol-vista' }, 'Fitxes desades'),
      h('div', { class: 'barra-filtres' },
        filtre('Curs', [['tots', 'Tots els cursos'], ['primer', '1r'], ['segon', '2n']], 'curs'),
        h('label', { class: 'cerca' }, h('span', { class: 'sr' }, 'Mes'),
          h('select', { id: 'filtre-mes', onchange: e => { estat.mes = e.target.value; pinta(); } },
            h('option', { value: 'tots' }, 'Tots els mesos'), C.mesos.map(([id, nom]) => h('option', { value: id }, nom)))),
        h('label', { class: 'cerca' }, h('span', { class: 'sr' }, 'Cerca per títol'),
          h('input', { type: 'search', id: 'cerca-fitxes', placeholder: 'Cerca per títol', oninput: e => { estat.cerca = e.target.value; pinta(); } }))),
      zona);
  };

  /* ---------- Configuració ---------- */
  AT.vistes.configuracio = function () {
    const entradaImport = h('input', {
      type: 'file', id: 'cfg-importa', accept: 'application/json,.json', class: 'sr',
      onchange: e => {
        const f = e.target.files[0]; if (!f) return;
        const r = new FileReader();
        r.onload = () => {
          try { const n = AT.store.importa(r.result); AT.avis(n === 1 ? 'S’ha importat 1 fitxa' : `S’han importat ${n} fitxes`); }
          catch (err) { AT.avis(err.message, 'error'); }
        };
        r.readAsText(f);
        e.target.value = '';
      }
    });
    const exporta = () => {
      const blob = new Blob([AT.store.exporta()], { type: 'application/json' });
      const a = h('a', { href: URL.createObjectURL(blob), download: 'tracapp-fitxes-' + new Date().toISOString().slice(0, 10) + '.json' });
      document.body.append(a); a.click(); a.remove();
      if (AT.dinsMarc) AT.avis('En aquesta previsualització no es poden baixar fitxers.', 'error');
    };
    const confirmaTot = h('div', { class: 'confirma', hidden: true },
      h('span', null, 'S’esborraran totes les fitxes d’aquest navegador.'),
      h('button', { class: 'boto boto-perill boto-petit', type: 'button', onclick: () => { AT.store.esborraTot(); confirmaTot.hidden = true; AT.avis('Totes les fitxes s’han esborrat'); } }, 'Esborra-ho tot'),
      h('button', { class: 'boto boto-petit', type: 'button', onclick: () => { confirmaTot.hidden = true; } }, 'Cancel·la'));

    const v = h('div', { class: 'vista vista-estreta' },
      molles([{ ruta: 'inici', text: 'Inici' }, { text: 'Configuració' }]),
      h('h1', { class: 'titol-vista' }, 'Configuració'),
      h('section', { class: 'bloc-config' },
        h('h2', null, 'Còpia de seguretat'),
        h('p', null, 'Les fitxes es desen en aquest navegador. Baixa’n una còpia per passar-les a un altre ordinador o compartir-les amb una altra mestra.'),
        h('div', { class: 'fila-botons' },
          h('button', { class: 'boto', type: 'button', onclick: exporta }, icona('baixa', 18), 'Baixa totes les fitxes'),
          h('label', { class: 'boto', for: 'cfg-importa' }, icona('puja', 18), 'Importa fitxes'), entradaImport),
        AT.store.persistent() ? null : h('p', { class: 'nota-alerta' }, 'Aquest navegador no deixa desar dades: les fitxes es perdran en tancar la pestanya.')),
      h('section', { class: 'bloc-config' },
        h('h2', null, 'Esborrar dades'),
        h('div', { class: 'fila-botons' },
          h('button', { class: 'boto boto-perill', type: 'button', onclick: () => { confirmaTot.hidden = false; } }, 'Esborra totes les fitxes')),
        confirmaTot),
      h('p', { class: 'meta' }, 'TRAÇApp · versió ' + C.versio));
    return v;
  };

  /* ---------- No trobat ---------- */
  AT.vistes.noTrobat = function (text) {
    return h('div', { class: 'vista vista-estreta' },
      h('h1', { class: 'titol-vista' }, 'No s’ha trobat'),
      h('p', null, text || 'Aquesta pàgina no existeix.'),
      h('p', null, h('a', { class: 'boto boto-primari', href: '#inici' }, 'Torna a l’inici')));
  };
})();
