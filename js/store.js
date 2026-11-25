/* TRAÇApp — desament local (al navegador d'aquest ordinador)
   Les fitxes es guarden a localStorage. Si el navegador no ho permet
   (finestra privada, dades bloquejades) l'app continua funcionant en memòria. */
window.AT = window.AT || {};

(function () {
  const CLAU = 'artdeltrac.v1';
  let dades = { fitxes: [], config: { logo: null, titolDefecte: 'Art del traç', versioQ: 'q' } };
  let persistent = true;

  function llegeix() {
    try {
      const t = localStorage.getItem(CLAU);
      if (t) {
        const d = JSON.parse(t);
        dades = { fitxes: Array.isArray(d.fitxes) ? d.fitxes : [], config: Object.assign(dades.config, d.config || {}) };
      }
    } catch (e) { persistent = false; }
  }

  function escriu() {
    try {
      localStorage.setItem(CLAU, JSON.stringify(dades));
      return true;
    } catch (e) {
      if (e && (e.name === 'QuotaExceededError' || e.code === 22)) {
        AT.avis('La memòria del navegador és plena. Treu alguna imatge o esborra fitxes antigues.', 'error');
      } else {
        persistent = false;
      }
      return false;
    }
  }

  llegeix();
  /* Fitxes de la primera versió (amb text lliure): passen a fer servir una lletra de l'escola */
  dades.fitxes.forEach(f => {
    (f.blocs || []).forEach(b => {
      if (b.tipus !== 'caligrafia') return;
      let c = b.lletra || (b.text || 'a').trim().charAt(0).toLowerCase();
      if (!'abcçdefghijklmnopqrstuvwxyz'.includes(c) || !c) c = 'a';
      b.tipus = 'fila'; b.lletra = c;
      b.columnes = b.ajuda === 'model' ? ['model', 'punts'] : b.ajuda === 'escola' ? ['model', 'gris', 'punts'] : ['model', b.estil === 'gris' ? 'gris' : 'puntets'];
      if (b.fletxes) b.columnes[0] = 'fletxes';
    });
    if (f.area === 'caligrafia' && !f.lletres) {
      f.lletres = [...new Set(f.blocs.filter(b => b.tipus === 'fila').map(b => b.lletra))].slice(0, 6);
      if (!f.lletres.length) f.lletres = ['a'];
      f.mostra = { visible: false, estil: 'fletxes', mida: 'gran' };
    }
  });

  AT.titolLletres = ll => (ll.length === 1 ? 'La lletra ' : 'Lletres ') + ll.join(' - ');

  AT.store = {
    persistent: () => persistent,
    fitxes: () => dades.fitxes.slice().sort((a, b) => b.modificat - a.modificat),
    fitxa: id => dades.fitxes.find(f => f.id === id) || null,
    config: () => dades.config,
    desaConfig(canvis) { Object.assign(dades.config, canvis); return escriu(); },

    desa(fitxa) {
      fitxa.modificat = Date.now();
      const i = dades.fitxes.findIndex(f => f.id === fitxa.id);
      if (i >= 0) dades.fitxes[i] = fitxa; else dades.fitxes.push(fitxa);
      return escriu();
    },
    esborra(id) {
      dades.fitxes = dades.fitxes.filter(f => f.id !== id);
      escriu();
    },
    esborraTot() {
      dades.fitxes = [];
      escriu();
    },

    /* Crea una fitxa nova a partir d'un model */
    nova(curs, area, modelId) {
      const c = AT.config.cursos[curs];
      const model = (AT.models[area] || []).find(m => m.id === modelId) || AT.models[area][0];
      const base = model.crea(c);
      const lletres = base.lletres || null;
      const fitxa = {
        id: AT.uid(), curs, area,
        titol: base.titol || (lletres ? AT.titolLletres(lletres) : 'Art del traç'),
        titolAuto: !base.titol && !!lletres,
        lletres: lletres || undefined,
        mostra: lletres ? Object.assign({ visible: true, estil: 'fletxes', mida: 'gran' }, base.mostra || {}) : undefined,
        capcalera: true,
        blocs: base.blocs.map(b => Object.assign(AT.clona(AT.config.blocs[b.tipus]), b, { id: AT.uid() })),
        creat: Date.now(), modificat: Date.now(),
        esborrany: true // passa a false amb el primer canvi
      };
      dades.fitxes.push(fitxa);
      escriu();
      return fitxa;
    },

    duplica(id) {
      const o = this.fitxa(id);
      if (!o) return null;
      const c = AT.clona(o);
      c.id = AT.uid();
      c.titol = o.titol + ' (còpia)';
      c.creat = c.modificat = Date.now();
      c.esborrany = false;
      c.blocs.forEach(b => { b.id = AT.uid(); });
      dades.fitxes.push(c);
      escriu();
      return c;
    },

    /* Treu les fitxes creades i mai tocades */
    netejaEsborranys(exceptuant) {
      const abans = dades.fitxes.length;
      dades.fitxes = dades.fitxes.filter(f => !f.esborrany || f.id === exceptuant);
      if (dades.fitxes.length !== abans) escriu();
    },

    exporta() {
      return JSON.stringify({ app: 'tracapp', versio: AT.config.versio, exportat: new Date().toISOString(), fitxes: dades.fitxes }, null, 1);
    },
    importa(text) {
      const d = JSON.parse(text);
      if (!d || !Array.isArray(d.fitxes)) throw new Error('Aquest fitxer no conté fitxes de TRAÇApp.');
      let n = 0;
      d.fitxes.forEach(f => {
        if (!f || !f.id || !Array.isArray(f.blocs)) return;
        if (!this.fitxa(f.id)) { f.esborrany = false; dades.fitxes.push(f); n++; }
      });
      escriu();
      return n;
    }
  };
})();
