/* TRAÇApp — fitxes que es generen en diverses versions a partir de les mateixes dades
   - Portada del mes: versions Lligada, Pal, PI (Pla Individualitzat) i ⭐.
   - Dita: versió lligada i versió pal.
   L'usuari escriu una vegada el mes, la dita, el dibuix i la sanefa, i l'app munta cada versió. */
window.AT = window.AT || {};

(function () {
  const B = (o) => Object.assign({ id: 'c' + Math.random().toString(36).slice(2, 8) }, o);
  const majuscula = t => t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
  const W = () => AT.config.full.amplada - AT.config.full.marges.esquerra - AT.config.full.marges.dreta;
  const linies = (text, lletra, mida) => {
    const u = { gran: 5, mitjana: 4, petita: 3.3 }[mida] || 4;
    return AT.motor.partirLinies(lletra === 'pal' ? String(text || '').toUpperCase() : text, lletra, W() - 8, u);
  };
  const sanefa = d => B(Object.assign({ tipus: 'sanefa', mida: 'gran', model: 2, resta: 'puntets', modeSanefa: 'forma', forma: 'merlets' }, d.sanefa || {}));
  const imatge = d => B({ tipus: 'imatge', src: d.imatge || null, alcada: 'auto' });

  AT.compostos = {
    portada: {
      nom: 'Portada del mes',
      versions: [['lligada', 'Lligada'], ['pal', 'Pal'], ['pi', 'PI'], ['estrella', '⭐']],
      blocs(f, v) {
        const d = f.dades, estil = d.estil || 'puntets';
        const mes = (d.mes || '').trim();
        if (v === 'pi') return { majuscules: true, blocs: [
          B({ tipus: 'caixa', text: mes.toUpperCase(), lletra: 'pal', estil, mida: 'gran', amplada: 'plena' }), imatge(d), sanefa(d)] };
        if (v === 'pal') return { majuscules: false, blocs: [
          B({ tipus: 'caixa', text: mes.toUpperCase(), lletra: 'pal', estil, mida: 'gran' }),
          ...linies(d.dita, 'pal', 'mitjana').map(t => B({ tipus: 'caixa', text: t, lletra: 'pal', estil, mida: 'mitjana' })),
          imatge(d), sanefa(d)] };
        if (v === 'estrella') return { majuscules: false, blocs: [
          B({ tipus: 'caixa', text: majuscula(mes), lletra: 'lligada', estil, mida: 'gran' }),
          ...linies(d.dita, 'lligada', 'petita').map(t => B({ tipus: 'caixa', text: t, lletra: 'lligada', estil: 'model', mida: 'petita', pauta: false })),
          imatge(d), sanefa(d)] };
        return { majuscules: false, blocs: [
          B({ tipus: 'caixa', text: majuscula(mes), lletra: 'lligada', estil, mida: 'gran' }),
          ...linies(d.dita, 'lligada', 'petita').map(t => B({ tipus: 'caixa', text: t, lletra: 'lligada', estil, mida: 'petita' })),
          imatge(d), sanefa(d)] };
      }
    },
    dita: {
      nom: 'Dita',
      versions: [['lligada', 'Lligada'], ['pal', 'Pal']],
      blocs(f, v) {
        const d = f.dades, estil = d.estil || 'puntets', lletra = v === 'pal' ? 'pal' : 'lligada';
        const titol = (d.titol || 'Dita').trim();
        const buides = Math.max(0, Number(d.caixesBuides) || 0);
        return { majuscules: false, blocs: [
          B({ tipus: 'caixa', text: lletra === 'pal' ? titol.toUpperCase() : majuscula(titol), lletra, estil, mida: 'mitjana', amplada: 'parella' }),
          ...linies(d.dita, lletra, 'mitjana').map(t => B({ tipus: 'caixa', text: t, lletra, estil, mida: 'mitjana' })),
          ...Array.from({ length: buides }, () => B({ tipus: 'caixa', text: '', lletra, estil: 'buit', mida: 'mitjana' })),
          ...(d.imatge ? [imatge(d)] : []),
          sanefa(d)] };
      }
    }
  };

  AT.compostos.versionsActives = f => {
    const c = AT.compostos[f.compost];
    if (!c) return [];
    const triades = (f.dades && f.dades.versions) || {};
    const act = c.versions.filter(([k]) => triades[k] !== false);
    return act.length ? act : [c.versions[0]];
  };
})();
