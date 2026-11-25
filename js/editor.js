/* TRAÇApp — editor de fitxes */
window.AT = window.AT || {};

(function () {
  const { h, icona } = AT;
  const C = AT.config;

  /* ---------- Controls de formulari ---------- */
  function camp(etiqueta, control, idControl, ajuda) {
    return h('div', { class: 'camp' },
      h('label', { for: idControl, class: 'etiqueta' }, etiqueta),
      control,
      ajuda ? h('p', { class: 'ajuda' }, ajuda) : null);
  }
  function segmentat(etiqueta, nom, opcions, valor, canvi) {
    return h('fieldset', { class: 'camp' },
      h('legend', { class: 'etiqueta' }, etiqueta),
      h('div', { class: 'segmentat' }, opcions.map(([v, t]) => {
        const id = nom + '-' + v;
        return [h('input', { type: 'radio', name: nom, id, value: v, checked: String(valor) === String(v), onchange: () => canvi(v) }),
          h('label', { for: id }, t)];
      })));
  }
  function selector(id, opcions, valor, canvi) {
    return h('select', { id, onchange: e => canvi(e.target.value) },
      opcions.map(([v, t]) => h('option', { value: v, selected: String(valor) === String(v) }, t)));
  }
  function casella(id, text, valor, canvi) {
    return h('label', { class: 'casella', for: id },
      h('input', { type: 'checkbox', id, checked: !!valor, onchange: e => canvi(e.target.checked) }),
      h('span', null, text));
  }
  const opcionsFiles = [['auto', 'Omple el full'], ...Array.from({ length: 12 }, (_, i) => [String(i + 1), i === 0 ? '1 fila' : (i + 1) + ' files'])];

  const NOMS_BLOC = { fila: 'Fila de pauta', paraula: 'Paraules o frase', grafomotricitat: 'Traç', espai: 'Espai per dibuixar' };
  const NOM_ESTAT = Object.fromEntries(AT.motor.ESTATS);
  const W_CONTINGUT = () => C.full.amplada - C.full.marges.esquerra - C.full.marges.dreta;
  const mm = v => String(v).replace('.', ',') + ' mm';
  const textFiles = f => f === 'auto' ? 'omple el full' : f === 1 ? '1 fila' : f + ' files';

  function descripcioColumnes(b) {
    const c = (b.columnes || []).map(e => NOM_ESTAT[e].toLowerCase());
    return c.length > 1 ? c.slice(0, -1).join(', ') + ' i ' + c[c.length - 1] : (c[0] || '');
  }

  function resumBloc(b, fitxa) {
    if (b.tipus === 'fila') return `«${AT.motor.lletraDeBloc(b, fitxa)}» · ${descripcioColumnes(b)} · ${textFiles(b.files)}`;
    if (b.tipus === 'paraula') return `«${(b.text || '').trim() || '…'}» · ${textFiles(b.files)}`;
    if (b.tipus === 'grafomotricitat') {
      const f = AT.formes[b.forma];
      return `${f ? f.nom : ''} · ${mm(AT.motor.mida(fitxa.curs, 'grafomotricitat', b.mida))}`;
    }
    return b.alcada === 'auto' ? 'Omple el full' : b.alcada + ' mm';
  }

  /* ---------- Formularis de cada tipus de bloc ---------- */
  /* Lletra de l'escola en petit (per al teclat de l'editor) */
  function miniLletra(lletra) {
    const dl = AT.LLETRES.lletres[AT.motor.clauLletra(lletra)];
    const lim = dl.limits_lletra;
    const x0 = lim.xmin * 100 - 12, x1 = lim.xmax * 100 + 12;
    return AT.s('svg', { class: 'mini-lletra', viewBox: `${x0} -10 ${x1 - x0} 320`, 'aria-hidden': 'true' },
      AT.s('line', { x1: x0, x2: x1, y1: 200, y2: 200, class: 'mini-base' }),
      AT.s('path', { d: dl.svg_model, fill: 'currentColor' }));
  }

  /* Editor de columnes d'una fila: combinacions ràpides + un selector per columna */
  function editorColumnes(b, fitxa, canvi, refrescadors) {
    const id = k => `b${b.id}-${k}`;
    const zona = h('div', { class: 'columnes' });
    const pinta = () => {
      const c = AT.motor.columnesDeFila(b, fitxa, W_CONTINGUT());
      const actual = JSON.stringify(c.estats);
      zona.replaceChildren(
        h('div', { class: 'patrons', role: 'group', 'aria-label': 'Combinacions ràpides' },
          AT.motor.PATRONS.map(([nom, patro]) => {
            const estats = Array.from({ length: c.n }, (_, i) => patro[Math.min(i, patro.length - 1)]);
            const actiu = JSON.stringify(estats) === actual;
            return h('button', { type: 'button', class: 'patro' + (actiu ? ' actiu' : ''), 'aria-pressed': String(actiu), onclick: () => { b.columnes = patro.slice(); canvi(); pinta(); refresca(); } }, nom);
          })),
        h('div', { class: 'graella-columnes' },
          c.estats.map((e, i) => h('label', { class: 'columna', for: id('col' + i) },
            h('span', { class: 'columna-num' }, String(i + 1)),
            selector(id('col' + i), AT.motor.ESTATS, e, v => { const n = c.estats.slice(); n[i] = v; b.columnes = n; canvi(); pinta(); refresca(); })))),
        h('p', { class: 'ajuda' }, b.tipus === 'paraula'
          ? `Hi ${c.n === 1 ? 'cap 1 vegada' : 'caben ' + c.n + ' vegades'} per fila. L’ordre continua de fila en fila i, al final, es repeteix l’últim. Les fletxes només surten a les lletres soles.`
          : (c.n === 1 ? 'Hi cap 1 columna.' : `Hi caben ${c.n} columnes.`) + ' «Només punts» deixa el punt verd, el vermell i la línia taronja si la lletra en porta.'));
    };
    const refresca = () => refrescadors.forEach(f => f !== pinta && f());
    refrescadors.push(pinta);
    pinta();
    return h('fieldset', { class: 'camp' }, h('legend', { class: 'etiqueta' }, b.tipus === 'paraula' ? 'Què hi ha a cada paraula' : 'Què hi ha a cada columna'), zona);
  }

  function campsComuns(b, fitxa, canvi) {
    const id = k => `b${b.id}-${k}`;
    const mides = C.cursos[fitxa.curs].mides.caligrafia;
    return [
      camp('Files', selector(id('files'), opcionsFiles, b.files, v => { b.files = v === 'auto' ? 'auto' : Number(v); canvi(true); }), id('files'),
        'Totes les files d’aquest bloc són iguals. Per fer-ne una de diferent, duplica el bloc.'),
      segmentat('Mida de la pauta', id('mida'), [['gran', 'Gran · ' + mm(mides.gran)], ['mitjana', 'Mitjana · ' + mm(mides.mitjana)], ['petita', 'Petita · ' + mm(mides.petita)]], b.mida, v => { b.mida = v; canvi(true); })
    ];
  }

  function formFila(b, fitxa, canvi, refrescadors) {
    const id = k => `b${b.id}-${k}`;
    const sel = h('select', { id: id('lletra') });
    const pintaSel = () => {
      sel.replaceChildren(
        h('optgroup', { label: 'Lletres de la fitxa' }, (fitxa.lletres || []).map((l, i) =>
          h('option', { value: '@' + i, selected: b.lletra === '@' + i }, `${i + 1}a lletra de la fitxa (${l})`))),
        h('optgroup', { label: 'Una altra lletra' }, AT.motor.lletresDisponibles.map(l =>
          h('option', { value: l, selected: b.lletra === l }, l))));
    };
    sel.addEventListener('change', e => { b.lletra = e.target.value; canvi(true); });
    refrescadors.push(pintaSel);
    pintaSel();
    return [
      camp('Lletra', sel, id('lletra'), 'Si tries una lletra de la fitxa, la fila canvia quan canvien les lletres de dalt.'),
      editorColumnes(b, fitxa, canvi, refrescadors),
      ...campsComuns(b, fitxa, canvi),
      camp('Enunciat (opcional)', h('input', { type: 'text', id: id('enun'), value: b.enunciat || '', oninput: e => { b.enunciat = e.target.value; canvi(true); } }), id('enun'))
    ];
  }

  function formParaula(b, fitxa, canvi, refrescadors) {
    const id = k => `b${b.id}-${k}`;
    return [
      camp('Paraula o frase', h('input', {
        type: 'text', id: id('text'), value: b.text || '', maxlength: 40, autocomplete: 'off', spellcheck: 'false',
        oninput: e => { b.text = e.target.value; canvi(true); }
      }), id('text'), 'Les lletres s’uneixen soles. Els accents i la dièresi es posen a sobre. Les majúscules, els números i els signes surten en lletra normal.'),
      editorColumnes(b, fitxa, canvi, refrescadors),
      ...campsComuns(b, fitxa, canvi),
      camp('Enunciat (opcional)', h('input', { type: 'text', id: id('enun'), value: b.enunciat || '', oninput: e => { b.enunciat = e.target.value; canvi(true); } }), id('enun'))
    ];
  }

  /* Lletres de la fitxa i mostra (només cal·ligrafia) */
  function panellLletres(fitxa, canvi, quanCanvienLletres) {
    const llista = h('div', { class: 'lletres-triades' });
    const teclat = h('div', { class: 'teclat', role: 'group', 'aria-label': 'Lletres de la fitxa' });
    const pinta = () => {
      llista.replaceChildren(...(fitxa.lletres.length
        ? fitxa.lletres.map((l, i) => h('span', { class: 'xip-lletra' }, h('span', { class: 'xip-num' }, String(i + 1)), miniLletra(l),
          h('button', { type: 'button', class: 'boto-icona boto-mini', 'aria-label': 'Treu la ' + l, title: 'Treu', onclick: () => { fitxa.lletres.splice(i, 1); fet(); } }, icona('creu', 14))))
        : [h('p', { class: 'ajuda' }, 'Tria almenys una lletra.')]));
      teclat.replaceChildren(...AT.motor.lletresDisponibles.map(l => {
        const on = fitxa.lletres.includes(l);
        return h('button', {
          type: 'button', class: 'tecla' + (on ? ' activa' : ''), 'aria-pressed': String(on), title: 'Lletra ' + l,
          onclick: () => { if (on) fitxa.lletres.splice(fitxa.lletres.indexOf(l), 1); else if (fitxa.lletres.length < 6) fitxa.lletres.push(l); else AT.avis('Com a màxim, 6 lletres per fitxa.', 'error'); fet(); }
        }, miniLletra(l), h('span', { class: 'sr' }, l));
      }));
    };
    const fet = () => { quanCanvienLletres(); pinta(); };
    pinta();
    const m = fitxa.mostra;
    return h('section', { class: 'panell-seccio' },
      h('h2', { class: 'panell-titol' }, 'Lletres de la fitxa'),
      h('p', { class: 'ajuda' }, 'Les lletres que es treballen. Surten a la mostra de dalt i les files les fan servir.'),
      llista, teclat,
      h('div', { class: 'separador' }),
      h('h3', { class: 'panell-subtitol' }, 'Mostra sota la capçalera'),
      casella('mostra-vis', 'Mostra les lletres sota la capçalera', m.visible, v => { m.visible = v; canvi(true); }),
      segmentat('Com es veuen', 'mostra-estil', [['fletxes', 'Amb fletxes'], ['model', 'Model'], ['gris', 'Gris clar'], ['puntets', 'Puntets']], m.estil, v => { m.estil = v; canvi(true); }),
      segmentat('Mida', 'mostra-mida', [['gran', 'Gran'], ['mitjana', 'Mitjana'], ['petita', 'Petita']], m.mida, v => { m.mida = v; canvi(true); }));
  }
  AT.editorPeces = { miniLletra };

  function formGrafo(b, fitxa, canvi) {
    const id = k => `b${b.id}-${k}`;
    const mides = C.cursos[fitxa.curs].mides.grafomotricitat;
    const formes = h('div', { class: 'graella-formes', role: 'radiogroup', 'aria-label': 'Forma del traç' },
      Object.entries(AT.formes).map(([k, f]) => {
        const idr = id('forma-' + k);
        return [h('input', { type: 'radio', name: id('forma'), id: idr, value: k, checked: b.forma === k, onchange: () => { b.forma = k; canvi(true); } }),
          h('label', { for: idr, class: 'forma' }, AT.motor.miniForma(k), h('span', null, f.nom))];
      }));
    const imatge = (clau, text) => {
      const zona = h('div', { class: 'imatge-camp' });
      const pinta = () => {
        const idf = id(clau);
        zona.replaceChildren(
          b[clau] ? h('img', { src: b[clau], alt: '' }) : h('span', { class: 'imatge-buida' }, icona('imatge', 22)),
          h('div', { class: 'imatge-accions' },
            h('span', { class: 'etiqueta' }, text),
            h('label', { class: 'boto boto-petit', for: idf }, b[clau] ? 'Canvia' : 'Puja una imatge'),
            h('input', {
              type: 'file', id: idf, accept: 'image/*', class: 'sr',
              onchange: async e => {
                try { b[clau] = await AT.redueixImatge(e.target.files[0], 600); canvi(true); pinta(); }
                catch (err) { AT.avis(err.message, 'error'); }
              }
            }),
            b[clau] ? h('button', { type: 'button', class: 'boto boto-petit', onclick: () => { b[clau] = null; canvi(true); pinta(); } }, 'Treu') : null));
      };
      pinta();
      return zona;
    };
    return [
      camp('Enunciat', h('input', { type: 'text', id: id('enun'), value: b.enunciat, oninput: e => { b.enunciat = e.target.value; canvi(); } }), id('enun')),
      h('fieldset', { class: 'camp' }, h('legend', { class: 'etiqueta' }, 'Forma del traç'), formes),
      segmentat('Mida', id('mida'), [['gran', 'Gran · ' + mides.gran + ' mm'], ['mitjana', 'Mitjana · ' + mides.mitjana + ' mm'], ['petita', 'Petita · ' + mides.petita + ' mm']], b.mida, v => { b.mida = v; canvi(true); }),
      camp('Ajuda', selector(id('ajuda'), AJUDES, b.ajuda, v => { b.ajuda = v; canvi(); }), id('ajuda')),
      segmentat('Línies guia', id('guies'), [['linies', 'A dalt i a baix'], ['cap', 'Sense línies']], b.guies, v => { b.guies = v; canvi(); }),
      casella(id('inici'), 'Marca el punt d’inici', b.puntInici, v => { b.puntInici = v; canvi(); }),
      camp('Files', selector(id('files'), opcionsFiles, b.files, v => { b.files = v === 'auto' ? 'auto' : Number(v); canvi(true); }), id('files')),
      h('fieldset', { class: 'camp' },
        h('legend', { class: 'etiqueta' }, 'Dibuixos a cada fila'),
        h('p', { class: 'ajuda' }, 'Opcional. Per fer camins: un dibuix on comença el traç i un on acaba.'),
        imatge('imatgeInici', 'Inici del camí'),
        imatge('imatgeFinal', 'Final del camí'))
    ];
  }

  function formEspai(b, fitxa, canvi) {
    const id = k => `b${b.id}-${k}`;
    return [
      camp('Enunciat', h('input', { type: 'text', id: id('enun'), value: b.enunciat, oninput: e => { b.enunciat = e.target.value; canvi(); } }), id('enun')),
      camp('Alçada', selector(id('alt'), [['auto', 'Omple el full'], ['40', '4 cm'], ['60', '6 cm'], ['80', '8 cm'], ['100', '10 cm'], ['130', '13 cm']], b.alcada, v => { b.alcada = v === 'auto' ? 'auto' : Number(v); canvi(true); }), id('alt'))
    ];
  }

  /* ---------- Editor ---------- */
  AT.vistes.editor = function (idFitxa) {
    const fitxa = AT.store.fitxa(idFitxa);
    if (!fitxa) return AT.vistes.noTrobat('Aquesta fitxa no existeix o s’ha esborrat.');
    AT.store.netejaEsborranys(fitxa.id);
    const curs = () => C.cursos[fitxa.curs];
    const area = C.arees[fitxa.area];
    const oberts = new Set([fitxa.blocs[0] && fitxa.blocs[0].id]);

    /* Estat de desament */
    const estat = h('span', { class: 'estat-desat', 'aria-live': 'polite' });
    const pintaEstat = () => {
      estat.textContent = fitxa.esborrany ? 'Es desarà quan facis el primer canvi' : 'Desada ' + AT.data(fitxa.modificat);
    };
    const desa = AT.debounce(() => { if (AT.store.desa(fitxa)) pintaEstat(); }, 350);

    /* Previsualització */
    const fulls = h('div', { class: 'fulls' });
    const resum = h('div', { class: 'resum-fulls' });
    const previa = h('section', { class: 'previa', 'aria-label': 'Previsualització de la fitxa' }, resum, fulls);
    let escala = 0.6;
    const PX = 3.7795;
    const ajustaEscala = () => {
      const ample = previa.clientWidth - 32;
      escala = Math.max(0.25, Math.min(1, ample / (C.full.amplada * PX)));
      fulls.querySelectorAll('.marc-full').forEach(m => {
        m.style.width = C.full.amplada * PX * escala + 'px';
        m.style.height = C.full.alcada * PX * escala + 'px';
        m.firstChild.style.transform = `scale(${escala})`;
      });
    };
    const pinta = () => {
      const res = AT.motor.fulls(fitxa);
      fulls.replaceChildren(...res.fulls.map((f, i) => h('div', { class: 'marc-full', 'aria-label': 'Full ' + (i + 1) }, f)));
      ajustaEscala();
      const n = res.fulls.length;
      resum.replaceChildren(
        h('p', { class: 'resum-n' }, n === 1 ? '1 full A4' : n + ' fulls A4',
          h('span', { class: 'ocupacio' }, res.ocupacio.map((o, i) => h('span', { class: 'barra', title: `Full ${i + 1}: ${Math.round(o * 100)} % ocupat` }, h('span', { style: { width: Math.min(100, Math.round(o * 100)) + '%' } }))))),
        ...(res.avisos.length ? [h('ul', { class: 'avisos-fitxa' }, [...new Set(res.avisos)].map(a => h('li', null, a)))] : []));
    };
    const pintaDiferit = AT.debounce(pinta, 90);
    if ('ResizeObserver' in window) new ResizeObserver(() => ajustaEscala()).observe(previa);

    /* Panell de blocs */
    const llistaBlocs = h('div', { class: 'blocs' });
    let refrescadors = []; // parts del panell que depenen de les lletres, la mida o el text
    const canvi = (estructural) => {
      fitxa.esborrany = false;
      desa();
      pintaDiferit();
      if (estructural) { refrescaResums(); refrescadors.forEach(f => f()); }
    };
    const refrescaResums = () => {
      llistaBlocs.querySelectorAll('[data-resum]').forEach(el => {
        const b = fitxa.blocs.find(x => x.id === el.dataset.resum);
        if (b) el.textContent = resumBloc(b, fitxa);
      });
    };
    const mou = (i, d) => {
      const j = i + d;
      if (j < 0 || j >= fitxa.blocs.length) return;
      [fitxa.blocs[i], fitxa.blocs[j]] = [fitxa.blocs[j], fitxa.blocs[i]];
      canvi(); pintaBlocs();
    };
    const pintaBlocs = () => {
      refrescadors = [];
      llistaBlocs.replaceChildren(...fitxa.blocs.map((b, i) => {
        const obert = oberts.has(b.id);
        const form = { fila: formFila, paraula: formParaula, grafomotricitat: formGrafo }[b.tipus] || formEspai;
        const cos = h('div', { class: 'bloc-cos', id: 'cos-' + b.id, hidden: !obert }, obert ? form(b, fitxa, canvi, refrescadors) : null);
        const confirma = h('div', { class: 'confirma', hidden: true },
          h('span', null, 'Vols treure aquest bloc?'),
          h('button', { type: 'button', class: 'boto boto-perill boto-petit', onclick: () => { fitxa.blocs.splice(i, 1); canvi(); pintaBlocs(); } }, 'Treu'),
          h('button', { type: 'button', class: 'boto boto-petit', onclick: () => { confirma.hidden = true; } }, 'Cancel·la'));
        return h('article', { class: 'bloc bloc-' + b.tipus + (obert ? ' obert' : '') },
          h('header', { class: 'bloc-cap' },
            h('button', {
              type: 'button', class: 'bloc-plega', 'aria-expanded': String(obert), 'aria-controls': 'cos-' + b.id,
              onclick: () => { if (oberts.has(b.id)) oberts.delete(b.id); else oberts.add(b.id); pintaBlocs(); }
            },
              h('span', { class: 'bloc-num' }, String(i + 1)),
              h('span', { class: 'bloc-nom' }, h('strong', null, NOMS_BLOC[b.tipus]), h('span', { 'data-resum': b.id }, resumBloc(b, fitxa)))),
            h('div', { class: 'bloc-accions' },
              h('button', { type: 'button', class: 'boto-icona', title: 'Puja', 'aria-label': 'Puja el bloc', disabled: i === 0, onclick: () => mou(i, -1) }, icona('amunt', 18)),
              h('button', { type: 'button', class: 'boto-icona', title: 'Baixa', 'aria-label': 'Baixa el bloc', disabled: i === fitxa.blocs.length - 1, onclick: () => mou(i, 1) }, icona('avall', 18)),
              h('button', { type: 'button', class: 'boto-icona', title: 'Duplica', 'aria-label': 'Duplica el bloc', onclick: () => duplicaBloc(i) }, icona('copia', 18)),
              h('button', { type: 'button', class: 'boto-icona', title: 'Treu', 'aria-label': 'Treu el bloc', onclick: () => { confirma.hidden = false; } }, icona('creu', 18)))),
          confirma,
          cos);
      }));
      if (!fitxa.blocs.length) llistaBlocs.append(h('p', { class: 'buit' }, 'La fitxa no té cap bloc. Afegeix-ne un a sota.'));
    };
    const afegeix = tipus => {
      const b = Object.assign(AT.clona(C.blocs[tipus]), { id: AT.uid() });
      fitxa.blocs.push(b);
      oberts.clear(); oberts.add(b.id);
      canvi(); pintaBlocs();
    };
    const duplicaBloc = i => {
      const b = Object.assign(AT.clona(fitxa.blocs[i]), { id: AT.uid() });
      fitxa.blocs.splice(i + 1, 0, b);
      oberts.clear(); oberts.add(b.id);
      canvi(); pintaBlocs();
    };

    /* Capçalera de la fitxa */
    const idT = 'fitxa-titol';
    const entradaTitol = h('input', { type: 'text', id: idT, value: fitxa.titol, maxlength: 60, oninput: e => { fitxa.titol = e.target.value; fitxa.titolAuto = false; canvi(); } });
    const quanCanvienLletres = () => {
      if (fitxa.titolAuto && fitxa.lletres.length) { fitxa.titol = AT.titolLletres(fitxa.lletres); entradaTitol.value = fitxa.titol; }
      canvi(true);
    };
    const panellCap = h('section', { class: 'panell-seccio' },
      h('h2', { class: 'panell-titol' }, 'Capçalera'),
      camp('Títol de la fitxa', entradaTitol, idT, fitxa.area === 'caligrafia' ? 'Es posa sol amb les lletres de la fitxa fins que l’escrius tu.' : null),
      segmentat('Curs', 'fitxa-curs', [['primer', '1r'], ['segon', '2n']], fitxa.curs, v => { fitxa.curs = v; canvi(true); pintaBlocs(); actualitzaMolles(); }),
      casella('fitxa-cap', 'Capçalera de l’escola (Nom, Data, Títol i Curs)', fitxa.capcalera !== false, v => { fitxa.capcalera = v; canvi(true); }),
      AT.store.config().logo ? null : h('p', { class: 'ajuda' }, 'Falta el logotip. ', h('a', { href: '#configuracio' }, 'Puja’l a Configuració'), '.'));

    const esCal = fitxa.area === 'caligrafia';
    if (esCal) {
      if (!Array.isArray(fitxa.lletres)) fitxa.lletres = ['a'];
      if (!fitxa.mostra) fitxa.mostra = { visible: true, estil: 'fletxes', mida: 'gran' };
    }
    const botoAfegeix = (tipus, text) => h('button', { type: 'button', class: 'boto', onclick: () => afegeix(tipus) }, icona('mes', 18), text);
    const panell = h('aside', { class: 'panell', 'aria-label': 'Contingut de la fitxa' },
      panellCap,
      esCal ? panellLletres(fitxa, canvi, quanCanvienLletres) : null,
      h('section', { class: 'panell-seccio' },
        h('h2', { class: 'panell-titol' }, esCal ? 'Files i blocs' : 'Blocs'),
        llistaBlocs,
        h('div', { class: 'afegeix' },
          h('span', { class: 'etiqueta' }, 'Afegeix'),
          h('div', { class: 'fila-botons' },
            esCal ? [botoAfegeix('fila', 'Fila de pauta'), botoAfegeix('paraula', 'Paraules o frase')] : botoAfegeix('grafomotricitat', 'Traç'),
            botoAfegeix('espai', 'Espai per dibuixar')))));

    /* Barra superior */
    const zonaMolles = h('div');
    const actualitzaMolles = () => zonaMolles.replaceChildren(
      h('nav', { class: 'molles', 'aria-label': 'On ets' }, h('ol', null,
        h('li', null, h('a', { href: '#inici' }, 'Inici')),
        h('li', null, h('a', { href: '#' + fitxa.curs }, curs().nom)),
        h('li', null, h('a', { href: `#${fitxa.curs}-${fitxa.area}` }, area.nom)),
        h('li', null, h('span', { 'aria-current': 'page' }, 'Editor')))));
    actualitzaMolles();

    const confirmaEsb = h('div', { class: 'confirma', hidden: true },
      h('span', null, 'Vols esborrar aquesta fitxa?'),
      h('button', { type: 'button', class: 'boto boto-perill boto-petit', onclick: () => { AT.store.esborra(fitxa.id); AT.avis('Fitxa esborrada'); location.hash = `${fitxa.curs}-${fitxa.area}`; } }, 'Esborra'),
      h('button', { type: 'button', class: 'boto boto-petit', onclick: () => { confirmaEsb.hidden = true; } }, 'Cancel·la'));

    const imprimeix = () => {
      if (fitxa.esborrany) { fitxa.esborrany = false; AT.store.desa(fitxa); pintaEstat(); }
      AT.imprimeix(fitxa);
    };
    const barra = h('div', { class: 'barra-editor' },
      h('div', { class: 'barra-editor-esq' }, zonaMolles, estat),
      h('div', { class: 'barra-editor-dre' },
        h('button', { type: 'button', class: 'boto', onclick: () => { const c = AT.store.duplica(fitxa.id); if (c) { AT.avis('Còpia creada'); location.hash = 'fitxa-' + c.id; } } }, icona('copia', 18), 'Duplica'),
        h('button', { type: 'button', class: 'boto', onclick: () => { confirmaEsb.hidden = false; } }, icona('paperera', 18), 'Esborra'),
        h('button', { type: 'button', class: 'boto boto-primari', onclick: imprimeix }, icona('impressora', 18), 'Imprimeix o desa en PDF')),
      confirmaEsb,
      AT.dinsMarc ? h('p', { class: 'nota-marc' }, 'En aquesta previsualització el navegador no deixa imprimir. Obre l’app des de la seva adreça pròpia per imprimir o desar en PDF.') : null);

    pintaEstat();
    pintaBlocs();
    pinta();
    requestAnimationFrame(ajustaEscala);

    return h('div', { class: 'vista vista-editor' }, barra, h('div', { class: 'editor' }, panell, previa));
  };

  /* ---------- Impressió ---------- */
  AT.imprimeix = function (fitxa) {
    const zona = document.getElementById('impressio');
    const { fulls } = AT.motor.fulls(fitxa);
    zona.replaceChildren(...fulls);
    const titolAnterior = document.title;
    const curs = C.cursos[fitxa.curs];
    document.title = `Fitxa - ${fitxa.titol} - ${curs ? curs.curt : ''} - ${new Date().toISOString().slice(0, 10)}`;
    const neteja = () => { document.title = titolAnterior; zona.replaceChildren(); window.removeEventListener('afterprint', neteja); };
    window.addEventListener('afterprint', neteja);
    setTimeout(() => window.print(), 60);
  };
})();
