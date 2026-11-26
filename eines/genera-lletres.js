/* Converteix dades/lletres.json (font de veritat, validada per l'escola) en js/lletres-dades.js,
   perquè l'app funcioni també obrint index.html amb doble clic (sense servidor).
   No modifica cap coordenada: només copia els camps que l'app fa servir.
   Ús: node eines/genera-lletres.js */
const fs = require('fs'), path = require('path');
const arrel = path.join(__dirname, '..');
const d = JSON.parse(fs.readFileSync(path.join(arrel, 'dades/lletres.json'), 'utf8'));
const CAMPS = ['svg_model', 'svg_puntets', 'svg_fletxes', 'numeros_fletxes', 'punt_verd', 'punt_vermell',
  'linies_taronja', 'limits_lletra', 'amplada_amb_punts', 'limits_amb_fletxes'];
const lletres = {};
for (const [k, v] of Object.entries(d.lletres)) {
  lletres[k] = {};
  CAMPS.forEach(c => { if (!(c in v)) throw new Error(`Falta ${c} a la lletra ${k}`); lletres[k][c] = v[c]; });
  /* «cap» (només la q): no s'uneix amb la lletra següent */
  lletres[k].unio_amb_la_seguent = v.unio_amb_la_seguent || 'normal';
  /* Traços (polilínies ja calculades al JSON) per poder unir lletres dins d'una paraula */
  lletres[k].tracos = v.tracos.map(t => t.tipus === 'punt'
    ? { tipus: 'punt', x: t.x, y: t.y }
    : { tipus: 'traç', p: t.polilinia.map(([x, y]) => [Math.round(x * 1000) / 1000, Math.round(y * 1000) / 1000]) });
}
const out = `/* Generat automàticament amb eines/genera-lletres.js a partir de dades/lletres.json (versió ${d.versio}).
   NO S'HA D'EDITAR A MÀ: les lletres estan validades per la direcció. */
window.AT = window.AT || {};
AT.LLETRES = ${JSON.stringify({ versio: d.versio, unitats: d.unitats, colors: d.colors, lletres })};
`;
fs.writeFileSync(path.join(arrel, 'js/lletres-dades.js'), out);
console.log('js/lletres-dades.js', (out.length / 1024).toFixed(0) + ' KB', Object.keys(lletres).length, 'lletres');
