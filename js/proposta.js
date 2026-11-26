/* TRAÇApp — «Dossier TRAÇApp»: un dossier ja fet per a cada mes i curs.
   - Setembre, octubre i novembre: els dossiers que l'escola va fer servir de debò, refets amb l'app
     (els dibuixos, mandales i fulls fets a mà surten dels PDF originals: dades/imatges-escola.js).
   - Desembre a juny: proposta de TRAÇApp amb el mateix format: portada amb la dita del mes,
     lletres (1r) o paraules (2n), endevinalla, grafomotricitat, mandala i un full de «De traç en traç».
   Les lletres de 1r segueixen l'ordre dels dossiers reals (setembre: vocals; octubre: l; novembre: i u t r)
   i continuen per famílies de moviment. Les paraules de 1r només fan servir lletres ja treballades. */
window.AT = window.AT || {};

(function () {
  /* ---------- Peces ---------- */
  const portada = (mes, dita, imatge, sanefa, versions) => ({
    area: 'portada', titol: 'Portada ' + mes.toLowerCase(), compost: 'portada',
    dades: { mes, dita, estil: 'puntets', imatge, sanefa: Object.assign({ modeSanefa: 'forma', model: 2, resta: 'referencies' }, sanefa), versions }
  });
  /* Portada de 2n: caixa buida per escriure-hi el mes, dibuixos i sanefa */
  const portada2n = (mes, blocs) => ({ area: 'portada', titol: 'Portada ' + mes.toLowerCase(), blocs });
  const dita = (mes, text, caixesBuides, sanefa) => ({
    area: 'dita', titol: 'Dita ' + mes.toLowerCase(), compost: 'dita',
    dades: { titol: 'Dita', dita: text, estil: 'puntets', caixesBuides, imatge: null,
      sanefa: Object.assign({ modeSanefa: 'forma', model: 2, resta: 'referencies' }, sanefa), versions: { lligada: true, pal: true } }
  });
  const full = (titol, src, o = {}) => ({ area: 'extres', titol, capcalera: o.capcalera !== false, blocs: [{ tipus: 'imatge', src, alcada: 'auto' }] });
  const caixaBuida = (o = {}) => Object.assign({ tipus: 'caixa', text: '', lletra: 'lligada', estil: 'buit', mida: 'gran', amplada: 'plena' }, o);
  const img = (src, alcada = 'auto', mida = 'gran') => ({ tipus: 'imatge', src, alcada, mida });
  const sanefaImg = (clau, model = 1) => ({ tipus: 'sanefa', modeSanefa: 'imatge', imatge: 'img:' + clau, model, resta: 'buit', mida: 'gran' });

  /* Fitxa de lletres: per a cada lletra, una fila amb model, repàs en gris i punts, i una fila només amb punts */
  const lletres = (ll, paraules, enunciat = 'Ressegueix i escriu.') => {
    const blocs = [];
    ll.forEach((l, i) => {
      blocs.push({ tipus: 'fila', lletra: '@' + i, columnes: ['model', 'gris', 'punts'], files: 1, mida: 'mitjana', enunciat: i === 0 ? enunciat : '' });
      blocs.push({ tipus: 'fila', lletra: '@' + i, columnes: ['punts'], files: 1, mida: 'mitjana' });
    });
    (paraules || []).forEach((p, i) => blocs.push({ tipus: 'paraula', text: p, columnes: ['model', 'puntets', 'buit'], files: 1, mida: 'petita', enunciat: i === 0 ? 'Ressegueix i escriu les paraules.' : '' }));
    if (paraules && paraules.length) blocs.push({ tipus: 'pauta', files: 'auto', mida: 'petita' });
    else blocs[blocs.length - 1].files = 'auto'; // sense paraules, la darrera fila de punts omple el full
    return { area: 'caligrafia', lletres: ll, mostra: { visible: true, estil: 'fletxes', mida: 'mitjana' }, sincronitza: false, blocs };
  };
  const endevinalla = (titol, linies) => ({
    area: 'endevinalla', titol: 'Endevinalla',
    blocs: [
      { tipus: 'text', text: titol, midaText: 16 },
      ...linies.flatMap(t => [{ tipus: 'paraula', text: t, columnes: ['puntets'], files: 1, mida: 'mini' }, { tipus: 'pauta', files: linies.length > 2 ? 1 : 2, mida: 'mini' }]),
      { tipus: 'text', text: 'Dibuixa què és:', midaText: 16 },
      { tipus: 'espai', enunciat: '', alcada: 'auto' }
    ]
  });
  /* Parteix una frase en línies que caben en una caixa de pauta (mida mitjana) */
  const liniesFrase = frase => AT.motor.partirLinies(frase, 'lligada', AT.config.full.amplada - AT.config.full.marges.esquerra - AT.config.full.marges.dreta - 8, 4);
  /* Paraules (2n): paraules del mes per resseguir i copiar i una frase */
  const paraules = (titol, llista, frase) => ({
    area: 'caligrafia', titol, lletres: ['a'], mostra: { visible: false, mida: 'mitjana' }, sincronitza: false,
    blocs: [
      /* cada paraula en una caixa de pauta per resseguir, amb la caixa del costat per copiar-la */
      ...llista.map((p, i) => ({ tipus: 'caixa', text: p, lletra: 'lligada', estil: 'puntets', mida: 'mitjana', amplada: 'parella', enunciat: i === 0 ? 'Ressegueix les paraules i copia-les al costat.' : '' })),
      /* la frase, com les dites: caixes de pauta per resseguir i, a sota, caixes buides per copiar-la */
      ...liniesFrase(frase).map((t, i) => ({ tipus: 'caixa', text: t, lletra: 'lligada', estil: 'puntets', mida: 'mitjana', amplada: 'plena', enunciat: i === 0 ? 'Ressegueix la frase i copia-la.' : '' })),
      ...liniesFrase(frase).map(() => caixaBuida({ mida: 'mitjana' })),
      ...(liniesFrase(frase).length === 1 ? [caixaBuida({ mida: 'mitjana', enunciat: 'Escriu una frase amb una de les paraules.' }), caixaBuida({ mida: 'mitjana' })] : [])
    ]
  });
  const grafo = (titol, blocs) => ({ area: 'grafomotricitat', titol, blocs });
  const serie = (forma, alcada, columnes, files, mida, enunciat = '') => ({ tipus: 'serie', forma, alcadaTraç: alcada, columnes, files, mida, enunciat });
  const mandala = (tema, mes) => full('Mandala ' + mes, 'img:mandala-' + tema);
  const TOTES = { lligada: true, pal: true, pi: true, estrella: true };

  /* ---------- Dossiers ---------- */
  AT.dossiersApp = {
    primer: {
      setembre: () => [
        portada('Setembre', 'El sol de setembre\nmadura el codonyer', 'img:1r-set-portada', { forma: 'cercles' }, { lligada: true, pal: true, pi: false, estrella: true }),
        grafo('Traç lletres 1', [
          { tipus: 'voltant', forma: 'bucles', mida: 'mitjana', model: 3, files: 2, enunciat: 'Ressegueix i continua.' },
          { tipus: 'voltant', forma: 'rodones', mida: 'mitjana', model: 3, files: 2 },
          { tipus: 'voltant', forma: 'ones', mida: 'mitjana', model: 3, files: 2 }]),
        full('Traç lletres 2', 'img:1r-set-tracos-2', { capcalera: false }),
        Object.assign(lletres(['a', 'e', 'i', 'o', 'u']), {
          titol: 'Les vocals', mostra: { visible: false, mida: 'mitjana' },
          blocs: ['a', 'e', 'i', 'o', 'u'].flatMap((l, i) => [
            { tipus: 'fila', lletra: '@' + i, columnes: ['puntets'], files: 1, mida: 'mitjana', enunciat: i === 0 ? 'Ressegueix les lletres.' : '' },
            { tipus: 'fila', lletra: '@' + i, columnes: ['punts'], files: 1, mida: 'mitjana' }]).concat([img('img:1r-set-mandala-flor')])
        }),
        full('Traç lletres 5', 'img:1r-set-tracos-5'),
        full('Mandala de cors', 'img:1r-set-mandala-cors', { capcalera: false }),
        full('Traç lletres 7', 'img:1r-set-tracos-7', { capcalera: false }),
        grafo('Traç copa', [
          serie('copa', 2, ['model', 'gris', 'punts'], 1, 'gran', 'Ressegueix i fes les copes.'),
          serie('copa', 2, ['punts'], 1, 'gran'),
          serie('copa', 1, ['model', 'gris', 'gris', 'punts'], 1, 'mitjana'),
          serie('copa', 1, ['punts'], 'auto', 'mitjana')]),
        full('Traç copa 2', 'img:1r-set-copa-2', { capcalera: false })
      ],
      octubre: () => [
        portada('Octubre', 'Si a l’octubre plou,\nel rovelló es mou.', 'img:1r-oct-portada', { forma: 'merlets' }, TOTES),
        full('Taula de traços', 'img:1r-oct-taula'),
        { area: 'grafomotricitat', titol: 'Traç curvat', blocs: [img('img:1r-oct-curvat-1'), img('img:1r-oct-curvat-2', 240)] },
        { area: 'extres', titol: 'Extra octubre', blocs: [img('img:1r-oct-extra-1'), img('img:1r-oct-extra-2', 240)] }
      ],
      novembre: () => [
        portada('Novembre', 'Novembre acabat,\nhivern començat.', 'img:1r-nov-portada', { forma: 'zigazaga' }, { lligada: true, pal: true, pi: true, estrella: false }),
        lletres(['i', 'u', 't', 'r']),
        endevinalla('Endevinalla de la tardor:', ['Una mena de patata', 'de color de pastanaga.']),
        full('Extra 1 novembre', 'img:1r-nov-extra-1'),
        full('Extra 2 novembre', 'img:1r-nov-extra-2')
      ],
      desembre: () => [
        portada('Desembre', 'Per Nadal, cada ovella\nal seu corral.', 'img:arbre-nadal', { forma: 'ponts' }, TOTES),
        lletres(['n', 'm', 'p'], ['pi', 'lluna']),
        endevinalla('Endevinalla de l’hivern:', ['Tinc barret', 'i nas de pastanaga.', 'Quan surt el sol,', 'em desfaig.']),
        grafo('Ponts i garlandes', [
          serie('pont', 2, ['model', 'gris', 'punts'], 1, 'gran', 'Ressegueix i continua.'), serie('pont', 2, ['punts'], 1, 'gran'),
          serie('garlanda', 2, ['model', 'gris', 'punts'], 1, 'gran'), serie('garlanda', 2, ['punts'], 'auto', 'gran')]),
        mandala('estrella', 'desembre'),
        grafo('Copia en punts', [
          { tipus: 'copia', graella: 'punts', parells: 2, figures: ['estrella', 'arbre'], files: 1, enunciat: 'Copia la figura unint els punts.' },
          { tipus: 'copia', graella: 'punts', parells: 2, figures: ['casa', 'espelma'], files: 1 },
          { tipus: 'copia', graella: 'punts', parells: 2, figures: ['cor', 'fletxa'], files: 1 }])
      ],
      gener: () => [
        portada('Gener', 'Aigua de gener,\nomple bótes i graner.', 'img:muntanyes-neu', { forma: 'serra' }, TOTES),
        lletres(['c', 'd', 'g', 'q']),
        endevinalla('Endevinalla de l’hivern:', ['Cau del cel', 'sense fer soroll,', 'és blanca i freda', 'com el gel.']),
        grafo('Punxes i valls', [
          serie('punxa', 2, ['model', 'gris', 'punts'], 1, 'gran', 'Ressegueix i continua.'), serie('punxa', 2, ['punts'], 1, 'gran'),
          serie('vall', 2, ['model', 'gris', 'punts'], 1, 'gran'), serie('vall', 2, ['punts'], 'auto', 'gran')]),
        mandala('floc', 'gener'),
        grafo('Sanefes en quadrícula', [
          { tipus: 'quadricula', sanefa: 'merlets', files: 1, enunciat: 'Continua les sanefes.' },
          { tipus: 'quadricula', sanefa: 'escala', files: 1 }, { tipus: 'quadricula', sanefa: 'triangles', files: 1 },
          { tipus: 'quadricula', sanefa: 'rombes', files: 1 }, { tipus: 'quadricula', sanefa: 'quadrats', files: 1 },
          { tipus: 'quadricula', sanefa: 'dents', files: 1 }, { tipus: 'quadricula', sanefa: 'zigazaga', files: 1 }])
      ],
      febrer: () => [
        portada('Febrer', 'Al febrer\nfloreix l’ametller.', 'img:careta', { forma: 'merlets' }, TOTES),
        lletres(['b', 'h', 'f', 'k']),
        endevinalla('Endevinalla de Carnaval:', ['Em poses', 'a la cara', 'i ningú no', 'et coneix.']),
        grafo('Merlets i serres', [
          serie('merlet', 2, ['model', 'gris', 'punts'], 1, 'gran', 'Ressegueix i continua.'), serie('merlet', 2, ['punts'], 1, 'gran'),
          serie('serra', 2, ['model', 'gris', 'punts'], 1, 'gran'), serie('serra', 2, ['punts'], 'auto', 'gran')]),
        mandala('cor', 'febrer'),
        grafo('Patrons de colors', [
          { tipus: 'colors', patro: [[1, 0, 1, 0], [0, 2, 0, 2]], files: 1, enunciat: 'Continua el patró.' },
          { tipus: 'colors', patro: [[3, 0, 0], [0, 3, 0], [0, 0, 3]], files: 1 },
          { tipus: 'colors', patro: [[4, 4, 0], [4, 0, 0], [4, 4, 4]], files: 1 },
          { tipus: 'colors', patro: [[5, 0], [5, 5], [0, 5]], files: 1 },
          { tipus: 'colors', patro: [[6, 0, 0], [6, 6, 0], [6, 6, 6]], files: 1 },
          { tipus: 'colors', patro: [[7, 0, 7], [0, 7, 0]], files: 1 }])
      ],
      marc: () => [
        portada('Març', 'Pluja de març,\ndona faves i lleva blat.', 'img:paraigua', { forma: 'ones' }, TOTES),
        lletres(['s', 'j', 'y'], ['sol', 'pluja']),
        endevinalla('Endevinalla de la primavera:', ['Surt quan plou', 'i fa sol,', 'té colors i no', 'es pot tocar.']),
        grafo('Ones i bucles', [
          serie('ona', 2, ['model', 'gris', 'punts'], 1, 'gran', 'Ressegueix i continua.'), serie('ona', 2, ['punts'], 1, 'gran'),
          serie('bucle', 2, ['model', 'gris', 'punts'], 1, 'gran'), serie('bucle', 2, ['punts'], 'auto', 'gran')]),
        mandala('fulla', 'març'),
        grafo('Camins que s’estrenyen', [
          { tipus: 'estret', forma: 'recte', files: 1, enunciat: 'Ves del punt verd al vermell sense tocar les vores.' },
          { tipus: 'estret', forma: 'ona', files: 2 }, { tipus: 'estret', forma: 'zigazaga', files: 'auto' }])
      ],
      abril: () => [
        portada('Abril', 'A l’abril,\naigües mil.', 'img:rosa-llibre', { forma: 'copes' }, TOTES),
        lletres(['v', 'x', 'z'], ['rosa', 'drac']),
        endevinalla('Endevinalla de Sant Jordi:', ['Té espines', 'i és vermella,', 'per Sant Jordi', 'és la més bella.']),
        grafo('Rodones i cargols', [
          { tipus: 'voltant', forma: 'rodones', mida: 'mitjana', files: 2, enunciat: 'Ressegueix i continua al voltant dels punts.' },
          { tipus: 'voltant', forma: 'cargols', mida: 'mitjana', files: 'auto' }]),
        mandala('cor', 'abril'),
        grafo('Copia en quadrícula', [
          { tipus: 'copia', graella: 'quadricula', parells: 1, figures: ['castell'], files: 1, enunciat: 'Copia el dibuix a la quadrícula.' },
          { tipus: 'copia', graella: 'quadricula', parells: 1, figures: ['cor'], files: 1 }])
      ],
      maig: () => [
        portada('Maig', 'Pel maig,\ncada dia un raig.', 'img:papallona-flors', { forma: 'bucles' }, TOTES),
        { area: 'caligrafia', titol: 'La lletra ç', lletres: ['ç'], mostra: { visible: true, estil: 'fletxes', mida: 'mitjana' }, sincronitza: false, blocs: [
          { tipus: 'fila', lletra: '@0', columnes: ['model', 'gris', 'punts'], files: 1, mida: 'mitjana', enunciat: 'Ressegueix i escriu.' },
          { tipus: 'fila', lletra: '@0', columnes: ['punts'], files: 'auto', mida: 'mitjana' },
          { tipus: 'paraula', text: 'cançó', columnes: ['model', 'puntets', 'buit'], files: 1, mida: 'petita', enunciat: 'Ressegueix i escriu les paraules.' },
          { tipus: 'paraula', text: 'plaça', columnes: ['model', 'puntets', 'buit'], files: 1, mida: 'petita' },
          { tipus: 'paraula', text: 'braç', columnes: ['model', 'puntets', 'buit'], files: 1, mida: 'petita' },
          { tipus: 'pauta', files: 'auto', mida: 'petita' }] },
        endevinalla('Endevinalla de la primavera:', ['Vola de flor', 'en flor', 'i té les ales', 'de colors.']),
        grafo('Sanefes', [
          { tipus: 'text', text: 'Continua les sanefes.', midaText: 14, negreta: true },
          { tipus: 'sanefa', forma: 'bucles' }, { tipus: 'sanefa', forma: 'cercles' }, { tipus: 'sanefa', forma: 'espirals' },
          { tipus: 'sanefa', forma: 'copes' }, { tipus: 'sanefa', forma: 'ones' }, { tipus: 'sanefa', forma: 'ponts' },
          { tipus: 'sanefa', forma: 'merlets' }, { tipus: 'sanefa', forma: 'serra' }]),
        mandala('flor', 'maig'),
        lletres(['a', 'e', 'l', 'p'], null, 'Repassem lletres.')
      ],
      juny: () => [
        portada('Juny', 'Pel juny,\nla falç al puny.', 'img:sol-gelat', { forma: 'espirals' }, TOTES),
        Object.assign(paraules('Paraules de l’estiu', ['estiu', 'platja', 'gelat', 'vacances', 'sol', 'mar'], 'Bon estiu!'), {}),
        endevinalla('Endevinalla de l’estiu:', ['És groc', 'i rodó', 'i a l’estiu', 'fa calor.']),
        grafo('Repàs de traços', [
          serie('copa', 2, ['model', 'punts'], 1, 'mitjana', 'Ressegueix i continua.'), serie('pont', 2, ['model', 'punts'], 1, 'mitjana'),
          serie('punxa', 2, ['model', 'punts'], 1, 'mitjana'), serie('bucle', 2, ['model', 'punts'], 1, 'mitjana'),
          serie('rodona', 2, ['model', 'punts'], 1, 'mitjana'), serie('cargol', 2, ['model', 'punts'], 'auto', 'mitjana')]),
        mandala('sol', 'juny'),
        grafo('Copia en punts', [
          { tipus: 'copia', graella: 'punts', parells: 2, figures: ['vaixell', 'peix'], files: 1, enunciat: 'Copia la figura unint els punts.' },
          { tipus: 'copia', graella: 'punts', parells: 2, figures: ['fletxa', 'cotxe'], files: 1 },
          { tipus: 'copia', graella: 'punts', parells: 2, figures: ['estrella', 'casa'], files: 1 }])
      ]
    },
    segon: {
      setembre: () => [
        portada2n('Setembre', [caixaBuida(), img('img:2n-set-garlanda', 62), img('img:2n-set-arbres'), { tipus: 'sanefa', forma: 'merlets', model: 2, resta: 'buit', mida: 'gran' }]),
        dita('Setembre', 'Del setembre a la tardor, torna la calor.', 2, { forma: 'serra' })
      ],
      octubre: () => [
        portada2n('Octubre', [img('img:2n-oct-bolet'), caixaBuida(), img('img:2n-oct-magrana'), sanefaImg('bolet')]),
        full('Extra octubre', 'img:2n-oct-extra')
      ],
      novembre: () => [
        portada2n('Novembre', [caixaBuida({ amplada: 'centrada' }), img('img:2n-nov-pages', 'auto', 'mitjana'), sanefaImg('fulles')]),
        dita('Novembre', 'Qui pel novembre no ha sembrat, que no sembri, que ja és tard!', 3, { modeSanefa: 'imatge', imatge: 'img:fulles', model: 1, resta: 'buit' }),
        full('Extra 1 novembre', 'img:2n-nov-mandala'),
        full('Extra 2 novembre', 'img:2n-nov-extra')
      ],
      desembre: () => [
        portada2n('Desembre', [caixaBuida(), img('img:ninot-neu'), sanefaImg('estel-petit', 2)]),
        dita('Desembre', 'Per Nadal, un pas de pardal; per Sant Esteve, un pas de llebre.', 2, { modeSanefa: 'imatge', imatge: 'img:estel-petit', model: 2, resta: 'buit' }),
        paraules('Paraules de Nadal', ['torró', 'pessebre', 'neula', 'estrella', 'campana', 'regal'], 'El ninot de neu té fred.'),
        grafo('Sanefes en quadrícula', [
          { tipus: 'quadricula', sanefa: 'greca', files: 1, enunciat: 'Continua les sanefes.' },
          { tipus: 'quadricula', sanefa: 'cases', files: 1 }, { tipus: 'quadricula', sanefa: 'fletxes', files: 1 },
          { tipus: 'quadricula', sanefa: 'escala', files: 1 }, { tipus: 'quadricula', sanefa: 'rombes', files: 1 },
          { tipus: 'quadricula', sanefa: 'merlets', files: 1 }, { tipus: 'quadricula', sanefa: 'triangles', files: 1 }]),
        mandala('estrella', 'desembre')
      ],
      gener: () => [
        portada2n('Gener', [caixaBuida(), img('img:gorro-bufanda'), sanefaImg('floc-petit', 2)]),
        dita('Gener', 'El gener és l’hereu de l’any, el desembre n’és l’avi.', 2, { modeSanefa: 'imatge', imatge: 'img:floc-petit', model: 2, resta: 'buit' }),
        paraules('Paraules de l’hivern', ['neu', 'bufanda', 'guants', 'muntanya', 'fred', 'gel'], 'Els Reis porten regals.'),
        grafo('Copia en quadrícula', [
          { tipus: 'copia', graella: 'quadricula', parells: 1, figures: ['vaixell'], files: 1, enunciat: 'Copia el dibuix a la quadrícula.' },
          { tipus: 'copia', graella: 'quadricula', parells: 1, figures: ['castell'], files: 1 }]),
        mandala('floc', 'gener')
      ],
      febrer: () => [
        portada2n('Febrer', [caixaBuida(), img('img:careta'), sanefaImg('cor-petit', 2)]),
        dita('Febrer', 'Si el febrer no febreja, mal març tindrem.', 2, { forma: 'zigazaga' }),
        paraules('Paraules de Carnaval', ['disfressa', 'careta', 'confeti', 'rua', 'pallasso', 'festa'], 'Visca el Carnaval!'),
        grafo('Patrons de colors', [
          { tipus: 'colors', patro: [[1, 0, 2], [0, 1, 0], [2, 0, 1]], files: 1, enunciat: 'Continua el patró.' },
          { tipus: 'colors', patro: [[3, 3, 0, 0], [0, 3, 3, 0], [0, 0, 3, 3]], files: 1 },
          { tipus: 'colors', patro: [[4, 0, 4], [0, 5, 0], [4, 0, 4]], files: 1 },
          { tipus: 'colors', patro: [[6, 6, 6], [6, 0, 6], [6, 6, 6]], files: 1 },
          { tipus: 'colors', patro: [[7, 0, 0, 7], [0, 8, 8, 0]], files: 1 },
          { tipus: 'colors', patro: [[9, 1], [1, 9]], files: 1 }]),
        mandala('cor', 'febrer')
      ],
      marc: () => [
        portada2n('Març', [caixaBuida(), img('img:cargol'), sanefaImg('gota-petita', 2)]),
        dita('Març', 'Quan el març fa de maig, el maig fa de març.', 2, { modeSanefa: 'imatge', imatge: 'img:gota-petita', model: 2, resta: 'buit' }),
        paraules('Paraules de la primavera', ['primavera', 'paraigua', 'cargol', 'tolls', 'pluja', 'núvol'], 'La pluja fa créixer les flors.'),
        grafo('Rodones i cargols', [
          { tipus: 'voltant', forma: 'rodones', mida: 'mitjana', files: 2, enunciat: 'Ressegueix i continua al voltant dels punts.' },
          { tipus: 'voltant', forma: 'cargols', mida: 'mitjana', files: 2 },
          { tipus: 'voltant', forma: 'bucles', mida: 'mitjana', files: 'auto' }]),
        mandala('fulla', 'març')
      ],
      abril: () => [
        portada2n('Abril', [caixaBuida(), img('img:rosa-llibre'), sanefaImg('cor-petit', 2)]),
        dita('Abril', 'Abril i maig tenen les claus de tot l’any.', 2, { forma: 'copes' }),
        paraules('Paraules de Sant Jordi', ['rosa', 'llibre', 'drac', 'cavaller', 'princesa', 'castell'], 'Sant Jordi va vèncer el drac.'),
        grafo('Copia en punts', [
          { tipus: 'copia', graella: 'punts', parells: 2, figures: ['castell', 'cor'], files: 1, enunciat: 'Copia la figura unint els punts.' },
          { tipus: 'copia', graella: 'punts', parells: 2, figures: ['estrella', 'casa'], files: 1 },
          { tipus: 'copia', graella: 'punts', parells: 2, figures: ['arbre', 'fletxa'], files: 1 }]),
        mandala('cor', 'abril')
      ],
      maig: () => [
        portada2n('Maig', [caixaBuida(), img('img:abella'), sanefaImg('flor-petita', 2)]),
        dita('Maig', 'Maig plujós, dolent per l’hort i pel camp hermós.', 2, { modeSanefa: 'imatge', imatge: 'img:flor-petita', model: 2, resta: 'buit' }),
        paraules('Paraules de la primavera', ['abella', 'papallona', 'margarida', 'jardí', 'flor', 'mel'], 'Les abelles fan mel.'),
        grafo('Sanefes en quadrícula', [
          { tipus: 'quadricula', sanefa: 'dents', files: 1, enunciat: 'Continua les sanefes.' },
          { tipus: 'quadricula', sanefa: 'quadrats', files: 1 }, { tipus: 'quadricula', sanefa: 'zigazaga', files: 1 },
          { tipus: 'quadricula', sanefa: 'merlets', files: 1 }, { tipus: 'quadricula', sanefa: 'greca', files: 1 },
          { tipus: 'quadricula', sanefa: 'cases', files: 1 }, { tipus: 'quadricula', sanefa: 'fletxes', files: 1 }]),
        mandala('flor', 'maig')
      ],
      juny: () => [
        portada2n('Juny', [caixaBuida(), img('img:platja'), sanefaImg('sol-petit', 2)]),
        dita('Juny', 'Pel juny, la falç al puny.', 3, { forma: 'espirals' }),
        paraules('Paraules de l’estiu', ['vacances', 'platja', 'revetlla', 'coca', 'sol', 'gelat'], 'Bon estiu a tothom!'),
        grafo('Camins que s’estrenyen', [
          { tipus: 'estret', forma: 'recte', files: 1, enunciat: 'Ves del punt verd al vermell sense tocar les vores.' },
          { tipus: 'estret', forma: 'ona', files: 2 }, { tipus: 'estret', forma: 'zigazaga', files: 'auto' }]),
        mandala('sol', 'juny')
      ]
    }
  };

  /* Ajustos després de muntar la fitxa:
     - una paraula que només cap una vegada per fila té les files que calen perquè surtin totes les columnes
       (model, puntets i en blanc);
     - una pauta «Omple el full» que quedaria sola en un full nou es treu. */
  function ajusta(f) {
    const F = AT.config.full, W = F.amplada - F.marges.esquerra - F.marges.dreta;
    f.blocs.forEach(b => {
      if (b.tipus !== 'paraula' || b.files === 'auto') return;
      const n = AT.motor.columnesDeFila(b, f, W).n;
      b.files = Math.max(Number(b.files) || 1, Math.ceil(b.columnes.length / n));
    });
    const darrer = f.blocs[f.blocs.length - 1];
    if (darrer && darrer.tipus === 'pauta' && darrer.files === 'auto') {
      const pags = AT.motor.pagina(f).pagines;
      const ultima = pags[pags.length - 1];
      if (pags.length > 1 && ultima.items.every(it => it.bloc === darrer)) f.blocs.pop();
    }
  }

  /* Converteix les definicions en fitxes completes (encara sense desar) */
  function construeix(def, curs, mes, proposta) {
    const ara = Date.now();
    return def().map((d, i) => {
      const f = {
        id: AT.uid(), curs, mes, area: d.area, ordre: i + 1, proposta: proposta || undefined,
        titol: d.titol || (d.lletres ? AT.titolLletres(d.lletres) : 'Fitxa'),
        titolAuto: !d.titol && !!d.lletres,
        lletres: d.lletres, mostra: d.mostra, sincronitza: d.sincronitza,
        compost: d.compost, dades: d.dades ? AT.clona(d.dades) : undefined,
        capcalera: d.capcalera !== false,
        blocs: (d.blocs || []).map(b => Object.assign(AT.clona(AT.config.blocs[b.tipus] || {}), b, { id: AT.uid() })),
        creat: ara + i, modificat: ara, esborrany: false
      };
      Object.keys(f).forEach(k => f[k] === undefined && delete f[k]);
      ajusta(f);
      return f;
    });
  }

  /* Setembre, octubre i novembre no són «Dossier TRAÇApp»: són els dossiers de l'escola, que surten
     ja posats al dossier de cada mes com si les mestres els haguessin fet amb l'app. */
  const MESOS_ESCOLA = ['setembre', 'octubre', 'novembre'];
  /* Puja aquest número quan canviïn aquests dossiers: les fitxes posades que ningú no ha tocat s'actualitzen */
  AT.dossiersEscolaVersio = 2;
  AT.dossiersEscola = {};
  Object.keys(AT.dossiersApp).forEach(curs => {
    AT.dossiersEscola[curs] = {};
    MESOS_ESCOLA.forEach(m => { AT.dossiersEscola[curs][m] = AT.dossiersApp[curs][m]; delete AT.dossiersApp[curs][m]; });
  });

  AT.dossierApp = function (curs, mes) {
    const def = (AT.dossiersApp[curs] || {})[mes];
    return def ? construeix(def, curs, mes, true) : [];
  };
  AT.dossierEscola = function (curs, mes) {
    const def = (AT.dossiersEscola[curs] || {})[mes];
    return def ? construeix(def, curs, mes, false) : [];
  };
})();
