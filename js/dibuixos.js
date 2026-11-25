/* TRAÇApp — dibuixos per pintar dels dossiers TRAÇApp
   - AT.IMATGES_ESCOLA (dades/imatges-escola.js): els dibuixos dels dossiers reals de l'escola.
   - AT.dibuixos: dibuixos de línia propis (estacions i festes), fets amb traç negre i fons blanc,
     perquè els nens els puguin pintar.
   - AT.mandala(tema): mandales geomètriques generades.
   Un bloc d'imatge pot guardar «img:<clau>» en lloc de la imatge: així no ocupa memòria del navegador. */
window.AT = window.AT || {};

(function () {
  const T = (w = 3) => `fill="none" stroke="#222" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
  const B = (w = 3) => `fill="#fff" stroke="#222" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
  const svg = (vb, cos) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${cos}</svg>`;
  const rot = (n, f) => Array.from({ length: n }, (_, i) => f(i * 360 / n, i)).join('');
  const floc = (x, y, r, w = 2) => `<g transform="translate(${x} ${y})" ${T(w)}>` +
    rot(6, a => `<g transform="rotate(${a})"><path d="M0 0V${-r}M0 ${-r * 0.55}l${r * 0.28} ${-r * 0.28}M0 ${-r * 0.55}l${-r * 0.28} ${-r * 0.28}"/></g>`) + '</g>';
  const estrella = (x, y, r, w = 3) => {
    const p = Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; return (x + rr * Math.cos(a)).toFixed(1) + ' ' + (y + rr * Math.sin(a)).toFixed(1); });
    return `<path d="M${p.join('L')}Z" ${B(w)}/>`;
  };
  const gota = (x, y, s, w = 2.5) => `<path d="M${x} ${y}c${-6 * s} ${9 * s} ${-7 * s} ${13 * s} 0 ${15 * s}c${7 * s} ${-2 * s} ${6 * s} ${-6 * s} 0 ${-15 * s}z" ${B(w)}/>`;
  const flor = (x, y, r, n = 6, w = 3) => `<g transform="translate(${x} ${y})">` +
    rot(n, a => `<ellipse cx="0" cy="${-r * 0.62}" rx="${r * 0.36}" ry="${r * 0.55}" transform="rotate(${a})" ${B(w)}/>`) +
    `<circle r="${r * 0.36}" ${B(w)}/></g>`;

  AT.dibuixos = {
    /* ---- Desembre ---- */
    'ninot-neu': { nom: 'Ninot de neu', mes: 'desembre', svg: svg('0 0 300 260',
      `<path d="M10 236c60-14 220-14 280 0" ${T()}/>` +
      `<circle cx="150" cy="176" r="56" ${B()}/><circle cx="150" cy="92" r="38" ${B()}/>` +
      `<path d="M118 66h64M130 66V30h40v36" ${B()}/><path d="M130 56h40" ${T()}/>` +
      `<circle cx="137" cy="86" r="4" fill="#222"/><circle cx="163" cy="86" r="4" fill="#222"/>` +
      `<path d="M150 96l26 7-26 5z" ${B()}/><path d="M136 114c8 6 20 6 28 0" ${T()}/>` +
      `<path d="M114 128c20 12 52 12 72 0l-2 14c-22 10-46 10-68 0z" ${B()}/><path d="M172 136l6 34h-14l-2-30" ${B()}/>` +
      `<circle cx="150" cy="160" r="4.5" fill="#222"/><circle cx="150" cy="180" r="4.5" fill="#222"/><circle cx="150" cy="200" r="4.5" fill="#222"/>` +
      `<path d="M98 160L58 132M70 140l-8-16M70 140l-18 2M202 160l40-28M230 140l8-16M230 140l18 2" ${T()}/>` +
      floc(46, 52, 16) + floc(256, 70, 13) + floc(240, 200, 10) + floc(62, 196, 10)) },
    'arbre-nadal': { nom: 'Arbre de Nadal', mes: 'desembre', svg: svg('0 0 300 280',
      `<path d="M150 40L104 104h22l-40 56h24l-46 62h172l-46-62h24l-40-56h22z" ${B()}/>` +
      `<path d="M136 222h28v30h-28z" ${B()}/>` + estrella(150, 32, 20) +
      [[138, 92], [168, 96], [120, 142], [150, 136], [180, 146], [104, 198], [134, 190], [166, 200], [196, 192]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" ${B(2.5)}/>`).join('') +
      `<path d="M16 216h44v40H16zM16 230h44M38 216v40M28 216c-8-14 4-18 10 0c6-18 18-14 10 0" ${B()}/>` +
      `<path d="M244 222h42v34h-42zM265 222v34M244 236h42" ${B()}/><path d="M265 222c-12-10-14-22 0-12c14-10 12 2 0 12" ${T()}/>` +
      `<path d="M10 258h280" ${T()}/>`) },
    'estrella-nadal': { nom: 'Estel de Nadal', mes: 'desembre', svg: svg('0 0 200 200', estrella(100, 92, 70) + `<path d="M100 162c-4 10-8 18-16 26M100 162c4 10 8 18 16 26" ${T()}/>` + estrella(36, 40, 12) + estrella(168, 34, 10) + estrella(170, 150, 12)) },
    /* ---- Gener ---- */
    'muntanyes-neu': { nom: 'Muntanyes nevades', mes: 'gener', svg: svg('0 0 320 240',
      `<path d="M10 210L104 60l58 92 46-62 102 120z" ${B()}/>` +
      `<path d="M78 102l26-42 26 42-12 12-14-10-12 12zM186 122l22-32 22 32-10 8-12-8-12 10z" ${B()}/>` +
      `<path d="M40 210v-10M40 200l-12 4 12-26 12 22z" ${B()}/><path d="M262 214l-14 2 14-30 14 28zM262 186l-10 2 10-22 10 20z" ${B()}/>` +
      `<path d="M10 222c80-8 220-8 300 0" ${T()}/>` + floc(30, 40, 12) + floc(160, 30, 14) + floc(280, 44, 12) + floc(250, 120, 9) + floc(70, 150, 8)) },
    'gorro-bufanda': { nom: 'Gorro i bufanda', mes: 'gener', svg: svg('0 0 300 230',
      `<path d="M60 130c0-56 30-86 70-86s70 30 70 86z" ${B()}/><path d="M52 130h156v26H52z" ${B()}/>` +
      `<circle cx="130" cy="38" r="16" ${B()}/>` + [80, 100, 120, 140, 160, 180].map(x => `<path d="M${x} 136v14" ${T(2)}/>`).join('') +
      `<path d="M96 70l12 14 12-14 12 14 12-14 12 14" ${T(2)}/>` +
      `<path d="M40 176c60 18 160 18 220 0l6 22c-64 20-168 20-232 0z" ${B()}/><path d="M206 192l14 34h22l-14-36" ${B()}/>` + floc(250, 50, 14) + floc(30, 70, 11)) },
    /* ---- Febrer ---- */
    'careta': { nom: 'Careta de Carnaval', mes: 'febrer', svg: svg('0 0 300 220',
      `<path d="M40 92c20-30 70-30 110-6c40-24 90-24 110 6c6 40-20 72-56 72c-26 0-40-16-54-30c-14 14-28 30-54 30c-36 0-62-32-56-72z" ${B()}/>` +
      `<path d="M74 104c14-14 40-14 50 4c-10 16-38 16-50-4zM176 108c10-18 36-18 50-4c-12 20-40 20-50 4z" ${B()}/>` +
      `<path d="M150 86c-8-30 0-56 20-70M150 86c10-26 32-44 58-48M150 86c-14-22-36-36-62-38" ${T()}/>` +
      `<path d="M252 150l26 64" ${T(5)}/>` +
      `<path d="M20 30c20 10 10 24 30 30s10 24 30 26M230 180c-14 12 0 22-14 32" ${T(2.5)}/>` +
      [[24, 150], [60, 196], [112, 200], [196, 196], [276, 30], [240, 20]].map(([x, y], i) => i % 2 ? `<circle cx="${x}" cy="${y}" r="6" ${B(2)}/>` : `<path d="M${x - 6} ${y - 6}l12 12M${x + 6} ${y - 6}l-12 12" ${T(2.5)}/>`).join('')) },
    'pallasso': { nom: 'Barret de festa', mes: 'febrer', svg: svg('0 0 220 240',
      `<path d="M110 20L50 200h120z" ${B()}/><circle cx="110" cy="20" r="14" ${B()}/>` +
      `<path d="M84 98h52M70 140h80M58 176h104" ${T()}/>` +
      `<path d="M40 200c20 18 120 18 140 0" ${B()}/>` +
      [[90, 120], [126, 120], [80, 160], [110, 158], [142, 162]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" ${B(2)}/>`).join('')) },
    /* ---- Març ---- */
    'paraigua': { nom: 'Paraigua i arc de Sant Martí', mes: 'marc', svg: svg('0 0 300 260',
      [104, 88, 72].map(r => `<path d="M${150 - r * 1.25} 112a${r * 1.25} ${r} 0 0 1 ${r * 2.5} 0" ${T()}/>`).join('') +
      `<path d="M52 150c8-46 50-72 98-72s90 26 98 72c-16-12-34-12-48 0c-14-12-34-12-50 0c-16-12-36-12-50 0c-14-12-32-12-48 0z" ${B()}/>` +
      `<path d="M150 78c-20 22-26 50-24 72M150 78c20 22 26 50 24 72M150 64v14" ${T()}/>` +
      `<path d="M150 150v70c0 16-24 16-24 0" ${T()}/>` + gota(40, 186, 1.2) + gota(82, 206, 1) + gota(220, 192, 1.2) + gota(260, 212, 1) +
      `<path d="M110 244c20-10 70-10 90 0" ${T()}/>`) },
    'cargol': { nom: 'Cargol sota la pluja', mes: 'marc', svg: svg('0 0 280 200',
      `<path d="M40 168h170c30 0 40-14 40-30" ${B()}/><circle cx="140" cy="116" r="52" ${B()}/>` +
      `<path d="M140 116c0-10 14-10 14 0c0 18-28 18-28 0c0-26 42-26 42 0c0 34-56 34-56 0c0-42 70-42 70 0" ${T()}/>` +
      `<path d="M226 140l8-46M244 142l16-40" ${T()}/><circle cx="234" cy="92" r="5" fill="#222"/><circle cx="260" cy="100" r="5" fill="#222"/>` +
      gota(40, 30, 1) + gota(90, 16, 0.9) + gota(210, 30, 1) + gota(250, 52, 0.8)) },
    /* ---- Abril ---- */
    'rosa-llibre': { nom: 'Rosa i llibre de Sant Jordi', mes: 'abril', svg: svg('0 0 320 260',
      `<path d="M20 216l120-22v40L20 256zM300 216l-120-22v40l120 22z" ${B()}/><path d="M140 194c14 6 26 6 40 0v40c-14 6-26 6-40 0z" ${B()}/>` +
      `<path d="M40 222l80-14M40 232l80-14M280 222l-80-14M280 232l-80-14" ${T(2)}/>` +
      `<path d="M196 182c-4-50-18-96-46-128" ${T(4)}/>` +
      `<path d="M178 130c26-10 42 0 48 16c-22 6-40 0-48-16zM166 98c-26-8-40 4-44 20c22 4 38-4 44-20z" ${B()}/>` +
      `<path d="M150 56c-30-6-44-30-34-50c16 10 26 4 34-4c8 8 18 14 34 4c10 20-4 44-34 50z" ${B()}/>` +
      `<path d="M150 56c-12-10-12-24 0-34c12 10 12 24 0 34M132 30c6 10 10 18 18 26M168 30c-6 10-10 18-18 26" ${T(2.5)}/>`) },
    /* ---- Maig ---- */
    'papallona-flors': { nom: 'Papallona i flors', mes: 'maig', svg: svg('0 0 300 260',
      `<g transform="translate(150 86)"><path d="M0 0c-30-56-92-50-80-10c6 22 40 26 80 10zM0 0c30-56 92-50 80-10c-6 22-40 26-80 10zM0 4c-26 10-62 30-50 50c10 14 40 0 50-46zM0 4c26 10 62 30 50 50c-10 14-40 0-50-46z" ${B()}/>` +
      `<ellipse cx="0" cy="8" rx="7" ry="30" ${B()}/><path d="M-2-20c-6-14-14-20-22-22M2-20c6-14 14-20 22-22" ${T(2.5)}/>` +
      `<circle cx="-46" cy="-14" r="9" ${B(2)}/><circle cx="46" cy="-14" r="9" ${B(2)}/></g>` +
      `<path d="M60 250v-62M150 250v-48M240 250v-70" ${T()}/><path d="M60 226c-16-4-24-14-26-26c16 0 24 8 26 26zM240 224c16-4 24-14 26-26c-16 0-24 8-26 26z" ${B()}/>` +
      flor(60, 182, 26) + flor(150, 196, 20, 8) + flor(240, 174, 28, 5) + `<path d="M10 252h280" ${T()}/>`) },
    'abella': { nom: 'Abella', mes: 'maig', svg: svg('0 0 260 200',
      `<path d="M96 70c-30-50 10-70 30-30M140 70c0-56 46-50 30-8" ${B()}/>` +
      `<ellipse cx="130" cy="120" rx="76" ry="50" ${B()}/><path d="M104 74c-10 30-10 62 0 92M140 70c-10 34-10 70 0 100M174 82c-8 26-8 50 0 76" ${T(5)}/>` +
      `<circle cx="60" cy="112" r="6" fill="#222"/><path d="M58 136c8 6 16 6 22 0" ${T()}/><path d="M206 120l24 6-24 8" ${B()}/>` +
      `<path d="M66 72c-10-20-24-26-34-24M82 66c-2-22-12-34-24-36" ${T(2.5)}/>`) },
    /* ---- Juny ---- */
    'sol-gelat': { nom: 'Sol i gelat', mes: 'juny', svg: svg('0 0 330 260',
      `<g transform="translate(84 84)"><circle r="40" ${B()}/>` + rot(12, a => `<path d="M0 -52V-70" transform="rotate(${a})" ${T()}/>`) +
      `<circle cx="-14" cy="-6" r="4" fill="#222"/><circle cx="14" cy="-6" r="4" fill="#222"/><path d="M-16 12c10 10 22 10 32 0" ${T()}/></g>` +
      `<path d="M196 150l34 100 34-100z" ${B()}/><path d="M204 166l40 28M200 152l52 46M256 166l-40 28M260 152l-52 46" ${T(2)}/>` +
      `<path d="M186 152c-14-30 10-56 30-46c4-30 50-30 54 0c20-10 44 16 30 46z" ${B()}/><circle cx="230" cy="84" r="10" ${B()}/><path d="M232 74c2-10 8-14 14-16" ${T()}/>` +
      `<path d="M20 238c30-10 60-10 90 0s60 10 90 0" ${T()}/>`) },
    'platja': { nom: 'Cubell i pala', mes: 'juny', svg: svg('0 0 300 240',
      `<path d="M70 110h110l-14 110H84z" ${B()}/><path d="M66 100h118v14H66z" ${B()}/><path d="M76 106c0-50 98-50 98 0" ${T()}/>` +
      `<path d="M206 220l40-150" ${T(5)}/><path d="M234 64c-8-28 6-46 22-50c16 6 24 26 8 54z" ${B()}/>` +
      estrella(120, 168, 22, 2.5) + `<path d="M10 226c90-14 190-14 280 0" ${T()}/>` +
      `<path d="M30 210c6-14 20-14 26 0z" ${B(2.5)}/>`) },
    /* ---- Petits, per a sanefes ---- */
    'bolet': { nom: 'Bolet', petit: true, svg: svg('0 0 100 100', `<path d="M10 52c0-30 18-44 40-44s40 14 40 44c-20 6-60 6-80 0z" ${B(4)}/><path d="M38 56c-4 14-4 26 0 36h24c4-10 4-22 0-36" ${B(4)}/>`) },
    'fulles': { nom: 'Fulles', petit: true, svg: svg('0 0 100 100', `<path d="M12 52c8-26 30-30 44-26c-6 22-26 32-44 26zM12 52l44-26" ${B(4)}/><path d="M60 94c-4-24-2-44 10-60c10 18 10 42-10 60zM60 94c0-20 4-40 10-60" ${B(4)}/>`) },
    'floc-petit': { nom: 'Floc de neu', petit: true, svg: svg('0 0 100 100', floc(50, 50, 40, 5)) },
    'estel-petit': { nom: 'Estel', petit: true, svg: svg('0 0 100 100', estrella(50, 52, 42, 4)) },
    'flor-petita': { nom: 'Flor', petit: true, svg: svg('0 0 100 100', flor(50, 50, 40, 6, 4)) },
    'gota-petita': { nom: 'Gota', petit: true, svg: svg('0 0 100 100', gota(50, 12, 4.6, 4)) },
    'sol-petit': { nom: 'Sol', petit: true, svg: svg('0 0 100 100', `<g transform="translate(50 50)"><circle r="22" ${B(4)}/>` + rot(8, a => `<path d="M0-32V-44" transform="rotate(${a})" ${T(4)}/>`) + '</g>') },
    'cor-petit': { nom: 'Cor', petit: true, svg: svg('0 0 100 100', `<path d="M50 88C10 60 6 34 22 22c12-9 24-2 28 10c4-12 16-19 28-10c16 12 12 38-28 66z" ${B(4)}/>`) }
  };

  /* ---------- Mandales ---------- */
  const petal = (r0, r1, w) => `M0 ${-r0}C${w} ${-r0 - (r1 - r0) * 0.25} ${w * 0.9} ${-r1 + (r1 - r0) * 0.25} 0 ${-r1}C${-w * 0.9} ${-r1 + (r1 - r0) * 0.25} ${-w} ${-r0 - (r1 - r0) * 0.25} 0 ${-r0}Z`;
  const cor = (r, s) => `M0 ${-r + 6 * s}c${-6 * s} ${-8 * s} ${-16 * s} ${-6 * s} ${-16 * s} ${4 * s}c0 ${8 * s} ${10 * s} ${14 * s} ${16 * s} ${20 * s}c${6 * s} ${-6 * s} ${16 * s} ${-12 * s} ${16 * s} ${-20 * s}c0 ${-10 * s} ${-10 * s} ${-12 * s} ${-16 * s} ${-4 * s}z`;
  const TEMES = {
    flor: { n: [8, 16, 12], motiu: 'flor' },
    floc: { n: [6, 12, 18], motiu: 'floc' },
    estrella: { n: [5, 10, 15], motiu: 'estrella' },
    cor: { n: [6, 12, 12], motiu: 'cor' },
    sol: { n: [12, 24, 12], motiu: 'sol' },
    fulla: { n: [7, 14, 14], motiu: 'fulla' }
  };
  AT.mandala = function (tema) {
    const t = TEMES[tema] || TEMES.flor, [n1, n2, n3] = t.n;
    let c = `<circle r="196" ${B()}/><circle r="22" ${B()}/>`;
    if (t.motiu === 'floc') c += rot(6, a => `<path d="M0-22V-70M0-46l16-16M0-46l-16-16" transform="rotate(${a})" ${T()}/>`);
    else if (t.motiu === 'estrella') c += estrella(0, 0, 62);
    else c += rot(n1, a => `<path d="${petal(22, 72, 18)}" transform="rotate(${a})" ${B()}/>`);
    c += `<circle r="84" ${T()}/>`;
    c += rot(n2, a => `<path d="${petal(84, 128, 11)}" transform="rotate(${a})" ${B()}/>` + `<circle cx="0" cy="-96" r="4" transform="rotate(${a + 180 / n2})" ${B(2)}/>`);
    c += `<circle r="136" ${T()}/>`;
    const m = t.motiu;
    c += rot(n3, a => {
      const g = `transform="rotate(${a}) translate(0 -162)"`;
      if (m === 'cor') return `<path d="${cor(0, 1.3)}" transform="rotate(${a}) translate(0 -150)" ${B()}/>`;
      if (m === 'floc') return `<g ${g}>${floc(0, 0, 18)}</g>`;
      if (m === 'estrella') return `<g ${g}>${estrella(0, 0, 18)}</g>`;
      if (m === 'sol') return `<path d="${petal(140, 190, 12)}" transform="rotate(${a})" ${B()}/>`;
      if (m === 'fulla') return `<path d="${petal(140, 188, 16)}" transform="rotate(${a})" ${B()}/><path d="M0-142V-186" transform="rotate(${a})" ${T(2)}/>`;
      return `<g ${g}>${flor(0, 0, 22, 6)}</g>`;
    });
    c += rot(n3, a => `<circle cx="0" cy="-186" r="5" transform="rotate(${a + 180 / n3})" ${B(2)}/>`);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-200 -200 400 400">${c}</svg>`;
  };

  const dataUrl = t => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(t);
  /* Converteix «img:clau» en una imatge que el navegador pot dibuixar */
  AT.srcImatge = function (src) {
    if (!src || typeof src !== 'string' || !src.startsWith('img:')) return src || null;
    const k = src.slice(4);
    if (k.startsWith('mandala-')) return dataUrl(AT.mandala(k.slice(8)));
    const e = AT.IMATGES_ESCOLA && AT.IMATGES_ESCOLA[k];
    if (e) return e.src;
    const d = AT.dibuixos[k];
    return d ? dataUrl(d.svg) : null;
  };
  /* Proporció (alt / ample) d'una imatge coneguda, per calcular espais */
  AT.proporcioImatge = function (src) {
    if (!src || !src.startsWith('img:')) return null;
    const k = src.slice(4);
    if (k.startsWith('mandala-')) return 1;
    const e = AT.IMATGES_ESCOLA && AT.IMATGES_ESCOLA[k];
    if (e) return e.h / e.w;
    const d = AT.dibuixos[k];
    if (!d) return null;
    const v = d.svg.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);
    return v[3] / v[2];
  };
})();
