/* TRAÇApp — desament local (al navegador d'aquest ordinador)
   Les fitxes es guarden a localStorage. Si el navegador no ho permet
   (finestra privada, dades bloquejades) l'app continua funcionant en memòria. */
window.AT = window.AT || {};

(function () {
  const CLAU = 'artdeltrac.v1';
  let dades = { fitxes: [], config: { logo: null, titolDefecte: 'Art del traç' } };
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
    if (!f.mes) {
      const ids = ['gener', 'febrer', 'marc', 'abril', 'maig', 'juny', 'juliol', 'agost', 'setembre', 'octubre', 'novembre', 'desembre'];
      const m = ids[new Date(f.creat || Date.now()).getMonth()];
      f.mes = (m === 'juliol' || m === 'agost') ? 'setembre' : m;
    }
    if (!f.ordre) f.ordre = f.creat || 1;
    if (f.area === 'caligrafia' && !f.lletres) {
      f.lletres = [...new Set(f.blocs.filter(b => b.tipus === 'fila').map(b => b.lletra))].slice(0, 6);
      if (!f.lletres.length) f.lletres = ['a'];
      f.mostra = { visible: false, estil: 'fletxes', mida: 'gran' };
    }
  });

  AT.mesActual = () => {
    const ids = ['gener', 'febrer', 'marc', 'abril', 'maig', 'juny', 'setembre', 'setembre', 'setembre', 'octubre', 'novembre', 'desembre'];
    return ids[new Date().getMonth()];
  };
  AT.nomMes = id => id === 'detrac' ? 'De traç en traç' : (AT.config.mesos.find(m => m[0] === id) || [id, id])[1];

  AT.titolLletres = ll => (ll.length === 1 ? 'La lletra ' : 'Lletres ') + ll.join(' - ');

  AT.store = {
    persistent: () => persistent,
    fitxes: () => dades.fitxes.filter(f => !f.proposta).sort((a, b) => b.modificat - a.modificat),
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
    nova(curs, area, modelId, mes) {
      const c = AT.config.cursos[curs];
      const mesId = mes || AT.mesActual();
      const nomMes = (AT.config.mesos.find(m => m[0] === mesId) || ['', 'Setembre'])[1];
      const model = (AT.models[area] || []).find(m => m.id === modelId) || AT.models[area][0];
      const base = model.crea(c, nomMes);
      const lletres = base.lletres || null;
      const ordre = Math.max(0, ...dades.fitxes.filter(f => f.curs === curs && f.mes === mesId && !f.esborrany).map(f => f.ordre || 0)) + 1;
      const fitxa = {
        id: AT.uid(), curs, area, mes: mesId, ordre,
        coleccio: area === 'detrac' ? 'detrac' : undefined,
        nivell: model.nivell || undefined,
        titol: base.titol || (lletres ? AT.titolLletres(lletres) : 'Art del traç'),
        titolAuto: !base.titol && !!lletres,
        lletres: lletres || undefined,
        mostra: lletres ? Object.assign({ visible: true, estil: 'fletxes', mida: 'gran' }, base.mostra || {}) : undefined,
        compost: base.compost || undefined,
        sincronitza: base.sincronitza === false ? false : undefined, // false: les lletres no creen files
        dades: base.dades ? AT.clona(base.dades) : undefined,
        capcalera: true,
        blocs: (base.blocs || []).map(b => Object.assign(AT.clona(AT.config.blocs[b.tipus]), b, { id: AT.uid() })),
        creat: Date.now(), modificat: Date.now(),
        esborrany: true // passa a false amb el primer canvi
      };
      dades.fitxes.push(fitxa);
      escriu();
      return fitxa;
    },

    /* Fitxes d'un dossier (curs + mes), en l'ordre del dossier */
    dossier(curs, mes) {
      return dades.fitxes.filter(f => f.curs === curs && f.mes === mes && !f.esborrany && !f.proposta).sort((a, b) => (a.ordre || 0) - (b.ordre || 0) || a.creat - b.creat);
    },
    mouEnDossier(id, d) {
      const f = this.fitxa(id); if (!f) return;
      const llista = this.dossier(f.curs, f.mes);
      llista.forEach((x, i) => { x.ordre = i + 1; });
      const i = llista.indexOf(f), j = i + d;
      if (j < 0 || j >= llista.length) return;
      [llista[i].ordre, llista[j].ordre] = [llista[j].ordre, llista[i].ordre];
      escriu();
    },

    /* Dossiers de setembre a novembre de l'escola: es posen una sola vegada a cada navegador, al dossier
       normal del mes, si encara és buit. Si després s'esborren fitxes, no tornen a aparèixer. */
    sembraDossiersEscola() {
      const fets = dades.config.dossiersEscola || {};
      let canvi = false;
      /* fitxes d'una versió anterior, quan aquests mesos eren «Dossier TRAÇApp» */
      const abans = dades.fitxes.length;
      dades.fitxes = dades.fitxes.filter(f => !(f.proposta && AT.dossiersEscola[f.curs] && AT.dossiersEscola[f.curs][f.mes]));
      if (dades.fitxes.length !== abans) canvi = true;
      Object.keys(AT.dossiersEscola).forEach(curs => Object.keys(AT.dossiersEscola[curs]).forEach(mes => {
        const k = curs + '-' + mes;
        if (fets[k]) return;
        if (!this.dossier(curs, mes).length) dades.fitxes.push(...AT.dossierEscola(curs, mes));
        fets[k] = true; canvi = true;
      }));
      dades.config.dossiersEscola = fets;
      if (canvi) escriu();
    },

    /* «Dossier TRAÇApp»: el dossier ja fet de cada mes. Es crea la primera vegada que s'obre
       i després es desa com qualsevol fitxa, amb els canvis que hi facin les mestres. */
    proposta(curs, mes) {
      return dades.fitxes.filter(f => f.proposta && f.curs === curs && f.mes === mes).sort((a, b) => (a.ordre || 0) - (b.ordre || 0));
    },
    generaProposta(curs, mes) {
      dades.fitxes = dades.fitxes.filter(f => !(f.proposta && f.curs === curs && f.mes === mes));
      const noves = AT.dossierApp(curs, mes);
      dades.fitxes.push(...noves);
      escriu();
      return noves;
    },
    /* Copia les fitxes del dossier TRAÇApp al dossier propi del mes, al final */
    copiaProposta(curs, mes, ids) {
      let ordre = Math.max(0, ...this.dossier(curs, mes).map(f => f.ordre || 0));
      const fets = this.proposta(curs, mes).filter(f => !ids || ids.includes(f.id)).map(o => {
        const c = AT.clona(o);
        c.id = AT.uid(); delete c.proposta;
        c.creat = c.modificat = Date.now(); c.ordre = ++ordre;
        c.blocs.forEach(b => { b.id = AT.uid(); });
        return c;
      });
      dades.fitxes.push(...fets);
      escriu();
      return fets.length;
    },
    mouProposta(id, d) {
      const f = this.fitxa(id); if (!f) return;
      const llista = this.proposta(f.curs, f.mes);
      llista.forEach((x, i) => { x.ordre = i + 1; });
      const i = llista.indexOf(f), j = i + d;
      if (j < 0 || j >= llista.length) return;
      [llista[i].ordre, llista[j].ordre] = [llista[j].ordre, llista[i].ordre];
      escriu();
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
      c.ordre = Math.max(0, ...dades.fitxes.filter(f => f.curs === c.curs && f.mes === c.mes).map(f => f.ordre || 0)) + 1;
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
