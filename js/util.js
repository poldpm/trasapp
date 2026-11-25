/* Art del traç — utilitats compartides */
window.AT = window.AT || {};

(function () {
  const SVGNS = 'http://www.w3.org/2000/svg';

  function posa(el, attrs) {
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class') el.setAttribute('class', v);
      else if (k === 'text') el.textContent = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, v);
    }
  }

  function fills(el, kids) {
    kids.flat(Infinity).forEach(c => {
      if (c === null || c === undefined || c === false) return;
      el.append(c.nodeType ? c : document.createTextNode(String(c)));
    });
  }

  /* Crea un element HTML: h('button', {class:'boto'}, 'Desa') */
  AT.h = function (tag, attrs, ...kids) {
    const el = document.createElement(tag);
    posa(el, attrs);
    fills(el, kids);
    return el;
  };

  /* Crea un element SVG */
  AT.s = function (tag, attrs, ...kids) {
    const el = document.createElementNS(SVGNS, tag);
    posa(el, attrs);
    fills(el, kids);
    return el;
  };

  AT.uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  AT.debounce = function (fn, ms) {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  };

  AT.clona = o => JSON.parse(JSON.stringify(o));

  AT.n = (x, d = 2) => Number(x.toFixed(d));

  /* Data llegible en català */
  AT.data = function (ms) {
    const d = new Date(ms);
    const avui = new Date();
    const hora = d.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' });
    if (d.toDateString() === avui.toDateString()) return 'avui a les ' + hora;
    const ahir = new Date(avui); ahir.setDate(avui.getDate() - 1);
    if (d.toDateString() === ahir.toDateString()) return 'ahir a les ' + hora;
    return d.toLocaleDateString('ca-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  /* Redueix una imatge pujada perquè no ompli la memòria del navegador */
  AT.redueixImatge = function (fitxer, maxPx = 700) {
    return new Promise((resol, rebutja) => {
      if (!fitxer || !fitxer.type.startsWith('image/')) return rebutja(new Error('Aquest fitxer no és una imatge.'));
      const lector = new FileReader();
      lector.onerror = () => rebutja(new Error('No s’ha pogut llegir la imatge.'));
      lector.onload = () => {
        const img = new Image();
        img.onerror = () => rebutja(new Error('No s’ha pogut obrir la imatge.'));
        img.onload = () => {
          const f = Math.min(1, maxPx / Math.max(img.width, img.height));
          const c = document.createElement('canvas');
          c.width = Math.round(img.width * f);
          c.height = Math.round(img.height * f);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          const esPng = fitxer.type === 'image/png' || fitxer.type === 'image/svg+xml' || fitxer.type === 'image/webp';
          resol(c.toDataURL(esPng ? 'image/png' : 'image/jpeg', 0.88));
        };
        img.src = lector.result;
      };
      lector.readAsDataURL(fitxer);
    });
  };

  /* Missatges breus a peu de pantalla */
  AT.avis = function (text, tipus = 'ok') {
    const zona = document.getElementById('avisos');
    if (!zona) return;
    const el = AT.h('div', { class: 'avis avis-' + tipus, role: 'status' }, text);
    zona.append(el);
    setTimeout(() => el.classList.add('surt'), 2600);
    setTimeout(() => el.remove(), 3000);
  };

  /* Icones lineals pròpies (24×24) */
  const ICONES = {
    amunt: 'M6 15l6-6 6 6',
    avall: 'M6 9l6 6 6-6',
    creu: 'M6 6l12 12M18 6L6 18',
    mes: 'M12 5v14M5 12h14',
    impressora: 'M7 9V4h10v5M7 17H5a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2M7 14h10v6H7z',
    copia: 'M9 9h10v10H9zM5 15V5h10',
    paperera: 'M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12',
    fletxa: 'M15 6l-6 6 6 6',
    endavant: 'M9 6l6 6-6 6',
    engranatge: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4',
    carpeta: 'M4 7a1 1 0 0 1 1-1h4l2 2h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z',
    imatge: 'M4 5h16v14H4zM4 16l5-5 4 4 2-2 5 5M15 9.5a1 1 0 1 0 0-.01',
    llapis: 'M4 20l4-1 11-11-3-3L5 16zM14 6l3 3',
    baixa: 'M12 4v11M7 10l5 5 5-5M5 20h14',
    puja: 'M12 20V9M7 14l5-5 5 5M5 4h14'
  };
  AT.icona = function (nom, mida = 20) {
    return AT.s('svg', { class: 'icona', width: mida, height: mida, viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false' },
      AT.s('path', { d: ICONES[nom] || '', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  };

  AT.dinsMarc = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();
})();
