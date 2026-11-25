/* TRAÇApp — arrencada i navegació
   Cada pantalla té una adreça pròpia (#inici, #primer, #primer-caligrafia,
   #fitxa-…), així es pot fer servir el botó «enrere» del navegador. */
(function () {
  const AT = window.AT;
  const vista = document.getElementById('vista');

  function ruta() {
    const r = (location.hash || '#inici').slice(1);
    if (r === 'inici' || r === '') return AT.vistes.inici();
    if (r === 'fitxes') return AT.vistes.fitxes();
    if (r === 'configuracio') return AT.vistes.configuracio();
    if (r.startsWith('fitxa-')) return AT.vistes.editor(r.slice(6));
    const [curs, area] = r.split('-');
    if (AT.config.cursos[curs] && !area) return AT.vistes.curs(curs);
    if (AT.config.cursos[curs] && AT.config.arees[area]) return AT.vistes.area(curs, area);
    return AT.vistes.noTrobat();
  }

  let anterior = null;
  function navega() {
    const r = location.hash.slice(1);
    if (!r.startsWith('fitxa-')) AT.store.netejaEsborranys();
    vista.replaceChildren(ruta());
    document.querySelectorAll('.nav-principal a').forEach(a => {
      const actiu = a.getAttribute('href') === '#' + (r || 'inici');
      if (actiu) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    if (anterior !== r) window.scrollTo(0, 0);
    anterior = r;
    vista.focus({ preventScroll: true });
  }

  window.addEventListener('hashchange', navega);

  AT.lletra.carrega().then(carregada => {
    AT.posaMarca();
    document.documentElement.classList.remove('carregant');
    if (!carregada) AT.avis('No s’han pogut carregar les tipografies. Comprova la connexió a internet.', 'error');
    navega();
  });
})();
