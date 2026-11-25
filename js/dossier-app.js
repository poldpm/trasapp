/* TRAÇApp — finestra del «Dossier TRAÇApp»
   El dossier ja fet del mes, per revisar-lo fitxa per fitxa, canviar-hi el que calgui i imprimir-lo.
   Si es vol, es passa al dossier propi del mes, on es pot barrejar amb les fitxes de sempre. */
window.AT = window.AT || {};

(function () {
  const { h, icona } = AT;
  const C = AT.config;
  const REALS = ['setembre', 'octubre', 'novembre'];

  AT.hiHaDossierApp = (curs, mes) => !!(AT.dossiersApp[curs] && AT.dossiersApp[curs][mes]);

  AT.tancaDossierApp = () => {
    const m = document.getElementById('dossier-app');
    if (m) { m.remove(); document.documentElement.classList.remove('amb-modal'); }
    if (AT.tancaDossierApp.tecla) { document.removeEventListener('keydown', AT.tancaDossierApp.tecla); AT.tancaDossierApp.tecla = null; }
  };

  AT.obreDossierApp = function (curs, mes) {
    AT.tancaDossierApp();
    if (!AT.hiHaDossierApp(curs, mes)) return;
    if (!AT.store.proposta(curs, mes).length) AT.store.generaProposta(curs, mes);
    const nomMes = AT.nomMes(mes), c = C.cursos[curs];
    let actual = 0;
    const tanca = () => { location.hash = `${curs}-${mes}`; };

    const llista = h('ol', { class: 'pagines-app' });
    const zonaEditor = h('div', { class: 'zona-editor-app' });
    const navegacio = h('div', { class: 'nav-pagines-app' });
    const confirma = h('div', { class: 'confirma confirma-app', hidden: true });

    const miniatura = (f, ample) => {
      const PX = 3.7795, esc = ample / (C.full.amplada * PX);
      const dins = AT.motor.fulls(f).fulls[0];
      dins.style.transform = `scale(${esc})`;
      dins.style.transformOrigin = '0 0';
      return h('span', { class: 'mini-full', style: { width: ample + 'px', height: C.full.alcada * PX * esc + 'px' }, 'aria-hidden': 'true' }, dins);
    };
    const fitxes = () => AT.store.proposta(curs, mes);

    const pintaLlista = () => {
      const fs = fitxes();
      llista.replaceChildren(...fs.map((f, i) => {
        const n = AT.motor.fulls(f).fulls.length;
        return h('li', { class: 'pagina-app' + (i === actual ? ' actual' : '') },
          h('button', { type: 'button', class: 'pagina-app-boto', 'aria-current': i === actual ? 'true' : null, onclick: () => tria(i) },
            h('span', { class: 'pagina-app-num' }, String(i + 1)),
            miniatura(f, 58),
            h('span', { class: 'pagina-app-text' }, h('strong', null, f.titol || 'Sense títol'), h('span', null, n === 1 ? '1 full' : n + ' fulls'))),
          h('span', { class: 'pagina-app-accions' },
            h('button', { type: 'button', class: 'boto-icona', title: 'Puja', 'aria-label': 'Puja ' + f.titol, disabled: i === 0, onclick: () => { AT.store.mouProposta(f.id, -1); actual = i - 1; pintaLlista(); pintaNav(); } }, icona('amunt', 16)),
            h('button', { type: 'button', class: 'boto-icona', title: 'Baixa', 'aria-label': 'Baixa ' + f.titol, disabled: i === fs.length - 1, onclick: () => { AT.store.mouProposta(f.id, 1); actual = i + 1; pintaLlista(); pintaNav(); } }, icona('avall', 16)),
            h('button', { type: 'button', class: 'boto-icona', title: 'Treu del dossier', 'aria-label': 'Treu ' + f.titol, onclick: () => pregunta(`Vols treure «${f.titol}» d’aquest dossier?`, 'Treu', () => { AT.store.esborra(f.id); actual = Math.max(0, Math.min(actual, fitxes().length - 1)); tot(); }) }, icona('paperera', 16))));
      }));
    };
    const pintaNav = () => {
      const n = fitxes().length;
      navegacio.replaceChildren(
        h('button', { type: 'button', class: 'boto', disabled: actual === 0, onclick: () => tria(actual - 1) }, icona('fletxa', 18), 'Anterior'),
        h('span', { class: 'nav-pagines-n' }, `Fitxa ${actual + 1} de ${n}`),
        h('button', { type: 'button', class: 'boto', disabled: actual >= n - 1, onclick: () => tria(actual + 1) }, 'Següent', icona('endavant', 18)));
    };
    const refrescaMiniatura = () => {
      const f = fitxes()[actual], li = llista.children[actual];
      if (!f || !li) return;
      const vella = li.querySelector('.mini-full');
      if (vella) vella.replaceWith(miniatura(f, 58));
      const t = li.querySelector('.pagina-app-text strong');
      if (t) t.textContent = f.titol || 'Sense títol';
    };
    const pintaEditor = () => {
      const f = fitxes()[actual];
      zonaEditor.replaceChildren(f ? AT.vistes.editor(f.id, { incrustat: true, quanCanvia: refrescaMiniatura }) : h('p', { class: 'buit' }, 'Aquest dossier ja no té cap fitxa. Torna a començar per recuperar-lo.'));
      zonaEditor.scrollTop = 0;
      cos.scrollTop = 0;
    };
    const tria = i => { actual = Math.max(0, Math.min(i, fitxes().length - 1)); pintaLlista(); pintaNav(); pintaEditor(); };
    const tot = () => { pintaLlista(); pintaNav(); pintaEditor(); };

    function pregunta(text, accio, fer) {
      confirma.replaceChildren(
        h('span', null, text),
        h('button', { type: 'button', class: 'boto boto-perill boto-petit', onclick: () => { confirma.hidden = true; fer(); } }, accio),
        h('button', { type: 'button', class: 'boto boto-petit', onclick: () => { confirma.hidden = true; } }, 'Cancel·la'));
      confirma.hidden = false;
    }

    const imprimeix = () => AT.imprimeixFitxes(fitxes(), `Dossier TRAÇApp - ${nomMes} - ${c.curt}`);
    const afegeix = () => {
      const n = AT.store.copiaProposta(curs, mes);
      AT.avis(n === 1 ? 'S’ha afegit 1 fitxa al teu dossier' : `S’han afegit ${n} fitxes al teu dossier de ${nomMes.toLowerCase()}`);
      tanca();
    };
    const reinicia = () => pregunta('Es perdran els canvis que hi hagis fet i tornarà a ser com l’ha preparat TRAÇApp. Continuem?', 'Torna a començar', () => {
      AT.store.generaProposta(curs, mes); actual = 0; tot(); AT.avis('Dossier refet');
    });

    const titolId = 'dossier-app-titol';
    const cap = h('header', { class: 'cap-app' },
      h('div', { class: 'cap-app-marca' },
        AT.marca.icona(44),
        h('div', null,
          h('h2', { id: titolId, class: 'cap-app-titol' }, `Dossier TRAÇApp · ${nomMes} · ${c.curt}`),
          h('p', { class: 'cap-app-sub' }, REALS.includes(mes)
            ? 'El dossier que vau fer servir aquest mes, refet amb TRAÇApp. Revisa’l, canvia el que vulguis i imprimeix-lo.'
            : 'Un dossier preparat per TRAÇApp per a aquest mes. Revisa’l fitxa per fitxa, canvia el que vulguis i imprimeix-lo.'),
          h('p', { class: 'cap-app-nota' }, 'Els canvis es desen sols. Si no el vols fer servir, tanca’l i continua amb el teu dossier com sempre.'))),
      h('div', { class: 'cap-app-accions' },
        h('button', { type: 'button', class: 'boto boto-primari', onclick: imprimeix }, icona('impressora', 18), 'Imprimeix el dossier'),
        h('button', { type: 'button', class: 'boto', onclick: afegeix }, icona('carpeta', 18), 'Passa’l al meu dossier'),
        h('button', { type: 'button', class: 'boto', onclick: reinicia }, 'Torna a començar'),
        h('button', { type: 'button', class: 'boto-icona boto-tanca', 'aria-label': 'Tanca', title: 'Tanca', onclick: tanca }, icona('creu', 22))),
      confirma,
      AT.dinsMarc ? h('p', { class: 'nota-marc' }, 'En aquesta previsualització el navegador no deixa imprimir. Obre l’app des de la seva adreça pròpia per imprimir o desar en PDF.') : null);

    const cos = h('div', { class: 'cos-app' },
      h('nav', { class: 'llista-app', 'aria-label': 'Fitxes del dossier' }, llista),
      h('div', { class: 'principal-app' }, navegacio, zonaEditor));

    const modal = h('div', { id: 'dossier-app', class: 'modal-app', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': titolId, tabindex: '-1' },
      h('div', { class: 'finestra-app' }, cap, cos));
    document.body.append(modal);
    document.documentElement.classList.add('amb-modal');
    tot();
    AT.tancaDossierApp.tecla = e => { if (e.key === 'Escape') tanca(); };
    document.addEventListener('keydown', AT.tancaDossierApp.tecla);
    setTimeout(() => modal.focus({ preventScroll: true }), 0);
  };
})();
